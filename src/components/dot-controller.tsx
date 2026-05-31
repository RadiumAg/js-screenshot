import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/dot-controller.module.scss';
import { memo } from 'preact/compat';
import { useRef } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useLongPressAndDrag } from '../hooks/use-long-press-and-drag';
import { useScreenshotStore } from '../store/screenshot-store';
import { ACTIVE_TYPE } from './utils/share';

export interface DotControllerProps {
  cursor: string
  left: number
  top: number
  position: { x: number, y: number }
  size: { width: number, height: number }
  onUpdateAxis: (xDistance: number, yDistance: number, consume: (axis?: 'x' | 'y' | 'xy') => void) => void
}

/**
 * DotController 组件 - 裁剪框控制点
 */
const DotController: FC<DotControllerProps> = ({
  cursor,
  left,
  top,
  position,
  size,
  onUpdateAxis,
}) => {
  const {
    container,
    activeTarget,
    drawCanvasContext,
    dotControllerSize,
    themeColor,
    operateHistory,
    setActiveTarget,
  } = useScreenshotStore(useShallow(state => ({
    container: state.container,
    activeTarget: state.activeTarget,
    drawCanvasContext: state.drawCanvasContext,
    dotControllerSize: state.dotControllerSize,
    themeColor: state.themeColor,
    operateHistory: state.operateHistory,
    setActiveTarget: state.setActiveTarget,
  }),
  ));
  const activeType = ACTIVE_TYPE.dotController + cursor;
  const elRef = useRef<HTMLDivElement>(null);

  useLongPressAndDrag({ target: elRef, container, onDrag(distance, consume) {
    if (activeTarget !== activeType)
      return;

    onUpdateAxis(distance.xDistance, distance.yDistance, consume);
  }, onMouseUp() {
    setActiveTarget(null);
    operateHistory.clear();
    // 清空 shapes，避免调整裁剪框后旧图形被重新渲染
    useScreenshotStore.getState().restoreShapesSnapshot([]);
    requestAnimationFrame(() => {
      if (drawCanvasContext && size.width > 0 && size.height > 0) {
        const imageData = drawCanvasContext.getImageData(
          position.x,
          position.y,
          size.width,
          size.height,
        );
        operateHistory.push({ imageData, position: { x: position.x, y: position.y } });
      }
    });
  }, onMouseDown() {
    setActiveTarget(activeType);
  } });

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
