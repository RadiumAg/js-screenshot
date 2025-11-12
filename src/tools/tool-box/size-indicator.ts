import type CutoutBox from '../cutout-box';
import Style from '@screenshots/theme/size-indicator.module.scss';
import BaseBox from '../base-box';

/**
 * 保存
 *
 * @class Save
 * @extends {BaseBox}
 */
class SizeIndicator extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;
  observerArray: MutationObserver[] = [];

  updatePosition() {}

  protected initEvent() {
    /**
     *
     * 更新位置
     *
     * @return {*}
     */
    const positionObserver = () => {
      const targetNode = this.cutoutBox.dotControllerArray[0].el;
      const config = { attributes: true };

      if (targetNode == null)
        return;

      const observer = new MutationObserver(() => {
        if (this.el == null)
          return;

        const { top, left } = (targetNode as HTMLDivElement).getBoundingClientRect();
        Object.assign(this.el?.style, {
          top: `${top}px`,
          left: `${left}px`,
        });
      });

      observer.observe(targetNode, config);
      this.observerArray.push(observer);
    };

    const sizeObserver = () => {
      this.cutoutBox.sizeObserverArray.push((width, height) => {
        if (this.el == null)
          return;
        this.el.textContent = `${width} * ${height}`;
      });
    };

    positionObserver();
    sizeObserver();
  }

  initSizeIndicator() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.sizeIndicator);
    document.body.append(this.el);
    this.initEvent();
  }

  destroy() {
    this.el?.remove();
    this.observerArray.forEach((ob) => {
      ob.disconnect();
    });
  }
}

export default SizeIndicator;
