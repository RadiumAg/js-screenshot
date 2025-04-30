import Style from '@screenshots/theme/mosaic.module.scss';
import mosaic from '@screenshots/assets/images/mosaic.svg';
import BaseBox from '../baseBox';
import {
  activeTarget,
  drawCanvasElement,
  operateHistory,
  setActiveTarget,
  setIsLock,
} from '../canvas';
import CutoutBox from '../cutout-box/cutoutBox';

class Mosaic extends BaseBox {
  constructor(private cutoutBox: CutoutBox) {
    super();
  }

  el: HTMLDivElement | null = null;
  private isDrawing = false;
  private mosaicSize = 10;

  updatePosition() {
    /** mosaic */
  }

  protected initEvent() {
    this.el?.addEventListener('click', () => {
      setIsLock(true);
      setActiveTarget(this);
    });

    drawCanvasElement.addEventListener('mousedown', event => {
      if (activeTarget !== this) return;

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
        // 立即在点击位置应用马赛克
        this.applyMosaic(event.clientX, event.clientY);
      }
    });

    drawCanvasElement.addEventListener('mousemove', event => {
      if (!this.isDrawing || activeTarget !== this) return;

      // 在鼠标移动位置应用马赛克
      this.applyMosaic(event.clientX, event.clientY);
    });

    drawCanvasElement.addEventListener('mouseup', () => {
      if (!this.isDrawing || activeTarget !== this) return;

      this.isDrawing = false;
      // 保存到历史记录
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
    // 设置马赛克笔刷大小
    const brushSize = 20;

    // 确保坐标在画布范围内
    x = Math.max(x, this.cutoutBox.x);
    y = Math.max(y, this.cutoutBox.y);
    x = Math.min(x, this.cutoutBox.x + this.cutoutBox.width - brushSize);
    y = Math.min(y, this.cutoutBox.y + this.cutoutBox.height - brushSize);

    // 获取马赛克区域的图像数据
    const imageData = this.context.getImageData(x, y, brushSize, brushSize);
    const pixels = imageData.data;

    // 计算马赛克块的数量
    const blocksX = Math.ceil(brushSize / this.mosaicSize);
    const blocksY = Math.ceil(brushSize / this.mosaicSize);

    // 对每个马赛克块进行处理
    for (let blockY = 0; blockY < blocksY; blockY++) {
      for (let blockX = 0; blockX < blocksX; blockX++) {
        // 计算当前块的起始位置
        const startX = blockX * this.mosaicSize;
        const startY = blockY * this.mosaicSize;

        // 计算当前块的实际大小
        const blockWidth = Math.min(this.mosaicSize, brushSize - startX);
        const blockHeight = Math.min(this.mosaicSize, brushSize - startY);

        // 计算当前块的平均颜色
        const avgColor = this.calculateAverageColor(
          pixels,
          startX,
          startY,
          blockWidth,
          blockHeight,
          brushSize,
        );

        // 用平均颜色填充当前块
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
  ): { r: number; g: number; b: number; a: number } {
    let r = 0,
      g = 0,
      b = 0,
      a = 0;
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
    color: { r: number; g: number; b: number; a: number },
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
