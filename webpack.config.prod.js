const path = require("path");
const webpack = require("webpack");
const package = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

try {
  require("os").networkInterfaces();
} catch (e) {
  require("os").networkInterfaces = () => ({});
}

module.exports = {
  mode: "production",
  entry: ["./src/app/VoxeetReactComponents.js"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    library: "VoxeetReactComponents",
    libraryTarget: "commonjs2",
  },
  externals: {
    "@voxeet/voxeet-web-sdk": true,
    react: true,
    "react-dom": true,
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
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{ loader: "css-loader" }, { loader: "less-loader" }],
        }),
      },
      {
        test: /\.mp3$/,
        exclude: /node_modules/,
        loader: "file-loader",
        options: {
          name: "sounds/[name].[ext]",
        },
      },
      {
        test: /\.(jpg|jpeg|gif|png)$/,
        exclude: /node_modules/,
        loader: "url-loader?limit=65000&name=images/[name].[ext]",
      },
      {
        test: /\.svg$/,
        loader:
          "url-loader?limit=65000&mimetype=image/svg+xml&name=fonts/[name].[ext]",
      },
      {
        test: /\.woff$/,
        loader:
          "url-loader?limit=65000&mimetype=application/font-woff&name=fonts/[name].[ext]",
      },
      {
        test: /\.woff2$/,
        loader:
          "url-loader?limit=65000&mimetype=application/font-woff2&name=fonts/[name].[ext]",
      },
      {
        test: /\.[ot]tf$/,
        loader:
          "url-loader?limit=65000&mimetype=application/octet-stream&name=fonts/[name].[ext]",
      },
      {
        test: /\.eot$/,
        loader:
          "url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=fonts/[name].[ext]",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: `"production"`,
      },
      __VERSION__: JSON.stringify(package.version),
    }),
    new CopyWebpackPlugin([{ from: "./src/static", ignore: ["*.html"] }]),
    new ExtractTextPlugin("voxeet-react-components.css"),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};
