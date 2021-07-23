const path = require("path");
const webpack = require("webpack");
const package = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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
  devtool: "inline-source-map",
  mode: "development",
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
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
    watchOptions: {
      poll: true,
    },
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: "babel-loader",
        exclude: [
          path.resolve(__dirname, '/node_modules/')
        ],
        include: path.resolve(__dirname),
      },
      {
        test: /.less$/,
        use: [
          'style-loader',
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
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  plugins: [
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
    // new webpack.NoEmitOnErrorsPlugin/(),
    new webpack.HotModuleReplacementPlugin(),
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       from: "./src/static",
    //       globOptions: {
    //         ignore: ["**/index.html"]
    //       }
    //     },
    //   ]
    //   }),
  ],
};
