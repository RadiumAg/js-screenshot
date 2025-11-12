import type CutoutBox from '../cutout-box';
import Style from '@screenshots/theme/tool-box.module.scss';
import { animateThrottleFn } from '@screenshots/utils';
import BaseBox from '../base-box';
import Arrow from './arrow';
import Mosaic from './mosaic';
import Pen from './pen';
import Refuse from './refuse';
import Save from './save';
import TextBox from './text-box';

/**
 *
 * 外框
 *
 * @class ToolBox
 * @extends {BaseBox}
 */
class ToolBox extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
    this.updatePosition = animateThrottleFn(this.updatePosition.bind(this));
  }

  el: HTMLDivElement | null = null;

  updatePosition(x: number, y: number) {
    if (!this.el)
      return;
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
    const arrow = new Arrow(this.cutoutBox);
    const textBox = new TextBox(this.cutoutBox);
    const mosaic = new Mosaic(this.cutoutBox);

    const refuse = new Refuse(this.cutoutBox, [
      pen.destroy,
      save.destroy,
      arrow.destroy,
      mosaic.destroy,
      textBox.destroy,
    ]);

    pen.initPen();
    save.initSave();
    refuse.initRefuse();
    textBox.initTextBox();
    arrow.initArrow();
    mosaic.initMosaic();

    this.el.append(
      ...([
        textBox.el,
        pen.el,
        arrow.el,
        mosaic.el,
        refuse.el,
        save.el,
      ] as HTMLElement[]),
    );

    document.body.append(this.el);
  }

  protected initEvent() {
    /** empty */
  }

  destroy(): void {
    this.el?.remove();
  }
}

export default ToolBox;
