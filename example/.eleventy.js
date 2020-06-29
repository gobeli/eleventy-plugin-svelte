const EleventySvelte = require('../')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventySvelte, {
    postCssOptions: {},
    outputClient: false,
  })
}
