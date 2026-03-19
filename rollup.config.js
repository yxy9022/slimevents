import {defineConfig} from "rollup";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [
      {file: "dist/index.esm.js", format: "esm", exports: "named"},
      {file: "dist/index.cjs.js", format: "cjs", exports: "named"},
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "slimevents",
        exports: "named",
      },
    ],
    plugins: [
      typescript(),
      terser({
        format: {comments: false},
        compress: {drop_console: true},
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {file: "dist/index.d.ts", format: "es"},
    plugins: [dts()],
  },
]);
