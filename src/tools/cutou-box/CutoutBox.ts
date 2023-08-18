import BaseBox from '../baseBox';
import { canvasElement } from '../canvas';
import DotController from './dotController';

class CutoutBox extends BaseBox {
  constructor() {
    super();
  }

  dotControllerArray: DotController[] = [];

  setMask() {
    if (this.context === null) return;

    this.context.fillStyle = 'rgba(0,0,0,0.5)';
    this.context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  initDotControllerArray() {
    this.dotControllerArray = [
      new DotController('nwse-resize'),
      new DotController('ns-resize'),
      new DotController('nesw-resize'),
      new DotController('ew-resize'),
      new DotController('nwse-resize'),
      new DotController('ns-resize'),
      new DotController('nesw-resize'),
      new DotController('ew-resize'),
    ];
  }

  updateDotControllerArray() {
    this.dotControllerArray[0].update(this.x, this.y);
    this.dotControllerArray[1].update(this.x + this.width / 2, this.y);
    this.dotControllerArray[2].update(this.x + this.width, this.y);
    this.dotControllerArray[3].update(
      this.x + this.width,
      this.y + this.height / 2,
    );
    this.dotControllerArray[4].update(
      this.x + this.width,
      this.y + this.height,
    );
    this.dotControllerArray[5].update(
      this.x + this.width / 2,
      this.y + this.height,
    );
    this.dotControllerArray[6].update(this.x, this.y + this.height);
    this.dotControllerArray[7].update(this.x, this.y + this.height / 2);
  }

  initEvent() {
    let isMouseDown = false;
    let oldX = this.x;
    let oldY = this.y;
    let oldClientX = 0;
    let oldClientY = 0;
    let isUpdateFinish = true;

    canvasElement.addEventListener('mousedown', event => {
      if (
        this.isCurrentArea(event.clientX, event.clientY) &&
        event.button === 0
      ) {
        oldClientX = event.clientX;
        oldClientY = event.clientY;
        oldX = this.x;
        oldY = this.y;

        isMouseDown = true;
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

        if (isUpdateFinish) {
          isUpdateFinish = false;
          requestAnimationFrame(() => {
            this.update();
            isUpdateFinish = true;
          });
        }
      }

      if (this.isCurrentArea(event.clientX, event.clientY)) {
        canvasElement.style.cursor = 'move';
      } else {
        canvasElement.style.cursor = '';
      }
    });
  }

  update() {
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

    const imgData = this.sourceContext.getImageData(
      this.x,
      this.y + startY,
      this.width,
      this.height,
    );

    this.context.putImageData(imgData, this.x, this.y);

    // update dotControllerArray
    this.updateDotControllerArray();
  }

  initCutoutBox() {
    this.width = canvasElement.width / 2;
    this.height = canvasElement.height / 2;

    this.initEvent();
    this.initDotControllerArray();
    this.update();
  }
}

export default CutoutBox;
