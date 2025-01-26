import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';

class Arrow extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;

  updatePosition() {}

  protected initEvent() {}

  initSave() {}

  destory(): void {}
}

export default Arrow;
