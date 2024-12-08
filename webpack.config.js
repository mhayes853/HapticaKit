// webpack.config.js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  output: {
    filename: "haptica-kit.js",
    path: path.resolve(__dirname, "dist"),
    library: "HapticaKit",
    libraryTarget: "umd",
    globalObject: "this",
  },
};
