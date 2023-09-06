import { animateThrottleFn } from '@screenshots/utils/animate-throttle';
import Style from '@screenshots/theme/tool-box.module.scss';
import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';
import Pen from './pen';
import Save from './save';

class ToolBox extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
    this.updatePosition = animateThrottleFn(this.updatePosition.bind(this));
  }

  el: HTMLDivElement | null = null;

  updatePosition(x: number, y: number) {
    if (!this.el) return;
    this.x = x;
    this.y = y;

    this.el.style.left = `${x}px`;
    this.el.style.top = `${y + 10}px`;
    this.el.style.transform = `translateX(-100%)`;
  }

  initToolBox() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.toolBox);
    this.el.style.zIndex = '4';

    const pen = new Pen(this.cutoutBox);
    const save = new Save();

    pen.initPen();
    save.initSave();

    this.el.append(...([pen.el, save.el] as HTMLElement[]));
    document.body.append(this.el);
  }

  protected initEvent() {
    /** empty **/
  }
}

export default ToolBox;
