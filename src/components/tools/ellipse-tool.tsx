import type { FC } from 'preact/compat';
import type { EllipseShape } from '../shapes/types';
import ellipse from '@screenshots/assets/images/ellipse.svg';
import Style from '@screenshots/theme/ellipse.module.scss';
import { useMemoizedFn, useMount } from 'ahooks';
import { useEffect, useRef, useState } from 'preact/hooks';
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
  const tempShapeRef = useRef<EllipseShape | null>(null);

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

  /**
   * 重绘画布：恢复背景 + 已有图形 + 临时图形
   */
  const redraw = useMemoizedFn((tempShape?: EllipseShape | null) => {
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
      contextRef.current.ellipse(
        tempShape.cx,
        tempShape.cy,
        Math.abs(tempShape.rx),
        Math.abs(tempShape.ry),
        0,
        0,
        Math.PI * 2,
      );
      contextRef.current.stroke();
    }
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    selectShape(null);
    setActiveTarget(ACTIVE_TYPE.ellipse);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) return;
      if (activeTarget !== ACTIVE_TYPE.ellipse) return;

      setIsDrawing(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    },
  );

  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (!contextRef.current) return;
      if (!isDrawing || activeTarget !== ACTIVE_TYPE.ellipse) return;

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
    if (!isDrawing || activeTarget !== ACTIVE_TYPE.ellipse) return;

    setIsDrawing(false);

    if (tempShapeRef.current && (tempShapeRef.current.rx !== 0 || tempShapeRef.current.ry !== 0)) {
      const newShape: EllipseShape = {
        ...tempShapeRef.current,
        id: `ellipse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
      data-tool-btn={ACTIVE_TYPE.ellipse}
      class={`${Style.ellipse}${activeTarget === ACTIVE_TYPE.ellipse ? ` ${Style.active}` : ''}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <img src={ellipse} alt="ellipse" />
    </div>
  );
};
