module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: ['jsx-a11y', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
  ],

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
      experimentalObjectRestSpread: true,
    },
  },

  settings: {
    'import/ignore': ['node_modules', '\\.(json|css|jpg|png|gif|eot|svg|ttf|woff|woff2|mp4|webm)$'],
    'import/extensions': ['.js'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
};
