import type CutoutBox from '../cutout-box';
import mosaic from '@screenshots/assets/images/mosaic.svg';
import Style from '@screenshots/theme/mosaic.module.scss';
import BaseBox from '../base-box';
import {
  activeTarget,
  drawCanvasElement,
  operateHistory,
  setActiveTarget,
  setIsLock,
} from '../canvas';

/**
 * 马赛克
 *
 * @class Mosaic
 * @extends {BaseBox}
 */
class Mosaic extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;
  private isDrawing = false;
  private mosaicSize = 10; // Mosaic block size

  updatePosition() {
    /** mosaic */
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    drawCanvasElement.addEventListener('mousedown', (event) => {
      if (activeTarget !== this)
        return;

      if (
        this.isCurrentArea(
          this.cutoutBox.x,
          this.cutoutBox.x + this.cutoutBox.width,
          this.cutoutBox.y,
          this.cutoutBox.y + this.cutoutBox.height,
          event.clientX,
          event.clientY,
        )
      ) {
        this.isDrawing = true;
        // Apply mosaic at click position immediately
        this.applyMosaic(event.clientX, event.clientY);
      }
    });

    drawCanvasElement.addEventListener('mousemove', (event) => {
      if (!this.isDrawing || activeTarget !== this)
        return;

      // Apply mosaic at mouse position
      this.applyMosaic(event.clientX, event.clientY);
    });

    drawCanvasElement.addEventListener('mouseup', () => {
      if (!this.isDrawing || activeTarget !== this)
        return;

      this.isDrawing = false;
      // Save to history
      const imageData = this.context.getImageData(
        this.cutoutBox.x,
        this.cutoutBox.y,
        this.cutoutBox.width,
        this.cutoutBox.height,
      );
      operateHistory.push(imageData);
    });
  }

  private applyMosaic(x: number, y: number) {
    // Set mosaic brush size
    const brushSize = 20;

    // Ensure coordinates are within canvas bounds
    x = Math.max(x, this.cutoutBox.x);
    y = Math.max(y, this.cutoutBox.y);
    x = Math.min(x, this.cutoutBox.x + this.cutoutBox.width - brushSize);
    y = Math.min(y, this.cutoutBox.y + this.cutoutBox.height - brushSize);

    // Get image data for mosaic area
    const imageData = this.context.getImageData(x, y, brushSize, brushSize);
    const pixels = imageData.data;

    // Calculate number of mosaic blocks
    const blocksX = Math.ceil(brushSize / this.mosaicSize);
    const blocksY = Math.ceil(brushSize / this.mosaicSize);

    // Process each mosaic block
    for (let blockY = 0; blockY < blocksY; blockY++) {
      for (let blockX = 0; blockX < blocksX; blockX++) {
        // Calculate current block start position
        const startX = blockX * this.mosaicSize;
        const startY = blockY * this.mosaicSize;

        // Calculate current block actual size
        const blockWidth = Math.min(this.mosaicSize, brushSize - startX);
        const blockHeight = Math.min(this.mosaicSize, brushSize - startY);

        // Calculate average color for current block
        const avgColor = this.calculateAverageColor(
          pixels,
          startX,
          startY,
          blockWidth,
          blockHeight,
          brushSize,
        );

        // Fill current block with average color
        this.fillBlock(
          x + startX,
          y + startY,
          blockWidth,
          blockHeight,
          avgColor,
        );
      }
    }
  }

  private calculateAverageColor(
    pixels: Uint8ClampedArray,
    startX: number,
    startY: number,
    width: number,
    height: number,
    totalWidth: number,
  ): { r: number, g: number, b: number, a: number } {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    let count = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = ((startY + y) * totalWidth + (startX + x)) * 4;
        r += pixels[index];
        g += pixels[index + 1];
        b += pixels[index + 2];
        a += pixels[index + 3];
        count++;
      }
    }

    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
      a: Math.round(a / count),
    };
  }

  private fillBlock(
    x: number,
    y: number,
    width: number,
    height: number,
    color: { r: number, g: number, b: number, a: number },
  ) {
    this.context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
      color.a / 255
    })`;
    this.context.fillRect(x, y, width, height);
  }

  initMosaic() {
    this.el = document.createElement('div');
    this.el.classList.add(Style.mosaic);
    this.el.append(mosaic);
    this.el.tabIndex = 0;

    this.initEvent();
  }

  destroy() {
    this.isDrawing = false;
    this.el?.remove();
  }
}

export default Mosaic;
