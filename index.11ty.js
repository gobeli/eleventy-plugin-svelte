import Index from "./src/pages/Index.svelte";

// if in browser
if (typeof window !== "undefined") {
  const i = new Index({
    name: "Ted",
    target: document.getElementById("app"),
    hydrate: true,
  });
  console.log(i);
}

export default class Test {
  data() {
    return {
      name: "Ted",
      layout: "base.njk",
      bundle: "index.11ty.js",
    };
  }

  render({ name }) {
    return Index.render({ name }).html;
  }
}
