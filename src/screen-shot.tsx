import type { ScreenShotOptions } from './utils';
import { ScreenShot as ScreenShotComponent } from './components/screen-shot';
import { createAndRenderComponent, destroyComponentContainer } from './components/utils/render-utils';

class ScreenShot {
  private container: HTMLElement | null = null;

  constructor(private screenShotOptions: ScreenShotOptions) {}

  async shot(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // 创建并渲染 ScreenShot 组件
        this.container = createAndRenderComponent(
          <ScreenShotComponent
            container={null as any}
            options={this.screenShotOptions}
            onComplete={(result) => {
              resolve(result);
            }}
          />,
        );
      }
      catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 销毁截图实例
   */
  destroy() {
    if (this.container) {
      destroyComponentContainer(this.container);
      this.container = null;
    }
  }
}

export default ScreenShot;
