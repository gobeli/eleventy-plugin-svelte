const EleventySvelte = require('../')
const postcss = require('rollup-plugin-postcss')
const terser = require('rollup-plugin-terser').terser

const dev = process.env.NODE_ENV === 'development'

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventySvelte, {
    rollupSSRPlugins: [postcss()],
    rollupPluginSvelteClientOptions: {
      emitCss: false,
      compilerOptions: {
        css: false
      }
    },
    rollupClientPlugins: [!dev && terser()],
  })
}
