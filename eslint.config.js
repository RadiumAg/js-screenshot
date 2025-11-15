// eslint.config.mjs
import antfu from '@antfu/eslint-config';

export default antfu({
  rules: {
    'style/semi': ['error', 'always'],
  },
  ignores:['node_modules', 'package.json', 'babel.config.js', 'lib', 'es', 'dist']
});
