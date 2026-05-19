import type { FC } from 'preact/compat';
import line from '@screenshots/assets/images/line.svg';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useMount } from '@screenshots/hooks/use-mount';
import Style from '@screenshots/theme/line.module.scss';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface LineToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 直线工具组件
 */
export const LineTool: FC<LineToolProps> = ({
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
    toolsConfig,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
    toolsConfig: state.toolsConfig,
  })));

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const firstScreenShotImageDataRef = useRef<ImageData | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const shiftPressedRef = useRef(false);

  const lineColor = toolsConfig.line?.color ?? 'red';
  const lineWidth = toolsConfig.line?.lineWidth ?? 2;

  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

  // 监听 Shift 键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftPressedRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftPressedRef.current = false;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * 约束直线角度为水平/垂直/45度
   */
  const constrainAngle = useMemoizedFn(
    (fromX: number, fromY: number, toX: number, toY: number) => {
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 吸附到最近的 45 度角
      const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      return {
        x: fromX + dist * Math.cos(snapped),
        y: fromY + dist * Math.sin(snapped),
      };
    },
  );

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.line);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) {
        return;
      }
      if (activeTarget !== ACTIVE_TYPE.line) {
        return;
      }

      firstScreenShotImageDataRef.current = contextRef.current.getImageData(
        cutoutBoxX,
        cutoutBoxY,
        cutoutBoxWidth,
        cutoutBoxHeight,
      );

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });

      contextRef.current.beginPath();
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (
        !firstScreenShotImageDataRef.current
        || !contextRef.current
      ) {
        return;
      }
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.line) {
        return;
      }

      contextRef.current.putImageData(
        firstScreenShotImageDataRef.current,
        cutoutBoxX,
        cutoutBoxY,
      );

      let endX = event.clientX;
      let endY = event.clientY;

      // Shift 约束角度
      if (shiftPressedRef.current) {
        const constrained = constrainAngle(
          startPoint.x,
          startPoint.y,
          endX,
          endY,
        );
        endX = constrained.x;
        endY = constrained.y;
      }

      contextRef.current.beginPath();
      contextRef.current.strokeStyle = lineColor;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.moveTo(startPoint.x, startPoint.y);
      contextRef.current.lineTo(endX, endY);
      contextRef.current.stroke();
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (
      !isDrawing
      || activeTarget !== ACTIVE_TYPE.line
      || !contextRef.current
    ) {
      return;
    }

    setIsDrawing(false);

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
  });

  useMount(() => {
    if (!drawCanvasElement) {
      return;
    }

    drawCanvasElement.addEventListener('mousedown', handleMouseDown as EventListener);
    drawCanvasElement.addEventListener('mousemove', handleMouseMove as EventListener);
    drawCanvasElement.addEventListener('mouseup', handleMouseUp as EventListener);

    return () => {
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as EventListener);
      drawCanvasElement.removeEventListener('mousemove', handleMouseMove as EventListener);
      drawCanvasElement.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  });

  return (
    <div
      data-tool-btn={ACTIVE_TYPE.line}
      class={`${Style.line}${activeTarget === ACTIVE_TYPE.line ? ` ${Style.active}` : ''}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <img src={line} alt="line" />
    </div>
  );
};
