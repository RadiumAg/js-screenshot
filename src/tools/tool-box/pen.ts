import BaseBox from '../baseBox';

class Pen extends BaseBox {
  el: HTMLDivElement | null = null;

  initPen() {
    this.el = document.createElement('div');
    this.el.style.backgroundColor = 'green';
    this.el.style.height = '10px';
    this.el.style.width = '10px';
  }

  updatePosition(...args: any[]): void {}
  protected initEvent(): void {}
}

export default Pen;
