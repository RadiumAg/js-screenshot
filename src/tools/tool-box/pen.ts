import Style from '@screenshots/theme/pen.module.scss';
import pen from '@screenshots/assets/images/pen.svg?raw';
import BaseBox from '../baseBox';
import { canvasElement, setActiveTarget, setIsLock } from '../canvas';

class Pen extends BaseBox {
  el: HTMLDivElement | null = null;

  initPen() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.pen);
    this.el.innerHTML = pen;

    this.initEvent();
  }

  updatePosition() {}

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setActiveTarget(this);
      setIsLock(true);
      canvasElement.style.cursor = 'crosshair';
    });
  }
}

export default Pen;
