import Style from '@screenshots/theme/save.module.scss';
import save from '@screenshots/assets/images/save.svg?raw';
import BaseBox from '../baseBox';
import { canvasElement } from '../canvas';

class Save extends BaseBox {
  el: HTMLDivElement | null = null;

  updatePosition(...args: any[]) {}

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      let blob: Blob | null = null;

      canvasElement.toBlob(
        blobData => {
          blob = blobData;
        },
        'image/png',
        1,
      );

      if (blob) {
        URL.createObjectURL(blob);
      }
    });
  }

  initSave() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.save);
    this.el.innerHTML = save;

    this.initEvent();
  }
}

export default Save;
