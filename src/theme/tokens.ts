/**
 * Theme tokens for portal panels (color-picker, arrow-options, pen-options).
 * Since portals render to document.body, they cannot inherit CSS variables
 * from the tool-box container. These tokens are injected via inline style.
 *
 * Palette source: UI Pro Max — Developer Tool palette
 */
import { Z_INDEX } from './z-index';

/** Convert hex color (#RRGGBB) to "R, G, B" string */
function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

const Z_INDEX_TOKENS = {
  '--ss-z-sourceCanvas': Z_INDEX.sourceCanvas,
  '--ss-z-toolbar': Z_INDEX.toolbar,
  '--ss-z-colorPicker': Z_INDEX.colorPicker,
  '--ss-z-textBox': Z_INDEX.textBox,
  '--ss-z-cutoutBox': Z_INDEX.cutoutBox,
  '--ss-z-optionsPanel': Z_INDEX.optionsPanel,
  '--ss-z-tooltip': Z_INDEX.tooltip,
  '--ss-z-popup': Z_INDEX.popup,
  '--ss-z-dotController': Z_INDEX.dotController,
  '--ss-z-loading': Z_INDEX.loading,
  '--ss-z-shapeEditor': Z_INDEX.shapeEditor,
} as const;

const BASE_TOKENS = {
  dark: {
    ...Z_INDEX_TOKENS,
    '--ss-muted-fg': '#94a3b8',
    '--ss-surface': 'rgba(15, 23, 42, 0.92)',
    '--ss-surface-shadow': '0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
    '--ss-text-primary': 'rgba(255, 255, 255, 0.85)',
    '--ss-text-secondary': 'rgba(255, 255, 255, 0.55)',
    '--ss-border-subtle': 'rgba(255, 255, 255, 0.1)',
    '--ss-hover-overlay': 'rgba(255, 255, 255, 0.08)',
    '--ss-icon-filter': 'brightness(0) invert(1)',
    '--ss-icon-opacity': '0.85',
  },
  light: {
    ...Z_INDEX_TOKENS,
    '--ss-muted-fg': '#64748b',
    '--ss-surface': 'rgba(255, 255, 255, 0.95)',
    '--ss-surface-shadow': '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
    '--ss-text-primary': 'rgba(0, 0, 0, 0.75)',
    '--ss-text-secondary': 'rgba(0, 0, 0, 0.45)',
    '--ss-border-subtle': 'rgba(0, 0, 0, 0.08)',
    '--ss-hover-overlay': 'rgba(0, 0, 0, 0.05)',
    '--ss-icon-filter': 'none',
    '--ss-icon-opacity': '0.7',
  },
} as const;

export type ResolvedTheme = 'dark' | 'light';

export function resolveTheme(uiTheme: string): ResolvedTheme {
  if (uiTheme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return uiTheme as ResolvedTheme;
}

/**
 * Get panel style tokens with dynamic accent color from themeColor.
 * @param theme - resolved theme (dark/light)
 * @param themeColor - user-configured accent color (hex), e.g. '#1677ff'
 */
export function getPanelStyle(theme: ResolvedTheme, themeColor: string): Record<string, string> {
  const accentRgb = hexToRgb(themeColor);
  const activeBgAlpha = theme === 'dark' ? 0.25 : 0.12;
  const glowAlpha = theme === 'dark' ? 0.6 : 0.4;
  const glowSize = theme === 'dark' ? '4px' : '3px';
  return {
    ...BASE_TOKENS[theme],
    '--ss-accent': themeColor,
    '--ss-accent-rgb': accentRgb,
    '--ss-btn-active-bg': `rgba(${accentRgb}, ${activeBgAlpha})`,
    '--ss-btn-active-glow': `drop-shadow(0 0 ${glowSize} rgba(${accentRgb}, ${glowAlpha}))`,
  };
}
