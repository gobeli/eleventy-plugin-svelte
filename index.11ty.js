import Index from "./src/pages/Index.svelte";

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
      layout: "svelte.11ty.js",
      bundle: "index.11ty.js",
      Component: Index,
      porps: {
        name: "Ted",
      }
    };
  }
}
