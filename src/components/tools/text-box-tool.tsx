import type { FC } from 'preact/compat';
import textBox from '@screenshots/assets/images/text-box.svg';
import Style from '@screenshots/theme/text-box.module.scss';
import { useMemoizedFn, useMount } from 'ahooks';
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
    isLock,
    themeColor,
    operateHistory,
    drawCanvasElement,
    dotControllerSize,
    toolsConfig,
    setActiveTarget,
    setIsLock,
  } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    themeColor: state.themeColor,
    isLock: state.isLock,
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
    dotControllerSize: state.dotControllerSize,
    toolsConfig: state.toolsConfig,
    setActiveTarget: state.setActiveTarget,
    setIsLock: state.setIsLock,
  })));

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const preTextareaRef = useRef<HTMLDivElement | null>(null);

  const fontSize = toolsConfig.textBox?.fontSize ?? 20;
  /* 统一颜色：预览 DOM 和 canvas 渲染都用同一个值 */
  const textColor = toolsConfig.textBox?.color ?? '#ff0000';
  /* 统一行高：预览 line-height 和 canvas 逐行偏移量必须相同 */
  const lineHeight = Math.round(fontSize * 1.4);
  const fontString = `${fontSize}px system-ui`;

  const shifting = {
    x: 15,
    y: 15,
    paddingTopBottom: 6,
    paddingLeftRight: 10,
  };

  /* 最小尺寸：保证空内容时文本框仍可见、可点击 */
  const minWidth = 40;
  const minHeight = lineHeight + shifting.paddingTopBottom * 2;

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

  /**
   * 从 contenteditable div 中提取文本行。
   * 浏览器按回车时会生成 <div>、<br> 等标签而非纯 \n，
   * 必须遍历子节点逐行提取。
   */
  const extractLinesFromElement = useMemoizedFn((element: HTMLDivElement): string[] => {
    const lines: string[] = [];
    const childNodes = element.childNodes;

    if (childNodes.length === 0)
      return [''];

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? '';
        if (i === 0) {
          lines.push(text);
        }
        else {
          if (lines.length > 0)
            lines[lines.length - 1] += text;
          else
            lines.push(text);
        }
      }
      else if (node.nodeName === 'BR') {
        lines.push('');
      }
      else if (node.nodeName === 'DIV') {
        const divText = (node as HTMLElement).textContent ?? '';
        lines.push(divText);
      }
      else {
        const inlineText = (node as HTMLElement).textContent ?? '';
        if (lines.length > 0)
          lines[lines.length - 1] += inlineText;
        else
          lines.push(inlineText);
      }
    }
    return lines;
  });

  /**
   * 渲染文本到 canvas，与预览 DOM 完全一致：
   * 同样的颜色、字体、行高、位置
   */
  const renderToCanvas = useMemoizedFn(
    (element: HTMLDivElement, boxLeft: number, boxTop: number) => {
      const ctx = contextRef.current;
      if (!ctx)
        return;

      const lines = extractLinesFromElement(element);
      if (lines.length === 0 || (lines.length === 1 && !lines[0]))
        return;

      ctx.fillStyle = textColor;
      ctx.font = fontString;
      ctx.textBaseline = 'top';

      const drawX = boxLeft + shifting.paddingLeftRight;
      const drawStartY = boxTop + shifting.paddingTopBottom;

      lines.forEach((line, index) => {
        ctx.fillText(line, drawX, drawStartY + index * lineHeight);
      });
    },
  );

  const setPosition = useMemoizedFn(
    (textBoxTextarea: HTMLDivElement, event: MouseEvent) => {
      const lastXy = { x: event.clientX, y: event.clientY };

      const actualClientX = event.clientX - shifting.x;
      const actualClientY = event.clientY - shifting.y;

      const isInLeft = !isOutLeft(cutoutBoxX + dotControllerSize / 2, actualClientX);
      const isInTop = !isOutTop(cutoutBoxY + dotControllerSize / 2, actualClientY);
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
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('contenteditable', 'true');
    textBoxTextarea.classList.add(Style['text-box-input']);

    textBoxTextarea.style.color = textColor;
    textBoxTextarea.style.fontSize = `${fontSize}px`;
    textBoxTextarea.style.fontFamily = 'system-ui';
    textBoxTextarea.style.lineHeight = `${lineHeight}px`;
    textBoxTextarea.style.padding = `${shifting.paddingTopBottom}px ${shifting.paddingLeftRight}px`;
    textBoxTextarea.style.border = `2px solid ${themeColor}`;
    textBoxTextarea.style.borderRadius = '6px';
    textBoxTextarea.style.minWidth = `${minWidth}px`;
    textBoxTextarea.style.minHeight = `${minHeight}px`;
  });

  const handleClick = useMemoizedFn(() => {
    setIsLock(true);
    setActiveTarget(ACTIVE_TYPE.textBox);
  });

  const handleMouseDown = useMemoizedFn(
    (event: MouseEvent) => {
      /*
       * 先让旧文本框同步完成 blur → renderToCanvas → getImageData，
       * 再移除它。直接 remove() 会导致 blur 异步触发，和新文本框的
       * focus() / cutoutBox 的 updatePosition 竞态，从而拿到错误的
       * canvas 状态（背景图被放大）。
       */
      if (preTextareaRef.current) {
        preTextareaRef.current.blur();
        preTextareaRef.current.remove();
        preTextareaRef.current = null;
      }

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
      preTextareaRef.current = textBoxTextarea;

      const lastXy = setPosition(textBoxTextarea, event);
      setStyle(textBoxTextarea);

      textBoxTextarea.addEventListener('blur', () => {
        renderToCanvas(textBoxTextarea, lastXy.x, lastXy.y);

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

      textBoxTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
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
