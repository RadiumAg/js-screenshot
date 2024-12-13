/* eslint-disable import/no-mutable-exports */
import Pen from './tool-box/pen';
import CutoutBox from './cutout-box/cutoutBox';
import DotController from './cutout-box/dotController';
import TextBox from './tool-box/textBox';

class OperateHistory extends Array<ImageData> {
  private currentHistoryIndex = -1;

  push(...items: any[]) {
    console.log('push', items);
    this.currentHistoryIndex++;
    return super.push(...items);
  }

  prev() {
    if (this.currentHistoryIndex === 0) {
      return operateHistory[this.currentHistoryIndex];
    }

    this.currentHistoryIndex--;
    return operateHistory[this.currentHistoryIndex];
  }

  next() {
    if (this.currentHistoryIndex === this.length) {
      return operateHistory[this.currentHistoryIndex];
    }

    this.currentHistoryIndex++;
    return operateHistory[this.currentHistoryIndex];
  }

  clear() {
    this.length = 0;
    this.currentHistoryIndex = -1;
  }

  async getScreenShotUrl(index: number) {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');
    context?.putImageData(this[index], 0, 0);
    const blob = await new Promise<Blob>(resolve => {
      canvasElement.toBlob(data => {
        if (data) resolve(data);
      });
    });

    return URL.createObjectURL(blob);
  }
}

const operateHistory: OperateHistory = new OperateHistory();
window.operateHistory = operateHistory;

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
