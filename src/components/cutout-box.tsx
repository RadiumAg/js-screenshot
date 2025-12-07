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
  const shifting = dotControllerSize / 2;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const oldPositionRef = useRef({ x: 0, y: 0 });
  const oldClientRef = useRef({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const sourceContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const updateWrapper = useMemoizedFn((fn: AnyFun) => {
    const miniDotControllerSize = dotControllerSize * 3;

    return (...args: any[]) => {
      if (!sourceContextRef.current) {
        return;
      }
      if (!contextRef.current) {
        return;
      }
      if (size.width < miniDotControllerSize) {
        setSize((oldValue) => {
          return {
            ...oldValue,
            width: miniDotControllerSize,
          };
        });
        return;
      }
      if (size.height < miniDotControllerSize) {
        setSize((oldValue) => {
          return {
            ...oldValue,
            height: miniDotControllerSize,
          };
        });

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

    throttledUpdatePosition();
  });

  // 设置事件监听
  useMount(() => {
    drawCanvasElement?.addEventListener('mouseup', handleMouseUp);
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('keydown', handleKeyDown);

    return () => {
      drawCanvasElement?.removeEventListener('mouseup', handleMouseUp);
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
    };
  });

  // 清理函数
  useEffect(() => {
    return () => {
      drawCanvasElement?.remove();
      setIsLock(false);
      setIsFirstInit(true);
      setActiveTarget(null);
    };
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
  const dotControllerPositions = [
    { x: position.x - shifting, y: position.y - shifting, cursor: 'nwse-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setPosition((oldValue) => {
        const newValue = { ...oldValue };
        newValue.x = oldValue.x + xDistance;
        newValue.y = oldValue.y + yDistance;
        return newValue;
      });
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.width = oldValue.width - xDistance;
        newValue.height = oldValue.height - yDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 左上
    { x: position.x + size.width / 2 - shifting, y: position.y - shifting, cursor: 'ns-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setPosition((oldValue) => {
        const newValue = { ...oldValue };
        newValue.y = oldValue.y + yDistance;
        return newValue;
      });
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.height = oldValue.height - yDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 上中
    { x: position.x + size.width - shifting, y: position.y - shifting, cursor: 'nesw-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.width = oldValue.width + xDistance;
        newValue.height = oldValue.height - yDistance;
        return newValue;
      });
      setPosition((oldValue) => {
        const newValue = { ...oldValue };
        newValue.y = oldValue.y + yDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 上右
    { x: position.x + size.width - shifting, y: position.y + size.height / 2 - shifting, cursor: 'ew-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.width = oldValue.width + xDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 右中
    { x: position.x + size.width - shifting, y: position.y + size.height - shifting, cursor: 'nwse-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.width = oldValue.width + xDistance;
        newValue.height = oldValue.height + yDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 右下
    { x: position.x + size.width / 2 - shifting, y: position.y + size.height - shifting, cursor: 'ns-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.height = oldValue.height + yDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 下中
    { x: position.x - shifting, y: position.y + size.height - shifting, cursor: 'nesw-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setPosition((oldValue) => {
        const newValue = { ...oldValue };
        newValue.x = oldValue.x + xDistance;
        return newValue;
      });
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.width = oldValue.width - xDistance;
        newValue.height = oldValue.height + yDistance;
        return newValue;
      });

      throttledUpdatePosition();
    }) }, // 下左
    { x: position.x - shifting, y: position.y + size.height / 2 - shifting, cursor: 'ew-resize', onUpdateAxis: updateWrapper((xDistance: number, yDistance: number) => {
      setPosition((oldValue) => {
        const newValue = { ...oldValue };
        newValue.x = oldValue.x + xDistance;
        return newValue;
      });
      setSize((oldValue) => {
        const newValue = { ...oldValue };
        newValue.width = oldValue.width - xDistance;
        return newValue;
      });
      throttledUpdatePosition();
    }) }, // 左中
  ];

  return (
    <>
      {/* 渲染 8 个控制点 */}
      {dotControllerPositions.map((dotPos, index) => (
        <DotController
          key={index}
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
          top: position.y,
          width: size.width - shifting,
          height: size.height - shifting,
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
