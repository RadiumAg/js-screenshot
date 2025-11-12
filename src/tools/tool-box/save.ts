import Style from '@screenshots/theme/save.module.scss';
import save from '@screenshots/assets/images/save.svg';
import { __isDev__, useDownLoad } from '@screenshots/utils';
import BaseBox from '../base-box';
import CutoutBox from '../cutout-box';

/**
 * 保存
 *
 * @class Save
 * @extends {BaseBox}
 */
class Save extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;

  updatePosition() {}

  protected initEvent() {
    const download = useDownLoad();

    this.el?.addEventListener('click', () => {
      const screenShotData = this.context.getImageData(
        this.cutoutBox.x,
        this.cutoutBox.y,
        this.cutoutBox.width,
        this.cutoutBox.height,
      );

      const screenCanvas = document.createElement('canvas');
      screenCanvas.width = this.cutoutBox.width;
      screenCanvas.height = this.cutoutBox.height;
      screenCanvas.getContext('2d')?.putImageData(screenShotData, 0, 0);

      if (__isDev__) {
        console.info(
          '[DEBUG]',
          'screen width',
          this.cutoutBox.width,
          'screen height',
          this.cutoutBox.height,
          'screen x',
          this.cutoutBox.x,
          'screen y',
          this.cutoutBox.y,
        );
      }

      screenCanvas.toBlob(
        blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          download('截图', url);
        },
        'image/png',
        1,
      );
    });
  }

  initSave() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.save);
    this.el.append(save);

    this.initEvent();
  }

  destroy() {
    /**
     * empty
     */
  }
}

export default Save;
