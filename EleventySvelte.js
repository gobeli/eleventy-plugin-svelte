const path = require('path')

const globby = require('globby')
const rollup = require('rollup')
const svelte = require('rollup-plugin-svelte')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

class EleventySvelte {
  constructor({
    cacheDir,
    assetDir,
    rollupPluginSvelteSSROptions,
    rollupSSRPlugins,
    rollupPluginSvelteClientOptions,
    rollupClientPlugins,
    useGitIgnore,
    outputClient,
  }) {
    this.workingDir = process.cwd()
    this.components = {}

    this.rollupPluginSvelteSSROptions = rollupPluginSvelteSSROptions
    this.rollupSSRPlugins = rollupSSRPlugins
    this.rollupPluginSvelteClientOptions = rollupPluginSvelteClientOptions
    this.rollupClientPlugins = rollupClientPlugins

    this.ssrDir = path.join(this.workingDir, cacheDir, 'ssr')
    this.clientDir = path.join(assetDir, 'client')
    this.clientLegacyDir = path.join(assetDir, 'client_legacy')

    this.useGitIgnore = useGitIgnore
    this.outputClient = outputClient
  }

  async build(outputDir, pathPrefix = '') {
    const input = await globby('**/*.11ty.svelte', { gitignore: this.useGitIgnore })

    const ssrOutput = await this.buildSSR(input)
    let clientOutput, clientLegacyOutput
    if (this.outputClient) {
      ;[clientOutput, clientLegacyOutput] = await this.buildClient(input, outputDir)
    }

    for (let entry of ssrOutput.output) {
      if (!!entry.facadeModuleId) {
        this.components[path.relative(this.workingDir, entry.facadeModuleId)] = {
          ssr: require(path.join(this.ssrDir, entry.fileName)),
          client: clientOutput && path.join(pathPrefix, this.clientDir, entry.fileName),
          clientLegacy: clientLegacyOutput && path.join(this.clientLegacyDir, entry.fileName),
        }
      }
    }
  }

  buildSSR(input) {
    return rollup
      .rollup({
        input,
        plugins: [
          svelte({
            generate: 'ssr',
            hydratable: this.outputClient,
            css: false,
            ...this.rollupPluginSvelteSSROptions,
          }),
          ...this.rollupSSRPlugins,
        ],
        external: [/^svelte/],
      })
      .then((build) =>
        build.write({
          dir: this.ssrDir,
          format: 'cjs',
          exports: 'named',
        })
      )
  }

  buildClient(input, outputDir) {
    return rollup
      .rollup({
        input,
        plugins: [
          svelte({
            hydratable: true,
            ...this.rollupPluginSvelteClientOptions,
          }),
          nodeResolve({
            browser: true,
            dedupe: ['svelte'],
          }),
          ...this.rollupClientPlugins,
        ],
      })
      .then((build) =>
        Promise.all(
          [
            {
              dir: path.join(outputDir, this.clientDir),
              format: 'esm',
              exports: 'named',
            },
            {
              dir: path.join(outputDir, this.clientLegacyDir),
              format: 'system',
              exports: 'named',
            },
          ].map((outputOptions) => build.write(outputOptions))
        )
      )
  }

  getComponent(localPath) {
    if (!this.components[localPath]) {
      throw new Error(`"${localPath}" is not a valid Svelte template.`)
    }
    return this.components[localPath]
  }
}

module.exports = EleventySvelte
