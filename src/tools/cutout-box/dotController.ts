import { animateThrottleFn } from '@screenshots/utils';
import Style from '@screenshots/theme/dot.controller.module.scss';
import BaseBox from '../baseBox';
import {
  activeTarget,
  canvasElement,
  dotControllerSize,
  operateHistory,
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
    this.initDotController();

    this.initEvent();
    this.updateAxiscallback = updateAxiscallback;
  }
  el: HTMLDivElement | null = null;
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
    });

    this.el?.addEventListener('mousedown', event => {
      event.stopPropagation();

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

    this.el?.addEventListener('mouseup', () => {
      if (activeTarget !== this) return;
      operateHistory.push(
        this.context.getImageData(
          this.cutoutBox.x,
          this.cutoutBox.y,
          this.cutoutBox.width,
          this.cutoutBox.height,
        ),
      );
      isMouseDown = false;
      setActiveTarget(null);
      setFirstInit(false);
    });
  }

  updatePosition(x: number, y: number) {
    if (this.context === null || this.el === null) return;

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;

    this.el.style.left = `${this.x}px`;
    this.el.style.top = `${this.y}px`;
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

  initDotController() {
    this.el = document.createElement('div');

    this.el.style.width = `${this.width}px`;
    this.el.style.height = `${this.height}px`;
    this.el.style.cursor = this.cursor;
    this.el.classList.add(Style['dot-controller']);

    document.body.append(this.el);
  }
}

export default DotController;
export type { UpdateAxisCallback };
