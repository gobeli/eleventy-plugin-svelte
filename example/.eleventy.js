const EleventySvelte = require('../')
const postcss = require('rollup-plugin-postcss')
const terser = require('rollup-plugin-terser').terser

const dev = process.env.NODE_ENV === 'development'

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventySvelte, {
    rollupPluginSvelteSSROptions: {
      dev,
    },
    rollupPluginSvelteClientOptions: {
      dev,
      emitCss: true,
    },
    rollupClientPlugins: [postcss(), !dev && terser()],
  })
}
