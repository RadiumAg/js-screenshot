let videoElement: HTMLVideoElement;
let canvasElement: HTMLCanvasElement;
let sourceCanvasElement: HTMLCanvasElement;

function setVideoElement(videoElementObject: HTMLVideoElement) {
  videoElement = videoElementObject;
}

function setCanvasElement(canvasElementObject: HTMLCanvasElement) {
  canvasElement = canvasElementObject;
}

function setSourceCanvasElement(sourceCanvasElementObject: HTMLCanvasElement) {
  sourceCanvasElement = sourceCanvasElementObject;
}

export {
  videoElement,
  canvasElement,
  sourceCanvasElement,
  setVideoElement,
  setCanvasElement,
  setSourceCanvasElement,
};
