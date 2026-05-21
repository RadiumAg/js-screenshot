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

        // 增量绘制：每次只画最新一段曲线，使用中点贝塞尔保证平滑连接
        const len = points.length;
        if (len >= 3) {
          const prev = points[len - 3];
          const ctrl = points[len - 2];
          const curr = points[len - 1];

          // 控制点 = 前一个采样点，终点 = 前一个点与当前点的中点
          const midX = (ctrl.x + curr.x) / 2;
          const midY = (ctrl.y + curr.y) / 2;

          // 从上一段中点开始新路径，确保无缝衔接
          const prevMidX = (prev.x + ctrl.x) / 2;
          const prevMidY = (prev.y + ctrl.y) / 2;

          contextRef.current.beginPath();
          contextRef.current.moveTo(prevMidX, prevMidY);
          contextRef.current.quadraticCurveTo(ctrl.x, ctrl.y, midX, midY);
          contextRef.current.stroke();
        }
        else if (len === 2) {
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

        contextRef.current.strokeStyle = toolsConfig.pen?.color ?? 'red';
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
    if (isMouseDownRef.current && contextRef.current && drawCanvasElement) {
      // pen 直接画像素，完成后更新 operateHistory[0] 基础快照
      // 这样其他工具的 redraw 从基础快照恢复时就包含 pen 的内容
      const fullImageData = contextRef.current.getImageData(
        0,
        0,
        drawCanvasElement.width,
        drawCanvasElement.height,
      );
      if (operateHistory.length > 0) {
        operateHistory[0] = {
          imageData: fullImageData,
          position: { x: 0, y: 0 },
        };
      }
      // 同时 push 一条用于撤销
      operateHistory.push({
        imageData: fullImageData,
        position: { x: 0, y: 0 },
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
