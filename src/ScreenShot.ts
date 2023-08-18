import {
  canvasElement,
  setCanvasElement,
  setSourceCanvasElement,
  setVideoElement,
  sourceCanvasElement,
  videoElement,
} from './tools/Canvas';
import CutoutBox from './tools/cutou-box/CutoutBox';

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

async function displayMediaMode() {
  let resolveFn: (value: unknown) => void;

  const promise = new Promise(resolve => {
    resolveFn = resolve;
  });

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'window',
    },
  });

  const { width, height } = captureStream.getVideoTracks()[0].getSettings();

  setSourceCanvasElement(createCanvas(width || 0, height || 0));
  setCanvasElement(createCanvas(window.innerWidth, window.innerHeight));
  setVideoElement(document.createElement('video'));

  videoElement.srcObject = captureStream;

  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();

    const sourceContext = sourceCanvasElement.getContext('2d');

    setTimeout(() => {
      sourceContext?.drawImage(videoElement, 0, 0);
      document.body.append(canvasElement);

      resolveFn('init');
    }, 1000);
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
