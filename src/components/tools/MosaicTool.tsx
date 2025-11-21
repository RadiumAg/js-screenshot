import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import mosaic from '@screenshots/assets/images/mosaic.svg';
import Style from '@screenshots/theme/mosaic.module.scss';
import { useScreenshotContext } from '../context/ScreenshotContext';

export interface MosaicToolProps {
  cutoutBoxX: number;
  cutoutBoxY: number;
  cutoutBoxWidth: number;
  cutoutBoxHeight: number;
}

/**
 * 马赛克工具组件
 */
export function MosaicTool({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}: MosaicToolProps) {
  const {
    activeTarget,
    setActiveTarget,
    setIsLock,
    operateHistory,
    drawCanvasElement,
  } = useScreenshotContext();

  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mosaicSize = 10;

  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

  const isCurrentArea = useCallback(
    (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    },
    []
  );

  const calculateAverageColor = useCallback(
    (
      pixels: Uint8ClampedArray,
      startX: number,
      startY: number,
      width: number,
      height: number,
      totalWidth: number,
    ): { r: number; g: number; b: number; a: number } => {
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
    },
    []
  );

  const fillBlock = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      color: { r: number; g: number; b: number; a: number },
    ) => {
      if (!contextRef.current) return;

      contextRef.current.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
        color.a / 255
      })`;
      contextRef.current.fillRect(x, y, width, height);
    },
    []
  );

  const applyMosaic = useCallback(
    (x: number, y: number) => {
      if (!contextRef.current) return;

      const brushSize = 20;

      x = Math.max(x, cutoutBoxX);
      y = Math.max(y, cutoutBoxY);
      x = Math.min(x, cutoutBoxX + cutoutBoxWidth - brushSize);
      y = Math.min(y, cutoutBoxY + cutoutBoxHeight - brushSize);

      const imageData = contextRef.current.getImageData(x, y, brushSize, brushSize);
      const pixels = imageData.data;

      const blocksX = Math.ceil(brushSize / mosaicSize);
      const blocksY = Math.ceil(brushSize / mosaicSize);

      for (let blockY = 0; blockY < blocksY; blockY++) {
        for (let blockX = 0; blockX < blocksX; blockX++) {
          const startX = blockX * mosaicSize;
          const startY = blockY * mosaicSize;

          const blockWidth = Math.min(mosaicSize, brushSize - startX);
          const blockHeight = Math.min(mosaicSize, brushSize - startY);

          const avgColor = calculateAverageColor(
            pixels,
            startX,
            startY,
            blockWidth,
            blockHeight,
            brushSize,
          );

          fillBlock(x + startX, y + startY, blockWidth, blockHeight, avgColor);
        }
      }
    },
    [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, calculateAverageColor, fillBlock]
  );

  const handleClick = useCallback(() => {
    setIsLock(true);
    setActiveTarget('mosaic');
  }, [setIsLock, setActiveTarget]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (activeTarget !== 'mosaic') return;

      if (
        isCurrentArea(
          cutoutBoxX,
          cutoutBoxX + cutoutBoxWidth,
          cutoutBoxY,
          cutoutBoxY + cutoutBoxHeight,
          event.clientX,
          event.clientY,
        )
      ) {
        setIsDrawing(true);
        applyMosaic(event.clientX, event.clientY);
      }
    },
    [activeTarget, cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, isCurrentArea, applyMosaic]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing || activeTarget !== 'mosaic') return;

      applyMosaic(event.clientX, event.clientY);
    },
    [isDrawing, activeTarget, applyMosaic]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || activeTarget !== 'mosaic' || !contextRef.current) return;

    setIsDrawing(false);

    const imageData = contextRef.current.getImageData(
      cutoutBoxX,
      cutoutBoxY,
      cutoutBoxWidth,
      cutoutBoxHeight,
    );
    operateHistory.push(imageData);
  }, [isDrawing, activeTarget, cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, operateHistory]);

  useEffect(() => {
    if (!drawCanvasElement) return;

    drawCanvasElement.addEventListener('mousedown', handleMouseDown as any);
    drawCanvasElement.addEventListener('mousemove', handleMouseMove as any);
    drawCanvasElement.addEventListener('mouseup', handleMouseUp as any);

    return () => {
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as any);
      drawCanvasElement.removeEventListener('mousemove', handleMouseMove as any);
      drawCanvasElement.removeEventListener('mouseup', handleMouseUp as any);
    };
  }, [drawCanvasElement, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div class={Style.mosaic} onClick={handleClick} tabIndex={0}>
      <img src={mosaic} alt="mosaic" />
    </div>
  );
}
