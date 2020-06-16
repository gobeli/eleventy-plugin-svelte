module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy({ "build/client": "client" });

  return {
    dir: {
      input: "build/ssr",
      layouts: "_layouts",
    },
  };
};
