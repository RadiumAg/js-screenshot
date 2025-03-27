import { animateThrottleFn } from '@screenshots/utils';
import BaseBox from '../baseBox';
import {
  activeTarget,
  drawCanvasElement,
  dotControllerSize,
  isFirstInit,
  isLock,
  operateHistory,
  setActiveTarget,
  setFirstInit,
  setIsLock,
} from '../canvas';
import ToolBox from '../tool-box/toolBox';
import DotController from './dotController';

class CutoutBox extends BaseBox {
  startY = window.outerHeight - window.innerHeight;
  dotControllerArray: DotController[] = [];
  toolBox: ToolBox | null = null;

  setMask() {
    if (this.context === null) return;
    this.context.fillStyle = 'rgba(0,0,0,0.5)';
    this.context.fillRect(0, 0, drawCanvasElement.width, drawCanvasElement.height);
  }

  /**
   * 初始化dot controller
   */
  initDotControllerArray() {
    this.dotControllerArray = [
      new DotController(
        'nwse-resize',
        this,
        (x, y, oldX, oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageWith = oldCutoutBox.width + (oldX - x);
          const imageHeight = oldCutoutBox.height + (oldY - y);

          this.width = Math.abs(imageWith);
          this.height = Math.abs(imageHeight);

          if (imageWith > 0) {
            this.x = x + dotControllerSize / 2;
          } else {
            this.x = oldCutoutBox.x + oldCutoutBox.width;
          }

          if (imageHeight > 0) {
            this.y = y + dotControllerSize / 2;
          } else {
            this.y = oldCutoutBox.y + oldCutoutBox.height;
          }

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);

          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'ns-resize',
        this,
        (_x, y, _oldX, oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageHeight = oldCutoutBox.height + (oldY - y);

          this.height = Math.abs(imageHeight);

          if (imageHeight > 0) {
            this.y = y + dotControllerSize / 2;
          } else {
            this.y = oldCutoutBox.y + oldCutoutBox.height;
          }

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);

          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'nesw-resize',
        this,
        (x, y, oldX, oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageWidth = oldCutoutBox.width + (x - oldX);
          const imageHeight = oldCutoutBox.height + (oldY - y);

          if (imageWidth > 0) {
            this.x = oldCutoutBox.x;
          } else {
            this.x = x + dotControllerSize / 2;
          }

          if (imageHeight > 0) {
            this.y = y + dotControllerSize / 2;
          } else {
            this.y = oldCutoutBox.y + oldCutoutBox.height;
          }

          this.width = Math.abs(imageWidth);
          this.height = Math.abs(imageHeight);

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);
          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'ew-resize',
        this,
        (x, _y, oldX, _oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageWidth = oldCutoutBox.width + (x - oldX);

          if (imageWidth > 0) {
            this.x = oldCutoutBox.x;
          } else {
            this.x = x + dotControllerSize / 2;
          }

          this.width = Math.abs(imageWidth);

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);

          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'nwse-resize',
        this,
        (x, y, oldX, oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageWidth = oldCutoutBox.width + (x - oldX);
          const imageHeight = oldCutoutBox.height + (y - oldY);

          if (imageWidth > 0) {
            this.x = oldCutoutBox.x;
          } else {
            this.x = x + dotControllerSize / 2;
          }

          if (imageHeight > 0) {
            this.y = oldCutoutBox.y;
          } else {
            this.y = y;
          }

          this.width = Math.abs(imageWidth);
          this.height = Math.abs(imageHeight);

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);
          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'ns-resize',
        this,
        (_x, y, _oldX, oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageHeight = oldCutoutBox.height + (y - oldY);

          this.height = Math.abs(imageHeight);

          if (imageHeight > 0) {
            this.y = oldCutoutBox.y;
          } else {
            this.y = y + dotControllerSize / 2;
          }

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);
          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'nesw-resize',
        this,
        (x, y, oldX, oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageWith = oldCutoutBox.width + (oldX - x);
          const imageHeight = oldCutoutBox.height + (y - oldY);

          this.width = Math.abs(imageWith);
          this.height = Math.abs(imageHeight);

          if (imageWith > 0) {
            this.x = x + dotControllerSize / 2;
          } else {
            this.x = oldCutoutBox.x + oldCutoutBox.width;
          }

          if (imageHeight > 0) {
            this.y = oldCutoutBox.y;
          } else {
            this.y = y + dotControllerSize / 2;
          }

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);
          this.updateDotControllerArrayPosition();
          this.toolBox?.updatePosition(
            this.x + this.width,
            this.y + this.height,
          );
        },
      ),
      new DotController(
        'ew-resize',
        this,
        (x, _y, oldX, _oldY, oldCutoutBox) => {
          if (this.sourceContext === null || this.context === null) return;

          this.updateBackGround();
          const imageWith = oldCutoutBox.width + (oldX - x);

          this.width = Math.abs(imageWith);

          if (imageWith > 0) {
            this.x = x + dotControllerSize / 2;
          } else {
            this.x = oldCutoutBox.x + oldCutoutBox.width;
          }

          const imgData = this.sourceContext.getImageData(
            this.x,
            this.y + this.startY,
            this.width || 1,
            this.height || 1,
          );

          this.context.putImageData(imgData, this.x, this.y);
          this.updateDotControllerArrayPosition();
        },
      ),
    ];
  }

  /**
   * 更新dot position
   */
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

    drawCanvasElement.addEventListener('mousedown', event => {
      if (isLock) return;

      if (
        this.isCurrentArea(
          this.x,
          this.x + this.width,
          this.y,
          this.y + this.height,
          event.clientX,
          event.clientY,
        ) &&
        event.button === 0
      ) {
        oldClientX = event.clientX;
        oldClientY = event.clientY;
        oldX = this.x;
        oldY = this.y;

        isMouseDown = true;
        setActiveTarget(this);
      }
    });

    drawCanvasElement.addEventListener('mouseup', event => {
      if (activeTarget !== this) return;
      if (isLock) return;

      isMouseDown = false;
      setActiveTarget(null);
      setFirstInit(false);

      if (
        this.isCurrentArea(
          this.x,
          this.x + this.width,
          this.y,
          this.y + this.height,
          event.clientX,
          event.clientY,
        ) &&
        !isLock
      ) {
        drawCanvasElement.style.cursor = 'move';
      }
    });

    drawCanvasElement.addEventListener('mousemove', event => {
      if (activeTarget !== null && activeTarget !== this) return;
      if (isLock) return;

      if (isFirstInit && isMouseDown) {
        isMouseDown = false;
        const width = dotControllerSize * 2;
        const height = dotControllerSize * 2;
        this.width = width;
        this.height = height;
        this.x = event.clientX - width;
        this.y = event.clientY - height;

        updatePosition()?.then(() => {
          Reflect.set(event.target || {}, 'isFirstInit', true);
          this.dotControllerArray
            .at(4)
            ?.el?.dispatchEvent(new MouseEvent('mousedown', event));
        });
      }

      if (!isFirstInit && isMouseDown) {
        this.x = oldX + event.clientX - oldClientX;
        this.y = oldY + event.clientY - oldClientY;

        if (this.x < 0) {
          this.x = 0;
        }

        if (this.y < 0) {
          this.y = 0;
        }
        if (this.x + this.width > drawCanvasElement.width) {
          this.x = drawCanvasElement.width - this.width;
        }

        if (this.y + this.height > drawCanvasElement.height) {
          this.y = drawCanvasElement.height - this.height;
        }

        updatePosition();
      }

      if (
        this.isCurrentArea(
          this.x,
          this.x + this.width,
          this.y,
          this.y + this.height,
          event.clientX,
          event.clientY,
        )
      ) {
        drawCanvasElement.style.cursor = 'move';
      } else {
        drawCanvasElement.style.cursor = '';
      }
    });

    document.addEventListener('keydown', event => {
      if (event.ctrlKey && event.key === 'z') {
        const preImageData = operateHistory.prev();

        if (preImageData) {
          this.context.putImageData(preImageData, this.x, this.y);
        } else {
          this.context.putImageData(
            this.sourceContext.getImageData(
              this.x,
              this.y,
              this.width,
              this.height,
            ),
            this.x,
            this.y,
          );
        }
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

    // update toolBox
    this.toolBox?.updatePosition(this.x + this.width, this.y + this.height);
  }

  updateBackGround() {
    if (this.sourceContext === null || this.context === null) return;
    const startY = window.outerHeight - window.innerHeight;

    // clear all
    this.context.clearRect(0, 0, drawCanvasElement.width, drawCanvasElement.height);

    const documentArea = this.sourceContext.getImageData(
      0,
      startY,
      drawCanvasElement.width,
      drawCanvasElement.height,
    );

    this.context.putImageData(documentArea, 0, 0);
    this.setMask();
  }

  initCutoutBox() {
    this.width = drawCanvasElement.width;
    this.height = drawCanvasElement.height;

    this.toolBox = new ToolBox(this);
    this.toolBox.initToolBox();

    this.initEvent();
    this.initDotControllerArray();
    this.updatePosition();

    drawCanvasElement.style.cursor = 'move';
  }

  destory() {
    drawCanvasElement.remove();
    this.toolBox?.el?.remove();
    this.dotControllerArray.forEach(_ => _.el?.remove());

    setIsLock(false);
    setFirstInit(true);
    setActiveTarget(null);
  }
}

export default CutoutBox;
