import { animateThrottleFn } from '@screenshots/utils/animate-throttle';
import BaseBox from '../baseBox';
import {
  activeTarget,
  canvasElement,
  dotControllerSize,
  setActiveTarget,
  setFirstInit,
} from '../canvas';
import CutoutBox from './cutoutBox';

type UpdateAxisCallback = (
  x: number,
  y: number,
  oldX: number,
  oldY: number,
  oldCutoutBox: CutoutBox,
) => void;

class DotController extends BaseBox {
  constructor(
    cursor: string,
    cutoutBox: CutoutBox,
    updateAxiscallback: UpdateAxisCallback,
  ) {
    super();

    this.cursor = cursor;
    this.cutoutBox = cutoutBox;
    this.initEvent();
    this.updateAxiscallback = updateAxiscallback;
  }

  width = dotControllerSize;
  height = dotControllerSize;

  private oldX = 0;
  private oldY = 0;
  private cursor = '';
  private cutoutBox: CutoutBox;
  private oldCutoutBox: CutoutBox | null = null;
  private updateAxiscallback: UpdateAxisCallback;
  protected initEvent() {
    let oldClientX = 0;
    let oldClientY = 0;
    let isMouseDown = false;
    const updateAxis = animateThrottleFn(this.updateAxis.bind(this));

    canvasElement.addEventListener('mousemove', event => {
      if (activeTarget !== null && activeTarget !== this) return;

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
      const isFirstMoveDown = Reflect.get(event.target || {}, 'isFirstInit');

      if (
        this.isCurrentArea(
          this.x,
          this.x + this.width,
          this.y,
          this.y + this.height,
          event.clientX,
          event.clientY,
        ) ||
        isFirstMoveDown
      ) {
        this.oldX = this.x;
        this.oldY = this.y;

        oldClientX = event.clientX;
        oldClientY = event.clientY;

        this.oldCutoutBox = {
          ...this.cutoutBox,
          ...Object.getPrototypeOf(this.cutoutBox),
        };

        isMouseDown = true;
        setActiveTarget(this);
        Reflect.deleteProperty(event.target || {}, 'isFirstInit');
      }
    });

    canvasElement.addEventListener('mouseup', () => {
      isMouseDown = false;
      setActiveTarget(null);
      setFirstInit(false);
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
      this.oldCutoutBox as CutoutBox,
    );
  }
}

export default DotController;
export type { UpdateAxisCallback };
