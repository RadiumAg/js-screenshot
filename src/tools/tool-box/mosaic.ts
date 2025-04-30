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
  private startX = 0;
  private startY = 0;
  private mosaicSize = 10; // 马赛克块的大小
  private firstScreenShotImageData: ImageData | null = null;

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
        this.startX = event.clientX;
        this.startY = event.clientY;

        // 保存原始截图数据
        this.firstScreenShotImageData = this.context.getImageData(
          this.cutoutBox.x,
          this.cutoutBox.y,
          this.cutoutBox.width,
          this.cutoutBox.height,
        );
      }
    });

    drawCanvasElement.addEventListener('mousemove', event => {
      if (
        !this.isDrawing ||
        !this.firstScreenShotImageData ||
        activeTarget !== this
      )
        return;

      // 恢复原始截图
      this.context.putImageData(
        this.firstScreenShotImageData,
        this.cutoutBox.x,
        this.cutoutBox.y,
      );

      // 计算马赛克区域
      const x = this.startX;
      const y = this.startY;
      const width = Math.abs(event.clientX - this.startX);
      const height = Math.abs(event.clientY - this.startY);

      // 应用马赛克效果
      this.applyMosaic(x, y, width, height);
    });

    drawCanvasElement.addEventListener('mouseup', () => {
      if (
        !this.isDrawing ||
        !this.firstScreenShotImageData ||
        activeTarget !== this
      )
        return;

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

  private applyMosaic(x: number, y: number, width: number, height: number) {
    if (width === 0 || height === 0) return;

    // 确保坐标在画布范围内
    x = Math.max(x, this.cutoutBox.x);
    y = Math.max(y, this.cutoutBox.y);
    width = Math.min(width, this.cutoutBox.width - (x - this.cutoutBox.x));
    height = Math.min(height, this.cutoutBox.height - (y - this.cutoutBox.y));

    // 获取马赛克区域的图像数据
    const imageData = this.context.getImageData(x, y, width, height);
    const pixels = imageData.data;

    // 计算马赛克块的数量
    const blocksX = Math.ceil(width / this.mosaicSize);
    const blocksY = Math.ceil(height / this.mosaicSize);

    // 对每个马赛克块进行处理
    for (let blockY = 0; blockY < blocksY; blockY++) {
      for (let blockX = 0; blockX < blocksX; blockX++) {
        // 计算当前块的起始位置
        const startX = blockX * this.mosaicSize;
        const startY = blockY * this.mosaicSize;

        // 计算当前块的实际大小
        const blockWidth = Math.min(this.mosaicSize, width - startX);
        const blockHeight = Math.min(this.mosaicSize, height - startY);

        // 计算当前块的平均颜色
        const avgColor = this.calculateAverageColor(
          pixels,
          startX,
          startY,
          blockWidth,
          blockHeight,
          width,
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
