const path = require("path");
const webpack = require("webpack");
const package = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");

try {
  require("os").networkInterfaces();
} catch (e) {
  require("os").networkInterfaces = () => ({});
}

module.exports = {
  mode: "production",
  entry: ["./src/app/VoxeetReactComponents.js"],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    libraryTarget: "umd",
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
        loader: "babel-loader",
        exclude: /node_modules/,
        include: path.resolve(__dirname),
      },
      {
        test: /\.(less)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ],
      },
      {
        test: /\.mp3$/,
        exclude: /node_modules/,
        type: 'asset/resource',
        generator: {
          filename: 'sounds/[name][ext][query]'
        }
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext][query]'
        },
      },
      {
        test: /\.(jpg|jpeg|gif|png)$/,
        exclude: /node_modules/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext][query]'
        }
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
    new MiniCssExtractPlugin({
      filename: 'voxeet-react-components.css'
    }),
    // new webpack.NoEmitOnErrorsPlugin(),
  ],
};
