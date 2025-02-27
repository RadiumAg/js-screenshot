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
  videoElement.width = width;
  videoElement.height = height;
  videoElement.style.objectFit = 'cover';

  return videoElement;
}

async function displayMediaMode() {
  let resolveFn: (value: unknown) => void;
  const promise = new Promise(resolve => {
    resolveFn = resolve;
  });
  const width = window.innerWidth;
  const height = window.innerHeight;

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width,
      height,
      displaySurface: 'window',
    },
  });

  // 设置源source
  setSourceCanvasElement(createCanvas(width, height));
  // 设置截图source
  setCanvasElement(createCanvas(width, height));
  setVideoElement(createVideoElement(width, height));

  videoElement.srcObject = captureStream;
  document.body.append(videoElement);
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
