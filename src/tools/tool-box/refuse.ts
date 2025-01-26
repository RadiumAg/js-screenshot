import Style from '@screenshots/theme/refuse.module.scss';
import refuse from '@screenshots/assets/images/refuse.svg';
import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';
import { operateHistory } from '../canvas';

class Refuse extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;

  updatePosition(): void {
    /** empty **/
  }

  protected initEvent(): void {
    this.el?.addEventListener('click', () => {
      this.cutoutBox.destroy();
      operateHistory.clear();
    });
  }

  initRefuse() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.refuse);
    this.el.append(refuse);

    this.initEvent();
  }
}

export default Refuse;
