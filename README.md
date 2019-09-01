# veryslide
veryslide.com homepage

## Run
Add `FIREBASE_CONFIG` as a JSON string with Firebase configuration.

```shell
$ npm install
$ npm run start
```

## Test

Veryslide uses below items to test itself.

 - [Karma](https://karma-runner.github.io): Test runner
 - [Mocha](https://mochajs.org/): Test framework
 - [karma-webpack](https://github.com/webpack-contrib/karma-webpack): To use webpack setting within Karma
 - [karma-coverage](https://github.com/karma-runner/karma-coverage): To make coverage report
 - [istanbul-instrumenter-loader](https://github.com/webpack-contrib/istanbul-instrumenter-loader): To create coverage report under karma-webpack

```shell
$ npm run test
```
