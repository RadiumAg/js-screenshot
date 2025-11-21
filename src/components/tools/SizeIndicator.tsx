import { useEffect, useState, useRef } from 'preact/hooks';
import Style from '@screenshots/theme/size-indicator.module.scss';

export interface SizeIndicatorProps {
  width: number;
  height: number;
  dotControllerX: number;
  dotControllerY: number;
}

/**
 * 尺寸指示器组件
 */
export function SizeIndicator({
  width,
  height,
  dotControllerX,
  dotControllerY,
}: SizeIndicatorProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({
      top: dotControllerY,
      left: dotControllerX,
    });
  }, [dotControllerX, dotControllerY]);

  return (
    <div
      ref={elRef}
      class={Style.sizeIndicator}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {width} * {height}
    </div>
  );
}
