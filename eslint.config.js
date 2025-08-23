const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      parser: require("@babel/eslint-parser"),
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"]
        }
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        DOMParser: "readonly",
        FileReader: "readonly",
        Image: "readonly",
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        // Node.js globals
        process: "readonly",
        global: "readonly",
        // Custom globals
        __dirname: "readonly",
        __filename: "readonly"
      }
    },
    rules: {
      // Relax some rules for this codebase
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-dupe-class-members": "warn",
      "no-case-declarations": "warn",
      "no-prototype-builtins": "warn",
      "no-useless-escape": "warn"
    }
  }
];