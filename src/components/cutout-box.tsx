import type { AnyFun } from '@screenshots/utils';
import type { FC } from 'preact/compat';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useMount } from '@screenshots/hooks/use-mount';
import Style from '@screenshots/theme/cutout-box.module.scss';
import { animateThrottleFn } from '@screenshots/utils';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../store/screenshot-store';
import DotController from './dot-controller';
import { ToolBox } from './tool-box';
import { SizeIndicator } from './tools/size-indicator';
import { ColorPicker } from './color-picker';
import { ArrowOptions } from './tools/arrow-options';
import { ACTIVE_TYPE } from './utils/share';

export interface CutoutBoxProps {
  onComplete?: (result: any) => void
}

/**
 * 裁剪框组件 - Preact 函数式组件版本
 */
export const CutoutBox: FC<CutoutBoxProps> = ({ onComplete }) => {
  const {
    container,
    drawCanvasElement,
    sourceCanvasElement,
    operateHistory,
    activeTarget,
    isLock,
    dotControllerSize,
    setIsLock,
    setIsFirstInit,
    setActiveTarget,
  } = useScreenshotStore(useShallow(state => ({
    container: state.container,
    drawCanvasElement: state.drawCanvasElement,
    sourceCanvasElement: state.sourceCanvasElement,
    operateHistory: state.operateHistory,
    activeTarget: state.activeTarget,
    isLock: state.isLock,
    dotControllerSize: state.dotControllerSize,
    setIsLock: state.setIsLock,
    setIsFirstInit: state.setIsFirstInit,
    setActiveTarget: state.setActiveTarget,
  })));
  const miniDotControllerSize = dotControllerSize * 3;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const oldPositionRef = useRef({ x: 0, y: 0 });
  const oldClientRef = useRef({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const sourceContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const updateWrapper = useMemoizedFn((fn: AnyFun) => {
    return (...args: any[]) => {
      if (!sourceContextRef.current) {
        return;
      }
      if (!contextRef.current) {
        return;
      }
      fn(...args);
    };
  });

  /**
   * 设置半透明遮罩
   */
  const setMask = useMemoizedFn(() => {
    if (!contextRef.current)
      return;

    if (!drawCanvasElement)
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
    if (!sourceContextRef.current)
      return;

    if (!contextRef.current)
      return;

    if (!drawCanvasElement)
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
    if (!sourceContextRef.current)
      return;

    if (!contextRef.current) {
      return;
    }

    if (size.width === 0)
      return;

    if (size.height === 0)
      return;
    updateBackground();
    const imgData = sourceContextRef.current.getImageData(
      position.x,
      position.y,
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
   * 处理鼠标按下事件
   */
  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      if (isLock)
        return;

      oldClientRef.current = { x: event.clientX, y: event.clientY };
      oldPositionRef.current = { x: position.x, y: position.y };
      setIsMouseDown(true);
      setActiveTarget(ACTIVE_TYPE.cutoutBox);
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
   * 处理键盘事件（Ctrl/Cmd+Z 撤销，Ctrl/Cmd+Shift+Z 或 Ctrl/Cmd+Y 重做）
   */
  const handleKeyDown = useMemoizedFn(
    (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;

      // 撤销: Ctrl/Cmd+Z (不按 Shift)
      if (isModifier && event.key === 'z' && !event.shiftKey) {
        const preImageData = operateHistory.prev();

        if (preImageData && contextRef.current) {
          contextRef.current.putImageData(preImageData.imageData, preImageData.position.x, preImageData.position.y);
        }
      }
      // 重做: Ctrl/Cmd+Shift+Z 或 Ctrl/Cmd+Y
      else if (
        (isModifier && event.shiftKey && event.key === 'Z')
        || (isModifier && event.key === 'y')
      ) {
        const nextImageData = operateHistory.next();
        if (nextImageData && contextRef.current) {
          contextRef.current.putImageData(nextImageData.imageData, nextImageData.position.x, nextImageData.position.y);
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

    throttledUpdatePosition();
  });

  // 设置事件监听
  useMount(() => {
    drawCanvasElement?.addEventListener('mouseup', handleMouseUp);
    container?.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      drawCanvasElement?.removeEventListener('mouseup', handleMouseUp);
      container?.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
    };
  });

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      drawCanvasElement?.remove();
      setIsLock(false);
      setIsFirstInit(true);
      setActiveTarget(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在组件卸载时执行清理
  }, []);

  // 初始化 context
  useMount(() => {
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
  });

  // 计算控制点位置
  const canvasWidth = drawCanvasElement?.width ?? 0;
  const canvasHeight = drawCanvasElement?.height ?? 0;

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

  const dotControllerPositions = [
    { x: position.x, y: position.y, cursor: 'nwse-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number, consume: () => void) => {
      const newX = clamp(position.x + xDistance, 0, canvasWidth - miniDotControllerSize);
      const newY = clamp(position.y + yDistance, 0, canvasHeight - miniDotControllerSize);
      const newW = clamp(size.width - xDistance, miniDotControllerSize, canvasWidth);
      const newH = clamp(size.height - yDistance, miniDotControllerSize, canvasHeight);
      setPosition({ x: newX, y: newY });
      setSize({ width: newW, height: newH });
      if (newX === position.x + xDistance && newY === position.y + yDistance
        && newW === size.width - xDistance && newH === size.height - yDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 左上
    { x: position.x + size.width / 2, y: position.y, cursor: 'ns-resize', onUpdateAxis: updateWrapper((_xDistance: number, yDistance: number, consume: () => void) => {
      const newY = clamp(position.y + yDistance, 0, canvasHeight - miniDotControllerSize);
      const newH = clamp(size.height - yDistance, miniDotControllerSize, canvasHeight);
      setPosition({ ...position, y: newY });
      setSize({ ...size, height: newH });
      if (newY === position.y + yDistance && newH === size.height - yDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 上中
    { x: position.x + size.width, y: position.y, cursor: 'nesw-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number, consume: () => void) => {
      const newY = clamp(position.y + yDistance, 0, canvasHeight - miniDotControllerSize);
      const newW = clamp(size.width + xDistance, miniDotControllerSize, canvasWidth);
      const newH = clamp(size.height - yDistance, miniDotControllerSize, canvasHeight);
      setPosition({ ...position, y: newY });
      setSize({ width: newW, height: newH });
      if (newY === position.y + yDistance && newW === size.width + xDistance && newH === size.height - yDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 上右
    { x: position.x + size.width, y: position.y + size.height / 2, cursor: 'ew-resize', onUpdateAxis: updateWrapper((xDistance: number, _yDistance: number, consume: () => void) => {
      const newW = clamp(size.width + xDistance, miniDotControllerSize, canvasWidth);
      setSize({ ...size, width: newW });
      if (newW === size.width + xDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 右中
    { x: position.x + size.width, y: position.y + size.height, cursor: 'nwse-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number, consume: () => void) => {
      const newW = clamp(size.width + xDistance, miniDotControllerSize, canvasWidth);
      const newH = clamp(size.height + yDistance, miniDotControllerSize, canvasHeight);
      setSize({ width: newW, height: newH });
      if (newW === size.width + xDistance && newH === size.height + yDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 右下
    { x: position.x + size.width / 2, y: position.y + size.height, cursor: 'ns-resize', onUpdateAxis: updateWrapper((_xDistance: number, yDistance: number, consume: () => void) => {
      const newH = clamp(size.height + yDistance, miniDotControllerSize, canvasHeight);
      setSize({ ...size, height: newH });
      if (newH === size.height + yDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 下中
    { x: position.x, y: position.y + size.height, cursor: 'nesw-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number, consume: () => void) => {
      const newX = clamp(position.x + xDistance, 0, canvasWidth - miniDotControllerSize);
      const newW = clamp(size.width - xDistance, miniDotControllerSize, canvasWidth);
      const newH = clamp(size.height + yDistance, miniDotControllerSize, canvasHeight);
      setPosition({ ...position, x: newX });
      setSize({ width: newW, height: newH });
      if (newX === position.x + xDistance && newW === size.width - xDistance && newH === size.height + yDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 下左
    { x: position.x, y: position.y + size.height / 2, cursor: 'ew-resize', onUpdateAxis: updateWrapper((xDistance: number, _yDistance: number, consume: () => void) => {
      const newX = clamp(position.x + xDistance, 0, canvasWidth - miniDotControllerSize);
      const newW = clamp(size.width - xDistance, miniDotControllerSize, canvasWidth);
      setPosition({ ...position, x: newX });
      setSize({ ...size, width: newW });
      if (newX === position.x + xDistance && newW === size.width - xDistance) {
        consume();
      }
      throttledUpdatePosition();
    }) }, // 左中
  ];

  return (
    <>
      {/* 渲染 8 个控制点 */}
      {dotControllerPositions.map((dotPos, index) => (
        <DotController
          key={index} // eslint-disable-line react/no-array-index-key -- 静态列表，索引作为key是安全的
          left={dotPos.x}
          top={dotPos.y}
          cursor={dotPos.cursor}
          onUpdateAxis={dotPos.onUpdateAxis}
        />
      ))}

      <div
        onMouseDown={handleMouseDown}
        className={Style['cutout-box']}
        style={{
          left: position.x,
          pointerEvents: isLock ? 'none' : 'auto',
          top: position.y,
          width: size.width,
          height: size.height,
        }}
      >
      </div>

      {/* 工具箱 */}
      <ToolBox
        cutoutBoxX={position.x}
        cutoutBoxY={position.y}
        cutoutBoxWidth={size.width}
        cutoutBoxHeight={size.height}
        onCancel={handleCancel}
      />

      {/* 颜色选择器 */}
      <ColorPicker />

      {/* 箭头选项 */}
      <ArrowOptions />

      {/* 尺寸指示器 */}
      <SizeIndicator
        width={size.width}
        height={size.height}
        dotControllerX={position.x}
        dotControllerY={position.y}
      />
    </>
  );
};
