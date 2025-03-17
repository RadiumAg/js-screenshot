import Style from '@screenshots/theme/arrow.module.scss';
import arrow from '@screenshots/assets/images/arrow.svg';
import BaseBox from '../baseBox';
import { setActiveTarget, setIsLock } from '../canvas';
import CutoutBox from '../cutout-box/cutoutBox';

class Arrow extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;

  updatePosition() {
    /** arrow */
  }

  protected initEvent() {
    const isMouseDown = false;

    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');

    canvasElement.addEventListener('mousedown', event => {
      setActiveTarget(this);
      this.isDrawing = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
    });

    canvasElement.addEventListener('mousemove', event => {
      if (this.isDrawing) {
        context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
        this.drawArrow(
          context,
          this.startX,
          this.startY,
          event.clientX,
          event.clientY,
        );
      }
    });

    canvasElement.addEventListener('mouseup', event => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.drawArrow(
          context,
          this.startX,
          this.startY,
          event.clientX,
          event.clientY,
        );
      }
    });
  }

  private drawArrow(
    context: CanvasRenderingContext2D | null,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) {
    if (!context) return;
    const headlen = 10; // 箭头头部长度
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6),
    );
    context.moveTo(toX, toY);
    context.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6),
    );
    context.stroke();
  }

  initArrow() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.arrow);
    this.el.append(arrow);

    this.initEvent();
  }

  destory(): void {}
}

export default Arrow;
