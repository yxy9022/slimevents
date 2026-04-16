import {defineConfig} from "rollup";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import pkg from "./package.json" assert {type: "json"};

// 顶部注释
const banner = `/*! slimevents v${pkg.version} | MIT License | Built: ${new Date().toISOString().split("T")[0]} */`;
console.log(banner);
export default defineConfig([
  {
    input: "src/index.ts",
    output: [
      {file: "dist/index.esm.js", format: "esm", exports: "named", banner},
      {file: "dist/index.cjs.js", format: "cjs", exports: "named", banner},
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "slimevents",
        exports: "named",
        banner,
      },
    ],
    plugins: [
      typescript(),
      terser({
        format: {
          comments: /^!/, // 只保留以 ! 开头的注释
        },
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
