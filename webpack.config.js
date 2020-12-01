const path = require("path");
const webpack = require("webpack");
const package = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

try {
  require("os").networkInterfaces();
} catch (e) {
  require("os").networkInterfaces = () => ({});
}

module.exports = {
  entry: [
    "react-hot-loader/patch",
    "webpack/hot/only-dev-server", // "only" prevents reload on syntax errors
    "./src/app/index.js",
  ],
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/",
  },
  devServer: {
    port: 8080,
    https: true,
    disableHostCheck: true,
    host: "0.0.0.0",
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loaders: ["babel-loader"],
        exclude: /node_modules/,
        include: path.resolve(__dirname),
      },
      {
        test: /.less$/,
        loader: "style-loader!css-loader!less-loader",
      },
      {
        test: /\.mp3$/,
        loader: "file-loader",
        options: {
          name: "sounds/[name].[ext]",
        },
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff",
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff",
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?limit=10000&mimetype=application/octet-stream",
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader",
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader",
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?limit=10000&mimetype=image/svg+xml",
      },
      {
        test: /\.(jpg|jpeg|gif|png)$/,
        exclude: /node_modules/,
        loader: "url-loader?limit=65000&name=images/[name].[ext]",
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "./src/static", ignore: ["*.html"] }]),
    new CopyWebpackPlugin([{ from: "./node_modules/@voxeet/voxeet-web-sdk/dist/dvwc_impl.wasm"}]),
    new HtmlWebpackPlugin({
      inject: true,
      template: "src/static/index.html",
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: `"development"`,
      },
      __VERSION__: JSON.stringify(package.version),
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};
