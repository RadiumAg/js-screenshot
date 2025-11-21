import Style from '@screenshots/theme/dot-controller.module.scss';
import { animateThrottleFn } from '@screenshots/utils';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { useScreenshotContext } from './context/ScreenshotContext';

export interface DotControllerProps {
  cursor: string
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
  onUpdateAxis: (x: number, y: number, oldX: number, oldY: number, oldCutoutBox: any) => void
}

/**
 * DotController 组件 - 裁剪框控制点
 */
export function DotController({
  cursor,
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
  onUpdateAxis,
}: DotControllerProps) {
  const {
    activeTarget,
    setActiveTarget,
    setIsFirstInit,
    operateHistory,
    drawCanvasElement,
    dotControllerSize,
  } = useScreenshotContext();

  const elRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const oldPositionRef = useRef({ x: 0, y: 0 });
  const oldClientRef = useRef({ x: 0, y: 0 });
  const oldCutoutBoxRef = useRef<any>(null);
  const isMouseDownRef = useRef(false);

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // 初始化 context
  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

  /**
   * 更新控制点位置
   */
  const updatePosition = useCallback((x: number, y: number) => {
    if (!elRef.current)
      return;

    positionRef.current = {
      x: x - dotControllerSize / 2,
      y: y - dotControllerSize / 2,
    };

    elRef.current.style.left = `${positionRef.current.x}px`;
    elRef.current.style.top = `${positionRef.current.y}px`;
  }, [dotControllerSize]);

  /**
   * 更新轴坐标
   */
  const updateAxis = useCallback(() => {
    onUpdateAxis(
      positionRef.current.x,
      positionRef.current.y,
      oldPositionRef.current.x,
      oldPositionRef.current.y,
      oldCutoutBoxRef.current,
    );
  }, [onUpdateAxis]);

  const throttledUpdateAxis = useRef(animateThrottleFn(updateAxis)).current;

  /**
   * 检查是否在当前区域
   */
  const isCurrentArea = useCallback(
    (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    },
    [],
  );

  /**
   * 停止移动
   */
  const stopMove = useCallback(() => {
    isMouseDownRef.current = false;
    setActiveTarget(null);
    setIsFirstInit(false);
  }, [setActiveTarget, setIsFirstInit]);

  /**
   * 处理鼠标进入
   */
  const handleMouseEnter = useCallback(() => {
    if (activeTarget == null) {
      document.body.style.cursor = cursor;
    }
  }, [activeTarget, cursor]);

  /**
   * 处理鼠标离开
   */
  const handleMouseLeave = useCallback(() => {
    if (activeTarget == null) {
      document.body.style.cursor = '';
    }
  }, [activeTarget]);

  /**
   * 处理鼠标按下
   */
  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      const isFirstMoveDown = Reflect.get(event.target || {}, 'isFirstInit');

      if (
        isCurrentArea(
          positionRef.current.x,
          positionRef.current.x + dotControllerSize,
          positionRef.current.y,
          positionRef.current.y + dotControllerSize,
          event.clientX,
          event.clientY,
        )
        || isFirstMoveDown
      ) {
        oldPositionRef.current = { ...positionRef.current };
        oldClientRef.current = { x: event.clientX, y: event.clientY };

        oldCutoutBoxRef.current = {
          x: cutoutBoxX,
          y: cutoutBoxY,
          width: cutoutBoxWidth,
          height: cutoutBoxHeight,
        };

        isMouseDownRef.current = true;
        setActiveTarget('dotController');
        Reflect.deleteProperty(event.target || {}, 'isFirstInit');
      }
    },
    [
      isCurrentArea,
      dotControllerSize,
      cutoutBoxX,
      cutoutBoxY,
      cutoutBoxWidth,
      cutoutBoxHeight,
      setActiveTarget,
    ],
  );

  /**
   * 处理鼠标松开
   */
  const handleMouseUp = useCallback(() => {
    if (activeTarget !== 'dotController')
      return;
    if (!contextRef.current)
      return;

    operateHistory.push(
      contextRef.current.getImageData(
        cutoutBoxX,
        cutoutBoxY,
        cutoutBoxWidth,
        cutoutBoxHeight,
      ),
    );
    stopMove();
  }, [activeTarget, operateHistory, cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, stopMove]);

  /**
   * 处理全局鼠标移动
   */
  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      if (activeTarget !== null && activeTarget === 'dotController') {
        if (isMouseDownRef.current) {
          positionRef.current = {
            x: oldPositionRef.current.x + event.clientX - oldClientRef.current.x,
            y: oldPositionRef.current.y + event.clientY - oldClientRef.current.y,
          };

          throttledUpdateAxis();
        }
      }
    },
    [activeTarget, throttledUpdateAxis],
  );

  // 设置全局事件监听
  useEffect(() => {
    document.body.addEventListener('mousemove', handleGlobalMouseMove as any);
    document.addEventListener('mouseup', stopMove as any);

    return () => {
      document.body.removeEventListener('mousemove', handleGlobalMouseMove as any);
      document.removeEventListener('mouseup', stopMove as any);
    };
  }, [handleGlobalMouseMove, stopMove]);

  // 初始化位置
  useEffect(() => {
    updatePosition(cutoutBoxX, cutoutBoxY);
  }, [cutoutBoxX, cutoutBoxY, updatePosition]);

  return (
    <div
      ref={elRef}
      class={Style['dot-controller']}
      style={{
        width: `${dotControllerSize}px`,
        height: `${dotControllerSize}px`,
        position: 'fixed',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
}
