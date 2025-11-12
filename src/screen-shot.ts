import {
  setDrawCanvasElement,
  setSourceCanvasElement,
  setVideoElement,
} from './tools/canvas';
import CutoutBox from './tools/cutout-box';
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
    preferCurrentTab: true,
  });

  const sourceCanvasElement = createCanvas();
  const drawCanvasElement = createCanvas();
  const videoElement = createVideoElement();
  const sourceContext = sourceCanvasElement.getContext('2d');

  setSourceCanvasElement(sourceCanvasElement);
  setDrawCanvasElement(drawCanvasElement);
  setVideoElement(videoElement);

  videoElement.srcObject = captureStream;
  videoElement.play();

  function updateCanvas() {
    if (
      sourceContext &&
      videoElement.readyState === videoElement.HAVE_ENOUGH_DATA
    ) {
      sourceContext.drawImage(videoElement, 0, 0);
      return;
    }

    requestAnimationFrame(updateCanvas);
  }

  videoElement.addEventListener('play', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sourceCanvasElement.width = width;
    sourceCanvasElement.height = height;

    drawCanvasElement.height = height;
    drawCanvasElement.width = width;

    document.body.append(drawCanvasElement);

    updateCanvas();
    resolveFn('init');
  });

  return promise;
}

class ScreenShot {
  constructor(private screenShotOptions: ScreenShotOptions) {
    if (__isDev__) {
      console.log('[DEBUG] options', this.screenShotOptions);
    }
  }

  async shot() {
    await displayMediaMode();
    new CutoutBox().initCutoutBox();
  }
}

export default ScreenShot;
