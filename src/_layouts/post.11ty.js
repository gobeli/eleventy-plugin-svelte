import PostComponent from '../svelte/pages/Post.svelte'

// if in browser
if (typeof window !== 'undefined') {
  new PostComponent({
    target: document.getElementById('app'),
    hydrate: true,
  })
}

export default class Post {
  data() {
    return {
      layout: 'base.njk',
      bundle: '_layouts/post.11ty.js',
    }
  }

  render({ title, content }) {
    return PostComponent.render({ post: { title, content } }).html
  }
}
