import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

const LINE_WIDTHS = [
  { label: '细', value: 2 },
  { label: '中', value: 4 },
  { label: '粗', value: 6 },
];

export const ArrowOptions: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number, y: number } | null>(null);
  const { activeTarget, toolsConfig, setToolsConfig } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    toolsConfig: state.toolsConfig,
    setToolsConfig: state.setToolsConfig,
  })));

  const isVisible = activeTarget === ACTIVE_TYPE.arrow;
  const arrowConfig = toolsConfig.arrow ?? {};
  const lineType = arrowConfig.lineType ?? 'arrow';
  const lineWidth = arrowConfig.lineWidth ?? 2;

  const handleSetLineType = useCallback((type: 'arrow' | 'line') => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, lineType: type },
    });
  }, [toolsConfig, arrowConfig, setToolsConfig]);

  const handleSetLineWidth = useCallback((width: number) => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, lineWidth: width },
    });
  }, [toolsConfig, arrowConfig, setToolsConfig]);

  // 计算面板位置
  useEffect(() => {
    if (!isVisible) {
      setPos(null);
      return;
    }

    const updatePos = () => {
      const btn = document.querySelector(`[data-tool-btn="${ACTIVE_TYPE.arrow}"]`);
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
      }
    };

    updatePos();
    const timer = setTimeout(updatePos, 0);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // 点击外部关闭
  useEffect(() => {
    if (!isVisible)
      return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-tool-btn]') && !target.closest('canvas')) {
          useScreenshotStore.getState().setActiveTarget(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  if (!isVisible || !pos)
    return null;

  return createPortal(
    <div
      ref={panelRef}
      class={Style.optionsPanel}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div class={Style.section}>
        <div
          class={`${Style.optionBtn} ${lineType === 'arrow' ? Style.active : ''}`}
          onClick={() => handleSetLineType('arrow')}
          title="箭头"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="14" x2="13" y2="3" stroke="#333" strokeWidth="2" />
            <polyline points="8,2 14,2 14,8" fill="none" stroke="#333" strokeWidth="2" />
          </svg>
        </div>
        <div
          class={`${Style.optionBtn} ${lineType === 'line' ? Style.active : ''}`}
          onClick={() => handleSetLineType('line')}
          title="直线"
        >
          <div class={Style.lineIcon} />
        </div>
      </div>

      <div class={Style.divider} />

      <div class={Style.section}>
        {LINE_WIDTHS.map(w => (
          <div
            key={w.value}
            class={`${Style.optionBtn} ${lineWidth === w.value ? Style.active : ''}`}
            onClick={() => handleSetLineWidth(w.value)}
            title={w.label}
          >
            <span class={Style.lineWidthBtn}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};
