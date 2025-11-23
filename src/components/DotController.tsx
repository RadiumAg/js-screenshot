import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/dot-controller.module.scss';
import { memo } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import { useScreenshotContext } from './context/ScreenshotContext';
import { useLongPressAndDrag } from './hooks/useLongPressAndDrag';
import { ACTIVE_TYPE } from './utils/share';

export interface DotControllerProps {
  cursor: string
  left: number
  top: number
  onUpdateAxis: (xDistance: number, yDistance: number) => void
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
    setActiveTarget,
  } = useScreenshotContext();
  const activeType = ACTIVE_TYPE.dotController + cursor;
  const elRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useLongPressAndDrag({ target: elRef, container, onDrag(distance) {
    if (activeTarget !== activeType)
      return;

    onUpdateAxis(distance.xDistance, distance.yDistance);
  }, onMouseUp() {
    setActiveTarget(null);
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
      class={Style['dot-controller']}
      style={{
        left,
        top,
        width: `${dotControllerSize}px`,
        height: `${dotControllerSize}px`,
        position: 'fixed',
      }}

    />
  );
};

export default memo(DotController);
