module.exports = (api) => {
  const isTest = api.env("test");

  return {
    plugins: [
      ["@babel/plugin-proposal-optional-chaining", { loose: false }],
      ["@babel/plugin-proposal-pipeline-operator", { proposal: "minimal" }],
      ["@babel/plugin-proposal-nullish-coalescing-operator", { loose: false }],
    ],
    presets: [
      [
        "@babel/preset-env",
        {
          targets: isTest ? { node: "current" } : "> 0.25%, not dead",
        },
      ],
      "@babel/preset-typescript",
    ],
  };
};
