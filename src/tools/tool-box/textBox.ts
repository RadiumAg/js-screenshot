import Style from '@screenshots/theme/text-box.module.scss';
import textBox from '@screenshots/assets/images/text-box.svg?raw';
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

  shifting = {
    x: 15,
    y: 15,
    minWidth: 100,
    paddingTopBottom: 6,
    paddingLeftRight: 10,
  };
  el: HTMLDivElement | null = null;
  preTextarea: HTMLDivElement | null = null;
  fontSize = 20;

  updatePosition() {
    /** empty  */
  }

  initTextBox() {
    this.el = document.createElement('div');
    this.el.classList.add(Style['text-box']);
    this.el.innerHTML = textBox;

    this.initEvent();
  }

  renderToCanvas(textBoxValue: string, clientX: number, clientY: number) {
    this.context.fillStyle = 'red';
    this.context.font = `${this.fontSize}px system-ui`;

    textBoxValue.split(/[\n\r]/g).forEach((value, index) => {
      this.context.fillText(
        value,
        clientX - this.shifting.x + this.shifting.paddingLeftRight,
        clientY -
          this.shifting.y +
          index * 20 +
          this.shifting.paddingTopBottom +
          this.fontSize,
      );
    });
  }

  setTextBox(textBoxTextarea: HTMLTextAreaElement) {
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('wrap', 'hard');
    textBoxTextarea.setAttribute('contenteditable', '');
    textBoxTextarea.classList.add(Style['text-box-input']);

    // setStyle
    textBoxTextarea.style.padding = `${this.shifting.paddingTopBottom}px ${this.shifting.paddingLeftRight}px`;
    textBoxTextarea.style.height = `${this.fontSize}px`;
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    canvasElement.addEventListener('mousedown', event => {
      const clientX = event.clientX;
      const clientY = event.clientY;
      const actualClientX = event.clientX - this.shifting.x;
      const actualClientY = event.clientY - this.shifting.y;
      const textBoxTextarea = document.createElement('div');

      textBoxTextarea.setAttribute('wrap', 'hard');
      textBoxTextarea.setAttribute('autofocus', '');
      textBoxTextarea.setAttribute('contenteditable', '');
      textBoxTextarea.classList.add(Style['text-box-input']);
      textBoxTextarea.style.height = `${
        this.fontSize + this.shifting.paddingTopBottom * 2
      }px`;
      textBoxTextarea.style.minWidth = `${this.shifting.minWidth}px`;
      textBoxTextarea.style.padding = `${this.shifting.paddingTopBottom}px ${this.shifting.paddingLeftRight}px`;

      const isInLeft = !this.isOutLeft(
        this.cutoutBox.x + dotControllerSize / 2,
        actualClientX,
      );

      const isInRight = !this.isOutRight(
        this.cutoutBox.x + this.cutoutBox.width - dotControllerSize / 2,
        actualClientX + this.shifting.minWidth,
      );

      const isInTop = !this.isOutTop(
        this.cutoutBox.y + dotControllerSize / 2,
        actualClientY,
      );

      const isInBottom = !this.isOutBottom(
        this.cutoutBox.y + this.cutoutBox.height + dotControllerSize / 2,
        actualClientY + this.fontSize + this.shifting.paddingTopBottom * 2,
      );

      if (
        activeTarget !== this ||
        !this.isCurrentArea(
          this.cutoutBox.x,
          this.cutoutBox.x + this.cutoutBox.width,
          this.cutoutBox.y,
          this.cutoutBox.y + this.cutoutBox.height,
          clientX,
          clientY,
        )
      )
        return;

      // 超出左侧
      if (!isInLeft) {
        textBoxTextarea.style.left = `${this.cutoutBox.x}px`;
      } else {
        textBoxTextarea.style.left = `${actualClientX}px`;
      }

      // 超出上侧
      if (!isInTop) {
        textBoxTextarea.style.top = `${this.cutoutBox.y}px`;
      } else {
        textBoxTextarea.style.top = `${actualClientY}px`;
      }

      if (!isInRight) {
        textBoxTextarea.style.left = `${
          this.cutoutBox.x + this.cutoutBox.width - this.shifting.minWidth
        }px`;
      }

      if (!isInBottom) {
        textBoxTextarea.style.top = `${
          this.cutoutBox.y + this.cutoutBox.height - this.shifting.minWidth
        }px`;
      }

      textBoxTextarea.addEventListener('blur', () => {
        // textBoxTextarea.remove();
        this.renderToCanvas(textBoxTextarea.innerHTML, clientX, clientY);
      });

      textBoxTextarea.addEventListener('input', event => {
        const currentTarget = event.currentTarget as HTMLTextAreaElement;

        currentTarget.style.height = `${
          currentTarget.scrollHeight - this.shifting.paddingTopBottom * 2
        }px`;

        currentTarget.style.width = `${
          currentTarget.scrollWidth - this.shifting.paddingLeftRight * 2
        }px`;
      });

      this.preTextarea = textBoxTextarea;
      document.body.append(textBoxTextarea);
    });
  }
}

export default TextBox;
