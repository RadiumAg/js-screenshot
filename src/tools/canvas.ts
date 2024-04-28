/* eslint-disable import/no-mutable-exports */
import Pen from './tool-box/pen';
import CutoutBox from './cutout-box/cutoutBox';
import DotController from './cutout-box/dotController';
import TextBox from './tool-box/textBox';

const operateHistory = {
  currentIndex: 0,

  history: [] as ImageData[],

  pop() {
    this.currentIndex--;
    return this.history[this.currentIndex];
  },

  push(history: ImageData) {
    this.history[this.currentIndex] = history;
    this.currentIndex++;
  },
};

let isLock = false;
let isFirstInit = true;
let videoElement: HTMLVideoElement;
let canvasElement: HTMLCanvasElement;
let sourceCanvasElement: HTMLCanvasElement;
let activeTarget: CutoutBox | DotController | Pen | TextBox | null;

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
  operateHistory,
  sourceCanvasElement,
  setIsLock,
  setFirstInit,
  setVideoElement,
  setCanvasElement,
  setActiveTarget,
  setSourceCanvasElement,
};
