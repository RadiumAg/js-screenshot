import type { FC } from 'preact/compat';
import arrow from '@screenshots/assets/images/arrow.svg';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useMount } from '@screenshots/hooks/use-mount';
import Style from '@screenshots/theme/arrow.module.scss';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface ArrowToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 箭头工具组件
 */
export const ArrowTool: FC<ArrowToolProps> = ({
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
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
  })));

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const firstScreenShotImageDataRef = useRef<ImageData | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const arrowColor = 'red';
  const arrowWidth = 2;
  const arrowHeadLength = 10;

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

  const drawArrow = useMemoizedFn(
    (fromX: number, fromY: number, toX: number, toY: number) => {
      if (!contextRef.current)
        return;

      const angle = Math.atan2(toY - fromY, toX - fromX);

      contextRef.current.beginPath();
      contextRef.current.moveTo(fromX, fromY);
      contextRef.current.lineTo(toX, toY);
      contextRef.current.stroke();

      contextRef.current.beginPath();
      contextRef.current.moveTo(toX, toY);
      contextRef.current.lineTo(
        toX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
        toY - arrowHeadLength * Math.sin(angle - Math.PI / 6),
      );
      contextRef.current.moveTo(toX, toY);
      contextRef.current.lineTo(
        toX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
        toY - arrowHeadLength * Math.sin(angle + Math.PI / 6),
      );
      contextRef.current.stroke();
    },
  );

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.arrow);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current)
        return;

      firstScreenShotImageDataRef.current = contextRef.current.getImageData(
        cutoutBoxX,
        cutoutBoxY,
        cutoutBoxWidth,
        cutoutBoxHeight,
      );

      if (activeTarget !== ACTIVE_TYPE.arrow)
        return;

      isCurrentArea(
        cutoutBoxX,
        cutoutBoxX + cutoutBoxWidth,
        cutoutBoxY,
        cutoutBoxY + cutoutBoxHeight,
        event.clientX,
        event.clientY,
      );
      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });

      contextRef.current.beginPath();
      contextRef.current.strokeStyle = arrowColor;
      contextRef.current.lineWidth = arrowWidth;
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!firstScreenShotImageDataRef.current || !contextRef.current)
        return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.arrow)
        return;

      contextRef.current.putImageData(
        firstScreenShotImageDataRef.current,
        cutoutBoxX,
        cutoutBoxY,
      );

      drawArrow(startPoint.x, startPoint.y, event.clientX, event.clientY);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.arrow || !contextRef.current)
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
    <div class={Style.arrow} onClick={handleClick} tabIndex={0}>
      <img src={arrow} alt="arrow" />
    </div>
  );
};
