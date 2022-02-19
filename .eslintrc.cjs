module.exports = {
  'root': true,
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'env': {
    'es2021': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
  ],
  'rules': {
    'indent': [ 'error', 2, {
      'SwitchCase': 1,
    }],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
    'no-debugger': 'off',
    'no-constant-condition': 'off',
  }
};
