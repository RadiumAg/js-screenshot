import type CutoutBox from '../cutout-box';
import arrow from '@screenshots/assets/images/arrow.svg';
import Style from '@screenshots/theme/arrow.module.scss';
import BaseBox from '../base-box';
import {
  activeTarget,
  drawCanvasElement,
  operateHistory,
  setActiveTarget,
  setIsLock,
} from '../canvas';

/**
 * 箭头
 *
 * @class Arrow
 * @extends {BaseBox}
 */
class Arrow extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;
  private firstScreenShotImageData: ImageData | null = null;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private arrowColor = 'red';
  private arrowWidth = 2;
  private arrowHeadLength = 10;

  updatePosition() {
    /** arrow */
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });
    drawCanvasElement.addEventListener('mousedown', (event) => {
      /**
       * 获取原始截图的imageData
       */
      this.firstScreenShotImageData = this.context.getImageData(
        this.cutoutBox.x,
        this.cutoutBox.y,
        this.cutoutBox.width,
        this.cutoutBox.height,
      );

      if (activeTarget !== this)
        return;

      this.isCurrentArea(
        this.cutoutBox.x,
        this.cutoutBox.x + this.cutoutBox.width,
        this.cutoutBox.y,
        this.cutoutBox.y + this.cutoutBox.height,
        event.clientX,
        event.clientY,
      );
      this.isDrawing = true;
      this.startX = event.clientX;
      this.startY = event.clientY;

      this.context.beginPath();
      this.context.strokeStyle = this.arrowColor;
      this.context.lineWidth = this.arrowWidth;
    });

    drawCanvasElement.addEventListener('mousemove', (event) => {
      if (this.firstScreenShotImageData === null)
        return;
      if (!this.isDrawing)
        return;
      if (activeTarget !== this)
        return;

      this.context.putImageData(
        this.firstScreenShotImageData,
        this.cutoutBox.x,
        this.cutoutBox.y,
      );

      this.drawArrow(this.startX, this.startY, event.clientX, event.clientY);
    });

    drawCanvasElement.addEventListener('mouseup', () => {
      if (!this.isDrawing || activeTarget !== this)
        return;

      this.isDrawing = false;

      const imageData = this.context.getImageData(
        this.cutoutBox.x,
        this.cutoutBox.y,
        this.cutoutBox.width,
        this.cutoutBox.height,
      );
      operateHistory.push(imageData);
    });
  }

  private drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
    const angle = Math.atan2(toY - fromY, toX - fromX);

    this.context.beginPath();
    this.context.moveTo(fromX, fromY);
    this.context.lineTo(toX, toY);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(toX, toY);
    this.context.lineTo(
      toX - this.arrowHeadLength * Math.cos(angle - Math.PI / 6),
      toY - this.arrowHeadLength * Math.sin(angle - Math.PI / 6),
    );
    this.context.moveTo(toX, toY);
    this.context.lineTo(
      toX - this.arrowHeadLength * Math.cos(angle + Math.PI / 6),
      toY - this.arrowHeadLength * Math.sin(angle + Math.PI / 6),
    );
    this.context.stroke();
  }

  initArrow() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.arrow);
    this.el.append(arrow);
    this.el.tabIndex = 0;

    this.initEvent();
  }

  destroy(): void {
    this.isDrawing = false;
    this.el?.remove();
  }
}

export default Arrow;
