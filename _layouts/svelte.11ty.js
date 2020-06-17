
export default class Test {
  data() {
    return {
      layout: "base.njk",
    };
  }

  render({ Component, props }) {
    return Component.render(props).html;
  }
}
