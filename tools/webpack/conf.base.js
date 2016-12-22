const fs = require('fs')
const webpack = require('webpack')

/* Plugins */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Happypack = require('happypack')
const autoprefixer = require('autoprefixer')
const eslintFriendlyFormatter = require('eslint-friendly-formatter')
const loaders = require('./loaders')
const postcssPlugins = [autoprefixer({ browsers: ['iOS 8', 'Android 4.0'] })]

/* vars */
const port = 8080
const urls = require('../urls')
const ip = require('../config/ip')
const config = require('../config')
const exclude = /(node_modules|bower_components)/
const prod = process.env.NODE_ENV === 'production'
/* Entries */
const libs = ['vue', 'vue-router', 'fastclick', 'whatwg-fetch']
const vendor = ['components/ui', urls.bootstrap]

module.exports = {
  entry: Object.assign({ libs, vendor }, config.entry),
  output: {
    path: urls.build,
    publicPath: '/',
    filename: 'assets/js/[name].js',
    chunkFilename: 'assets/js/chunk.[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.vue', '.css', '.scss', '.gif', '.png', '.jpg', '.jpeg', '.json', '.html'],
    alias: {
      components: urls.components,
      assets: urls.assets
    }
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      enforce: "pre",
      loader: 'standard-loader',
      exclude
    }, {
      test: /\.vue$/,
      enforce: "pre",
      loader: 'eslint-loader',
      exclude
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.jsx?$/,
      loader: 'babel-loader?cacheDirectory',
      // loader: 'happypack/loader',
      exclude
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loader: 'url-loader',
      options: {
        limit: 1000,
        name: 'assets/imgs/[name].[hash:8].[ext]'
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)$/i,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'assets/fonts/[name].[hash:8].[ext]'
      }
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: require.resolve('whatwg-fetch'),
      loader: 'imports-loader?this=>global!exports-loader?global.fetch'
    }]
  },
  plugins: [
    // new Happypack({
    //   loaders: ['babel?cacheDirectory'],
    //   tempDir: urls.temp
    // }),
    new webpack.LoaderOptionsPlugin({
      debug: !prod,
      minimize: prod,
      options: {
        context: urls.project,
        eslint: {
          formatter: eslintFriendlyFormatter,
          emitWarning: true,
          failOnWarning: false,
          failOnError: true,
          fix: true
        },
        vue: {
          loaders: loaders.css({ sourceMap: true, extract: prod }),
          postcss: postcssPlugins
        },
        postcss: postcssPlugins
      }
    }),
    new webpack.ProvidePlugin({
      'fetch': 'whatwg-fetch'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'libs', 'manifest'],
      minChunks: Infinity
    }),
    ...config.htmls.map(conf => new HtmlWebpackPlugin(conf))
  ],
  performance: {
    hints: prod ? 'warning' : false
  }
}
