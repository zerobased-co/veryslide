const webpack = require('webpack');
const path = require('path');
const config = require('./config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (env, argv) => {
  var mode = argv.mode || 'development';

  return {
    mode,

    entry: [
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

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },

    plugins: [
      new ReactRefreshWebpackPlugin(),
      new webpack.DefinePlugin({
        'process.env.MODE': JSON.stringify(mode),
        'process.env.FIREBASE_CONFIG': JSON.stringify(config.firebaseConfig),
      }),
    ].concat(
      mode === 'production' ? [
        new CompressionPlugin(),
        new BundleAnalyzerPlugin(),
      ] : []
    ),
    devtool: (mode === 'development') ? 'eval-source-map' : 'source-map',
    devServer: {
      static: './dist',
      historyApiFallback: true,
      hot: true,
    },
  };
};
