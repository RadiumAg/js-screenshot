import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';

class Refuse extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }
}
