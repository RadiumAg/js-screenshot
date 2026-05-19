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
  /* 统一颜色：预览 DOM 和 canvas 渲染都用同一个值，保证一致 */
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
   * 所以不能用 textContent.split('\n')，必须遍历子节点逐行提取。
   */
  const extractLinesFromElement = useMemoizedFn((element: HTMLDivElement): string[] => {
    const lines: string[] = [];
    const childNodes = element.childNodes;

    if (childNodes.length === 0)
      return [''];

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        /* 顶层文本节点：一般是第一行（没有被 <div> 包裹的部分） */
        const text = node.textContent ?? '';
        if (i === 0) {
          lines.push(text);
        }
        else {
          /* 两个 <div> 之间的裸文本，追加到最后一行 */
          if (lines.length > 0)
            lines[lines.length - 1] += text;
          else
            lines.push(text);
        }
      }
      else if (node.nodeName === 'BR') {
        /* 空行 */
        lines.push('');
      }
      else if (node.nodeName === 'DIV') {
        /* Chrome 按回车产生的新行：<div>text</div> 或 <div><br></div>（空行） */
        const divText = (node as HTMLElement).textContent ?? '';
        lines.push(divText);
      }
      else {
        /* 其它行内元素（<span> 等），取文本追加 */
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
   * - 同样的颜色、字体、行高
   * - 同样的位置（文本框 left + padding）
   * - 不做自动换行限制，只按用户手动回车换行
   */
  const renderToCanvas = useMemoizedFn(
    (
      element: HTMLDivElement,
      boxLeft: number,
      boxTop: number,
    ) => {
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

  /**
   * 根据当前文本框位置 + 截图框范围，计算允许的最大宽高。
   * - 最大宽度：min(配置 maxWidth, 截图框右边界到文本框 left 的距离)
   * - 最大高度：min(配置 maxHeight, 截图框下边界到文本框 top 的距离)
   * 这样能保证文本框始终不超出截图区域。
   */
  const getMaxSize = useMemoizedFn((leftPx: number, topPx: number) => {
    const cutoutRight = cutoutBoxX + cutoutBoxWidth - dotControllerSize / 2;
    const cutoutBottom = cutoutBoxY + cutoutBoxHeight - dotControllerSize / 2;

    const maxWidthByCutout = Math.max(adaptiveSize.minWidth, cutoutRight - leftPx);
    const maxHeightByCutout = Math.max(adaptiveSize.minHeight, cutoutBottom - topPx);

    return {
      maxWidth: Math.min(adaptiveSize.maxWidth, maxWidthByCutout),
      maxHeight: Math.min(adaptiveSize.maxHeight, maxHeightByCutout),
    };
  });

  const setStyle = useMemoizedFn((textBoxTextarea: HTMLDivElement) => {
    textBoxTextarea.setAttribute('autofocus', '');
    textBoxTextarea.setAttribute('contenteditable', 'true');
    textBoxTextarea.classList.add(Style['text-box-input']);

    /* 颜色、字体、行高全部用统一变量，保证和 canvas 渲染完全一致 */
    textBoxTextarea.style.color = textColor;
    textBoxTextarea.style.fontSize = `${fontSize}px`;
    textBoxTextarea.style.fontFamily = 'system-ui';
    textBoxTextarea.style.lineHeight = `${lineHeight}px`;
    textBoxTextarea.style.padding = `${shifting.paddingTopBottom}px ${shifting.paddingLeftRight}px`;
    textBoxTextarea.style.border = `1px solid ${textColor}`;

    /* 不限制最大宽高，文本框随内容自由增长，可超出截图框 */
    textBoxTextarea.style.minWidth = `${minWidth}px`;
    textBoxTextarea.style.minHeight = `${minHeight}px`;
  });

  /**
   * 监听文本内容变化，触发自适应。
   * 性能优化要点：
   * 1. 用 requestAnimationFrame 节流，多次 input 在同一帧内只会重算一次 max-width/max-height；
   * 2. 仅在 maxWidth/maxHeight 真的变化时才写回 style，避免无意义的样式赋值触发 reflow；
   * 3. 宽高的实际增长由浏览器布局完成（inline-block + min/max + pre-wrap），
   *    JS 只负责更新随位置/截图框变化的“最大边界”，从而把 DOM 写操作降到最低。
   */
  const bindAutoResize = useMemoizedFn((textBoxTextarea: HTMLDivElement, getPosition: () => { x: number, y: number }) => {
    let rafId = 0;
    let lastMaxWidth = -1;
    let lastMaxHeight = -1;

    const update = () => {
      rafId = 0;
      const { x, y } = getPosition();
      const { maxWidth, maxHeight } = getMaxSize(x, y);
      if (maxWidth !== lastMaxWidth) {
        textBoxTextarea.style.maxWidth = `${maxWidth}px`;
        lastMaxWidth = maxWidth;
      }
      if (maxHeight !== lastMaxHeight) {
        textBoxTextarea.style.maxHeight = `${maxHeight}px`;
        lastMaxHeight = maxHeight;
      }
    };

    const onInput = () => {
      if (rafId)
        return;
      rafId = requestAnimationFrame(update);
    };

    textBoxTextarea.addEventListener('input', onInput);

    // 返回解绑函数，blur 后调用以避免内存泄漏
    return () => {
      if (rafId)
        cancelAnimationFrame(rafId);
      textBoxTextarea.removeEventListener('input', onInput);
    };
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
      preTextareaRef.current = textBoxTextarea;

      // 1. 先确定文本框位置（确保不超出截图框上/下/左边界）
      const lastXy = setPosition(textBoxTextarea, event);
      // 2. 基于最终位置应用自适应样式（min/max 宽高、字体、内边距等）
      setStyle(textBoxTextarea, lastXy.x, lastXy.y);
      // 3. 绑定 input 事件，内容变化时通过 rAF 节流地更新 maxWidth/maxHeight
      const unbindAutoResize = bindAutoResize(textBoxTextarea, () => lastXy);

      textBoxTextarea.addEventListener('blur', () => {
        unbindAutoResize();

        /* 传入整个 DOM 元素，而非 textContent，
           这样 renderToCanvas 能正确提取换行和获取实际渲染宽度 */
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
