import useMemoizedFn from '@screenshots/hooks/useMemoizedFn';
import { useMount } from '@screenshots/hooks/useMount';
import Style from '@screenshots/theme/dot-controller.module.scss';
import { animateThrottleFn } from '@screenshots/utils';
import { useEffect, useRef } from 'preact/hooks';
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

  /**
   * 更新控制点位置
   */
  const updatePosition = useMemoizedFn((x: number, y: number) => {
    if (!elRef.current)
      return;

    positionRef.current = {
      x: x - dotControllerSize / 2,
      y: y - dotControllerSize / 2,
    };

    elRef.current.style.left = `${positionRef.current.x}px`;
    elRef.current.style.top = `${positionRef.current.y}px`;
  });

  /**
   * 更新轴坐标
   */
  const updateAxis = useMemoizedFn(() => {
    onUpdateAxis(
      positionRef.current.x,
      positionRef.current.y,
      oldPositionRef.current.x,
      oldPositionRef.current.y,
      oldCutoutBoxRef.current,
    );
  });

  const throttledUpdateAxis = useRef(animateThrottleFn(updateAxis)).current;

  /**
   * 检查是否在当前区域
   */
  const isCurrentArea = useMemoizedFn(
    (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    },
  );

  /**
   * 停止移动
   */
  const stopMove = useMemoizedFn(() => {
    isMouseDownRef.current = false;
    setActiveTarget(null);
    setIsFirstInit(false);
  });

  /**
   * 处理鼠标进入
   */
  const handleMouseEnter = useMemoizedFn(() => {
    if (activeTarget == null) {
      document.body.style.cursor = cursor;
    }
  });

  /**
   * 处理鼠标离开
   */
  const handleMouseLeave = useMemoizedFn(() => {
    if (activeTarget == null) {
      document.body.style.cursor = '';
    }
  });

  /**
   * 处理鼠标按下
   */
  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      event.stopPropagation();

      if (
        isCurrentArea(
          positionRef.current.x,
          positionRef.current.x + dotControllerSize,
          positionRef.current.y,
          positionRef.current.y + dotControllerSize,
          event.clientX,
          event.clientY,
        )
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
  );

  /**
   * 处理鼠标松开
   */
  const handleMouseUp = useMemoizedFn(() => {
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
  });

  /**
   * 处理全局鼠标移动
   */
  const handleGlobalMouseMove = useMemoizedFn(
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
  );

  // 设置全局事件监听
  useMount(() => {
    document.body.addEventListener('mousemove', handleGlobalMouseMove);
    document.body.addEventListener('mouseup', stopMove);

    return () => {
      document.body.removeEventListener('mousemove', handleGlobalMouseMove as any);
      document.body.removeEventListener('mouseup', stopMove as any);
    };
  });

  // 初始化位置
  useEffect(() => {
    updatePosition(cutoutBoxX, cutoutBoxY);
  });

  // 初始化 context
  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

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
