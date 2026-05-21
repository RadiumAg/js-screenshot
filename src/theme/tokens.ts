/**
 * Theme tokens for portal panels (color-picker, arrow-options, pen-options).
 * Since portals render to document.body, they cannot inherit CSS variables
 * from the tool-box container. These tokens are injected via inline style.
 *
 * Palette source: UI Pro Max — Developer Tool (#22C55E) + Blue accent (#2563EB)
 */

export const PANEL_TOKENS = {
  dark: {
    '--ss-accent': '#22c55e',
    '--ss-accent-rgb': '34, 197, 94',
    '--ss-accent-hover': '#16a34a',
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
    '--ss-accent': '#2563eb',
    '--ss-accent-rgb': '37, 99, 235',
    '--ss-accent-hover': '#1d4ed8',
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

export function getPanelStyle(theme: ResolvedTheme) {
  return PANEL_TOKENS[theme] as Record<string, string>;
}
