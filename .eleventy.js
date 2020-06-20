const EleventySvelte = require('./EleventySvelte')
const path = require('path')

module.exports = function (eleventyConfig, configGlobalOptions = {}) {
  const eleventySvelte = new EleventySvelte()

  eleventyConfig.addTemplateFormats('11ty.svelte')

  eleventyConfig.addExtension('11ty.svelte', {
    // read: false, // We use rollup to read the files
    getData: true,
    getInstanceFromInputPath: function (inputPath) {
      const component = eleventySvelte.getComponent(path.normalize(inputPath)).ssr
      const ret = {
        data: component.preload ? component.preload() : {},
      }
      return ret
    },
    init: async function () {
      eleventySvelte.setInputDir(this.config.inputDir, this.config.dir.includes)

      let components = await eleventySvelte.write()

      for (let component of components) {
        let inputPath = eleventySvelte.getLocalFilePath(component.ssr.facadeModuleId)
        let jsFilename = component.ssr.fileName
        eleventySvelte.addComponentToJsMapping(inputPath, jsFilename)
        eleventySvelte.addComponent(inputPath)
      }
    },
    compile: function (str, inputPath) {
      return async (data) => {
        const component = eleventySvelte.getComponent(path.normalize(data.page.inputPath))
        return eleventySvelte.renderComponent(component.ssr.default, data)
      }
    },
  })
}
