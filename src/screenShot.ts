import {
  canvasElement,
  setCanvasElement,
  setSourceCanvasElement,
  setVideoElement,
  sourceCanvasElement,
  videoElement,
} from './tools/canvas';
import CutoutBox from './tools/cutout-box/cutoutBox';

type ScreenShotOptions = {
  afterFinished: () => void;
};

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

// 物理像素/ css = 屏幕 / window.innerHeight
async function displayMediaMode() {
  let resolveFn: (value: unknown) => void;
  const promise = new Promise(resolve => {
    resolveFn = resolve;
  });
  const width = window.innerWidth;
  const height = window.innerHeight;

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'window',
    },
  });
  setSourceCanvasElement(createCanvas(width, height));
  setCanvasElement(createCanvas(width, height));

  setVideoElement(document.createElement('video'));
  videoElement.width = width;
  videoElement.height = height;
  videoElement.style.objectFit = 'cover';
  videoElement.srcObject = captureStream;

  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
    const sourceContext = sourceCanvasElement.getContext('2d');

    setTimeout(() => {
      sourceContext?.drawImage(videoElement, 0, 0, 0, 0, 0, 0, width, height);
      document.body.append(canvasElement);
      document.body.append(videoElement);

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
