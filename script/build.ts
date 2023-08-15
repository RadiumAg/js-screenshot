import { resolve } from 'path';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';

async function build() {
  const bundle = await rollup({
    watch: {
      include: `${resolve(__dirname, '../src').replaceAll('\\', '/')}/**`,
    },
    input: resolve(__dirname, '../src/ScreenShot.ts'),
    plugins: [
      typescript({
        compilerOptions: {
          target: 'esnext',
          module: 'esnext',
          strict: true,
          skipLibCheck: true,
        },
      }),
    ],
    external: ['html2canvas'],
  });

  bundle.write({
    dir: resolve(__dirname, '../dist'),
    format: 'esm',
    globals: { html2canvas: 'html2canvas' },
    preserveModules: true,
  });
}

build();
