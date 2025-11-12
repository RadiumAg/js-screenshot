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
  observer: MutationObserver | null = null;

  updatePosition() {}

  protected initEvent() {
    const targetNode = this.cutoutBox.dotControllerArray[0].el;
    const config = { attributes: true };

    if (targetNode == null)
      return;

    // 创建一个观察器实例并传入回调函数
    const observer = new MutationObserver(() => {
      if (this.el == null)
        return;

      const { top, left } = (targetNode as HTMLDivElement).getBoundingClientRect();
      Object.assign(this.el?.style, {
        top: `${top}px`,
        left: `${left}px`,
      });
    });

    // 以上述配置开始观察目标节点
    observer.observe(targetNode, config);
    this.observer = observer;
  }

  initSizeIndicator() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.sizeIndicator);
    document.body.append(this.el);
    this.initEvent();
  }

  destroy() {
    this.el?.remove();
    this.observer?.disconnect();
  }
}

export default SizeIndicator;
