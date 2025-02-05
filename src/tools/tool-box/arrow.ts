import Style from '@screenshots/theme/pen.module.scss';
import BaseBox from '../baseBox';
import { setActiveTarget, setIsLock } from '../canvas';
import CutoutBox from '../cutout-box/cutoutBox';

class Arrow extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;

  updatePosition() {
    /** arrow */
  }

  protected initEvent() {
    const isMouseDown = false;

    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });
  }

  initArrow() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.pen);
    this.el.append(pen);

    this.initEvent();
  }

  destory(): void {}
}

export default Arrow;
