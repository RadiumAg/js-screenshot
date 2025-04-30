import { drawCanvasElement, sourceCanvasElement } from './canvas';

abstract class BaseBox {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  // Current operating context
  protected context: CanvasRenderingContext2D;
  constructor() {
    this.context = drawCanvasElement.getContext('2d') as CanvasRenderingContext2D;
  }

  // Source context
  protected sourceContext: CanvasRenderingContext2D;

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
