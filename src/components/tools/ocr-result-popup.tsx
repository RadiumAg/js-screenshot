import type { FC } from 'preact/compat';
import { useScreenshotStore } from '@screenshots/store/screenshot-store';
import Style from '@screenshots/theme/ocr-result-popup.module.scss';
import { getPanelStyle, resolveTheme } from '@screenshots/theme/tokens';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';

export interface OcrResultPopupProps {
  text: string
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
  onClose: () => void
}

const POPUP_WIDTH = 320;
const TOOL_BOX_OFFSET = 10;
const POPUP_GAP = 8;

export const OcrResultPopup: FC<OcrResultPopupProps> = (props) => {
  const { text, cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, onClose } = props;

  const { uiTheme, themeColor } = useScreenshotStore(useShallow(state => ({
    uiTheme: state.uiTheme,
    themeColor: state.themeColor,
  })));

  const [copied, setCopied] = useState(false);

  const resolvedTheme = useMemo(() => resolveTheme(uiTheme), [uiTheme]);
  const panelTokens = useMemo(
    () => getPanelStyle(resolvedTheme, themeColor),
    [resolvedTheme, themeColor],
  );

  // 横向紧贴 tool-box 右侧，顶部与 tool-box 对齐
  const position = useMemo(() => {
    const toolBoxTop = cutoutBoxY + cutoutBoxHeight + TOOL_BOX_OFFSET;
    const toolBoxRight = cutoutBoxX + cutoutBoxWidth;

    let left = toolBoxRight + POPUP_GAP;
    // 右侧放不下则改放 tool-box 左侧
    if (left + POPUP_WIDTH > window.innerWidth - 8) {
      left = cutoutBoxX - POPUP_GAP - POPUP_WIDTH;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - POPUP_WIDTH - 8));

    return { left, top: toolBoxTop };
  }, [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight]);

  const handleCopy = useMemoizedFn(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
    catch {
      setCopied(false);
    }
  });

  const handleCancel = useMemoizedFn(() => {
    onClose();
  });

  // ESC 关闭
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  return (
    <div
      class={Style.popup}
      style={{
        ...panelTokens,
        left: `${position.left}px`,
        top: `${position.top}px`,
      } as any}
      role="dialog"
      aria-label="文字识别结果"
    >
      <div class={Style.header}>
        <span>识别结果</span>
        <span class={Style.charCount}>
          {copied ? <span class={Style.copiedTip}>已复制</span> : `${text.length} 字`}
        </span>
      </div>

      <div class={Style.content}>{text}</div>

      <div class={Style.actions}>
        <button type="button" class={Style.btn} onClick={handleCancel}>
          取消
        </button>
        <button type="button" class={`${Style.btn} ${Style.btnPrimary}`} onClick={handleCopy}>
          复制
        </button>
      </div>
    </div>
  );
};
