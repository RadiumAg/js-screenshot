import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { useMemoizedFn } from 'ahooks';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

const COLORS = [
  '#000000',
  '#ff0000',
  '#0000ff',
  '#00b050',
  '#ffc000',
  '#ff6600',
  '#9933ff',
  '#ffffff',
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
  const arrowColor = arrowConfig.color ?? 'red';

  const handleSetLineType = useMemoizedFn((type: 'arrow' | 'line') => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, lineType: type },
    });
  });

  const handleSetLineWidth = useMemoizedFn((width: number) => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, lineWidth: width },
    });
  });

  const handleSetColor = useMemoizedFn((color: string) => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, color },
    });
  });

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

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
      {/* 形状切换 */}
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

      {/* 粗细滑块 */}
      <div class={Style.sliderSection}>
        <input
          type="range"
          class={Style.slider}
          min="1"
          max="10"
          value={lineWidth}
          onInput={e => handleSetLineWidth(Number((e.target as HTMLInputElement).value))}
        />
      </div>

      <div class={Style.divider} />

      {/* 颜色选择 */}
      <div class={Style.section}>
        {COLORS.map(color => (
          <div
            key={color}
            class={`${Style.colorDot} ${arrowColor === color ? Style.active : ''} ${color === '#ffffff' ? Style.whiteDot : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleSetColor(color)}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
};
