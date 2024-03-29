import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default [
  {
    input: "src/index.js",
    external: ["@donkeyclip/motorcortex"],
    output: [
      { dir: pkg.main, format: "cjs" },
      { dir: pkg.module, format: "es" },
    ],
    plugins: [resolve(), commonjs(), babel(), json()],
  },
  {
    input: "src/index.js",
    external: ["@donkeyclip/motorcortex"],
    output: [
      {
        inlineDynamicImports: true,
        globals: {
          "@donkeyclip/motorcortex": "MotorCortex",
        },
        name: pkg.name,
        file: pkg.browser,
        format: "umd",
      },
    ],
    plugins: [
      json(),
      resolve({ mainFields: ["module", "main", "browser"] }),
      commonjs(),
      babel(),
      terser(),
    ],
  },
];
