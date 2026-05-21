import type { FC } from 'preact/compat';
import type { RectShape } from '../shapes/types';
import rect from '@screenshots/assets/images/rect.svg';
import Style from '@screenshots/theme/rect.module.scss';
import { useMemoizedFn, useMount } from 'ahooks';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { renderAllShapes } from '../shapes/shape-renderer';
import { ShapeType } from '../shapes/types';
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
export const RectTool: FC<RectToolProps> = (_props) => {
  const {
    activeTarget,
    setActiveTarget,
    setIsLock,
    drawCanvasElement,
    toolsConfig,
    shapes,
    addShape,
    selectShape,
    operateHistory,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    drawCanvasElement: state.drawCanvasElement,
    toolsConfig: state.toolsConfig,
    shapes: state.shapes,
    addShape: state.addShape,
    selectShape: state.selectShape,
    operateHistory: state.operateHistory,
  })));

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const shiftPressedRef = useRef(false);
  const tempShapeRef = useRef<RectShape | null>(null);

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

  /**
   * 重绘画布：恢复背景 + 已有图形 + 临时图形
   */
  const redraw = useMemoizedFn((tempShape?: RectShape | null) => {
    if (!contextRef.current) return;

    // 恢复背景
    if (operateHistory.length > 0) {
      const initialEntry = operateHistory[0];
      contextRef.current.putImageData(initialEntry.imageData, initialEntry.position.x, initialEntry.position.y);
    }

    // 渲染已确认的图形
    renderAllShapes(contextRef.current, shapes);

    // 渲染临时图形（正在绘制中的）
    if (tempShape) {
      contextRef.current.beginPath();
      contextRef.current.strokeStyle = tempShape.style.color;
      contextRef.current.lineWidth = tempShape.style.lineWidth;
      contextRef.current.strokeRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height);
    }
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    selectShape(null);
    setActiveTarget(ACTIVE_TYPE.rect);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) return;
      if (activeTarget !== ACTIVE_TYPE.rect) return;

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.rect) return;

      let w = event.clientX - startPoint.x;
      let h = event.clientY - startPoint.y;

      // Shift 约束正方形
      if (shiftPressedRef.current) {
        const side = Math.min(Math.abs(w), Math.abs(h));
        w = w >= 0 ? side : -side;
        h = h >= 0 ? side : -side;
      }

      const tempShape: RectShape = {
        id: '__temp__',
        type: ShapeType.Rect,
        x: startPoint.x,
        y: startPoint.y,
        width: w,
        height: h,
        style: { color: rectColor, lineWidth: rectWidth },
      };

      tempShapeRef.current = tempShape;
      redraw(tempShape);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.rect) return;

    setIsDrawing(false);

    if (tempShapeRef.current && (tempShapeRef.current.width !== 0 || tempShapeRef.current.height !== 0)) {
      const newShape: RectShape = {
        ...tempShapeRef.current,
        id: `rect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      addShape(newShape);

      // 重绘最终画面并保存历史（包含 shapes 快照）
      redraw(null);
      if (contextRef.current && operateHistory.length > 0) {
        const initialEntry = operateHistory[0];
        const imageData = contextRef.current.getImageData(
          initialEntry.position.x,
          initialEntry.position.y,
          initialEntry.imageData.width,
          initialEntry.imageData.height,
        );
        const updatedShapes = useScreenshotStore.getState().shapes;
        operateHistory.push({
          imageData,
          position: { ...initialEntry.position },
          shapes: JSON.parse(JSON.stringify(updatedShapes)),
        });
      }
    }

    tempShapeRef.current = null;
  });

  useMount(() => {
    if (!drawCanvasElement) return;

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
