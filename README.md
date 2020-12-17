[![npm](https://img.shields.io/npm/dw/eleventy-plugin-svelte)](https://www.npmjs.com/package/eleventy-plugin-svelte)
[![npm](https://img.shields.io/npm/v/eleventy-plugin-svelte)](https://www.npmjs.com/package/eleventy-plugin-svelte)

# Eleventy Plugin to enable svelte

Heavily inspired by [eleventy-plugin-vue](https://github.com/11ty/eleventy-plugin-vue).

## Installation

`npm install eleventy-plugin-svelte`

- Requires experimental features in Eleventy, specifically: Custom File Extension Handlers feature from Eleventy. Opt in to experimental features on Eleventy by running `ELEVENTY_EXPERIMENTAL=true npx @11ty/eleventy`.

## Features

- Builds `*.svelte` single file components.
- Emits client side JavaScript code which can be included on the site to enable hydration of the static HTML.
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
    // Directory to emit client side JS code
    assetDir: 'assets',

    // If false client side bundle is not generated
    outputClient: true,

    // Options for the rollup-plugin-svelte for prerendering
    rollupPluginSvelteSSROptions: {},

    // Options for the rollup-plugin-svelte for the client side code
    rollupPluginSvelteClientOptions: {},

    // Additional rollup plugins for prerendering
    rollupSSRPlugins: [],

    // Additional rollup plugins for the client side code
    rollupClientPlugins: [],
  })
}
```

### Example Configuration

```js
const eleventySvelte = require('eleventy-plugin-svelte')
const postcss = require('rollup-plugin-postcss')
const terser = require('rollup-plugin-terser').terser

const dev = process.env.NODE_ENV === 'development'

// Example with prerendering the styles and omitting them in the client bundle.
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventySvelte, {
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
```

### Template Variables and Functions

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
    <!-- Adds content from svelte:head -->
    {{ content.head | safe }}
    
    <!-- Adds prerendered css -->
    <style>
      {{ content.css | safe }}
    </style>
  </head>
  <body>
    ....
    <!-- Adds prerendered html -->
    {{ content | safe }}  
  </body>
  <script>
    // Provides the data used on the client side (dataFn is a function defining the used data)
    {{ dataFn | svelteData | safe }}
  </script>
  <!-- Gets the svelte client side code for browsers which support es modules ("app" is the id of the HTMLElement the app is going to mount on) -->
  {% svelteClient 'app' %}
  <!-- The legacy bundle needs systemjs to be loaded -->
  <script nomodule src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.3.2/s.min.js"></script>
  <!-- Gets the svelte client side code for browsers do not support es modules ("app" is the id of the HTMLElement the app is going to mount on) -->
  {% svelteClientLegacy 'app' %}
</html>
```
