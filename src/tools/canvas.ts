/* eslint-disable import/no-mutable-exports */
import CutoutBox from './cutou-box/cutoutBox';
import DotController from './cutou-box/dotController';
import Pen from './tool-box/pen';

let isLock = false;
let isFirstInit = true;
let videoElement: HTMLVideoElement;
let canvasElement: HTMLCanvasElement;
let sourceCanvasElement: HTMLCanvasElement;
let activeTarget: CutoutBox | DotController | Pen | null;

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

function setActiveTarget(target: typeof activeTarget) {
  activeTarget = target;
}

function setIsLock(isLockValue: boolean) {
  isLock = isLockValue;
}

export {
  isLock,
  activeTarget,
  isFirstInit,
  videoElement,
  canvasElement,
  dotControllerSize,
  sourceCanvasElement,
  setIsLock,
  setFirstInit,
  setVideoElement,
  setCanvasElement,
  setActiveTarget,
  setSourceCanvasElement,
};
