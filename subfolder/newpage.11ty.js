import Button from '../src/common/Button.svelte'

// if in browser
if (typeof window !== "undefined") {
  new Index({
    props: {
      name: "Ted",
    },
    target: document.getElementById("app"),
    hydrate: true,
  });
}

export default class Test {
  data() {
    return {
      layout: "base.njk",
      bundle: "subfolder/newpage.11ty.js",
    };
  }

  render() {
    return Button.render().html;
  }
}
