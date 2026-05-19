import type { FC } from 'preact/compat';
import textBox from '@screenshots/assets/images/text-box.svg';
import { useMount, useMemoizedFn } from 'ahooks';
import Style from '@screenshots/theme/text-box.module.scss';
import { useEffect, useRef } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

export interface TextBoxToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 文本框工具组件
 */
export const TextBoxTool: FC<TextBoxToolProps> = ({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}) => {
  const {
    activeTarget,
    setActiveTarget,
    setIsLock,
    isLock,
    operateHistory,
    drawCanvasElement,
    dotControllerSize,
    toolsConfig,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
    isLock: state.isLock,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
    dotControllerSize: state.dotControllerSize,
    toolsConfig: state.toolsConfig,
  })));

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const preTextareaRef = useRef<HTMLDivElement | null>(null);

  const fontSize = toolsConfig.textBox?.fontSize ?? 20;
  const shifting = {
    x: 15,
    y: 15,
    paddingTopBottom: 6,
    paddingLeftRight: 10,
  };

  useEffect(() => {
    if (drawCanvasElement) {
      contextRef.current = drawCanvasElement.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, [drawCanvasElement]);

  const isCurrentArea = useMemoizedFn(
    (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    },
  );

  const isOutLeft = useMemoizedFn((minX: number, x: number) => x < minX);
  const isOutTop = useMemoizedFn((minY: number, y: number) => y < minY);
  const isOutBottom = useMemoizedFn((maxY: number, y: number) => y > maxY);

  const measureLineToCanvas = useMemoizedFn(
    (
      textBoxValue: string | null,
      clientX: number,
      clientY: number,
    ) => {
      if (!textBoxValue || !contextRef.current)
        return;

      contextRef.current.fillStyle = toolsConfig.textBox?.color ?? '#000000';
      contextRef.current.font = `${fontSize}px system-ui`;

      const lines = textBoxValue.split('\n');
      lines.forEach((line, index) => {
        contextRef.current!.fillText(
          line,
          clientX - shifting.x + shifting.paddingLeftRight * 2,
          clientY
          - shifting.y
          + index * 20
          + shifting.paddingTopBottom
          + fontSize,
        );
      });
    },
  );

  const renderToCanvas = useMemoizedFn(
    (
      textBoxValue: string | null,
      clientX: number,
      clientY: number,
    ) => {
      measureLineToCanvas(textBoxValue, clientX, clientY);
    },
  );

  const setPosition = useMemoizedFn(
    (textBoxTextarea: HTMLDivElement, event: MouseEvent) => {
      const clientX = event.clientX;
      const clientY = event.clientY;
      const lastXy = {
        x: clientX,
        y: clientY,
      };

      const actualClientX = event.clientX - shifting.x;
      const actualClientY = event.clientY - shifting.y;

      const isInLeft = !isOutLeft(
        cutoutBoxX + dotControllerSize / 2,
        actualClientX,
      );

      const isInTop = !isOutTop(
        cutoutBoxY + dotControllerSize / 2,
        actualClientY,
      );

      const isInBottom = !isOutBottom(
        cutoutBoxY + cutoutBoxHeight + dotControllerSize / 2,
        actualClientY + fontSize + shifting.paddingTopBottom * 2,
      );

      if (!isInLeft) {
        textBoxTextarea.style.left = `${cutoutBoxX}px`;
        lastXy.x = cutoutBoxX;
      }
      else {
        textBoxTextarea.style.left = `${actualClientX}px`;
        lastXy.x = actualClientX;
      }

      if (!isInTop) {
        textBoxTextarea.style.top = `${cutoutBoxY}px`;
        lastXy.y = cutoutBoxY;
      }
      else {
        textBoxTextarea.style.top = `${actualClientY}px`;
        lastXy.y = actualClientY;
      }

      if (!isInBottom) {
        const lastY = cutoutBoxY + cutoutBoxHeight - 46;
        textBoxTextarea.style.top = `${lastY}px`;
        lastXy.y = lastY;
      }

      return lastXy;
    },
  );

  const setStyle = useMemoizedFn((textBoxTextarea: HTMLDivElement) => {
    textBoxTextarea.setAttribute('wrap', 'hard');
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('contenteditable', '');
    textBoxTextarea.classList.add(Style['text-box-input']);
    textBoxTextarea.style.height = `${fontSize + shifting.paddingTopBottom * 2}px`;
    textBoxTextarea.style.width = `${cutoutBoxWidth - shifting.paddingLeftRight * 2}px`;
    textBoxTextarea.style.padding = `${shifting.paddingTopBottom}px ${shifting.paddingLeftRight}px`;
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.textBox);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      preTextareaRef.current?.remove();

      if (!isLock)
        return;
      if (activeTarget !== ACTIVE_TYPE.textBox)
        return;
      if (!contextRef.current)
        return;

      if (
        !isCurrentArea(
          cutoutBoxX + dotControllerSize / 2,
          cutoutBoxX + cutoutBoxWidth - dotControllerSize / 2,
          cutoutBoxY + dotControllerSize / 2,
          cutoutBoxY + cutoutBoxHeight - dotControllerSize / 2,
          event.clientX,
          event.clientY,
        )
      ) {
        return;
      }

      const textBoxTextarea = document.createElement('div');
      setStyle(textBoxTextarea);
      preTextareaRef.current = textBoxTextarea;
      const lastXy = setPosition(textBoxTextarea, event);

      textBoxTextarea.addEventListener('blur', () => {
        renderToCanvas(
          textBoxTextarea.textContent,
          lastXy.x,
          lastXy.y,
        );

        if (contextRef.current) {
          const imageData = contextRef.current.getImageData(
            cutoutBoxX,
            cutoutBoxY,
            cutoutBoxWidth,
            cutoutBoxHeight,
          );
          operateHistory.push({
            imageData,
            position: { x: cutoutBoxX, y: cutoutBoxY },
          });
        }
      });

      document.body.append(textBoxTextarea);
      textBoxTextarea.focus();
    },
  );

  useMount(() => {
    if (!drawCanvasElement)
      return;

    drawCanvasElement.addEventListener('mousedown', handleMouseDown as EventListener);

    return () => {
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as EventListener);
      preTextareaRef.current?.remove();
    };
  });

  return (
    <div data-tool-btn={ACTIVE_TYPE.textBox} class={`${Style['text-box']}${activeTarget === ACTIVE_TYPE.textBox ? ` ${Style.active}` : ''}`} onClick={handleClick}>
      <img src={textBox} alt="text" />
    </div>
  );
};
