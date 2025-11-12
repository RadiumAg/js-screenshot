import type { AnyFun } from '@screenshots/utils';
import { drawCanvasElement, sourceCanvasElement } from './canvas';

abstract class BaseBox {
  x = 0;
  y = 0;
  sizeObserverArray: AnyFun[] = [];
  private __width = 0;
  private __height = 0;

  get width() {
    return this.__width;
  }

  set width(value: number) {
    const oldWidth = this.__width;
    this.__width = value;

    if (value !== oldWidth) {
      this.sizeObserverCallback();
    }
  }

  get height() {
    return this.__height;
  }

  set height(value: number) {
    const oldHeight = this.__height;
    this.__height = value;

    console.log('[DEBUG] height', value);

    if (value !== oldHeight) {
      this.sizeObserverCallback();
    }
  }

  protected context = drawCanvasElement.getContext('2d', {
    willReadFrequently: true,
  })!;

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

  /**
   * 是否在当前区域
   *
   * @param {number} minX
   * @param {number} maxX
   * @param {number} minY
   * @param {number} maxY
   * @param {number} x
   * @param {number} y
   * @return {*}
   * @memberof BaseBox
   */
  isCurrentArea(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    x: number,
    y: number,
  ) {
    return (
      !this.isOutLeft(minX, x)
      && !this.isOutRight(maxX, x)
      && !this.isOutTop(minY, y)
      && !this.isOutBottom(maxY, y)
    );
  }

  sizeObserverCallback() {
    this.sizeObserverArray.forEach(ob => ob?.(this.width, this.height));
  }

  abstract updatePosition(...args: any[]): void;
  protected abstract initEvent(): void;
  abstract destroy(): void;
}

export default BaseBox;
