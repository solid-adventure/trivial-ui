require('dotenv').config()
const path = require('path')
const glob = require('glob')
const { VueLoaderPlugin } = require('vue-loader')

const mode = process.env['NODE_ENV'] === 'production' ? 'production' : 'development'

module.exports = {
  devtool: 'inline-source-map',
  mode: mode,
  entry: glob.sync('./source/packs/**/*.js')
  .reduce((obj,file) => {
      obj[path.relative('./source/packs', file).replace(/\.js$/, '')] = file
      return obj
    }, {}),
  output: {
    path: path.resolve(__dirname, 'public/packs'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader:  'css-loader',
            options: {
              url: false
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader:  'css-loader',
            options: {
              url: false
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    fallback: {
      'vm': false
    }
  }
}