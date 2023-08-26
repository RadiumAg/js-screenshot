let videoElement: HTMLVideoElement;
let canvasElement: HTMLCanvasElement;
let sourceCanvasElement: HTMLCanvasElement;
let isFirstInit = true;
const dotControllerSize = 10;

function setVideoElement(videoElementObject: HTMLVideoElement) {
  videoElement = videoElementObject;
}

function setCanvasElement(canvasElementObject: HTMLCanvasElement) {
  canvasElement = canvasElementObject;
}

function setSourceCanvasElement(sourceCanvasElementObject: HTMLCanvasElement) {
  sourceCanvasElement = sourceCanvasElementObject;
}

function setFirstInit(value: boolean) {
  isFirstInit = value;
}

export {
  isFirstInit,
  videoElement,
  canvasElement,
  dotControllerSize,
  sourceCanvasElement,
  setFirstInit,
  setVideoElement,
  setCanvasElement,
  setSourceCanvasElement,
};
