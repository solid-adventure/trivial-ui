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
const enableSaveCredentials = process.env["VUE_APP_ENABLE_SAVE_CREDENTIALS"] === "true";
const enableBuildApps = process.env["VUE_APP_ENABLE_BUILD_APPS"] === "true";
const enableWebhookAppTrigger = process.env["VUE_APP_ENABLE_WEBHOOK_APP_TRIGGER"] === "true";

const trivialApiUrl = JSON.stringify(process.env["TRIVIAL_URL"]);

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
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          "vue-style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: isDevelopment,
              url: false,
            },
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
      VUE_APP_ENABLE_SAVE_CREDENTIALS: enableSaveCredentials,
      VUE_APP_ENABLE_BUILD_APPS: enableBuildApps,
      VUE_APP_ENABLE_WEBHOOK_APP_TRIGGER: enableWebhookAppTrigger,
      VUE_APP_TRIVIAL_API_URL: trivialApiUrl,
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
