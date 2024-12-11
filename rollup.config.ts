import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts", // Entry file for your SDK
    output: [
      {
        file: "dist/index.js",
        format: "cjs", // CommonJS
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm", // ES Module
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(), // Resolves node_modules
      commonjs(), // Converts CommonJS to ESModules
      typescript(), // Transpiles TypeScript
    ],
    external: ["react"], // Exclude React from the bundle
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
];
