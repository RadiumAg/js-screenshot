import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/js-screenshot',

  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@screenshots',
        replacement: resolve(__dirname, '../src'),
      },
    ],
  },
});
