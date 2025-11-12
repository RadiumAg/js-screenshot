import type {
  ModuleFormat,
  OutputOptions,
  RollupOptions,
  RollupWatchOptions,
} from 'rollup';
import fs from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import alias from '@rollup/plugin-alias';
import image from '@rollup/plugin-image';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import {
  rollup,
  watch,
} from 'rollup';
import postcss from 'rollup-plugin-postcss';
import { getArgs } from './util';

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
      format: 'esm',
      dir: resolve(outputDist, './esm'),
      globals: { html2canvas: 'html2canvas' },
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    cjs: {
      format: 'cjs',
      dir: resolve(outputDist, './cjs'),
      globals: { html2canvas: 'html2canvas' },
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    iife: {
      format: 'iife',
      file: resolve(outputDist, './iife/index.js'),
      globals: { html2canvas: 'html2canvas' },
    },
  } as Record<string, OutputOptions>;

  const buildConfig: RollupWatchOptions = {
    input: resolve(__dirname, '../src/screen-shot.ts'),
    plugins: [
      alias({
        entries: [
          { find: '@screenshots', replacement: resolve(__dirname, '../src') },
        ],
      }),
      image({ dom: true }),
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
        },
        include: [
          resolve(__dirname, './type.d.ts'),
          resolve(__dirname, '../src/**/*.ts'),
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

async function cleanDist() {
  const distPath = outputDist;
  try {
    await fs.rm(distPath, { recursive: true, force: true });
    console.log('🗑️  Cleaned dist directory');
  }
  catch (error) {
    // ignore error
  }
}

cleanDist().then(() => {
  build('esm');
  build('iife');
  build('cjs');
});
