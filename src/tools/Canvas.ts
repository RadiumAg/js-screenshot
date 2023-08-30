import CutoutBox from './cutou-box/cutoutBox';
import DotController from './cutou-box/dotController';

let isFirstInit = true;
let videoElement: HTMLVideoElement;
let canvasElement: HTMLCanvasElement;
let sourceCanvasElement: HTMLCanvasElement;
let activeTarget: CutoutBox | DotController | null;

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

function setActiveTarget(target: CutoutBox | DotController | null) {
  activeTarget = target;
}

export {
  activeTarget,
  isFirstInit,
  videoElement,
  canvasElement,
  dotControllerSize,
  sourceCanvasElement,
  setFirstInit,
  setVideoElement,
  setCanvasElement,
  setActiveTarget,
  setSourceCanvasElement,
};
