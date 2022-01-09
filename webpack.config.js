const webpack = require('webpack');
const path = require('path');
const config = require('./config');

module.exports = (env, argv) => {
  var mode = argv.mode || 'development';
  return {
    mode,

    entry: [
      'react-hot-loader/patch',
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

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.MODE': JSON.stringify(argv.mode),
        'process.env.FIREBASE_CONFIG': JSON.stringify(config.firebaseConfig),
      }),
    ],
    devtool: (mode === 'development') ? 'inline-source-map' : 'source-map',
    devServer: {
      static: './dist',
      historyApiFallback: true,
      hot: true,
    },
  };
};
