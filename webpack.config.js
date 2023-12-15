require("dotenv").config();
const path = require("path");
const glob = require("glob");
const autoprefixer = require("autoprefixer");
const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

const mode =
  process.env["NODE_ENV"] === "production" ? "production" : "development";
const isDevelopment = mode == "development";

module.exports = {
  devtool: "inline-source-map",
  mode: mode,
  entry: glob.sync("./source/packs/**/*.js").reduce((obj, file) => {
    obj[path.relative("./source/packs", file).replace(/\.js$/, "")] = file;
    return obj;
  }, {}),
  output: {
    path: path.resolve(__dirname, "public/packs"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.svg$/,
        loader: "svg-url-loader"
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          "vue-style-loader",
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDevelopment,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin(
    {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: !isDevelopment,
    }),
  ],
  resolve: {
    fallback: {
      vm: false,
    }
    },
};
