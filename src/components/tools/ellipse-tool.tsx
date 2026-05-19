import type { FC } from 'preact/compat';
import ellipse from '@screenshots/assets/images/ellipse.svg';
import { useMount, useMemoizedFn } from 'ahooks';
import Style from '@screenshots/theme/ellipse.module.scss';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface EllipseToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 椭圆工具组件
 */
export const EllipseTool: FC<EllipseToolProps> = ({
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

  const ellipseColor = toolsConfig.ellipse?.color ?? 'red';
  const ellipseWidth = toolsConfig.ellipse?.lineWidth ?? 2;

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
    setActiveTarget(ACTIVE_TYPE.ellipse);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) {
        return;
      }
      if (activeTarget !== ACTIVE_TYPE.ellipse) {
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
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.ellipse) {
        return;
      }

      contextRef.current.putImageData(
        firstScreenShotImageDataRef.current,
        cutoutBoxX,
        cutoutBoxY,
      );

      const centerX = (startPoint.x + event.clientX) / 2;
      const centerY = (startPoint.y + event.clientY) / 2;
      let radiusX = Math.abs(event.clientX - startPoint.x) / 2;
      let radiusY = Math.abs(event.clientY - startPoint.y) / 2;

      // Shift 约束正圆
      if (shiftPressedRef.current) {
        const r = Math.min(radiusX, radiusY);
        radiusX = r;
        radiusY = r;
      }

      if (radiusX > 0 && radiusY > 0) {
        contextRef.current.beginPath();
        contextRef.current.strokeStyle = ellipseColor;
        contextRef.current.lineWidth = ellipseWidth;
        contextRef.current.ellipse(
          centerX,
          centerY,
          radiusX,
          radiusY,
          0,
          0,
          Math.PI * 2,
        );
        contextRef.current.stroke();
      }
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (
      !isDrawing
      || activeTarget !== ACTIVE_TYPE.ellipse
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
      data-tool-btn={ACTIVE_TYPE.ellipse}
      class={`${Style.ellipse}${activeTarget === ACTIVE_TYPE.ellipse ? ` ${Style.active}` : ''}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <img src={ellipse} alt="ellipse" />
    </div>
  );
};
