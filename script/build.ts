import type {
  ModuleFormat,
  OutputOptions,
  RollupOptions,
  RollupWatchOptions,
} from 'rollup';
import fs from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import resolveModule from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import {
  rollup,
  watch,
} from 'rollup';
import postcss from 'rollup-plugin-postcss';
import { getArgs } from './util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDist = resolve(__dirname, '../dist');

/**
 * build 入口函数
 *
 * @param {ModuleFormat} format
 */
async function build(format: ModuleFormat) {
  const args = getArgs();
  const buildConfig = getBuildConfig(format);

  if (Reflect.has(args, '--watch')) {
    const watcher = watch(
      buildConfig,
    );

    watcher.on('event', (event) => {
      if (event.code === 'START') {
        console.log('📦 build start...');
      }
      else if (event.code === 'BUNDLE_END') {
        console.log('📦 build end');
      }
      else if (event.code === 'ERROR') {
        console.error('📦 build error:', event.error);
      }
      else if (event.code === 'END') {
        console.log('📦 build end');
      }
    });
  }
  else {
    (await rollup(buildConfig as RollupOptions)).write(
      buildConfig.output as OutputOptions,
    );
  }
}

function getBuildConfig(format: ModuleFormat) {
  const output = {
    esm: {
      file: resolve(outputDist, './esm/screen-shot.js'),
      globals: { html2canvas: 'html2canvas' },
    },
    cjs: {
      format: 'cjs',
      file: resolve(outputDist, './cjs/screen-shot.js'),
      globals: { html2canvas: 'html2canvas' },
    },
    iife: {
      format: 'iife',
      file: resolve(outputDist, './iife/screen-shot.js'),
      globals: { html2canvas: 'html2canvas' },
    },
  } as Record<string, OutputOptions>;

  const buildConfig: RollupWatchOptions = {
    input: resolve(__dirname, '../src/screen-shot.tsx'),
    plugins: [
      resolveModule(), // 解析node_modules中的模块
      commonjs(), // 将CommonJS模块转换为ES6模块
      alias({
        entries: [
          { find: '@screenshots', replacement: resolve(__dirname, '../src') },
          { find: 'react', replacement: 'preact/compat' },
          { find: 'react', replacement: 'preact/compat' },
        ],
      }),
      image({ dom: false }),
      postcss({
        modules: true,
        extract: true,
        sourceMap: false,
        namedExports(id) {
          const nameArray = id.split('-');
          const name = nameArray.reduce((pre, current, index) => {
            if (index === 0) {
              return pre;
            }
            else {
              return pre + current[0].toUpperCase() + current.slice(1);
            }
          });

          return name;
        },
      }),
      typescript({
        compilerOptions: {
          target: 'esnext',
          module: 'esnext',
          strict: true,
          skipLibCheck: true,
          declaration: format !== 'iife',
          rootDir: resolve(__dirname, '../src'),
          declarationDir: resolve(__dirname, `../dist/${format}`),
          jsx: 'react-jsx',
          jsxImportSource: 'preact',
        },
        include: [
          resolve(__dirname, './type.d.ts'),
          resolve(__dirname, '../src/**/*.ts'),
          resolve(__dirname, '../src/**/*.tsx'),
        ],
        exclude: ['node_modules', '../script', '../playground'],
      }),
      replace({
        'preventAssignment': true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
    external: ['html2canvas'],
    output: output[format],
  };

  return buildConfig;
}

/**
 *
 * 清理dist
 *
 */
async function cleanDist() {
  const distPath = outputDist;
  try {
    await fs.rm(distPath, { recursive: true, force: true });
    console.log('🗑️  Cleaned dist directory');
  }
  catch {
    // ignore error
  }
}

cleanDist().then(() => {
  build('esm');
  build('iife');
  build('cjs');
});
