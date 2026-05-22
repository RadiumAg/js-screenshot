import type { FC } from 'preact/compat';
import type { RectShape } from '../shapes/types';
import rect from '@screenshots/assets/images/rect.svg';
import Style from '@screenshots/theme/rect.module.scss';
import { useEventListener, useMemoizedFn } from 'ahooks';
import { useRef, useState } from 'preact/hooks';
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
    drawCanvasElement,
    drawCanvasContext,
    toolsConfig,
    operateHistory,
    setActiveTarget,
    setIsLock,
    addShape,
    selectShape,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    drawCanvasElement: state.drawCanvasElement,
    drawCanvasContext: state.drawCanvasContext,
    toolsConfig: state.toolsConfig,
    operateHistory: state.operateHistory,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    addShape: state.addShape,
    selectShape: state.selectShape,
  })));

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const shiftPressedRef = useRef(false);
  const tempShapeRef = useRef<RectShape | null>(null);

  const rectColor = toolsConfig.rect?.color ?? 'red';
  const rectWidth = toolsConfig.rect?.lineWidth ?? 2;

  // 监听 Shift 键
  const handleKeyDown = useMemoizedFn((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftPressedRef.current = true;
    }
  });
  const handleKeyUp = useMemoizedFn((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftPressedRef.current = false;
    }
  });
  useEventListener('keydown', handleKeyDown);
  useEventListener('keyup', handleKeyUp);

  /**
   * 重绘画布：恢复背景 + 已有图形 + 临时图形
   */
  const redraw = useMemoizedFn((tempShape?: RectShape | null) => {
    if (!drawCanvasContext)
      return;

    // 恢复完整画面（含遮罩），operateHistory[0] 是整个 canvas 的快照
    if (operateHistory.length > 0) {
      const initialEntry = operateHistory[0];
      drawCanvasContext.putImageData(initialEntry.imageData, initialEntry.position.x, initialEntry.position.y);
    }

    // 渲染已确认的图形（从 store 获取最新 shapes，避免闭包过时）
    const currentShapes = useScreenshotStore.getState().shapes;
    renderAllShapes(drawCanvasContext, currentShapes);

    // 渲染临时图形（正在绘制中的）
    if (tempShape) {
      drawCanvasContext.beginPath();
      drawCanvasContext.strokeStyle = tempShape.style.color;
      drawCanvasContext.lineWidth = tempShape.style.lineWidth;
      drawCanvasContext.strokeRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height);
    }
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    selectShape(null);
    setActiveTarget(ACTIVE_TYPE.rect);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!drawCanvasContext)
        return;
      if (activeTarget !== ACTIVE_TYPE.rect)
        return;

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!drawCanvasContext)
        return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.rect)
        return;

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
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.rect)
      return;

    setIsDrawing(false);

    if (tempShapeRef.current && (tempShapeRef.current.width !== 0 || tempShapeRef.current.height !== 0)) {
      const newShape: RectShape = {
        ...tempShapeRef.current,
        id: `rect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      addShape(newShape);

      // 重绘最终画面并保存历史（包含 shapes 快照）
      redraw(null);
      if (drawCanvasContext && operateHistory.length > 0) {
        const initialEntry = operateHistory[0];
        const imageData = drawCanvasContext.getImageData(
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

  useEventListener('mousedown', handleMouseDown, { target: () => drawCanvasElement });
  useEventListener('mousemove', handleMouseMove, { target: () => drawCanvasElement });
  useEventListener('mouseup', handleMouseUp, { target: () => drawCanvasElement });

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
