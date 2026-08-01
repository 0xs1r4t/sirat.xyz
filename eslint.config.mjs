import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), {
  files: ["**/*.{ts,tsx}"],
  plugins: {
    jsdoc,
  },
  rules: {
    // ts.dev: Function Declarations/Expressions — arrow functions over
    // pre-ES6 function expressions, block body unless return value is used.
    // allowNamedFunctions preserves intentionally-named function expressions
    // (e.g. forwardRef render functions, needed for React DevTools naming).
    "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
    "func-style": ["error", "expression", { allowArrowFunctions: true }],
    "arrow-body-style": ["error", "as-needed"],

    // ts.dev: Variables — never var, prefer const.
    "no-var": "error",
    "prefer-const": "error",

    // ts.dev: Equality Checks.
    eqeqeq: ["error", "always"],

    // ts.dev: Identifiers — naming conventions.
    "@typescript-eslint/naming-convention": [
      "warn",
      { selector: "typeLike", format: ["PascalCase"] },
      { selector: "enumMember", format: ["PascalCase"] },
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
      },
      { selector: "function", format: ["camelCase", "PascalCase"] },
    ],

    // ts.dev: any Type / Interfaces vs Type Aliases / Type Inference.
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/no-inferrable-types": "error",

    // ts.dev + Google TS style guide: Comments & Documentation.
    // Only exported/public API surfaces need JSDoc — matches ts.dev's
    // "top-level exports" guidance rather than blanket comment coverage.
    "jsdoc/require-jsdoc": [
      "warn",
      {
        publicOnly: true,
        contexts: [
          "ExportNamedDeclaration > FunctionDeclaration",
          "ExportDefaultDeclaration > FunctionDeclaration",
          "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression",
          "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > FunctionExpression",
          "ExportNamedDeclaration > TSInterfaceDeclaration",
          "ExportNamedDeclaration > ClassDeclaration",
        ],
      },
    ],
    // Types live in the TS signature, not in @param {type} — avoids the
    // redundant-annotation problem both guides call out.
    "jsdoc/no-types": "error",
    "jsdoc/require-description": "warn",
    "jsdoc/check-alignment": "error",
    "jsdoc/multiline-blocks": "error",
  },
}, {
  files: ["tailwind.config.js", "next.config.js"],
  rules: {
    "@typescript-eslint/no-require-imports": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];

export default eslintConfig;
