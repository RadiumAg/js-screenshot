import type { AnyFun } from '@screenshots/utils';
import type CutoutBox from '../cutout-box';
import refuse from '@screenshots/assets/images/refuse.svg';
import Style from '@screenshots/theme/refuse.module.scss';
import BaseBox from '../base-box';
import { operateHistory } from '../canvas';

class Refuse extends BaseBox {
  constructor(private cutoutBox: CutoutBox, private destoryArray: AnyFun[]) {
    super();
  }

  el: HTMLDivElement | null = null;

  updatePosition(): void {
    /** empty */
  }

  protected initEvent(): void {
    this.el?.addEventListener('click', () => {
      this.cutoutBox.destroy();
      operateHistory.clear();
      this.destoryArray.forEach((fn) => {
        fn();
      });
    });
  }

  initRefuse() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.refuse);
    this.el.append(refuse);

    this.initEvent();
  }

  destroy(): void {
    // empty
  }
}

export default Refuse;
