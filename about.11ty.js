import About from "./src/pages/About.svelte";

// if in browser
if (typeof window !== "undefined") {
  new About({
    target: document.getElementById("app"),
    hydrate: true,
  });
}

export default class Test {
  data() {
    return {
      layout: "base.njk",
      bundle: "about.11ty.js",
    };
  }

  render() {
    return About.render().html;
  }
}
