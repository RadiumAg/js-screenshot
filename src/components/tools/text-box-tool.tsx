import textBox from '@screenshots/assets/images/text-box.svg';
import useMemoizedFn from '@screenshots/hooks/useMemoizedFn';
import { useMount } from '@screenshots/hooks/useMount';
import Style from '@screenshots/theme/text-box.module.scss';
import { useEffect, useRef } from 'preact/hooks';
import { useScreenshotContext } from '../context/screenshot-context';

export interface TextBoxToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 文本框工具组件
 */
export function TextBoxTool({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}: TextBoxToolProps) {
  const {
    activeTarget,
    setActiveTarget,
    setIsLock,
    isLock,
    operateHistory,
    drawCanvasElement,
    dotControllerSize,
  } = useScreenshotContext();

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const preTextareaRef = useRef<HTMLDivElement | null>(null);

  const fontSize = 20;
  const shifting = {
    x: 15,
    y: 15,
    minWidth: 100,
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
  const isOutRight = useMemoizedFn((maxX: number, x: number) => x > maxX);
  const isOutTop = useMemoizedFn((minY: number, y: number) => y < minY);
  const isOutBottom = useMemoizedFn((maxY: number, y: number) => y > maxY);

  const measureLineToCanvas = useMemoizedFn(
    (
      textBoxValue: string | null,
      maxWidth: number,
      clientX: number,
      clientY: number,
      renderIndex: number,
      startIndex = 0,
      endIndex = 1,
    ): number => {
      if (!textBoxValue || !contextRef.current)
        return renderIndex;

      const stringValue = textBoxValue.slice(startIndex, endIndex);

      const render = () => {
        if (stringValue == null || !contextRef.current)
          return;

        contextRef.current.fillText(
          stringValue,
          clientX - shifting.x + shifting.paddingLeftRight * 2,
          clientY
          - shifting.y
          + renderIndex * 20
          + shifting.paddingTopBottom
          + fontSize,
        );
      };

      if (endIndex === textBoxValue.length) {
        render();
        return renderIndex;
      }

      if (contextRef.current.measureText(stringValue).width > maxWidth) {
        startIndex = --endIndex;
        render();
        return measureLineToCanvas(
          textBoxValue,
          maxWidth,
          clientX,
          clientY,
          renderIndex + 1,
          startIndex,
          endIndex,
        );
      }
      else {
        endIndex++;
        return measureLineToCanvas(
          textBoxValue,
          maxWidth,
          clientX,
          clientY,
          renderIndex,
          startIndex,
          endIndex,
        );
      }
    },
  );

  const renderToCanvas = useMemoizedFn(
    (
      textBoxValue: string | null,
      maxWidth: number,
      clientX: number,
      clientY: number,
    ) => {
      if (!contextRef.current)
        return;

      contextRef.current.fillStyle = 'red';
      contextRef.current.font = `${fontSize}px system-ui`;
      measureLineToCanvas(textBoxValue, maxWidth, clientX, clientY, 0);
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

      const isInRight = !isOutRight(
        cutoutBoxX + cutoutBoxWidth - dotControllerSize / 2,
        actualClientX + shifting.minWidth + shifting.paddingTopBottom * 2,
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

      if (!isInRight) {
        const lastLeft
          = cutoutBoxX
            + cutoutBoxWidth
            - shifting.minWidth
            - shifting.paddingLeftRight * 2;
        textBoxTextarea.style.left = `${lastLeft}px`;
        lastXy.x = lastLeft;
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
    textBoxTextarea.style.whiteSpace = 'nowrap';
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('contenteditable', '');
    textBoxTextarea.classList.add(Style['text-box-input']);
    textBoxTextarea.style.height = `${fontSize + shifting.paddingTopBottom * 2}px`;
    textBoxTextarea.style.width = `${shifting.minWidth}px`;
    textBoxTextarea.style.minWidth = `${shifting.minWidth}px`;
    textBoxTextarea.style.padding = `${shifting.paddingTopBottom}px ${shifting.paddingLeftRight}px`;
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget('textBox');
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      preTextareaRef.current?.remove();

      if (!isLock)
        return;
      if (activeTarget !== 'textBox')
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

      let maxHeight = 0;
      let maxWidth = shifting.minWidth;

      const textBoxTextarea = document.createElement('div');
      setStyle(textBoxTextarea);
      preTextareaRef.current = textBoxTextarea;
      const lastXy = setPosition(textBoxTextarea, event);

      textBoxTextarea.addEventListener('blur', () => {
        renderToCanvas(
          textBoxTextarea.textContent,
          maxWidth,
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
          operateHistory.push(imageData);
        }
      });

      textBoxTextarea.addEventListener('input', (event) => {
        const currentTarget = event.currentTarget as HTMLDivElement;
        const textboxTextReact = currentTarget.getBoundingClientRect();

        if (
          maxWidth === shifting.minWidth
          && textboxTextReact.right >= cutoutBoxX + cutoutBoxWidth
        ) {
          maxWidth
            = currentTarget.scrollWidth - shifting.paddingLeftRight * 2 - 20;
          currentTarget.style.whiteSpace = 'unset';
        }

        if (
          !maxHeight
          && shifting.minWidth
          && textboxTextReact.bottom >= cutoutBoxY + cutoutBoxHeight
        ) {
          maxHeight
            = currentTarget.scrollHeight - shifting.paddingTopBottom * 2 - 60;
        }

        currentTarget.style.height = maxHeight
          ? `${maxHeight}px`
          : `${currentTarget.scrollHeight - shifting.paddingTopBottom * 2}px`;

        currentTarget.style.width
          = maxWidth !== shifting.minWidth
            ? `${maxWidth}px`
            : `${currentTarget.scrollWidth - shifting.paddingLeftRight * 2}px`;
      });

      document.body.append(textBoxTextarea);
      textBoxTextarea.focus();
    },
  );

  useMount(() => {
    if (!drawCanvasElement)
      return;

    drawCanvasElement.addEventListener('mousedown', handleMouseDown as any);

    return () => {
      drawCanvasElement.removeEventListener('mousedown', handleMouseDown as any);
      preTextareaRef.current?.remove();
    };
  });

  return (
    <div class={Style['text-box']} onClick={handleClick}>
      <img src={textBox} alt="text" />
    </div>
  );
}
