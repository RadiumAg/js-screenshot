import { drawCanvasElement, sourceCanvasElement } from './canvas';

abstract class BaseBox {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  // 当前操作的上下文
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  protected context = drawCanvasElement.getContext('2d', {
    willReadFrequently: true,
  })!;

  // 源上下文
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  protected sourceContext = sourceCanvasElement.getContext('2d', {
    willReadFrequently: true,
  })!;

  isOutLeft(minX: number, x: number) {
    return x < minX;
  }

  isOutRight(maxX: number, x: number) {
    return x > maxX;
  }

  isOutTop(minY: number, y: number) {
    return y < minY;
  }

  isOutBottom(maxY: number, y: number) {
    return y > maxY;
  }

  isCurrentArea(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    x: number,
    y: number,
  ) {
    return (
      !this.isOutLeft(minX, x) &&
      !this.isOutRight(maxX, x) &&
      !this.isOutTop(minY, y) &&
      !this.isOutBottom(maxY, y)
    );
  }

  abstract updatePosition(...args: any[]): void;
  protected abstract initEvent(): void;
  abstract destroy(): void;
}

export default BaseBox;
