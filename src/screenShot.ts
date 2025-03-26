import {
  canvasElement,
  setCanvasElement,
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
 * @param width
 * @param height
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

  // 设置源source
  const sourceCanvasElement = createCanvas();
  setSourceCanvasElement(sourceCanvasElement);
  const videoElement = createVideoElement();
  // 设置截图source

  const canvas = createCanvas();
  setCanvasElement(canvas);
  setVideoElement(videoElement);

  videoElement.srcObject = captureStream;
  videoElement.play();

  videoElement.addEventListener('play', () => {
    setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      sourceCanvasElement.width = width;
      sourceCanvasElement.height = height;

      canvas.height = height;
      canvas.width = width;

      const sourceContext = sourceCanvasElement.getContext('2d');
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
    }, 2000);
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
