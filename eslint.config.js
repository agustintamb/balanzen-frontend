import expoConfig from "eslint-config-expo/flat.js";
import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": "error",
      "no-console": ["warn", { allow: ["error"] }],
    },
  },
  {
    ignores: ["dist/*", "node_modules/", ".expo/"],
  },
]);
