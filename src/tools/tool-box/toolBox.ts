import { animateThrottleFn } from '@screenshots/utils';
import Style from '@screenshots/theme/tool-box.module.scss';
import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';
import Pen from './pen';
import Save from './save';
import TextBox from './textBox';
import Refuse from './refuse';

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
    const save = new Save(this.cutoutBox);
    const textBox = new TextBox(this.cutoutBox);
    const refuse = new Refuse(this.cutoutBox, [pen.destory]);

    pen.initPen();
    save.initSave();
    refuse.initRefuse();
    textBox.initTextBox();

    this.el.append(
      ...([textBox.el, pen.el, refuse.el, save.el] as HTMLElement[]),
    );
    document.body.append(this.el);
  }

  protected initEvent() {
    /** empty **/
  }

  destory(): void {}
}

export default ToolBox;
