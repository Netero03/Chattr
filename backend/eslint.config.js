import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    // Apply to all JS files
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node, // Node globals like process, __dirname
    },
    rules: {
      "no-undef": "error",       // catch undeclared variables
      "no-unused-vars": "warn",  // warn about unused vars
      "no-console": "off",       // allow console.log for now
    },
  },
]);
