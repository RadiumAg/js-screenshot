import type { ScreenShotOptions } from './utils';
import { ScreenShot as ScreenShotComponent } from './components/screen-shot';
import { createAndRenderComponent, destroyComponentContainer } from './components/utils/render-utils';
import { useScreenshotStore } from './store/screenshot-store';

class ScreenShot {
  private container: HTMLElement | null = null;

  constructor(private screenShotOptions: ScreenShotOptions) { }

  async shot(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // 创建并渲染 ScreenShot 组件
        this.container = createAndRenderComponent(
          <ScreenShotComponent
            options={this.screenShotOptions}
            onComplete={(result) => {
              this.destroy();
              resolve(result);
            }}
            onError={(error) => {
              this.destroy();
              reject(error);
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
    // 先清理 store 状态（包括停止 MediaStream tracks）
    useScreenshotStore.getState().resetState();

    if (this.container) {
      destroyComponentContainer(this.container);
      this.container = null;
    }
  }
}

export default ScreenShot;
