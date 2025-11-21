/* eslint-disable import/no-mutable-exports */
import type CutoutBox from './cutout-box';
import type DotController from './cutout-box/dot-controller';
import type Arrow from './tool-box/arrow';
import type Mosaic from './tool-box/mosaic';
import type Pen from './tool-box/pen';
import type TextBox from './tool-box/text-box';

class OperateHistory extends Array<ImageData> {
  private currentHistoryIndex = -1;

  push(...items: any[]) {
    this.currentHistoryIndex = this.length - 1;
    return super.push(...items);
  }

  prev() {
    if (this.currentHistoryIndex === 0) {
      return this[this.currentHistoryIndex];
    }

    this.currentHistoryIndex--;
    return this[this.currentHistoryIndex];
  }

  next() {
    if (this.currentHistoryIndex === this.length) {
      return this[this.currentHistoryIndex];
    }

    this.currentHistoryIndex++;
    return this[this.currentHistoryIndex];
  }

  clear() {
    this.length = 0;
    this.currentHistoryIndex = -1;
  }

  async getScreenShotUrl(index: number) {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');
    context?.putImageData(this[index], 0, 0);
    const blob = await new Promise<Blob>((resolve) => {
      canvasElement.toBlob((data) => {
        if (data)
          resolve(data);
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
// Canvas for drawing
let drawCanvasElement: HTMLCanvasElement;
// Canvas for original screenshot
let sourceCanvasElement: HTMLCanvasElement;
let activeTarget: CutoutBox | DotController | Pen | TextBox | Arrow | Mosaic | null;

const dotControllerSize = 10;

function setVideoElement(videoElementObject: HTMLVideoElement) {
  videoElement = videoElementObject;
}

function setDrawCanvasElement(canvasElementObject: HTMLCanvasElement) {
  drawCanvasElement = canvasElementObject;
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
  activeTarget,
  dotControllerSize,
  drawCanvasElement,
  isFirstInit,
  isLock,
  operateHistory,
  setActiveTarget,
  setDrawCanvasElement,
  setFirstInit,
  setIsLock,
  setSourceCanvasElement,
  setVideoElement,
  sourceCanvasElement,
  videoElement,
};
