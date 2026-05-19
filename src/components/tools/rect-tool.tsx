import type { FC } from 'preact/compat';
import rect from '@screenshots/assets/images/rect.svg';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useMount } from '@screenshots/hooks/use-mount';
import Style from '@screenshots/theme/rect.module.scss';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface RectToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 矩形工具组件
 */
export const RectTool: FC<RectToolProps> = ({
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

  const rectColor = toolsConfig.rect?.color ?? 'red';
  const rectWidth = toolsConfig.rect?.lineWidth ?? 2;

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

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.rect);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) {
        return;
      }
      if (activeTarget !== ACTIVE_TYPE.rect) {
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
      contextRef.current.strokeStyle = rectColor;
      contextRef.current.lineWidth = rectWidth;
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
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.rect) {
        return;
      }

      contextRef.current.putImageData(
        firstScreenShotImageDataRef.current,
        cutoutBoxX,
        cutoutBoxY,
      );

      let w = event.clientX - startPoint.x;
      let h = event.clientY - startPoint.y;

      // Shift 约束正方形
      if (shiftPressedRef.current) {
        const side = Math.min(Math.abs(w), Math.abs(h));
        w = w >= 0 ? side : -side;
        h = h >= 0 ? side : -side;
      }

      contextRef.current.beginPath();
      contextRef.current.strokeStyle = rectColor;
      contextRef.current.lineWidth = rectWidth;
      contextRef.current.strokeRect(startPoint.x, startPoint.y, w, h);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (
      !isDrawing
      || activeTarget !== ACTIVE_TYPE.rect
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
      data-tool-btn={ACTIVE_TYPE.rect}
      class={`${Style.rect}${activeTarget === ACTIVE_TYPE.rect ? ` ${Style.active}` : ''}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <img src={rect} alt="rect" />
    </div>
  );
};
