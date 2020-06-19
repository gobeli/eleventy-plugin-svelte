import AboutComponent from './svelte/pages/About.svelte'

// if in browser
if (typeof window !== 'undefined') {
  new AboutComponent({
    target: document.getElementById('app'),
    hydrate: true,
  })
}

export default class About {
  data() {
    return {
      layout: 'base.njk',
      bundle: 'about.11ty.js',
    }
  }

  render() {
    return AboutComponent.render().html
  }
}
