import type { FC } from 'preact/compat';
import mosaic from '@screenshots/assets/images/mosaic.svg';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useMount } from '@screenshots/hooks/use-mount';
import Style from '@screenshots/theme/mosaic.module.scss';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface MosaicToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 马赛克工具组件
 */
export const MosaicTool: FC<MosaicToolProps> = ({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}) => {
  const {
    activeTarget,
    operateHistory,
    drawCanvasElement,
    setActiveTarget,
    setIsLock,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
  })));

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

  const isCurrentArea = useMemoizedFn(
    (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    },
  );

  const calculateAverageColor = useMemoizedFn(
    (
      pixels: Uint8ClampedArray,
      startX: number,
      startY: number,
      width: number,
      height: number,
      totalWidth: number,
    ): { r: number, g: number, b: number, a: number } => {
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
  );

  const fillBlock = useMemoizedFn(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      color: { r: number, g: number, b: number, a: number },
    ) => {
      if (!contextRef.current)
        return;

      contextRef.current.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
        color.a / 255
      })`;
      contextRef.current.fillRect(x, y, width, height);
    },
  );

  const applyMosaic = useMemoizedFn(
    (x: number, y: number) => {
      if (!contextRef.current)
        return;

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
  );

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.mosaic);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (activeTarget !== ACTIVE_TYPE.mosaic)
        return;

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
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.mosaic)
        return;

      applyMosaic(event.clientX, event.clientY);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.mosaic || !contextRef.current)
      return;

    setIsDrawing(false);

    const imageData = contextRef.current.getImageData(
      cutoutBoxX,
      cutoutBoxY,
      cutoutBoxWidth,
      cutoutBoxHeight,
    );
    operateHistory.push(imageData);
  });

  useMount(() => {
    if (!drawCanvasElement)
      return;

    drawCanvasElement.addEventListener('mousedown', handleMouseDown as any);
    drawCanvasElement.addEventListener('mousemove', handleMouseMove as any);
    drawCanvasElement.addEventListener('mouseup', handleMouseUp as any);

    return () => {
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as any);
      drawCanvasElement.removeEventListener('mousemove', handleMouseMove as any);
      drawCanvasElement.removeEventListener('mouseup', handleMouseUp as any);
    };
  });

  return (
    <div class={Style.mosaic} onClick={handleClick} tabIndex={0}>
      <img src={mosaic} alt="mosaic" />
    </div>
  );
};
