import type { ScreenShotOptions } from './utils';
import { ScreenShot as ScreenShotComponent } from './components/ScreenShot';
import { createAndRenderComponent, destroyComponentContainer } from './components/utils/renderUtils';

class ScreenShot {
  private container: HTMLElement | null = null;

  constructor(private screenShotOptions: ScreenShotOptions) {}

  async shot(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // 创建并渲染 ScreenShot 组件
        this.container = createAndRenderComponent(
          <ScreenShotComponent 
            options={this.screenShotOptions}
            onComplete={(result) => {
              resolve(result);
            }}
          />
        );
      } catch (error) {
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
