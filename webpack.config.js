require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const { EsbuildPlugin } = require('esbuild-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const isDocker = require('is-docker');

const PROD = process.env.NODE_ENV === 'production';
const DOCKER = isDocker();
const ESBUILD_TARGET = 'es2017';
const src = path.resolve(__dirname, './src');
const node_modules = path.resolve(__dirname, './node_modules');

const config = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  // watchOptions: {
  //   ignored: /node_modules/,
  //   aggregateTimeout: 300,
  //   poll: 500
  // },
  entry: {
    client: './src/client/index.js'
  },
  output: {
    path: path.resolve(__dirname, './build'),
    pathinfo: true,
    filename: '[name].[contenthash:8].js',
    sourceMapFilename: '[name].[contenthash:8].js.map',
    publicPath: '/',
  },
  resolve: {
    modules: ['./node_modules'],
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [src, /node_modules\/@react-spring/],
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          target: ESBUILD_TARGET
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                includePaths: [
                  './src',
                  './src/scss',
                  './src/assets',
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|otf|woff|woff2)$/,
        include: [src, node_modules],
        type: 'asset/resource'
      },
      {
        test: /\.md/,
        include: [src],
        type: 'asset/source'
      },
    ],
  },
  optimization: {
    moduleIds: 'named',
    // concatenateModules: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: './src/html/index.html',
      favicon: './src/assets/favicon.png',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'TESTING_BLOG', 'SENTRY_DSN']),
    new webpack.DefinePlugin({
      'process.env.WEBSOCKET_HOST': `'${process.env.PROTOCOL.replace('http', 'ws')}://${process.env.HOST_HOSTNAME}'`,
    }),
    new EsbuildPlugin({
      define: {
        'process.env.WEBSOCKET_HOST': `'${process.env.PROTOCOL.replace('http', 'ws')}://${process.env.HOST_HOSTNAME}'`,
      },
    }),
    new CaseSensitivePathsPlugin(),
    // new FriendlyErrorsWebpackPlugin(),
    // new CleanWebpackPlugin(['./build'])
  ]
};

if (DOCKER && PROD) {

  // config.stats = {
  //   errors: true,
  //   errorDetails: true,
  //   logging: 'error',
  //   loggingTrace: true,
  // };
  // config.performance = {
  //   hints: false
  // };

} else {

  config.plugins.push(new SimpleProgressWebpackPlugin({
    format: (DOCKER || PROD) ? 'expanded' : 'compact',
  }));

}

if (PROD) {

  config.mode = 'production';
  config.devtool = 'source-map';
  config.optimization = {
    minimize: true,
    minimizer: [
      new EsbuildPlugin({
        target: ESBUILD_TARGET,
        css: true
      })
    ]
    // minimizer: [
    //   new TerserPlugin({
    //     cache: true,
    //     parallel: true,
    //     sourceMap: true,
    //   })
    // ],
    // splitChunks: {
    //   cacheGroups: {
    //     commons: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name: 'vendors',
    //       chunks: 'all',
    //     },
    //   },
    // },
  };

} else {

  config.plugins.push(
    new ESLintPlugin({
      formatter: require('eslint-formatter-pretty'),
    })
  );

}

module.exports = config;
