var webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  const grepPattern = config.grep || process.argv.find(arg => arg.startsWith('--grep='))?.split('=')[1] || '';

  config.set({
    basePath: '',
    frameworks: ['mocha', 'webpack'],

    client: {
      mocha: {
        grep: grepPattern,
      }
    },

    files: [
      'test/index.js',
    ],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap'],
    },

    webpack: webpackConfig({}, { mode: 'development', test: true }),
    webpackMiddleware: {
      stats: 'errors-only',
    },

    reporters: ['dots', 'coverage'],

    coverageReporter: {
      reporters: [
        {type: 'html'},
        {type: 'text-summary'},
      ],
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    browsers: ['ChromeHeadless'],
    browserNoActivityTimeout: 60000,
    debugger: true,

    customLaunchers: {
      ChromeDebugging: {
        base: 'ChromeHeadless',
        flags: ['--remote-debugging-port=9333']
      }
    },

    singleRun: true,
    concurrency: Infinity
  })
}
