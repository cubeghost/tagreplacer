require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
// const findCacheDir = require('find-cache-dir');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const isDocker = require('is-docker');

const PROD = process.env.NODE_ENV === 'production';
const DOCKER = isDocker();

const paths = {
  appBuild: path.resolve(__dirname, './build'),
  appHtml: path.resolve(__dirname, './src/html/index.html'),
  appFavicon: path.resolve(__dirname, './src/assets/favicon.png'),
  appPackageJson: path.resolve(__dirname, './package.json'),
  appSrc: path.resolve(__dirname, './src'),
  appNodeModules: path.resolve(__dirname, './node_modules'),
};

const config = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 500
  },
  entry: {
    client: path.join(paths.appSrc, 'client.js')
  },
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: '[name].[hash:8].js',
    sourceMapFilename: '[name].[hash:8].js.map',
    publicPath: '/',
  },
  resolve: {
    modules: [paths.appSrc, paths.appNodeModules],
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [paths.appSrc],
        use: [{
          loader: 'babel-loader',
          // query: {
          //   cacheDirectory: findCacheDir({
          //     name: 'tagreplacer-babel-cache',
          //   }),
          // },
        }],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          (() => {
            if (PROD) {
              return MiniCssExtractPlugin.loader;
            } else {
              return {
                loader: 'style-loader',
                options: {
                  sourceMap: true,
                  singleton: false,
                },
              };
            }
          })(),
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              minimize: PROD,
              localIdentName: PROD ? '[hash:5]' : '[path][hash:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: path.resolve(__dirname, './postcss.config.js'),
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              includePaths: [
                paths.appSrc,
                path.resolve(paths.appSrc, './scss'),
                path.resolve(paths.appSrc, './assets'),
                path.resolve(__dirname, './node_modules'),
              ],
              outputStyle: PROD ? 'compressed' : 'expanded',
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|otf|woff|woff2)$/,
        include: [paths.appSrc],
        loader: 'file-loader',
      },
      {
        test: /\.md/,
        include: [paths.appSrc],
        loader: 'raw-loader',
      },
    ],
  },
  optimization: {
    namedModules: true,
    concatenateModules: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      favicon: paths.appFavicon,
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
    new CaseSensitivePathsPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new CleanWebpackPlugin([paths.appBuild])
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
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      })
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  };

  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css',
    })
  );

} else {

  config.module.rules.unshift({
    test: /\.js$/,
    enforce: 'pre',
    exclude: [/node_modules/],
    include: [paths.appSrc],
    use: [{
      loader: 'eslint-loader',
      options: {
        configFile: path.join(__dirname, 'eslint.js'),
        useEslintrc: false,
        cache: false,
        emitWarning: true,
        formatter: require('eslint-formatter-pretty'),
      },
    }],
  });

}

module.exports = config;
