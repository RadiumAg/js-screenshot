import Style from '@screenshots/theme/text-box.module.scss';
import textBox from '@screenshots/assets/images/text-box.svg';
import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';
import {
  activeTarget,
  canvasElement,
  dotControllerSize,
  setActiveTarget,
  setIsLock,
} from '../canvas';

class TextBox extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;
  preTextInput: HTMLDivElement | null = null;

  updatePosition() {
    /** empty  */
  }

  initTextBox() {
    this.el = document.createElement('div');
    this.el.classList.add(Style['text-box']);
    this.el.innerHTML = textBox;

    this.initEvent();
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    canvasElement.addEventListener('mousedown', event => {
      if (activeTarget !== this) return;

      if (
        this.isCurrentArea(
          this.cutoutBox.x + dotControllerSize / 2,
          this.cutoutBox.x + this.cutoutBox.width - dotControllerSize / 2,
          this.cutoutBox.y + dotControllerSize / 2,
          this.cutoutBox.y + this.cutoutBox.height - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        )
      ) {
        this.preTextInput?.remove();

        const textBoxInput = document.createElement('div');
        textBoxInput.setAttribute('autofocus', 'true');
        textBoxInput.setAttribute('contenteditable', 'true');
        textBoxInput.classList.add(Style['text-box-input']);

        textBoxInput.style.top = `${event.clientY}px`;
        textBoxInput.style.left = `${event.clientX}px`;

        textBoxInput.addEventListener('blur', () => {
          textBoxInput.remove();
          this.context.fillStyle = 'red';
          this.context.font = '17px serif';
          this.context.fillText(
            textBoxInput.textContent || '',
            event.clientX,
            event.clientY,
          );
        });

        this.preTextInput = textBoxInput;

        document.body.append(textBoxInput);
      }
    });
  }
}

export default TextBox;
