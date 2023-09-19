import Style from '@screenshots/theme/text-box.module.scss';
import textBox from '@screenshots/assets/images/text-box.svg?raw';
import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';
import { activeTarget, canvasElement, isLock, setIsLock } from '../canvas';

class TextBox extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;

  updatePosition(...args: any[]) {}

  initTextBox() {
    this.el = document.createElement('div');
    this.el.classList.add(Style['text-box']);
    this.el.innerHTML = textBox;

    this.initEvent();
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(!isLock);
    });

    canvasElement.addEventListener('mousedown', event => {
      if (activeTarget !== null && activeTarget !== this) return;
      const textBoxInput = 
    });
  }
}

export default TextBox;
