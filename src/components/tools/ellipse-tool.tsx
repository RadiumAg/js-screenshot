import type { FC } from 'preact/compat';
import type { EllipseShape } from '../shapes/types';
import ellipse from '@screenshots/assets/images/ellipse.svg';
import Style from '@screenshots/theme/ellipse.module.scss';
import { useEventListener, useMemoizedFn } from 'ahooks';
import { useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { renderAllShapes } from '../shapes/shape-renderer';
import { ShapeType } from '../shapes/types';
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
export const EllipseTool: FC<EllipseToolProps> = (_props) => {
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
  const tempShapeRef = useRef<EllipseShape | null>(null);

  const ellipseColor = toolsConfig.ellipse?.color ?? 'red';
  const ellipseWidth = toolsConfig.ellipse?.lineWidth ?? 2;

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
  const redraw = useMemoizedFn((tempShape?: EllipseShape | null) => {
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
      drawCanvasContext.ellipse(
        tempShape.cx,
        tempShape.cy,
        Math.abs(tempShape.rx),
        Math.abs(tempShape.ry),
        0,
        0,
        Math.PI * 2,
      );
      drawCanvasContext.stroke();
    }
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    selectShape(null);
    setActiveTarget(ACTIVE_TYPE.ellipse);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!drawCanvasContext)
        return;
      if (activeTarget !== ACTIVE_TYPE.ellipse)
        return;

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!drawCanvasContext)
        return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.ellipse)
        return;

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

      const tempShape: EllipseShape = {
        id: '__temp__',
        type: ShapeType.Ellipse,
        cx: centerX,
        cy: centerY,
        rx: radiusX,
        ry: radiusY,
        style: { color: ellipseColor, lineWidth: ellipseWidth },
      };

      tempShapeRef.current = tempShape;
      redraw(tempShape);
    },
  );

  const handleMouseUp = useMemoizedFn(() => {
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.ellipse)
      return;

    setIsDrawing(false);

    if (tempShapeRef.current && (tempShapeRef.current.rx !== 0 || tempShapeRef.current.ry !== 0)) {
      const newShape: EllipseShape = {
        ...tempShapeRef.current,
        id: `ellipse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
      data-tool-btn={ACTIVE_TYPE.ellipse}
      class={`${Style.ellipse}${activeTarget === ACTIVE_TYPE.ellipse ? ` ${Style.active}` : ''}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <img src={ellipse} alt="ellipse" />
    </div>
  );
};
