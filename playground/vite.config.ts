import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

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
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },

  server: {
    port: 5050,
  },
});
