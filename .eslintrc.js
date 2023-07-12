module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  plugins: ['jsx-a11y', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 8,
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

  rules: {
    'react/no-multi-comp': 1,
    'jsx-a11y/label-has-for': [2, {
      required: {
        some: ['nesting', 'id'],
      },
    }]
  }
};
