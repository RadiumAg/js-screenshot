import Style from '@screenshots/theme/pen.module.scss';
import pen from '@screenshots/assets/images/pen.svg';
import BaseBox from '../baseBox';
import {
  activeTarget,
  drawCanvasElement,
  dotControllerSize,
  operateHistory,
  setActiveTarget,
  setIsLock,
} from '../canvas';
import CutoutBox from '../cutout-box/cutoutBox';

class Pen extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;

  initPen() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.pen);
    this.el.append(pen);

    this.initEvent();
  }

  updatePosition() {
    /** pen */
  }

  protected initEvent() {
    let isMouseDown = false;

    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    drawCanvasElement.addEventListener('mousemove', event => {
      if (activeTarget !== this) return;

      if (
        this.isCurrentArea(
          this.cutoutBox.x + dotControllerSize / 2,
          this.cutoutBox.x + this.cutoutBox.width - dotControllerSize / 2,
          this.cutoutBox.y + dotControllerSize / 2,
          this.cutoutBox.y + this.cutoutBox.height - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        ) &&
        isMouseDown
      ) {
        this.context.lineWidth = 15;
        this.context.lineCap = 'round';
        this.context.lineTo(event.clientX, event.clientY);
        this.context.stroke();
      }
    });

    drawCanvasElement.addEventListener('mousedown', event => {
      if (activeTarget !== this) return;

      if (
        this.isCurrentArea(
          this.cutoutBox.x + dotControllerSize / 2,
          this.cutoutBox.x + this.cutoutBox.width - dotControllerSize / 2,
          this.cutoutBox.y + dotControllerSize / 2,
          this.cutoutBox.y + this.cutoutBox.height - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        )
      ) {
        setActiveTarget(this);
        isMouseDown = true;

        this.context.strokeStyle = 'blue';
        this.context.beginPath();
        this.context.moveTo(event.clientX, event.clientY);
      } else {
        drawCanvasElement.style.cursor = '';
      }
    });

    drawCanvasElement.addEventListener('mouseup', () => {
      if (isMouseDown) {
        const imageData = this.context.getImageData(
          this.cutoutBox.x,
          this.cutoutBox.y,
          this.cutoutBox.width,
          this.cutoutBox.height,
        );
        operateHistory.push(imageData);
      }
      isMouseDown = false;
    });
  }

  destory(): void {}
}

export default Pen;
