<script setup lang="ts">
import { reactive } from 'vue';
import '../../dist/esm/screen-shot.css';
import ScreenShot from '../../dist/esm/screen-shot.js';

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';
type CaptureMode = 'media' | 'htmlInCanvas';
type UITheme = 'dark' | 'light' | 'auto';

const config = reactive({
  format: 'image/png' as ExportFormat,
  quality: 0.92,
  filename: '',
  mode: 'media' as CaptureMode,
  theme: 'auto' as UITheme,
});

const formats: { value: ExportFormat; label: string }[] = [
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/webp', label: 'WebP' },
];

const modes: { value: CaptureMode; label: string; desc: string }[] = [
  { value: 'media', label: 'WebRTC', desc: '传统模式，使用 getDisplayMedia' },
  { value: 'htmlInCanvas', label: 'HTML-in-Canvas', desc: 'Chrome 148+ 新特性' },
];

const themes: { value: UITheme; label: string; desc: string }[] = [
  { value: 'auto', label: 'Auto', desc: '跟随系统 prefers-color-scheme' },
  { value: 'dark', label: 'Dark', desc: '深色工具栏' },
  { value: 'light', label: 'Light', desc: '浅色工具栏' },
];

const handleStartShot = () => {
  const screenShot = new ScreenShot({
    mode: config.mode as any,
    theme: config.theme,
    exportFormat: config.format,
    quality: config.quality,
    filename: config.filename,
  });
  screenShot.shot();
};
</script>

<template>
  <div class="demo">
    <header class="demo-header">
      <div class="header-content">
        <div class="logo-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <h1>JS ScreenShot</h1>
        <p>轻量级网页截图工具 · 标注 · 导出</p>
      </div>
    </header>

    <main class="demo-main">
      <!-- 截图模式 -->
      <section class="config-section">
        <h3 class="section-title">截图模式</h3>
        <div class="segment-control">
          <label
            v-for="m in modes"
            :key="m.value"
            class="segment-item"
            :class="{ active: config.mode === m.value }"
            :title="m.desc"
          >
            <input v-model="config.mode" type="radio" :value="m.value" class="sr-only">
            <span>{{ m.label }}</span>
          </label>
        </div>
        <p class="hint-text" v-if="config.mode === 'htmlInCanvas'">
          需要 Chrome 148+ 并启用 chrome://flags/#canvas-draw-element
        </p>
      </section>

      <!-- 工具栏主题 -->
      <section class="config-section">
        <h3 class="section-title">工具栏主题</h3>
        <div class="segment-control">
          <label
            v-for="t in themes"
            :key="t.value"
            class="segment-item"
            :class="{ active: config.theme === t.value }"
            :title="t.desc"
          >
            <input v-model="config.theme" type="radio" :value="t.value" class="sr-only">
            <span>{{ t.label }}</span>
          </label>
        </div>
        <p class="hint-text" v-if="config.theme === 'auto'">
          跟随系统 prefers-color-scheme 自动切换
        </p>
      </section>

      <!-- 导出设置 -->
      <section class="config-section">
        <h3 class="section-title">导出设置</h3>

        <div class="field-group">
          <label class="field-label">格式</label>
          <div class="chip-group">
            <label
              v-for="f in formats"
              :key="f.value"
              class="chip"
              :class="{ active: config.format === f.value }"
            >
              <input v-model="config.format" type="radio" :value="f.value" class="sr-only">
              <span>{{ f.label }}</span>
            </label>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">
            质量
            <span class="field-value">{{ Math.round(config.quality * 100) }}%</span>
          </label>
          <input v-model.number="config.quality" type="range" min="0.1" max="1" step="0.05" class="range-input">
        </div>

        <div class="field-group">
          <label class="field-label">文件名</label>
          <input v-model="config.filename" type="text" class="text-input" placeholder="screenshot">
        </div>
      </section>

      <!-- CTA -->
      <button class="shot-button" @click="handleStartShot">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        开始截图
      </button>
    </main>
  </div>
</template>

<style lang="scss" scoped>
// Design tokens
$color-bg: #0f172a;
$color-surface: #1e293b;
$color-surface-hover: #334155;
$color-border: rgba(255, 255, 255, 0.06);
$color-text-primary: #f1f5f9;
$color-text-secondary: #94a3b8;
$color-text-muted: #64748b;
$color-accent: #22c55e;
$color-accent-hover: #16a34a;
$color-accent-glow: rgba(34, 197, 94, 0.15);
$color-warning: #f59e0b;
$radius-sm: 6px;
$radius-md: 10px;
$radius-lg: 14px;
$transition-fast: 150ms ease-out;
$transition-normal: 200ms ease-out;

.demo {
  min-height: 100vh;
  background: $color-bg;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: $color-text-primary;
  -webkit-font-smoothing: antialiased;
}

.demo-header {
  padding: 48px 24px 32px;
  text-align: center;
}

.header-content {
  max-width: 320px;
  margin: 0 auto;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: $radius-md;
  background: $color-accent-glow;
  color: $color-accent;
  margin-bottom: 16px;
}

h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.demo-header p {
  margin: 0;
  font-size: 14px;
  color: $color-text-secondary;
  line-height: 1.5;
}

.demo-main {
  max-width: 380px;
  margin: 0 auto;
  padding: 0 20px 48px;
}

// Section
.config-section {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

// Segment control (mode / theme toggle)
.segment-control {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: $radius-sm;
}

.segment-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all $transition-fast;
  user-select: none;

  &:hover {
    color: $color-text-primary;
  }

  &.active {
    background: $color-surface-hover;
    color: $color-text-primary;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
}

// Chip group (format)
.chip-group {
  display: flex;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: $color-text-secondary;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all $transition-fast;
  user-select: none;

  &:hover {
    color: $color-text-primary;
    border-color: $color-border;
  }

  &.active {
    color: $color-accent;
    background: $color-accent-glow;
    border-color: rgba(34, 197, 94, 0.3);
  }
}

// Field group
.field-group {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 13px;
  color: $color-text-muted;
  margin-bottom: 8px;
}

.field-value {
  font-size: 13px;
  font-weight: 600;
  color: $color-text-primary;
  font-variant-numeric: tabular-nums;
}

// Range input
.range-input {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: $color-accent;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.15);
    }
  }
}

// Text input
.text-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  font-size: 14px;
  color: $color-text-primary;
  outline: none;
  box-sizing: border-box;
  transition: border-color $transition-normal;

  &::placeholder {
    color: $color-text-muted;
  }

  &:focus {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.08);
  }
}

// CTA button
.shot-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  margin-top: 20px;
  background: $color-accent;
  color: #fff;
  border: none;
  border-radius: $radius-md;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background $transition-fast, transform $transition-fast, box-shadow $transition-fast;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);

  &:hover {
    background: $color-accent-hover;
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
  }

  &:active {
    transform: scale(0.97);
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
  }
}

// Hint text
.hint-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: $color-warning;
  line-height: 1.5;
}

// Accessibility: visually hidden radio inputs
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
