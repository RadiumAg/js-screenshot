import BaseBox from '../baseBox';

class TextBox extends BaseBox {
  updatePosition(...args: any[]): void {
    throw new Error('Method not implemented.');
  }
  protected initEvent(): void {
    throw new Error('Method not implemented.');
  }
}

export default TextBox;
