import { canvasElement, sourceCanvasElement } from './canvas';

abstract class BaseBox {
  protected x = 0;
  protected y = 0;
  protected width = 0;
  protected height = 0;

  protected context = canvasElement.getContext('2d', {
    willReadFrequently: true,
  });
  protected sourceContext = sourceCanvasElement.getContext('2d', {
    willReadFrequently: true,
  });

  isCurrentArea(clientX: number, clientY: number) {
    return (
      clientX > this.x &&
      clientX < this.x + this.width &&
      clientY > this.y &&
      clientY < this.y + this.height
    );
  }

  abstract updatePosition(...args: any[]): void;
  protected abstract initEvent(): void;
}

export default BaseBox;
