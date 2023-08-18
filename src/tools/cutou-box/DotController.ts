import BaseBox from '../baseBox';
import { canvasElement } from '../canvas';

class DotController extends BaseBox {
  constructor(cursor: string) {
    super();

    this.cursor = cursor;
    this.initEvent();
  }

  protected width = 10;
  protected height = 10;
  private cursor = '';

  protected initEvent() {
    canvasElement.addEventListener('mousemove', event => {
      if (this.isCurrentArea(event.clientX, event.clientY)) {
        canvasElement.style.cursor = this.cursor;
      }
    });
  }

  update(x: number, y: number) {
    if (this.context === null) return;

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;

    this.context.fillStyle = '#ffff00';
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }

  beforeUpdate() {
    /* empty */
  }
}

export default DotController;
