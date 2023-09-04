import { canvasElement, sourceCanvasElement } from './canvas';

abstract class BaseBox {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  protected context = canvasElement.getContext('2d', {
    willReadFrequently: true,
  })!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  protected sourceContext = sourceCanvasElement.getContext('2d', {
    willReadFrequently: true,
  })!;

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
