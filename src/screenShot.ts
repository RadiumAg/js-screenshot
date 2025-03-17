import {
  canvasElement,
  setCanvasElement,
  setSourceCanvasElement,
  setVideoElement,
  sourceCanvasElement,
  videoElement,
} from './tools/canvas';
import CutoutBox from './tools/cutout-box/cutoutBox';
import { __isDev__ } from './utils';

type ScreenShotOptions = {
  mode?: 'media';
  afterFinished?: () => void;
};

/**
 * 创建canvas
 *
 * @param width
 * @param height
 * @returns
 */
function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  // init position
  canvas.style.position = 'fixed';
  canvas.style.top = '0px';
  canvas.style.left = '0px';

  return canvas;
}

/**
 * 创建video element
 *
 * @param width
 * @param height
 * @returns
 */
function createVideoElement(width: number, height: number) {
  const videoElement = document.createElement('video');
  videoElement.style.width = `${width}px`;
  videoElement.style.height = `${height}px`;
  videoElement.style.objectFit = 'cover';
  videoElement.style.visibility = 'hidden';
  document.body.append(videoElement);

  return videoElement;
}

async function displayMediaMode() {
  let resolveFn: (value: unknown) => void;
  const promise = new Promise(resolve => {
    resolveFn = resolve;
  });

  // 获取当前视口尺寸
  const updateDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return { width, height };
  };

  const { width, height } = updateDimensions();

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width,
      height,
      cursor: 'never',
      displaySurface: 'window',
    },
  });

  // 设置源source
  setSourceCanvasElement(createCanvas(width, height));
  // 设置截图source
  setCanvasElement(createCanvas(width, height));
  setVideoElement(createVideoElement(width, height));

  videoElement.srcObject = captureStream;
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
    const sourceContext = sourceCanvasElement.getContext('2d');
    if (__isDev__) {
      const sourceConfig = captureStream.getTracks()[0].getSettings();
      console.info('width', width, 'height', height);
      console.info(
        'source width',
        sourceConfig.width,
        'source height',
        sourceConfig.height,
      );
      console.info('source height', sourceConfig.height);
    }

    setTimeout(() => {
      sourceContext?.drawImage(
        videoElement,
        0,
        0,
        width,
        height,
        0,
        0,
        width,
        height,
      );
      document.body.append(canvasElement);

      resolveFn('init');
    }, 1000);
  });

  // 监听窗口缩放事件
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', async () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(async () => {
      const { width, height } = updateDimensions();

      // 停止当前的媒体流
      const tracks = captureStream.getTracks();
      tracks.forEach(track => track.stop());

      // 获取新的媒体流
      const newCaptureStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: width, min: 100, max: 4096 },
          height: { ideal: height, min: 100, max: 4096 },
          displaySurface: 'window',
        },
      });

      // 更新画布和视频元素
      setSourceCanvasElement(createCanvas(width, height));
      setCanvasElement(createCanvas(width, height));
      setVideoElement(createVideoElement(width, height));

      videoElement.srcObject = newCaptureStream;
      videoElement.addEventListener('loadedmetadata', () => {
        videoElement.play();
        const sourceContext = sourceCanvasElement.getContext('2d');
        const actualWidth = videoElement.videoWidth;
        const actualHeight = videoElement.videoHeight;
        if (actualWidth !== width || actualHeight !== height) {
          console.warn(
            'Actual video size does not match viewport size:',
            actualWidth,
            actualHeight,
          );
        }
        sourceContext?.drawImage(
          videoElement,
          0,
          0,
          actualWidth,
          actualHeight,
          0,
          0,
          width,
          height,
        );
      });
    }, 200); // 延迟200毫秒
  });

  return promise;
}

class ScreenShot {
  constructor(private screenShotOptions: ScreenShotOptions) {
    console.log('options', this.screenShotOptions);
  }

  async shot() {
    await displayMediaMode();
    new CutoutBox().initCutoutBox();
  }
}

export default ScreenShot;
