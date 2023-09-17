import Style from '@screenshots/theme/pen.module.scss';
import pen from '@screenshots/assets/images/pen.svg?raw';
import BaseBox from '../baseBox';
import {
  activeTarget,
  canvasElement,
  dotControllerSize,
  isLock,
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
    this.el.innerHTML = pen;

    this.initEvent();
  }

  updatePosition() {}

  protected initEvent() {
    let isMouseDown = false;

    this.el?.addEventListener('click', () => {
      setIsLock(!isLock);
    });

    canvasElement.addEventListener('mousemove', event => {
      if (activeTarget !== null && activeTarget !== this) return;

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

    canvasElement.addEventListener('mousedown', event => {
      if (!isLock) return;

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
        canvasElement.style.cursor = '';
      }
    });

    canvasElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
  }
}

export default Pen;
