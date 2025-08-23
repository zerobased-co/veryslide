const webpack = require('webpack');
const path = require('path');
const config = require('./config');

module.exports = (env, argv) => {
  var mode = argv.mode || 'development';

  var isProd = mode === 'production';
  var isTest = argv.test || false;
  var isDev = !isProd && !isTest;

  return {
    mode,

    entry: isTest ? undefined : [
      './src/index.js',
    ],

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                url: false,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },

    resolve: {
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules'
      ],
    },

    output: !isTest ? {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    } : undefined,

    plugins: [
      // Common plugins
      // Injecting variables while bundling
      new webpack.DefinePlugin({
        'process.env.MODE': JSON.stringify(mode),
        'process.env.FIREBASE_CONFIG': JSON.stringify(config.firebaseConfig),
      }),
    ].concat(
      // for production build
      isProd ? [
        new (require("compression-webpack-plugin"))(),
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        }),
      ] :
      // for development build, not for testing
      !isTest ? [
      ] : []
    ),

    devtool: isProd ? 'source-map' : 'eval-source-map',
    devServer: isDev ? {
      static: './dist',
      historyApiFallback: true,
      hot: true,
    } : undefined,
  };
};
