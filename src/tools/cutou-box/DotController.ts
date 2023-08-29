import { animateThrottleFn } from '@screenshots/utils/animate-throttle';
import BaseBox from '../baseBox';
import { canvasElement, dotControllerSize } from '../canvas';
import CutoutBox from './cutoutBox';

type UpdateAxisCallback = (
  x: number,
  y: number,
  oldX: number,
  oldY: number,
  oldCutoBox: CutoutBox,
) => void;

class DotController extends BaseBox {
  constructor(
    cursor: string,
    cutoBox: CutoutBox,
    updateAxiscallback: UpdateAxisCallback,
  ) {
    super();

    this.cursor = cursor;
    this.cutoBox = cutoBox;
    this.initEvent();
    this.updateAxiscallback = updateAxiscallback;
  }

  private oldX = 0;
  private oldY = 0;
  protected width = dotControllerSize;
  protected height = dotControllerSize;
  private cursor = '';
  private cutoBox: CutoutBox;
  private oldCutoBox: CutoutBox;
  private updateAxiscallback: UpdateAxisCallback;

  protected initEvent() {
    let oldClientX = 0;
    let oldClientY = 0;
    let isMouseDown = false;
    const updateAxis = animateThrottleFn(this.updateAxis.bind(this));

    canvasElement.addEventListener('mousemove', event => {
      if (isMouseDown) {
        this.x = this.oldX + event.clientX - oldClientX;
        this.y = this.oldY + event.clientY - oldClientY;

        updateAxis();
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
        canvasElement.style.cursor = this.cursor;
      }
    });

    canvasElement.addEventListener('mousedown', event => {
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
        this.oldX = this.x;
        this.oldY = this.y;

        oldClientX = event.clientX;
        oldClientY = event.clientY;

        this.oldCutoBox = {
          ...this.cutoBox,
          ...Object.getPrototypeOf(this.cutoBox),
        };
        isMouseDown = true;
      }
    });

    canvasElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
  }

  updatePosition(x: number, y: number) {
    if (this.context === null) return;

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;

    this.context.fillStyle = '#ffff00';
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }

  updateAxis() {
    this.updateAxiscallback(
      this.x,
      this.y,
      this.oldX,
      this.oldY,
      this.oldCutoBox,
    );
  }
}

export default DotController;
export type { UpdateAxisCallback };
