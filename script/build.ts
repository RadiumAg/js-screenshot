import { resolve } from 'path';
import { rollup } from 'rollup';
import alias from '@rollup/plugin-alias';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

async function build(type: 'iife' | 'esm') {
  const bundle = await rollup({
    input: resolve(__dirname, '../src/screenShot.ts'),
    plugins: [
      alias({
        entries: [
          { find: '@screenshots', replacement: resolve(__dirname, '../src') },
        ],
      }),
      image(),
      postcss({
        modules: true,
        extract: true,
        sourceMap: false,
      }),
      typescript({
        compilerOptions: {
          target: 'esnext',
          module: 'esnext',
          strict: true,
          skipLibCheck: true,
          declaration: true,
          declarationDir: resolve(__dirname, `../dist/${type}`),
          rootDir: resolve(__dirname, '../src'),
        },
        exclude: ['node_modules'],
      }),
    ],
    external: ['html2canvas'],
  });

  bundle.write({
    format: type,
    dir: resolve(__dirname, `../dist/${type}`),
    globals: { html2canvas: 'html2canvas' },
    preserveModules: type === 'esm' ? true : false,
    preserveModulesRoot: 'src',
  });
}

build('esm');
build('iife');
