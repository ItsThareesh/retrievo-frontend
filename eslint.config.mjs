import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // `setState` inside `useEffect` is idiomatic for data-fetching / mount guards.
      // The new react-hooks rule is overly strict for this codebase; disable it.
      "react-hooks/set-state-in-effect": "off",
      // Allow `any` in fetch utilities and dynamic HEIC decoder where proper typing
      // would require extensive generic plumbing; handled case-by-case elsewhere.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
