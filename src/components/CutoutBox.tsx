import useMemoizedFn from '@screenshots/hooks/useMemoizedFn';
import { useMount } from '@screenshots/hooks/useMount';
import { animateThrottleFn } from '@screenshots/utils';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useScreenshotContext } from './context/ScreenshotContext';
import { DotController } from './DotController';
import { ToolBox } from './ToolBox';
import { SizeIndicator } from './tools/SizeIndicator';
import { ACTIVE_TYPE } from './utils/share';

export interface CutoutBoxProps {
  onComplete?: (result: any) => void
}

/**
 * 裁剪框组件 - Preact 函数式组件版本
 */
export function CutoutBox({ onComplete }: CutoutBoxProps) {
  const {
    drawCanvasElement,
    sourceCanvasElement,
    operateHistory,
    activeTarget,
    isLock,
    dotControllerSize,
    setIsLock,
    setIsFirstInit,
    setActiveTarget,
  } = useScreenshotContext();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  const startYRef = useRef(0);
  const oldPositionRef = useRef({ x: 0, y: 0 });
  const oldClientRef = useRef({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const sourceContextRef = useRef<CanvasRenderingContext2D | null>(null);

  // 初始化 context
  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
    if (sourceCanvasElement) {
      sourceContextRef.current = sourceCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement, sourceCanvasElement]);

  /**
   * 设置半透明遮罩
   */
  const setMask = useMemoizedFn(() => {
    if (!contextRef.current || !drawCanvasElement)
      return;

    contextRef.current.fillStyle = 'rgba(0,0,0,0.5)';
    contextRef.current.fillRect(
      0,
      0,
      drawCanvasElement.width,
      drawCanvasElement.height,
    );
  });

  /**
   * 更新背景
   */
  const updateBackground = useMemoizedFn(() => {
    if (!sourceContextRef.current || !contextRef.current || !drawCanvasElement)
      return;

    // 清除所有内容
    contextRef.current.clearRect(
      0,
      0,
      drawCanvasElement.width,
      drawCanvasElement.height,
    );

    // 重绘整个源图像
    const documentArea = sourceContextRef.current.getImageData(
      0,
      0,
      drawCanvasElement.width,
      drawCanvasElement.height,
    );

    contextRef.current.putImageData(documentArea, 0, 0);
    setMask();
  });

  /**
   * 更新裁剪框位置和渲染
   */
  const updatePosition = useMemoizedFn(() => {
    if (!sourceContextRef.current || !contextRef.current)
      return;

    updateBackground();

    const imgData = sourceContextRef.current.getImageData(
      position.x,
      position.y + startYRef.current,
      size.width || 1,
      size.height || 1,
    );
    contextRef.current.putImageData(imgData, position.x, position.y);
  });

  // 使用节流的更新函数
  const throttledUpdatePosition = useRef(
    animateThrottleFn(() => {
      updatePosition();
    }),
  ).current;

  /**
   * 检查是否在当前区域内
   */
  const isCurrentArea = useMemoizedFn(
    (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    },
  );

  /**
   * 处理控制点更新轴坐标
   */
  const handleDotControllerUpdateAxis = useMemoizedFn(
    (x: number, y: number, oldX: number, oldY: number, oldCutoutBox: any) => {
      if (!sourceContextRef.current || !contextRef.current)
        return;

      updateBackground();

      // 根据控制点位置计算新的裁剪框尺寸和位置
      const imageWidth = oldCutoutBox.width + (oldX - x);
      const imageHeight = oldCutoutBox.height + (oldY - y);

      setSize({
        width: Math.abs(imageWidth),
        height: Math.abs(imageHeight),
      });

      if (imageWidth > 0) {
        setPosition(prev => ({ ...prev, x: x + dotControllerSize / 2 }));
      }
      else {
        setPosition(prev => ({ ...prev, x: oldCutoutBox.x + oldCutoutBox.width }));
      }

      if (imageHeight > 0) {
        setPosition(prev => ({ ...prev, y: y + dotControllerSize / 2 }));
      }
      else {
        setPosition(prev => ({ ...prev, y: oldCutoutBox.y + oldCutoutBox.height }));
      }

      const imgData = sourceContextRef.current.getImageData(
        position.x,
        position.y + startYRef.current,
        size.width || 1,
        size.height || 1,
      );

      contextRef.current.putImageData(imgData, position.x, position.y);
    },
  );

  /**
   * 处理鼠标按下事件
   */
  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (isLock)
        return;

      if (
        isCurrentArea(
          position.x,
          position.x + size.width,
          position.y,
          position.y + size.height,
          event.clientX,
          event.clientY,
        )
        && event.button === 0
      ) {
        oldClientRef.current = { x: event.clientX, y: event.clientY };
        oldPositionRef.current = { x: position.x, y: position.y };
        setIsMouseDown(true);
        setActiveTarget(ACTIVE_TYPE.cutoutBox);
      }
    },
  );

  /**
   * 处理鼠标松开事件
   */
  const handleMouseUp = useMemoizedFn(() => {
    if (activeTarget !== ACTIVE_TYPE.cutoutBox)
      return;
    if (isLock)
      return;

    setIsMouseDown(false);
    setActiveTarget(null);
    setIsFirstInit(false);
  });

  /**
   * 处理鼠标移动事件
   */
  const handleMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (activeTarget == null)
        return;

      if (activeTarget !== ACTIVE_TYPE.cutoutBox)
        return;

      if (isLock || !drawCanvasElement) {
        return;
      }

      // 正常拖拽
      else if (isMouseDown) {
        let newX = oldPositionRef.current.x + event.clientX - oldClientRef.current.x;
        let newY = oldPositionRef.current.y + event.clientY - oldClientRef.current.y;

        // 边界检查
        if (newX < 0)
          newX = 0;
        if (newY < 0)
          newY = 0;
        if (newX + size.width > drawCanvasElement.width) {
          newX = drawCanvasElement.width - size.width;
        }
        if (newY + size.height > drawCanvasElement.height) {
          newY = drawCanvasElement.height - size.height;
        }

        setPosition({ x: newX, y: newY });
        throttledUpdatePosition();
      }
    },
  );

  /**
   * 处理 Canvas 鼠标移动（用于光标样式）
   */
  const handleCanvasMouseMove = useMemoizedFn(
    (event: MouseEvent) => {
      if (activeTarget != null)
        return;

      if (
        isCurrentArea(
          position.x,
          position.x + size.width,
          position.y,
          position.y + size.height,
          event.clientX,
          event.clientY,
        )
      ) {
        document.body.style.cursor = isLock ? '' : 'move';
      }
      else {
        document.body.style.cursor = '';
      }
    },
  );

  /**
   * 处理键盘事件（Ctrl+Z 撤销）
   */
  const handleKeyDown = useMemoizedFn(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'z') {
        const preImageData = operateHistory.prev();

        if (preImageData && contextRef.current) {
          contextRef.current.putImageData(preImageData, position.x, position.y);
        }
        else if (sourceContextRef.current && contextRef.current) {
          contextRef.current.putImageData(
            sourceContextRef.current.getImageData(
              position.x,
              position.y,
              size.width,
              size.height,
            ),
            position.x,
            position.y,
          );
        }
      }
    },
  );

  /**
   * 处理取消操作
   */
  const handleCancel = useMemoizedFn(() => {
    if (onComplete) {
      onComplete(null);
    }
  });

  // 初始化裁剪框
  useMount(() => {
    if (!drawCanvasElement)
      return;
    const cutoutBoxWidth = drawCanvasElement.width / 2;
    const cutoutBoxHeight = drawCanvasElement.height / 2;

    setSize({
      width: cutoutBoxWidth,
      height: cutoutBoxHeight,
    });

    setPosition({
      x: (drawCanvasElement.width - cutoutBoxWidth) / 2,
      y: (drawCanvasElement.height - cutoutBoxHeight) / 2,
    });

    updatePosition();
  });

  // 监听位置变化，更新渲染
  useEffect(() => {
    updatePosition();
  }, [position, size, updatePosition]);

  // 设置事件监听
  useEffect(() => {
    document.body.addEventListener('mousedown', handleMouseDown);
    document.body.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('keydown', handleKeyDown);

    if (drawCanvasElement) {
      drawCanvasElement.addEventListener('mousemove', handleCanvasMouseMove);
    }

    return () => {
      document.body.removeEventListener('mousedown', handleMouseDown);
      document.body.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('keydown', handleKeyDown);

      if (drawCanvasElement) {
        drawCanvasElement.removeEventListener('mousemove', handleCanvasMouseMove);
      }

      // 清理
      document.body.style.cursor = '';
    };
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      drawCanvasElement?.remove();
      setIsLock(false);
      setIsFirstInit(true);
      setActiveTarget(null);
    };
  }, []);

  // 计算控制点位置
  const dotControllerPositions = [
    { x: position.x, y: position.y, cursor: 'nwse-resize' },
    { x: position.x + size.width / 2, y: position.y, cursor: 'ns-resize' },
    { x: position.x + size.width, y: position.y, cursor: 'nesw-resize' },
    { x: position.x + size.width, y: position.y + size.height / 2, cursor: 'ew-resize' },
    { x: position.x + size.width, y: position.y + size.height, cursor: 'nwse-resize' },
    { x: position.x + size.width / 2, y: position.y + size.height, cursor: 'ns-resize' },
    { x: position.x, y: position.y + size.height, cursor: 'nesw-resize' },
    { x: position.x, y: position.y + size.height / 2, cursor: 'ew-resize' },
  ];

  return (
    <>
      {/* 渲染 8 个控制点 */}
      {dotControllerPositions.map((dotPos, index) => (
        <DotController
          key={index}
          cursor={dotPos.cursor}
          cutoutBoxX={dotPos.x}
          cutoutBoxY={dotPos.y}
          cutoutBoxWidth={size.width}
          cutoutBoxHeight={size.height}
          onUpdateAxis={handleDotControllerUpdateAxis}
        />
      ))}

      {/* 工具箱 */}
      <ToolBox
        cutoutBoxX={position.x}
        cutoutBoxY={position.y}
        cutoutBoxWidth={size.width}
        cutoutBoxHeight={size.height}
        onCancel={handleCancel}
      />

      {/* 尺寸指示器 */}
      <SizeIndicator
        width={size.width}
        height={size.height}
        dotControllerX={position.x}
        dotControllerY={position.y}
      />
    </>
  );
}
