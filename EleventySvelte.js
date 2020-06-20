const path = require('path')

const globby = require('globby')
const rollup = require('rollup')
const svelte = require('rollup-plugin-svelte')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

class EleventySvelte {
  constructor(cacheDirectory = '.cache/svelte') {
    this.dev = process.env.NODE_ENV === 'development'
    this.workingDir = process.cwd()
    this.components = {}
    this.componentsToJsPath = {}

    this.setCacheDir(cacheDirectory)
  }

  setCacheDir(cacheDir) {
    this.cacheDir = path.join(this.workingDir, cacheDir)
    this.ssrDir = path.join(this.cacheDir, 'ssr')
    this.clientDir = path.join(this.cacheDir, 'client')
    this.clientLegacyDir = path.join(this.cacheDir, 'client_legacy')
    this.rollupBundleClientOptions = [
      {
        dir: this.clientDir,
        format: 'esm',
      },
      {
        dir: this.clientLegacyDir,
        format: 'system',
      },
    ]
    this.rollupBundleSSROptions = {
      dir: this.ssrDir,
      format: 'cjs',
    }
  }

  setInputDir(inputDir, includeDir) {
    this.inputDir = inputDir
    this.includeDir = includeDir
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
        }),
        nodeResolve({
          browser: true,
          dedupe: ['svelte'],
        }),
      ],
    })
    return { ssr, client }
  }

  async write() {
    const { ssr, client } = await this.getBundle()

    const ssrOutput = await ssr.write(this.rollupBundleSSROptions)
    const [clientOutput, clientOutputLegacy] = await Promise.all(
      this.rollupBundleClientOptions.map((output) => client.write(output))
    )

    const components = ssrOutput.output
      .filter((entry) => !!entry.facadeModuleId)
      .map((entry) => ({
        ssr: entry,
        client: clientOutput.output.find((e) => e.facadeModuleId === entry.facadeModuleId),
        clientLegacy: clientOutputLegacy.output.find((e) => e.facadeModuleId === entry.facadeModuleId),
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
}

module.exports = EleventySvelte
