const EleventySvelte = require('./EleventySvelte')
const path = require('path')
const url = require('url')

const defaultOptions = {
  assetDir: 'assets',
  outputClient: true,
  rollupPluginSvelteSSROptions: {},
  rollupPluginSvelteClientOptions: {},
  rollupClientPlugins: [],
  rollupSSRPlugins: [],
}

const svelteComponentRegex = new RegExp(/11ty.svelte$/);

module.exports = function (eleventyConfig, configOptions = {}) {
  const options = { ...eleventyConfig, ...defaultOptions, ...configOptions }

  const eleventySvelte = new EleventySvelte(options)

  eleventyConfig.addTemplateFormats('11ty.svelte')

  eleventyConfig.addFilter('svelteData', function (dataFn) {
    return `window.__DATA__ = ${typeof dataFn === 'function' ? JSON.stringify(dataFn(this.ctx)) : '{}'}`
  })

  eleventyConfig.addShortcode('svelteClient', function (id) {
    if (!svelteComponentRegex.test(this.page.inputPath)) {
      return '';
    }
    const component = eleventySvelte.getComponent(path.normalize(this.page.inputPath))
    return `
    <script type="module">
      import Component from '${url.format(component.client)}';
      new Component({
        target: document.getElementById('${id}'),
        props: window.__DATA__,
        hydrate: true
      })
    </script>
    `
  })

  eleventyConfig.addShortcode('svelteClientLegacy', function (id) {
    if (!svelteComponentRegex.test(this.page.inputPath)) {
      return '';
    }
    const component = eleventySvelte.getComponent(path.normalize(this.page.inputPath))
    return `
    <script nomodule>
      System.import('/${component.clientLegacy}')
        .then(c => {
          new c.default({
            target: document.getElementById('${id}'),
            props: window.__DATA__,
            hydrate: true
          });
        });
    </script>
    `
  })

  eleventyConfig.addExtension('11ty.svelte', {
    read: false, // We use rollup to read the files
    getData: true,
    init: async function () {
      await eleventySvelte.build(this.config.dir.output, this.config.pathPrefix)
    },
    getInstanceFromInputPath: function (inputPath) {
      return eleventySvelte.getComponent(path.normalize(inputPath))
    },
    compile: function (str, inputPath) {
      return (data) => {
        if (str) {
          // When str has a value, it's being used for permalinks in data
          return typeof str === 'function' ? str(data) : str
        }

        const {
          html,
          head,
          css
        } = eleventySvelte.getComponent(path.normalize(inputPath)).ssr.render(data);

        return {
          html,
          head,
          css: css.code,
          toString() {
            return html
          }
        }
      }
    },
  })
}
