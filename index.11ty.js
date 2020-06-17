import IndexComponent from './src/pages/Index.svelte'

// if in browser
if (typeof window !== 'undefined') {
  new IndexComponent({
    props: {
      name: 'Ted',
    },
    target: document.getElementById('app'),
    hydrate: true,
  })
}

export default class Index {
  data() {
    return {
      layout: 'base.njk',
      bundle: 'index.11ty.js',
      porps: {
        name: 'Ted',
      },
    }
  }

  render({ props, collections }) {
    return IndexComponent.render({ posts: collections.posts.map((post) => post.data), ...props }).html
  }
}
