import type { FC } from 'preact/compat';
import pen from '@screenshots/assets/images/pen.svg';
import Style from '@screenshots/theme/pen.module.scss';
import { useMemoizedFn, useMount } from 'ahooks';
import { useEffect, useRef } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
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
    toolsConfig,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
    dotControllerSize: state.dotControllerSize,
    toolsConfig: state.toolsConfig,
  })));

  const isMouseDownRef = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Array<{ x: number, y: number }>>([]);

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
        const points = pointsRef.current;
        points.push({ x: event.clientX, y: event.clientY });

contextRef.current.lineWidth = toolsConfig.pen?.lineWidth ?? 2;
        // 使用二次贝塞尔曲线平滑连线
        if (points.length >= 3) {
          const lastTwo = points[points.length - 2];
          const lastOne = points[points.length - 1];
          const midX = (lastTwo.x + lastOne.x) / 2;
          const midY = (lastTwo.y + lastOne.y) / 2;

          contextRef.current.quadraticCurveTo(
            lastTwo.x,
            lastTwo.y,
            midX,
            midY,
          );
          contextRef.current.stroke();
        }
        else {
          contextRef.current.lineTo(event.clientX, event.clientY);
          contextRef.current.stroke();
        }
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
        pointsRef.current = [{ x: event.clientX, y: event.clientY }];

        contextRef.current.strokeStyle = toolsConfig.pen?.color ?? '#000000';
        contextRef.current.lineWidth = toolsConfig.pen?.lineWidth ?? 2;
        contextRef.current.lineCap = 'round';
        contextRef.current.lineJoin = 'round';
        contextRef.current.beginPath();
        contextRef.current.moveTo(event.clientX, event.clientY);
      }
      else {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = '';
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
      operateHistory.push({
        imageData,
        position: { x: cutoutBoxX, y: cutoutBoxY },
      });
    }
    isMouseDownRef.current = false;
  });

  useMount(() => {
    if (!drawCanvasElement)
      return;

    drawCanvasElement.addEventListener('mousemove', handleMouseMove as EventListener);
    drawCanvasElement.addEventListener('mousedown', handleMouseDown as EventListener);
    drawCanvasElement.addEventListener('mouseup', handleMouseUp as EventListener);

    return () => {
      drawCanvasElement.removeEventListener('mousemove', handleMouseMove as EventListener);
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as EventListener);
      drawCanvasElement.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  });

  useEffect(() => {
    if (drawCanvasElement) {
      canvasRef.current = drawCanvasElement;
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

  return (
    <div data-tool-btn={ACTIVE_TYPE.pen} class={`${Style.pen}${activeTarget === ACTIVE_TYPE.pen ? ` ${Style.active}` : ''}`} onClick={handleClick}>
      <img src={pen} alt="pen" />
    </div>
  );
};
