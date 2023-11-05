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
    minHeight: 20,

    paddingTopBottom: 6,
    paddingLeftRight: 10,
  };
  el: HTMLDivElement | null = null;
  preTextarea: HTMLTextAreaElement | null = null;
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

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    canvasElement.addEventListener('mousedown', event => {
      let clientX = event.clientX;
      const clientY = event.clientY;
      if (activeTarget !== this) return;

      if (
        this.isCurrentArea(
          this.cutoutBox.x + dotControllerSize / 2,
          this.cutoutBox.x + this.cutoutBox.width - dotControllerSize / 2,
          this.cutoutBox.y + dotControllerSize / 2,
          this.cutoutBox.y + this.cutoutBox.height - dotControllerSize / 2,
          clientX,
          clientY,
        )
      ) {
        this.preTextarea?.remove();
        const textBoxTextarea = document.createElement('textarea');

        textBoxTextarea.setAttribute('autofocus', '');
        textBoxTextarea.setAttribute('wrap', 'hard');
        textBoxTextarea.setAttribute('contenteditable', '');
        textBoxTextarea.classList.add(Style['text-box-input']);

        // setStyle
        textBoxTextarea.style.padding = `${this.shifting.paddingTopBottom}px ${this.shifting.paddingLeftRight}px`;
        if (
          this.isCurrentArea(
            this.cutoutBox.x,
            this.cutoutBox.x + this.cutoutBox.width,
            this.cutoutBox.y,
            this.cutoutBox.y + this.cutoutBox.height,
            clientX - this.shifting.x,
            clientY - this.shifting.y,
          ) &&
          this.isCurrentArea(
            this.cutoutBox.x,
            this.cutoutBox.x + this.cutoutBox.width,
            this.cutoutBox.y,
            this.cutoutBox.y + this.cutoutBox.height,
            clientX - this.shifting.x + this.shifting.minWidth,
            clientY - this.shifting.y + this.shifting.minHeight,
          )
        ) {
          textBoxTextarea.style.minWidth = `${this.shifting.minWidth}px`;
          textBoxTextarea.style.minHeight = `${this.shifting.minHeight}px`;
        } else {
          textBoxTextarea.style.maxWidth = `${this.shifting.minWidth}px`;
          textBoxTextarea.style.maxHeight = `${this.shifting.minHeight}px`;

          if (clientX - this.shifting.x < this.cutoutBox.x) {
            clientX = clientX + this.shifting.x;
          } else if (
            clientX -
              this.shifting.x +
              this.shifting.minWidth -
              this.shifting.paddingLeftRight * 2 >
            this.cutoutBox.x + this.cutoutBox.width
          ) {
            clientX =
              this.cutoutBox.x +
              this.cutoutBox.width -
              this.shifting.minWidth -
              this.shifting.x;
          }
        }

        textBoxTextarea.style.left = `${clientX - this.shifting.x}px`;
        textBoxTextarea.style.top = `${clientY - this.shifting.y}px`;

        textBoxTextarea.addEventListener('blur', () => {
          textBoxTextarea.remove();
          this.renderToCanvas(textBoxTextarea.value, clientX, clientY);
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
      }
    });
  }
}

export default TextBox;
