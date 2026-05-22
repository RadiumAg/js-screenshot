import type { FC } from 'preact/compat';
import type { LineShape } from '../shapes/types';
import line from '@screenshots/assets/images/line.svg';
import Style from '@screenshots/theme/line.module.scss';
import { useMemoizedFn, useMount } from 'ahooks';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { renderAllShapes, renderShape } from '../shapes/shape-renderer';
import { ShapeType } from '../shapes/types';
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
export const LineTool: FC<LineToolProps> = (_props) => {
  const {
    activeTarget,
    drawCanvasElement,
    toolsConfig,
    operateHistory,
    setActiveTarget,
    setIsLock,
    addShape,
    selectShape,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    drawCanvasElement: state.drawCanvasElement,
    toolsConfig: state.toolsConfig,
    operateHistory: state.operateHistory,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    addShape: state.addShape,
    selectShape: state.selectShape,
  })));

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const shiftPressedRef = useRef(false);
  const tempShapeRef = useRef<LineShape | null>(null);

  const lineColor = toolsConfig.line?.color ?? 'red';
  const lineWidth = toolsConfig.line?.lineWidth ?? 2;

  /**
   * 重绘画布：恢复背景 + 已有图形 + 临时图形
   */
  const redraw = useMemoizedFn((tempShape?: LineShape | null) => {
    if (!contextRef.current)
      return;

    // 恢复完整画面（含遮罩），operateHistory[0] 是整个 canvas 的快照
    if (operateHistory.length > 0) {
      const initialEntry = operateHistory[0];
      contextRef.current.putImageData(initialEntry.imageData, initialEntry.position.x, initialEntry.position.y);
    }

    // 渲染已确认的图形（从 store 获取最新 shapes，避免闭包过时）
    const currentShapes = useScreenshotStore.getState().shapes;
    renderAllShapes(contextRef.current, currentShapes);

    // 渲染临时图形（正在绘制中的）
    if (tempShape) {
      renderShape(contextRef.current, tempShape);
    }
  });

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
    selectShape(null);
    setActiveTarget(ACTIVE_TYPE.line);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current)
        return;
      if (activeTarget !== ACTIVE_TYPE.line)
        return;

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current)
        return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.line)
        return;

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

      const tempShape: LineShape = {
        id: '__temp__',
        type: ShapeType.Line,
        startX: startPoint.x,
        startY: startPoint.y,
        endX,
        endY,
        style: { color: lineColor, lineWidth },
      };

      tempShapeRef.current = tempShape;
      redraw(tempShape);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.line)
      return;

    setIsDrawing(false);

    if (tempShapeRef.current) {
      const { startX, startY, endX, endY } = tempShapeRef.current;
      // 检查线段长度是否足够（避免误触创建空线段）
      const dist = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      if (dist > 0) {
        const newShape: LineShape = {
          ...tempShapeRef.current,
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    }

    tempShapeRef.current = null;
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
