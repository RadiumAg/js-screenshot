import type { Plugin } from 'rollup';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function svgResolverPlugin(): Plugin {
  return {
    name: 'svg-resolver',
    resolveId(source, importer) {
      if (source.endsWith('.svg')) {
        return path.resolve(path.dirname(importer!), source);
      }
      return null;
    },
    load(id) {
      if (id.endsWith('.svg')) {
        const source = readFileSync(id);
        return `const source = ${source}; export default`;
      }
      return null;
    },
  };
}

export { svgResolverPlugin };
