module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy({ "./_build/client": "client" });
  eleventyConfig.addPassthroughCopy({ "./_build/client_legacy": "client_legacy" });
  eleventyConfig.setUseGitIgnore(false);

  return {
    dir: {
      input: "_build/ssr",
      layouts: "_layouts",
    },
  };
};
