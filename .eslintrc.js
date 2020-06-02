module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "amd": true,
    "node": true,
    "jquery": true
  },
  "extends": ["eslint:recommended", "airbnb"],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "linebreak-style": ["error", "windows"],
    "no-plusplus": 0,
    "no-trailing-spaces": 0,
    "no-use-before-define": 0
  }
};