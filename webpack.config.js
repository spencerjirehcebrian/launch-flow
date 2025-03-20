const path = require("path");

const mainConfig = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/main.ts",
  target: "electron-main",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: "source-map",
};

const preloadConfig = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/preload.ts",
  target: "electron-preload",
  output: {
    filename: "preload.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  devtool: "source-map",
};

const rendererConfig = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/renderer/index.ts",
  target: "electron-renderer",
  output: {
    filename: "renderer.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  devtool: "source-map",
};

// CLI config for npm package
const cliConfig = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/cli.ts",
  target: "node",
  output: {
    filename: "cli.js",
    path: path.resolve(__dirname, "bin"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  devtool: "source-map",
};

module.exports = [mainConfig, preloadConfig, rendererConfig, cliConfig];
