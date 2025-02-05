import { resolve } from 'path';
import { watch } from 'rollup';
import alias from '@rollup/plugin-alias';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

async function build() {
  const watcher = watch({
    input: resolve(__dirname, '../src/screenShot.ts'),
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
            } else {
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
          declaration: true,
          rootDir: resolve(__dirname, '../src'),
          declarationDir: resolve(__dirname, '../dist/esm'),
        },
        include: [
          resolve(__dirname, './type.d.ts'),
          resolve(__dirname, '../src/**/*.ts'),
        ],
        exclude: ['node_modules'],
      }),
    ],
    external: ['html2canvas'],
    output: [
      {
        format: 'esm',
        dir: resolve(__dirname, '../dist/esm'),
        globals: { html2canvas: 'html2canvas' },
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    ],
  });

  watcher.on('event', event => {
    if (event.code === 'START') {
      console.log('📦 build start...');
    } else if (event.code === 'BUNDLE_END') {
      console.log('📦 build end');
    } else if (event.code === 'ERROR') {
      console.error('📦 build error:', event.error);
    } else if (event.code === 'END') {
      console.log('📦 build end');
    }
  });
}

build();
