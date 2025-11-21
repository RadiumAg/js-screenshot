import useMemoizedFn from '@screenshots/hooks/useMemoizedFn';
import { useState } from 'preact/hooks';

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface PositionState extends Position, Size {}

/**
 * Position Hook - 用于管理位置和尺寸状态
 */
export function usePosition(initialState: Partial<PositionState> = {}) {
  const [position, setPosition] = useState<PositionState>({
    x: initialState.x || 0,
    y: initialState.y || 0,
    width: initialState.width || 0,
    height: initialState.height || 0,
  });

  const updatePosition = useMemoizedFn((newPosition: Partial<PositionState>) => {
    setPosition(prev => ({ ...prev, ...newPosition }));
  });

  const setX = useMemoizedFn((x: number) => {
    setPosition(prev => ({ ...prev, x }));
  });

  const setY = useMemoizedFn((y: number) => {
    setPosition(prev => ({ ...prev, y }));
  });

  const setWidth = useMemoizedFn((width: number) => {
    setPosition(prev => ({ ...prev, width }));
  });

  const setHeight = useMemoizedFn((height: number) => {
    setPosition(prev => ({ ...prev, height }));
  });

  const isCurrentArea = useMemoizedFn((
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    x: number,
    y: number,
  ) => {
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  });

  return {
    position,
    updatePosition,
    setX,
    setY,
    setWidth,
    setHeight,
    isCurrentArea,
  };
}
