import { canvasElement, sourceCanvasElement } from '../Canvas';

class CutoutBox {
  constructor(
    private context = canvasElement.getContext('2d'),
    private sourceContext = sourceCanvasElement.getContext('2d'),
  ) {}

  private x = 10;
  private y = 10;
  private width = 0;
  private height = 0;

  setMask() {
    if (this.context === null) return;

    this.context.fillStyle = 'rgba(0,0,0,0.5)';
    this.context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  initEvent() {
    let isMouseDown = false;
    let oldX = this.x;
    let oldY = this.y;
    let oldClientX = 0;
    let oldClientY = 0;

    const isCutoutBoxArea = (clientX: number, clientY: number) =>
      clientX > this.x &&
      clientX < this.x + this.width &&
      clientY > this.y &&
      clientY < this.y + this.height;

    canvasElement.addEventListener('mousedown', event => {
      if (isCutoutBoxArea(event.clientX, event.clientY) && event.button === 0) {
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

        this.update();
      }

      if (isCutoutBoxArea(event.clientX, event.clientY)) {
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
  }

  initCutoutBox() {
    this.width = 200;
    this.height = 200;

    this.update();
    this.initEvent();
  }
}

export default CutoutBox;
