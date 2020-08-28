const path = require('path')

const globby = require('globby')
const rollup = require('rollup')
const svelte = require('rollup-plugin-svelte')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

class EleventySvelte {
  constructor({
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

    this.clientDir = path.join(assetDir, 'client')
    this.clientLegacyDir = path.join(assetDir, 'client_legacy')

    this.useGitIgnore = useGitIgnore
    this.outputClient = outputClient
  }

  async build(outputDir, pathPrefix = '') {
    const inputs = await globby('**/*.11ty.svelte', { gitignore: this.useGitIgnore })

    const ssrOutputs = await this.buildSSR(inputs)
    let clientOutput, clientLegacyOutput
    if (this.outputClient) {
      ;[clientOutput, clientLegacyOutput] = await this.buildClient(inputs, outputDir)
    }

    for (let {
      output: [entry],
    } of ssrOutputs) {
      if (!!entry.facadeModuleId) {
        const ssrModule = requireFromString(entry.code, entry.facadeModuleId)
        this.components[path.relative(this.workingDir, entry.facadeModuleId)] = {
          ssr: ssrModule.default,
          client: clientOutput && path.join(pathPrefix, this.clientDir, entry.fileName),
          clientLegacy: clientLegacyOutput && path.join(this.clientLegacyDir, entry.fileName),
          data: ssrModule.data,
        }
      }
    }
  }

  buildSSR(inputs) {
    return Promise.all(
      inputs.map((input) =>
        rollup
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
            build.generate({
              format: 'cjs',
              exports: 'named',
            })
          )
      )
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

function requireFromString(src, filename) {
  const m = new module.constructor()
  m.paths = module.paths
  m._compile(src, filename)
  return m.exports
}

module.exports = EleventySvelte
