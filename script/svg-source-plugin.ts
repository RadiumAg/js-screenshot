import { readFileSync } from 'fs';
import path from 'path';
import { Plugin } from 'rollup';

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
