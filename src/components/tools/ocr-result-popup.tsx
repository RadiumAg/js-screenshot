import type { FC } from 'preact/compat';
import { useScreenshotStore } from '@screenshots/store/screenshot-store';
import Style from '@screenshots/theme/ocr-result-popup.module.scss';
import { getPanelStyle, resolveTheme } from '@screenshots/theme/tokens';
import { useEventListener, useMemoizedFn, useSize } from 'ahooks';
import { createPortal } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
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
const POPUP_MAX_HEIGHT = 380;
const TOOL_BOX_OFFSET = 10;
const POPUP_GAP = 8;
const VIEWPORT_PADDING = 8;

export const OcrResultPopup: FC<OcrResultPopupProps> = (props) => {
  const { text, cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, onClose } = props;

  const { uiTheme, themeColor } = useScreenshotStore(useShallow(state => ({
    uiTheme: state.uiTheme,
    themeColor: state.themeColor,
  })));

  const [copied, setCopied] = useState(false);
  const viewport = useSize(typeof document !== 'undefined' ? document.documentElement : undefined);

  const resolvedTheme = useMemo(() => resolveTheme(uiTheme), [uiTheme]);
  const panelTokens = useMemo(
    () => getPanelStyle(resolvedTheme, themeColor),
    [resolvedTheme, themeColor],
  );

  // 横向：紧贴 tool-box 右侧，溢出则改放左侧，最后兜底钳制在视口内
  // 纵向：与 tool-box 顶部对齐，溢出底部则贴底显示，最后兜底钳制在视口内
  const position = useMemo(() => {
    const vw = viewport?.width ?? window.innerWidth;
    const vh = viewport?.height ?? window.innerHeight;

    const toolBoxRight = cutoutBoxX + cutoutBoxWidth;
    const toolBoxTop = cutoutBoxY + cutoutBoxHeight + TOOL_BOX_OFFSET;

    let left = toolBoxRight + POPUP_GAP;
    if (left + POPUP_WIDTH > vw - VIEWPORT_PADDING) {
      left = cutoutBoxX - POPUP_GAP - POPUP_WIDTH;
    }
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - POPUP_WIDTH - VIEWPORT_PADDING));

    let top = toolBoxTop;
    if (top + POPUP_MAX_HEIGHT > vh - VIEWPORT_PADDING) {
      top = vh - POPUP_MAX_HEIGHT - VIEWPORT_PADDING;
    }
    top = Math.max(VIEWPORT_PADDING, top);

    return { left, top };
  }, [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, viewport?.width, viewport?.height]);

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
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  }, { capture: true });

  return createPortal(
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
    </div>,
    document.body,
  );
};
