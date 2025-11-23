import type { RefObject } from 'preact';
import useMemoizedFn from '@screenshots/hooks/use-memoized-fn';
import { useEffect, useRef } from 'preact/hooks';

interface Option {
  container: HTMLDivElement
  target: RefObject<HTMLElement>
  onDrag: (distance: { xDistance: number, yDistance: number }) => void
  onMouseUp?: () => void
  onMouseDown?: () => void
  onMouseOver?: () => void
  onMouseOut?: () => void
}

const useLongPressAndDrag = (option: Option) => {
  const { target, container, onDrag, onMouseDown, onMouseUp } = option;
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
    mouseDownRef.current = false;
    pointPositionRef.current = {
      x: 0,
      y: 0,
    };
    onMouseUp?.();
  });
  const handleMouseMove = useMemoizedFn((event: MouseEvent) => {
    if (mouseDownRef.current) {
      onDrag({
        xDistance: event.clientX - pointPositionRef.current.x,
        yDistance: event.clientY - pointPositionRef.current.y,
      });

      pointPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  });

  useEffect(() => {
    const targetElement = target.current;
    targetElement?.addEventListener('mousedown', handleMouseDown);
    container?.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      targetElement?.removeEventListener('mousedown', handleMouseDown);
      container?.removeEventListener('mouseup', handleMouseUp);
      container?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
};

export { useLongPressAndDrag };
