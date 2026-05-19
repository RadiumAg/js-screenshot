import type { RefObject } from 'preact';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useRef } from 'preact/hooks';

interface Option {
  container: HTMLDivElement | null
  target: RefObject<HTMLElement>
  onDrag: (distance: { xDistance: number, yDistance: number }, consume: (axis?: 'x' | 'y' | 'xy') => void) => void
  onMouseUp?: () => void
  onMouseDown?: () => void
  onMouseOver?: () => void
  onMouseOut?: () => void
}

const useLongPressAndDrag = (option: Option) => {
  const { target, onDrag, onMouseDown, onMouseUp } = option;
  const mouseDownRef = useRef(false);
  const pointPositionRef = useRef({
    x: 0,
    y: 0,
  });
  const handleMouseDown = useMemoizedFn((event: MouseEvent) => {
    mouseDownRef.current = true;
    pointPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    onMouseDown?.();
  });
  const handleMouseUp = useMemoizedFn(() => {
    if (mouseDownRef.current) {
      onMouseUp?.();
    }
    mouseDownRef.current = false;
    pointPositionRef.current = {
      x: 0,
      y: 0,
    };
  });
  const handleMouseMove = useMemoizedFn((event: MouseEvent) => {
    if (mouseDownRef.current) {
      const xDistance = event.clientX - pointPositionRef.current.x;
      const yDistance = event.clientY - pointPositionRef.current.y;

      const consume = (axis?: 'x' | 'y' | 'xy') => {
        if (!axis || axis === 'xy') {
          pointPositionRef.current = { x: event.clientX, y: event.clientY };
        }
        else if (axis === 'x') {
          pointPositionRef.current = { ...pointPositionRef.current, x: event.clientX };
        }
        else if (axis === 'y') {
          pointPositionRef.current = { ...pointPositionRef.current, y: event.clientY };
        }
      };

      onDrag({ xDistance, yDistance }, consume);
    }
  });

  useEffect(() => {
    const targetElement = target.current;
    targetElement?.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      targetElement?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
};

export { useLongPressAndDrag };
