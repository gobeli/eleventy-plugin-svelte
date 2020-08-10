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
    return `
      import Component from '${url.format(component.client)}';
      new Component({
        target: document.getElementById('${id}'),
        props: window.__DATA__,
        hydrate: true
      })
    `
  })

  eleventyConfig.addFilter('getSvelteClientLegacy', function (id) {
    const component = eleventySvelte.getComponent(path.normalize(this.ctx.page.inputPath))
    return `
      System.import('/${component.clientLegacy}')
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
    init: async function () {
      await eleventySvelte.build(this.config.dir.output, this.config.pathPrefix)
    },
    getInstanceFromInputPath: function (inputPath) {
      return eleventySvelte.getComponent(path.normalize(inputPath)).ssr
    },
    compile: function (str, inputPath) {
      return (data) => {
        if (str) {
          // When str has a value, it's being used for permalinks in data
          return typeof str === 'function' ? str(data) : str
        }
        return eleventySvelte.getComponent(path.normalize(inputPath)).ssr.default.render(data).html
      }
    },
  })
}
