import svelte from "rollup-plugin-svelte";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

module.exports = [
  {
    input: "index.11ty.js",
    plugins: [
      svelte({
        generate: "ssr",
      }),
      copy({
        targets: [{ src: "_layouts", dest: "build/ssr" }],
      }),
    ],
    output: {
      dir: "build/ssr",
      format: "cjs",
    },
  },
  {
    input: "index.11ty.js",
    plugins: [
      svelte({
        hydratable: true,
      }),
      resolve(),
      terser(),
    ],
    output: {
      dir: "build/client",
      format: "iife",
    },
  },
];
