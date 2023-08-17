import {
  canvasElement,
  setCanvasElement,
  setSourceCanvasElement,
  setVideoElement,
  sourceCanvasElement,
  videoElement,
} from './tools/Canvas';
import CutoutBox from './tools/cutou-box/CutoutBox';

function createCanvas() {
  const canvas = document.createElement('canvas');

  // init size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // init position
  canvas.style.position = 'fixed';
  canvas.style.top = '0px';
  canvas.style.left = '0px';

  return canvas;
}

async function displayMediaMode() {
  let resolveFn: (value: unknown) => void;

  const promise = new Promise(resolve => {
    resolveFn = resolve;
  });

  setSourceCanvasElement(createCanvas());
  setCanvasElement(createCanvas());
  setVideoElement(document.createElement('video'));

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
  });

  videoElement.srcObject = captureStream;
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();

    const context = canvasElement.getContext('2d');
    const sourceContext = sourceCanvasElement.getContext('2d');

    context?.drawImage(
      videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height,
    );

    sourceContext?.drawImage(
      videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height,
    );

    document.body.append(canvasElement);
    resolveFn('init');
  });

  return promise;
}

type ScreenShotOptions = {
  mode: 'displayMedia' | 'html2canvas';
};

class ScreenShot {
  constructor(private screenShotOptions: ScreenShotOptions) {}

  async shot() {
    await displayMediaMode();
    new CutoutBox().initCutoutBox();
  }
}

export default ScreenShot;
