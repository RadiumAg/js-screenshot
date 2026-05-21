import type { FC } from 'preact/compat';
import type { ArrowShape } from '../shapes/types';
import arrow from '@screenshots/assets/images/arrow.svg';
import Style from '@screenshots/theme/arrow.module.scss';
import { useMemoizedFn, useMount } from 'ahooks';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { renderAllShapes, renderShape } from '../shapes/shape-renderer';
import { ShapeType } from '../shapes/types';
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
export const ArrowTool: FC<ArrowToolProps> = (_props) => {
  const {
    activeTarget,
    setActiveTarget,
    setIsLock,
    operateHistory,
    drawCanvasElement,
    toolsConfig,
    addShape,
    selectShape,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
    toolsConfig: state.toolsConfig,
    addShape: state.addShape,
    selectShape: state.selectShape,
  })));

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const tempShapeRef = useRef<ArrowShape | null>(null);

  const arrowColor = toolsConfig.arrow?.color ?? 'red';
  const arrowWidth = toolsConfig.arrow?.lineWidth ?? 2;
  const arrowSize = toolsConfig.arrow?.arrowSize ?? 10;
  const lineType = toolsConfig.arrow?.lineType ?? 'arrow';

  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

  /**
   * 重绘画布：恢复背景 + 已有图形 + 临时图形
   */
  const redraw = useMemoizedFn((tempShape?: ArrowShape | null) => {
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

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    selectShape(null);
    setActiveTarget(ACTIVE_TYPE.arrow);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current)
        return;
      if (activeTarget !== ACTIVE_TYPE.arrow)
        return;

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current)
        return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.arrow)
        return;

      const tempShape: ArrowShape = {
        id: '__temp__',
        type: ShapeType.Arrow,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: event.clientX,
        endY: event.clientY,
        arrowSize,
        lineType,
        style: { color: arrowColor, lineWidth: arrowWidth },
      };

      tempShapeRef.current = tempShape;
      redraw(tempShape);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.arrow)
      return;

    setIsDrawing(false);

    if (tempShapeRef.current) {
      const { startX, startY, endX, endY } = tempShapeRef.current;
      // 只添加非零长度的箭头
      if (Math.abs(endX - startX) > 0 || Math.abs(endY - startY) > 0) {
        const newShape: ArrowShape = {
          ...tempShapeRef.current,
          id: `arrow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    if (!drawCanvasElement)
      return;

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
    <div data-tool-btn={ACTIVE_TYPE.arrow} class={`${Style.arrow}${activeTarget === ACTIVE_TYPE.arrow ? ` ${Style.active}` : ''}`} onClick={handleClick} tabIndex={0}>
      <img src={arrow} alt="arrow" />
    </div>
  );
};
