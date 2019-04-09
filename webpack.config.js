const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/veryslide.js',
  output: {
    filename: 'veryslide.js',
    path: path.resolve(__dirname, 'dist')
  }
};
