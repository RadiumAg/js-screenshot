import BaseBox from '../baseBox';

class ToolBox extends BaseBox {
  updatePosition(...args: any[]): void {}

  protected initEvent(): void {}

  initToolBox() {
    const boxElement = document.createElement('div');
    boxElement.style.position = 'fixed';
  }
}

export default ToolBox;
