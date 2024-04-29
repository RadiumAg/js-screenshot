import Style from '@screenshots/theme/text-box.module.scss';
import textBox from '@screenshots/assets/images/text-box.svg?raw';
import BaseBox from '../baseBox';
import CutoutBox from '../cutout-box/cutoutBox';
import {
  activeTarget,
  canvasElement,
  dotControllerSize,
  isLock,
  operateHistory,
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
  renderIndex = 0;

  updatePosition() {
    /** empty  */
  }

  initTextBox() {
    this.el = document.createElement('div');
    this.el.classList.add(Style['text-box']);
    this.el.innerHTML = textBox;
    this.initEvent();
  }

  mersureLineToCanvas(
    textBoxValue: string | null,
    maxWidth: number,
    clientX: number,
    clientY: number,
    startIndex = 0,
    endIndex = 1,
  ) {
    if (!textBoxValue) {
      return;
    }
    const render = () =>
      this.context.fillText(
        stringValue,
        clientX - this.shifting.x + this.shifting.paddingLeftRight * 2,
        clientY -
          this.shifting.y +
          this.renderIndex * 20 +
          this.shifting.paddingTopBottom +
          this.fontSize,
      );
    const stringValue = textBoxValue.slice(startIndex, endIndex);

    if (endIndex === textBoxValue.length) {
      render();
      return;
    }

    if (this.context.measureText(stringValue).width > maxWidth) {
      startIndex = --endIndex;
      render();
      this.renderIndex++;
      this.mersureLineToCanvas(
        textBoxValue,
        maxWidth,
        clientX,
        clientY,
        startIndex,
        endIndex,
      );
    } else {
      endIndex++;
      this.mersureLineToCanvas(
        textBoxValue,
        maxWidth,
        clientX,
        clientY,
        startIndex,
        endIndex,
      );
    }
  }

  // caulate the text
  renderToCanvas(
    textBoxValue: string | null,
    maxWidth: number,
    clientX: number,
    clientY: number,
  ) {
    this.renderIndex = 0;
    this.context.fillStyle = 'red';
    this.context.font = `${this.fontSize}px system-ui`;
    this.mersureLineToCanvas(textBoxValue, maxWidth, clientX, clientY);
  }

  setTextBox(textBoxTextarea: HTMLTextAreaElement) {
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('wrap', 'hard');
    textBoxTextarea.style.height = `${this.fontSize}px`;
    textBoxTextarea.setAttribute('contenteditable', '');
    textBoxTextarea.classList.add(Style['text-box-input']);
    // setStyle
    textBoxTextarea.style.padding = `${this.shifting.paddingTopBottom}px ${this.shifting.paddingLeftRight}px`;
  }

  private setPosition(textBoxTextarea: HTMLDivElement, event: MouseEvent) {
    const clientX = event.clientX;
    const clientY = event.clientY;
    const actualClientX = event.clientX - this.shifting.x;
    const actualClientY = event.clientY - this.shifting.y;
    const isInLeft = !this.isOutLeft(
      this.cutoutBox.x + dotControllerSize / 2,
      actualClientX,
    );

    const isInRight = !this.isOutRight(
      this.cutoutBox.x + this.cutoutBox.width - dotControllerSize / 2,
      actualClientX +
        this.shifting.minWidth +
        this.shifting.paddingTopBottom * 2,
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

    // out left
    if (!isInLeft) {
      textBoxTextarea.style.left = `${this.cutoutBox.x}px`;
    } else {
      textBoxTextarea.style.left = `${actualClientX}px`;
    }

    // out top
    if (!isInTop) {
      textBoxTextarea.style.top = `${this.cutoutBox.y}px`;
    } else {
      textBoxTextarea.style.top = `${actualClientY}px`;
    }

    // out right
    if (!isInRight) {
      textBoxTextarea.style.left = `${
        this.cutoutBox.x +
        this.cutoutBox.width -
        this.shifting.minWidth -
        this.shifting.paddingLeftRight * 2
      }px`;
    }

    if (!isInBottom) {
      textBoxTextarea.style.top = `${
        this.cutoutBox.y + this.cutoutBox.height - this.shifting.minWidth
      }px`;
    }
  }

  private setStyle(textBoxTextarea: HTMLDivElement) {
    textBoxTextarea.setAttribute('wrap', 'hard');
    textBoxTextarea.style.whiteSpace = 'nowrap';
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('contenteditable', '');
    textBoxTextarea.classList.add(Style['text-box-input']);
    textBoxTextarea.style.height = `${
      this.fontSize + this.shifting.paddingTopBottom * 2
    }px`;
    textBoxTextarea.style.width = `${this.shifting.minWidth}px`;
    textBoxTextarea.style.minWidth = `${this.shifting.minWidth}px`;
    textBoxTextarea.style.padding = `${this.shifting.paddingTopBottom}px ${this.shifting.paddingLeftRight}px`;
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    canvasElement.addEventListener('mousedown', event => {
      if (!isLock) return;
      let maxHeight = 0;
      let maxWidth = this.shifting.minWidth;
      const clientX = event.clientX;
      const clientY = event.clientY;

      const textBoxTextarea = document.createElement('div');
      this.setStyle(textBoxTextarea);
      this.setPosition(textBoxTextarea, event);

      this.preTextarea?.remove();

      textBoxTextarea.addEventListener('blur', () => {
        textBoxTextarea.remove();
        this.renderToCanvas(
          textBoxTextarea.textContent,
          maxWidth,
          clientX,
          clientY,
        );
        const imageData = this.context.getImageData(
          this.cutoutBox.x,
          this.cutoutBox.y,
          this.cutoutBox.width,
          this.cutoutBox.height,
        );
        operateHistory.push(imageData);
      });

      textBoxTextarea.addEventListener('input', event => {
        const currentTarget = event.currentTarget as HTMLDivElement;
        const textboxTextReact = currentTarget.getBoundingClientRect();
        if (
          maxWidth === this.shifting.minWidth &&
          textboxTextReact.right >= this.cutoutBox.x + this.cutoutBox.width
        ) {
          maxWidth =
            currentTarget.scrollWidth - this.shifting.paddingLeftRight * 2 - 20;
          currentTarget.style.whiteSpace = 'unset';
        }

        if (
          !maxHeight &&
          this.shifting.minWidth &&
          textboxTextReact.bottom >= this.cutoutBox.y + this.cutoutBox.height
        ) {
          maxHeight =
            currentTarget.scrollHeight -
            this.shifting.paddingTopBottom * 2 -
            60;
        }

        currentTarget.style.height = maxHeight
          ? `${maxHeight}`
          : `${
              currentTarget.scrollHeight - this.shifting.paddingTopBottom * 2
            }px`;

        currentTarget.style.width =
          maxWidth !== this.shifting.minWidth
            ? `${maxWidth}px`
            : `${
                currentTarget.scrollWidth - this.shifting.paddingLeftRight * 2
              }px`;
      });

      this.preTextarea = textBoxTextarea;
      document.body.append(textBoxTextarea);
    });
  }
}

export default TextBox;
