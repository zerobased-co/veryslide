const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  var mode = argv.mode || 'development';
  return {
    mode,
    entry: ['react-hot-loader/patch', './src/index.js', ],
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
      new Dotenv(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.MODE': JSON.stringify(argv.mode),
      }),
    ],
    devtool: (mode === 'development') ? 'inline-source-map' : 'source-map',
    devServer: {
      contentBase: './dist',
      historyApiFallback: true,
      hot: true,
    },
  };
};
