const EleventySvelte = require('./EleventySvelte')
const path = require('path')
const url = require('url')

const defaultOptions = {
  cacheDir: '.cache/svelte',
  assetDir: 'assets',
  outputClient: true,
  rollupPluginSvelteSSROptions: {},
  rollupPluginSvelteClientOptions: {},
  rollupClientPlugins: [],
  rollupSSRPlugins: [],
}

module.exports = function (eleventyConfig, configOptions = {}) {
  const options = { ...eleventyConfig, ...defaultOptions, ...configOptions }

  const eleventySvelte = new EleventySvelte(options)

  eleventyConfig.addTemplateFormats('11ty.svelte')

  eleventyConfig.addFilter('getDataForComponent', function (dataFn) {
    const data = 'window.__DATA__ = '
    if (typeof dataFn === 'function') {
      return data + JSON.stringify(dataFn(this.ctx))
    }
    return data + '{}'
  })

  eleventyConfig.addFilter('getSvelteClient', function (id) {
    const component = eleventySvelte.getComponent(path.normalize(this.ctx.page.inputPath))
    const assets = eleventySvelte.getAssetUrls(component)
    return `
      import Component from '${eleventySvelte.pathPrefix}${url.format(path.join(options.assetDir, assets.client))}';
      new Component({
        target: document.getElementById('${id}'),
        props: window.__DATA__,
        hydrate: true
      })
    `
  })

  eleventyConfig.addFilter('getSvelteClientLegacy', function (id) {
    const component = eleventySvelte.getComponent(path.normalize(this.ctx.page.inputPath))
    const assets = eleventySvelte.getAssetUrls(component)
    return `
      System.import('/${url.format(path.join(options.assetDir, assets.clientLegacy))}')
        .then(c => {
          new c.default({
            target: document.getElementById('${id}'),
            props: window.__DATA__,
            hydrate: true
          });
        });
    `
  })

  eleventyConfig.addExtension('11ty.svelte', {
    read: false, // We use rollup to read the files
    getData: true,
    getInstanceFromInputPath: function (inputPath) {
      return eleventySvelte.getComponent(path.normalize(inputPath)).ssr
    },
    init: async function () {
      eleventySvelte.setPathPrefix(this.config.pathPrefix)
      eleventySvelte.setDirs(options.cacheDir, path.join(this.config.dir.output, options.assetDir))
      let components = await eleventySvelte.write()

      for (let component of components) {
        let inputPath = eleventySvelte.getLocalFilePath(component.ssr.facadeModuleId)
        let jsFilename = component.ssr.fileName
        eleventySvelte.addComponentToJsMapping(inputPath, jsFilename)
        eleventySvelte.addComponent(inputPath)
      }
    },
    compile: function (str, inputPath) {
      return (data) => {
        if (str) {
          // When str has a value, it's being used for permalinks in data
          return typeof str === 'function' ? str(data) : str
        }
        const component = eleventySvelte.getComponent(path.normalize(data.page.inputPath))
        return eleventySvelte.renderComponent(component.ssr.default, data)
      }
    },
  })
}
