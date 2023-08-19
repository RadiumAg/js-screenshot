import BaseBox from '../baseBox';
import { canvasElement } from '../canvas';

type UpdateAxisCallback = (
  x: number,
  y: number,
  oldX: number,
  oldY: number,
) => void;

class DotController extends BaseBox {
  constructor(cursor: string, updateAxiscallback: UpdateAxisCallback) {
    super();

    this.cursor = cursor;
    this.initEvent();
    this.updateAxiscallback = updateAxiscallback;
  }

  private oldX = 0;
  private oldY = 0;
  protected width = 10;
  protected height = 10;
  private cursor = '';
  private updateAxiscallback: UpdateAxisCallback;

  protected initEvent() {
    let oldClientX = 0;
    let oldClientY = 0;
    let isMouseDown = false;

    canvasElement.addEventListener('mousemove', event => {
      if (isMouseDown) {
        this.x = this.oldX + event.clientX - oldClientX;
        this.y = this.oldY + event.clientY - oldClientY;

        this.updateAxis();
      }

      if (this.isCurrentArea(event.clientX, event.clientY)) {
        canvasElement.style.cursor = this.cursor;
      }
    });

    canvasElement.addEventListener('mousedown', event => {
      if (this.isCurrentArea(event.clientX, event.clientY)) {
        this.oldX = this.x;
        this.oldY = this.y;

        oldClientX = event.clientX;
        oldClientY = event.clientY;

        isMouseDown = true;
      }
    });

    canvasElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
  }

  update(x: number, y: number) {
    if (this.context === null) return;

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;

    this.context.fillStyle = '#ffff00';
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }

  updateAxis() {
    this.updateAxiscallback(this.x, this.y, this.oldX, this.oldY);
  }
}

export default DotController;
