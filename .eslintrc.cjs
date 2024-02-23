module.exports = {
  env: {
    commonjs: true,
    node: true
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'prettier/prettier': 2
  }
};
