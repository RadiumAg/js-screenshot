import { animateThrottleFn } from '@screenshots/utils/animate-throttle';
import BaseBox from '../baseBox';
import {
  canvasElement,
  dotControllerSize,
  isFirstInit,
  setFirstInit,
  sourceCanvasElement,
} from '../canvas';
import DotController from './dotController';

class CutoutBox extends BaseBox {
  constructor() {
    super();
  }

  startY = window.outerHeight - window.innerHeight;
  dotControllerArray: DotController[] = [];

  setMask() {
    if (this.context === null) return;

    this.context.fillStyle = 'rgba(0,0,0,0.5)';
    this.context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  initDotControllerArray() {
    this.dotControllerArray = [
      new DotController('nwse-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageWith = oldCutoBox.width + (oldX - x);
        const imageHeight = oldCutoBox.height + (oldY - y);

        this.width = Math.abs(imageWith);
        this.height = Math.abs(imageHeight);

        if (imageWith >= 0) {
          this.x = x;
        } else {
          this.x = oldCutoBox.x + oldCutoBox.width;
        }

        if (imageHeight >= 0) {
          this.y = y;
        } else {
          this.y = oldCutoBox.y + oldCutoBox.height;
        }

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('ns-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageHeight = oldCutoBox.height + (oldY - y);

        this.height = Math.abs(imageHeight);

        if (imageHeight >= 0) {
          this.y = y;
        } else {
          this.y = oldCutoBox.y + oldCutoBox.height;
        }

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('nesw-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageWith = oldCutoBox.width + (x - oldX);
        const imageHeight = oldCutoBox.height + (oldY - y);

        if (imageWith < 0) {
          this.x = x;
        }

        if (imageHeight > 0) {
          this.y = y;
        }

        this.width = Math.abs(imageWith);
        this.height = Math.abs(imageHeight);

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('ew-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageWith = oldCutoBox.width + (x - oldX);

        if (imageWith < 0) {
          this.x = x;
        }

        this.width = Math.abs(imageWith);

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('nwse-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageWith = oldCutoBox.width + (x - oldX);
        const imageHeight = oldCutoBox.height + (y - oldY);

        if (imageWith < 0) {
          this.x = x;
        }

        if (imageHeight < 0) {
          this.y = y;
        }

        this.width = Math.abs(imageWith);
        this.height = Math.abs(imageHeight);

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('ns-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageHeight = oldCutoBox.height + (y - oldY);

        this.height = Math.abs(imageHeight);

        if (imageHeight < 0) {
          this.y = y;
        }

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('nesw-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageWith = oldCutoBox.width + (oldX - x);
        const imageHeight = oldCutoBox.height + (y - oldY);

        this.width = Math.abs(imageWith);
        this.height = Math.abs(imageHeight);

        if (imageWith >= 0) {
          this.x = x;
        } else {
          this.x = oldCutoBox.x + oldCutoBox.width;
        }

        if (imageHeight < 0) {
          this.y = y;
        }

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
      new DotController('ew-resize', this, (x, y, oldX, oldY, oldCutoBox) => {
        if (this.sourceContext === null || this.context === null) return;

        this.updateBackGround();
        const imageWith = oldCutoBox.width + (oldX - x);

        this.width = Math.abs(imageWith);

        if (imageWith >= 0) {
          this.x = x;
        } else {
          this.x = oldCutoBox.x + oldCutoBox.width;
        }

        const imgData = this.sourceContext.getImageData(
          this.x,
          this.y + this.startY,
          this.width || 1,
          this.height || 1,
        );

        this.context.putImageData(imgData, this.x, this.y);

        this.updateDotControllerArrayPosition();
      }),
    ];
  }

  updateDotControllerArrayPosition() {
    this.dotControllerArray[0].updatePosition(this.x, this.y);
    this.dotControllerArray[1].updatePosition(this.x + this.width / 2, this.y);
    this.dotControllerArray[2].updatePosition(this.x + this.width, this.y);
    this.dotControllerArray[3].updatePosition(
      this.x + this.width,
      this.y + this.height / 2,
    );
    this.dotControllerArray[4].updatePosition(
      this.x + this.width,
      this.y + this.height,
    );
    this.dotControllerArray[5].updatePosition(
      this.x + this.width / 2,
      this.y + this.height,
    );
    this.dotControllerArray[6].updatePosition(this.x, this.y + this.height);
    this.dotControllerArray[7].updatePosition(this.x, this.y + this.height / 2);
  }

  initEvent() {
    let isMouseDown = false;
    let oldX = this.x;
    let oldY = this.y;
    let oldClientX = 0;
    let oldClientY = 0;

    const updatePosition = animateThrottleFn(this.updatePosition.bind(this));

    canvasElement.addEventListener('mousedown', event => {
      if (
        this.isCurrentArea(
          this.x + dotControllerSize / 2,
          this.x + this.width - dotControllerSize / 2,
          this.y + dotControllerSize / 2,
          this.y + this.height - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        ) &&
        event.button === 0 &&
        !isFirstInit
      ) {
        oldClientX = event.clientX;
        oldClientY = event.clientY;
        oldX = this.x;
        oldY = this.y;

        isMouseDown = true;
      } else if (isFirstInit) {
        setFirstInit(false);

        this.width = dotControllerSize * 2;
        this.height = dotControllerSize * 2;
        this.x = event.clientX - dotControllerSize * 2;
        this.y = event.clientY - dotControllerSize * 2;

        updatePosition();

        setTimeout(() => {
          canvasElement.style.cursor = 'nwse-resize';
          canvasElement.dispatchEvent(new MouseEvent('mousedown', event));
        });
      }
    });

    canvasElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    canvasElement.addEventListener('mousemove', event => {
      if (isMouseDown) {
        this.x = oldX + event.clientX - oldClientX;
        this.y = oldY + event.clientY - oldClientY;

        if (this.x < 0) {
          this.x = 0;
        }

        if (this.y < 0) {
          this.y = 0;
        }
        if (this.x + this.width > canvasElement.width) {
          this.x = canvasElement.width - this.width;
        }

        if (this.y + this.height > canvasElement.height) {
          this.y = canvasElement.height - this.height;
        }

        updatePosition();
      }

      if (
        this.isCurrentArea(
          this.x + dotControllerSize / 2,
          this.x + this.width - dotControllerSize / 2,
          this.y + dotControllerSize / 2,
          this.y + this.height - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        )
      ) {
        canvasElement.style.cursor = 'move';
      } else {
        canvasElement.style.cursor = '';
      }
    });
  }

  updatePosition() {
    if (this.sourceContext === null || this.context === null) return;
    this.updateBackGround();

    const imgData = this.sourceContext.getImageData(
      this.x,
      this.y + this.startY,
      this.width || 1,
      this.height || 1,
    );

    this.context.putImageData(imgData, this.x, this.y);

    // update dotControllerArray
    this.dotControllerArray[0].updatePosition(this.x, this.y);
    this.dotControllerArray[1].updatePosition(this.x + this.width / 2, this.y);
    this.dotControllerArray[2].updatePosition(this.x + this.width, this.y);
    this.dotControllerArray[3].updatePosition(
      this.x + this.width,
      this.y + this.height / 2,
    );
    this.dotControllerArray[4].updatePosition(
      this.x + this.width,
      this.y + this.height,
    );
    this.dotControllerArray[5].updatePosition(
      this.x + this.width / 2,
      this.y + this.height,
    );
    this.dotControllerArray[6].updatePosition(this.x, this.y + this.height);
    this.dotControllerArray[7].updatePosition(this.x, this.y + this.height / 2);
  }

  updateBackGround() {
    if (this.sourceContext === null || this.context === null) return;
    const startY = window.outerHeight - window.innerHeight;

    // clear all
    this.context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const documentArea = this.sourceContext.getImageData(
      0,
      startY,
      canvasElement.width,
      canvasElement.height,
    );

    this.context.putImageData(documentArea, 0, 0);
    this.setMask();
  }

  initCutoutBox() {
    this.width = canvasElement.width;
    this.height = canvasElement.height;

    this.initEvent();
    this.initDotControllerArray();
    this.updatePosition();
  }
}

export default CutoutBox;
