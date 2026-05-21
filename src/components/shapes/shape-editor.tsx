import type { FC } from 'preact/compat';
import type { ControlPoint, Shape } from './types';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useRef } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';
import { hitTestControlPoint, hitTestShape } from './hit-test';
import { getShapeBoundingBox, renderAllShapes, renderSelection } from './shape-renderer';
import { ControlPointPosition, ShapeType } from './types';

export interface ShapeEditorProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 图形编辑器组件 - 处理图形选中、控制点拖拽编辑
 */
export const ShapeEditor: FC<ShapeEditorProps> = (_props) => {
  const {
    shapes,
    selectedShapeId,
    selectShape,
    updateShape,
    removeShape,
    drawCanvasElement,
    activeTarget,
    setActiveTarget,
    operateHistory,
    themeColor,
  } = useScreenshotStore(useShallow(state => ({
    shapes: state.shapes,
    selectedShapeId: state.selectedShapeId,
    selectShape: state.selectShape,
    updateShape: state.updateShape,
    removeShape: state.removeShape,
    drawCanvasElement: state.drawCanvasElement,
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    operateHistory: state.operateHistory,
    themeColor: state.themeColor,
  })));

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragTypeRef = useRef<'move' | 'resize'>('move');
  const activeControlPointRef = useRef<ControlPoint | null>(null);
  const originalShapeRef = useRef<Shape | null>(null);

  const selectedShape = shapes.find(s => s.id === selectedShapeId) ?? null;

  /**
   * 重绘所有图形到 Canvas（包含选中态）
   */
  const redrawShapes = useMemoizedFn(() => {
    if (!drawCanvasElement)
      return;
    const ctx = drawCanvasElement.getContext('2d');
    if (!ctx)
      return;

    // 先恢复背景（从 operateHistory 的初始快照）
    if (operateHistory.length > 0) {
      const initialEntry = operateHistory[0];
      ctx.putImageData(initialEntry.imageData, initialEntry.position.x, initialEntry.position.y);
    }

    // 渲染所有图形
    renderAllShapes(ctx, shapes);

    // 渲染选中态
    if (selectedShape) {
      renderSelection(ctx, selectedShape, themeColor);
    }
  });

  // shapes 或 selectedShapeId 变化时重绘
  useEffect(() => {
    redrawShapes();
  }, [shapes, selectedShapeId]);

  /**
   * 处理鼠标按下 - 选中图形或开始拖拽
   *
   * 关键：不再检查 activeTarget，而是通过命中检测判断。
   * 如果点击命中了已有图形，则接管事件（stopPropagation），
   * 这样工具的 mouseDown 就不会再触发新绘制。
   */
  const handleMouseDown = useMemoizedFn((event: MouseEvent) => {
    if (!selectedShape && !shapes.length)
      return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 如果已有选中图形，检测是否点击了控制点
    if (selectedShape) {
      const controlPoint = hitTestControlPoint(mouseX, mouseY, selectedShape);
      if (controlPoint) {
        isDraggingRef.current = true;
        dragTypeRef.current = 'resize';
        dragStartRef.current = { x: mouseX, y: mouseY };
        activeControlPointRef.current = controlPoint;
        originalShapeRef.current = { ...selectedShape };
        setActiveTarget(ACTIVE_TYPE.dotController);
        event.stopImmediatePropagation();
        event.preventDefault();
        return;
      }

      // 检测是否点击了选中图形本体（拖拽移动）
      const hitOnSelected = hitTestShape(mouseX, mouseY, [selectedShape]);
      if (hitOnSelected) {
        isDraggingRef.current = true;
        dragTypeRef.current = 'move';
        dragStartRef.current = { x: mouseX, y: mouseY };
        originalShapeRef.current = { ...selectedShape };
        setActiveTarget(ACTIVE_TYPE.dotController);
        event.stopImmediatePropagation();
        event.preventDefault();
        return;
      }
    }

    // 检测是否点击了其他图形
    const hitShape = hitTestShape(mouseX, mouseY, shapes);
    if (hitShape) {
      selectShape(hitShape.id);
      isDraggingRef.current = true;
      dragTypeRef.current = 'move';
      dragStartRef.current = { x: mouseX, y: mouseY };
      originalShapeRef.current = { ...hitShape };
      setActiveTarget(ACTIVE_TYPE.dotController);
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // 点击空白处取消选中
    if (selectedShape) {
      selectShape(null);
    }
  });

  /**
   * 处理鼠标移动 - 拖拽图形或调整大小
   */
  const handleMouseMove = useMemoizedFn((event: MouseEvent) => {
    if (!isDraggingRef.current || !originalShapeRef.current || !selectedShapeId)
      return;

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const original = originalShapeRef.current;

    if (dragTypeRef.current === 'move') {
      applyMove(original, dx, dy);
    }
    else if (dragTypeRef.current === 'resize' && activeControlPointRef.current) {
      applyResize(original, dx, dy, activeControlPointRef.current.position);
    }
  });

  /**
   * 处理鼠标松开 - 结束拖拽
   */
  const handleMouseUp = useMemoizedFn(() => {
    if (!isDraggingRef.current)
      return;
    isDraggingRef.current = false;
    activeControlPointRef.current = null;
    originalShapeRef.current = null;
    setActiveTarget(null);
  });

  /**
   * 应用移动变换
   */
  const applyMove = useMemoizedFn((original: Shape, dx: number, dy: number) => {
    switch (original.type) {
      case ShapeType.Rect:
        updateShape(original.id, { x: original.x + dx, y: original.y + dy });
        break;
      case ShapeType.Ellipse:
        updateShape(original.id, { cx: original.cx + dx, cy: original.cy + dy });
        break;
      case ShapeType.Arrow:
      case ShapeType.Line:
        updateShape(original.id, {
          startX: original.startX + dx,
          startY: original.startY + dy,
          endX: original.endX + dx,
          endY: original.endY + dy,
        });
        break;
    }
  });

  /**
   * 应用缩放变换
   */
  const applyResize = useMemoizedFn((
    original: Shape,
    dx: number,
    dy: number,
    position: ControlPointPosition,
  ) => {
    const box = getShapeBoundingBox(original);

    let newX = box.x;
    let newY = box.y;
    let newWidth = box.width;
    let newHeight = box.height;

    switch (position) {
      case ControlPointPosition.TopLeft:
        newX = box.x + dx;
        newY = box.y + dy;
        newWidth = box.width - dx;
        newHeight = box.height - dy;
        break;
      case ControlPointPosition.TopCenter:
        newY = box.y + dy;
        newHeight = box.height - dy;
        break;
      case ControlPointPosition.TopRight:
        newY = box.y + dy;
        newWidth = box.width + dx;
        newHeight = box.height - dy;
        break;
      case ControlPointPosition.MiddleLeft:
        newX = box.x + dx;
        newWidth = box.width - dx;
        break;
      case ControlPointPosition.MiddleRight:
        newWidth = box.width + dx;
        break;
      case ControlPointPosition.BottomLeft:
        newX = box.x + dx;
        newWidth = box.width - dx;
        newHeight = box.height + dy;
        break;
      case ControlPointPosition.BottomCenter:
        newHeight = box.height + dy;
        break;
      case ControlPointPosition.BottomRight:
        newWidth = box.width + dx;
        newHeight = box.height + dy;
        break;
    }

    // 应用到具体图形类型
    switch (original.type) {
      case ShapeType.Rect:
        updateShape(original.id, { x: newX, y: newY, width: newWidth, height: newHeight });
        break;
      case ShapeType.Ellipse:
        updateShape(original.id, {
          cx: newX + newWidth / 2,
          cy: newY + newHeight / 2,
          rx: newWidth / 2,
          ry: newHeight / 2,
        });
        break;
      case ShapeType.Arrow:
      case ShapeType.Line: {
        // 对于线段/箭头，映射包围盒变换到起止点
        const origBox = getShapeBoundingBox(original);
        const scaleX = origBox.width !== 0 ? newWidth / origBox.width : 1;
        const scaleY = origBox.height !== 0 ? newHeight / origBox.height : 1;
        const offsetX = newX - origBox.x;
        const offsetY = newY - origBox.y;

        updateShape(original.id, {
          startX: origBox.x + (original.startX - origBox.x) * scaleX + offsetX,
          startY: origBox.y + (original.startY - origBox.y) * scaleY + offsetY,
          endX: origBox.x + (original.endX - origBox.x) * scaleX + offsetX,
          endY: origBox.y + (original.endY - origBox.y) * scaleY + offsetY,
        });
        break;
      }
    }
  });

  /**
   * 处理键盘事件 - Delete 删除选中图形
   */
  const handleKeyDown = useMemoizedFn((event: KeyboardEvent) => {
    if (!selectedShapeId)
      return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      removeShape(selectedShapeId);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // 注册事件（使用 capture 阶段，确保在工具的 mousedown 之前触发）
  useEffect(() => {
    if (!drawCanvasElement)
      return;

    drawCanvasElement.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawCanvasElement, selectedShape, shapes]);

  // 更新光标
  useEffect(() => {
    if (!drawCanvasElement || !selectedShape)
      return;

    const handleCursorMove = (event: MouseEvent) => {
      if (isDraggingRef.current)
        return;
      if (activeTarget && activeTarget !== ACTIVE_TYPE.dotController)
        return;

      const controlPoint = hitTestControlPoint(event.clientX, event.clientY, selectedShape);
      if (controlPoint) {
        drawCanvasElement.style.cursor = controlPoint.cursor;
        return;
      }

      const hit = hitTestShape(event.clientX, event.clientY, [selectedShape]);
      if (hit) {
        drawCanvasElement.style.cursor = 'move';
        return;
      }

      drawCanvasElement.style.cursor = '';
    };

    drawCanvasElement.addEventListener('mousemove', handleCursorMove);
    return () => {
      drawCanvasElement.removeEventListener('mousemove', handleCursorMove);
    };
  }, [drawCanvasElement, selectedShape, activeTarget]);

  return null;
};
