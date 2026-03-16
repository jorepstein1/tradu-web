// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";

export default defineConfig(
  {
    ignores: [".next/**", ".venv/**", "node_modules/**", "next-env.d.ts"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
  // Configure language/parsing options
  {
    languageOptions: {
      // Use TypeScript ESLint parser for TypeScript files
      parser: tseslint.parser,
      parserOptions: {
        // Enable project service for better TypeScript integration
        projectService: {
          allowDefaultProject: ["*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
