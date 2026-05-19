<script setup lang="ts">
import { reactive } from 'vue';
import '../../dist/esm/screen-shot.css';
import ScreenShot from '../../dist/esm/screen-shot.js';

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const config = reactive({
  format: 'image/png' as ExportFormat,
  quality: 0.92,
  filename: '',
});

const formats: { value: ExportFormat; label: string }[] = [
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/webp', label: 'WebP' },
];

const handleStartShot = () => {
  const screenShot = new ScreenShot({
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
      <h1>JS ScreenShot</h1>
      <p>轻量级网页截图工具，支持多种标注工具和导出格式</p>
    </header>

    <main class="demo-main">
      <div class="config-panel">
        <h3>配置</h3>

        <div class="config-item">
          <label>导出格式</label>
          <div class="radio-group">
            <label v-for="f in formats" :key="f.value" class="radio-label">
              <input v-model="config.format" type="radio" :value="f.value">
              {{ f.label }}
            </label>
          </div>
        </div>

        <div class="config-item">
          <label>质量 ({{ Math.round(config.quality * 100) }}%)</label>
          <input v-model.number="config.quality" type="range" min="0.1" max="1" step="0.05">
        </div>

        <div class="config-item">
          <label>文件名</label>
          <input v-model="config.filename" type="text" class="text-input" placeholder="screenshot">
        </div>

        <button class="shot-button" @click="handleStartShot">
          开始截图
        </button>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.demo {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 600;
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 14px;
  }
}

.demo-main {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px 20px;
}

.config-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  h3 {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }
}

.config-item {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 13px;
    color: #666;
    margin-bottom: 6px;
  }
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #333;
  cursor: pointer;

  input[type="radio"] {
    margin: 0;
  }
}

input[type="range"] {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #667eea;
    border-radius: 50%;
    cursor: pointer;
  }
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
  }
}

.shot-button {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>
