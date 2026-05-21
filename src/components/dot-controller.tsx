import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/dot-controller.module.scss';
import { useMemoizedFn } from 'ahooks';
import { memo } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../store/screenshot-store';
import { useLongPressAndDrag } from './hooks/use-long-press-and-drag';
import { ACTIVE_TYPE } from './utils/share';

export interface DotControllerProps {
  cursor: string
  left: number
  top: number
  onUpdateAxis: (xDistance: number, yDistance: number, consume: (axis?: 'x' | 'y' | 'xy') => void) => void
}

/**
 * DotController 组件 - 裁剪框控制点
 */
const DotController: FC<DotControllerProps> = ({
  cursor,
  left,
  top,
  onUpdateAxis,
}) => {
  const {
    container,
    activeTarget,
    drawCanvasElement,
    dotControllerSize,
    themeColor,
    operateHistory,
    setActiveTarget,
  } = useScreenshotStore(useShallow(state => ({
    container: state.container,
    activeTarget: state.activeTarget,
    drawCanvasElement: state.drawCanvasElement,
    dotControllerSize: state.dotControllerSize,
    themeColor: state.themeColor,
    operateHistory: state.operateHistory,
    setActiveTarget: state.setActiveTarget,
  }),
  ));
  const activeType = ACTIVE_TYPE.dotController + cursor;
  const elRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const resetOperateHistory = useMemoizedFn(() => {
    if (!contextRef.current || !drawCanvasElement)
      return;
    const imageData = contextRef.current.getImageData(0, 0, drawCanvasElement.width, drawCanvasElement.height);
    operateHistory.clear();
    operateHistory.push({
      imageData,
      position: { x: 0, y: 0 },
    });
  });

  useLongPressAndDrag({ target: elRef, container, onDrag(distance, consume) {
    if (activeTarget !== activeType)
      return;

    onUpdateAxis(distance.xDistance, distance.yDistance, consume);
  }, onMouseUp() {
    setActiveTarget(null);
    // 拖动结束后，用最新 canvas 内容重置基础快照
    requestAnimationFrame(() => {
      resetOperateHistory();
    });
  }, onMouseDown() {
    setActiveTarget(activeType);
  } });

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
      style={{
        left,
        top,
        cursor,
        position: 'fixed',
        pointerEvents: 'auto',
      }}
      class={Style['dot-controller-container']}
    >
      <div
        style={{
          width: `${dotControllerSize}px`,
          height: `${dotControllerSize}px`,
          backgroundColor: themeColor,
        }}
        class={Style['dot-controller']}
      />
    </div>
  );
};

export default memo(DotController);
