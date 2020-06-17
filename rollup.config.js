import svelte from "rollup-plugin-svelte";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

import { sync as globby } from 'globby';
import { basename, dirname, join } from 'path'

const stripExtension = file => join(dirname(file), basename(file, '.js'))

const input = globby('**/*.11ty.js', { gitignore: true })
  .reduce((acc, i) => ({ ...acc, [stripExtension(i)]: i }), {})
const dev = process.env.NODE_ENV === 'development'

export default [
  {
    input,
    plugins: [
      svelte({
        generate: "ssr",
        dev,
        css: false
      }),
      copy({
        targets: [{ src: "_layouts/*.njk", dest: "_build/ssr/_layouts" }],
      }),
    ],
    output: {
      dir: "_build/ssr",
      format: "cjs",
    },
    external: [/^svelte/]
  },
  {
    input,
    plugins: [
      svelte({
        hydratable: true,
        dev,
        css: false
      }),
      resolve({
				browser: true,
				dedupe: ['svelte']
			}),
      !dev && terser(),
    ],
    output: [{
      dir: "_build/client",
      format: "esm",
    }, {
      dir: "_build/client_legacy",
      format: "system",
      sourcemap: true
    }],
  },
];
