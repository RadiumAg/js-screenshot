// eslint.config.mjs
import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  rules: {
    'style/semi': ['error', 'always'],
    'no-useless-return': 'off',
    'antfu/top-level-function': 'off',
  },
  ignores: ['node_modules', 'package.json', 'babel.config.js', 'lib', 'es', 'dist'],
});
