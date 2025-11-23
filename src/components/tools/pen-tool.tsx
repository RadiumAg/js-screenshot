import type { FC } from 'preact/compat';
import pen from '@screenshots/assets/images/pen.svg';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useMount } from '@screenshots/hooks/use-mount';
import Style from '@screenshots/theme/pen.module.scss';
import { useEffect, useRef } from 'preact/hooks';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface PenToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 画笔工具组件
 */
export const PenTool: FC<PenToolProps> = ({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}) => {
  const {
    activeTarget,
    setActiveTarget,
    setIsLock,
    operateHistory,
    drawCanvasElement,
    dotControllerSize,
  } = useScreenshotStore();

  const isMouseDownRef = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

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

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.pen);
    // Tool is now active
  });

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (activeTarget !== ACTIVE_TYPE.pen || !contextRef.current)
        return;

      if (
        isCurrentArea(
          cutoutBoxX + dotControllerSize / 2,
          cutoutBoxX + cutoutBoxWidth - dotControllerSize / 2,
          cutoutBoxY + dotControllerSize / 2,
          cutoutBoxY + cutoutBoxHeight - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        )
        && isMouseDownRef.current
      ) {
        contextRef.current.lineWidth = 15;
        contextRef.current.lineCap = 'round';
        contextRef.current.lineTo(event.clientX, event.clientY);
        contextRef.current.stroke();
      }
    },
  );

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (activeTarget !== ACTIVE_TYPE.pen || !contextRef.current)
        return;

      if (
        isCurrentArea(
          cutoutBoxX + dotControllerSize / 2,
          cutoutBoxX + cutoutBoxWidth - dotControllerSize / 2,
          cutoutBoxY + dotControllerSize / 2,
          cutoutBoxY + cutoutBoxHeight - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        )
      ) {
        setActiveTarget(ACTIVE_TYPE.pen);
        isMouseDownRef.current = true;

        contextRef.current.strokeStyle = 'blue';
        contextRef.current.beginPath();
        contextRef.current.moveTo(event.clientX, event.clientY);
      }
      else {
        if (drawCanvasElement) {
          drawCanvasElement.style.cursor = '';
        }
      }
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (isMouseDownRef.current && contextRef.current) {
      const imageData = contextRef.current.getImageData(
        cutoutBoxX,
        cutoutBoxY,
        cutoutBoxWidth,
        cutoutBoxHeight,
      );
      operateHistory.push(imageData);
    }
    isMouseDownRef.current = false;
  });

  useMount(() => {
    if (!drawCanvasElement)
      return;

    drawCanvasElement.addEventListener('mousemove', handleMouseMove as any);
    drawCanvasElement.addEventListener('mousedown', handleMouseDown as any);
    drawCanvasElement.addEventListener('mouseup', handleMouseUp as any);

    return () => {
      drawCanvasElement.removeEventListener('mousemove', handleMouseMove as any);
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as any);
      drawCanvasElement.removeEventListener('mouseup', handleMouseUp as any);
    };
  });

  return (
    <div class={Style.pen} onClick={handleClick}>
      <img src={pen} alt="pen" />
    </div>
  );
};
