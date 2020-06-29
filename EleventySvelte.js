const path = require('path')

const globby = require('globby')
const rollup = require('rollup')
const svelte = require('rollup-plugin-svelte')
const postcss = require('rollup-plugin-postcss')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

class EleventySvelte {
  constructor(postCssOptions, outputClient) {
    this.dev = process.env.NODE_ENV === 'development'
    this.workingDir = process.cwd()
    this.components = {}
    this.componentsToJsPath = {}
    this.postCssOptions = postCssOptions
    this.outputClient = outputClient
  }

  setPathPrefix(pathPrefix) {
    this.pathPrefix = pathPrefix
  }

  setDirs(cacheDir, outputDir) {
    this.outputDir = outputDir
    this.clientDir = path.join(outputDir, 'client')
    this.clientLegacyDir = path.join(outputDir, 'client_legacy')

    this.cacheDir = path.join(this.workingDir, cacheDir)
    this.ssrDir = path.join(this.cacheDir, 'ssr')
    this.rollupBundleClientOptions = [
      {
        dir: this.clientDir,
        format: 'esm',
        exports: 'named',
      },
      {
        dir: this.clientLegacyDir,
        format: 'system',
        exports: 'named',
      },
    ]
    this.rollupBundleSSROptions = {
      dir: this.ssrDir,
      format: 'cjs',
      exports: 'named',
    }
  }

  async getBundle() {
    const input = await globby('**/*.11ty.svelte')
    const ssr = await rollup.rollup({
      input,
      plugins: [
        svelte({
          generate: 'ssr',
          dev: this.dev,
          css: false,
        }),
      ],
      external: [/^svelte/],
    })
    const client = await rollup.rollup({
      input,
      plugins: [
        svelte({
          hydratable: true,
          dev: this.dev,
          emitCss: true,
        }),
        nodeResolve({
          browser: true,
          dedupe: ['svelte'],
        }),
        postcss(this.postCssOptions),
      ],
    })
    return { ssr, client }
  }

  async write() {
    const { ssr, client } = await this.getBundle()

    const ssrOutput = await ssr.write(this.rollupBundleSSROptions)
    let clientOutput, clientOutputLegacy
    if (this.outputClient) {
      ;[clientOutput, clientOutputLegacy] = await Promise.all(
        this.rollupBundleClientOptions.map((output) => client.write(output))
      )
    }

    const components = ssrOutput.output
      .filter((entry) => !!entry.facadeModuleId)
      .map((entry) => ({
        ssr: entry,
        client: clientOutput && clientOutput.output.find((e) => e.facadeModuleId === entry.facadeModuleId),
        clientLegacy: clientOutput && clientOutputLegacy.output.find((e) => e.facadeModuleId === entry.facadeModuleId),
      }))

    return components
  }

  getLocalFilePath(fullPath) {
    return path.relative(this.workingDir, fullPath)
  }

  addComponentToJsMapping(inputPath, jsFilename) {
    this.componentsToJsPath[inputPath] = jsFilename
  }

  addComponent(localPath) {
    const jsFilename = this.componentsToJsPath[localPath]

    this.components[localPath] = {
      ssr: require(path.join(this.ssrDir, jsFilename)),
      client: path.join(this.clientDir, jsFilename),
      clientLegacy: path.join(this.clientLegacyDir, jsFilename),
    }
  }

  getComponent(localPath) {
    if (!this.components[localPath]) {
      throw new Error(`"${localPath}" is not a valid Svelte template.`)
    }
    return this.components[localPath]
  }

  renderComponent(component, props) {
    return component.render(props).html
  }

  getAssetUrls(component) {
    return {
      client: path.relative(this.outputDir, component.client),
      clientLegacy: path.relative(this.outputDir, component.clientLegacy),
    }
  }
}

module.exports = EleventySvelte
