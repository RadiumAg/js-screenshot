import {
  drawCanvasElement,
  setDrawCanvasElement,
  setSourceCanvasElement,
  setVideoElement,
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
 * @returns
 */
function createCanvas() {
  const canvas = document.createElement('canvas');

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
function createVideoElement() {
  const videoElement = document.createElement('video');
  return videoElement;
}

async function displayMediaMode() {
  let resolveFn: (value: unknown) => void;
  const promise = new Promise(resolve => {
    resolveFn = resolve;
  });

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {},
    preferCurrentTab: 1,
    audio: false,
    cursor: false,
  });

  const sourceCanvasElement = createCanvas();
  const drawCanvaElement = createCanvas();
  const videoElement = createVideoElement();

  setSourceCanvasElement(sourceCanvasElement);
  setDrawCanvasElement(drawCanvaElement);
  setVideoElement(videoElement);

  videoElement.srcObject = captureStream;
  videoElement.play();

  videoElement.addEventListener('play', () => {
    setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      sourceCanvasElement.width = width;
      sourceCanvasElement.height = height;

      drawCanvaElement.height = height;
      drawCanvaElement.width = width;

      const sourceContext = sourceCanvasElement.getContext('2d');
      sourceContext?.drawImage(
        videoElement,
        0,
        0,
      );

      document.body.append(drawCanvasElement);
      resolveFn('init');
    });
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
