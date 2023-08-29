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

  isCurrentArea(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    x: number,
    y: number,
  ) {
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }

  abstract updatePosition(...args: any[]): void;
  protected abstract initEvent(): void;
}

export default BaseBox;
