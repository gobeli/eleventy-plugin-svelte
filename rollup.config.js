import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'

import { sync as globby } from 'globby'
import { basename, dirname, join } from 'path'
import fs from 'fs-extra'

const stripExtension = (file) => join(dirname(file), basename(file, '.js'))

// copy non js files to _build
globby(['**/*.njk', '**/*.md', '**/*.json'], { cwd: 'src' })
  .map((file) => ({
    src: join('src', file),
    dest: join('_build', 'ssr', file),
  }))
  .forEach(({ src, dest }) => fs.copySync(src, dest))

const input = globby('**/*.11ty.js', { cwd: 'src' }).reduce(
  (acc, i) => ({ ...acc, [stripExtension(i)]: join('src', i) }),
  {}
)

const dev = process.env.NODE_ENV === 'development'

export default [
  {
    input,
    plugins: [
      svelte({
        generate: 'ssr',
        dev,
        css: false,
      }),
    ],
    output: {
      dir: '_build/ssr',
      format: 'cjs',
    },
    external: [/^svelte/],
  },
  {
    input,
    plugins: [
      svelte({
        hydratable: true,
        dev,
        emitCss: true,
      }),
      resolve({
        browser: true,
        dedupe: ['svelte'],
      }),
      postcss(),
      !dev && terser(),
    ],
    output: [
      {
        dir: '_build/client',
        format: 'esm',
      },
      {
        dir: '_build/client_legacy',
        format: 'system',
        sourcemap: true,
      },
    ],
  },
]
