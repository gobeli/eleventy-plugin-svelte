# Eleventy Plugin to enable svelte

Heavily inspired by [eleventy-plugin-vue](https://github.com/11ty/eleventy-plugin-vue).

## Installation

`npm install eleventy-plugin-svelte`

- Requires experimental features in Eleventy, specifically: Custom File Extension Handlers feature from Eleventy. Opt in to experimental features on Eleventy by running ELEVENTY_EXPERIMENTAL=true npx @11ty/eleventy.

## Features

- Builds `*.svelte` single file components.
- Emits client side JavaScript code which can be included in on the site to enable hydration of the static HTML.
- Data which is defined in the `data` function (module context) feeds into the data cascade.
- Data is supplied via Svelte props, to use the data during runtime you have to define a `dataFn` which defines what will be provided as props at runtime. (see [example](example))

### Not yet available

- Svelte components as layouts

## Usage

```js
const eleventySvelte = require('eleventy-plugin-svelte')

module.exports = function (eleventyConfig) {
  // Use Defaults
  eleventyConfig.addPlugin(eleventySvelte)
}
```

### Customize with options

```js
const eleventySvelte = require('eleventy-plugin-svelte')

module.exports = function (eleventyConfig) {
  // Use Defaults
  eleventyConfig.addPlugin(eleventySvelte, {
    // Directory to store compiled ssr components
    cacheDir: '.cache/svelte',

    // Directory to emit client side JS code
    assetDir: 'assets',

    // If false client side bundle is not generated
    outputClient: true,

    // rollup-plugin-postcss Options
    postCssOptions: {
      extract: true,
    },
  })
}
```

### Template Functions

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    ....
  </body>
  <script>
    // Provides the data used on the client side (dataFn is a function defining the used data)
    {{ dataFn | getDataForComponent | safe }}
  </script>
  <script type="module">
    // Gets the svelte client side code for browsers which support es modules ("app" is the id of the HTMLElement the app is going to mount on)
    {{ "app" | getSvelteClient | safe }}
  </script>
  <script nomodule src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.3.2/s.min.js"></script>
  <script nomodule>
    // Gets the svelte client side code for browsers do not support es modules ("app" is the id of the HTMLElement the app is going to mount on)
    {{ "app" | getSvelteClientLegacy | safe }}
  </script>
</html>
```
