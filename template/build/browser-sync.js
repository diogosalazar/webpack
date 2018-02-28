'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'development'

const browserSync = require('browser-sync');
const ora = require('ora')
const url = require('url')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackMiddleware = require('webpack-dev-middleware');
const config = require('../config')
const webpackConfigPromise = require('./webpack.dev.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const entities = require('entities');

const spinner = ora('starting development server...')
spinner.start()

webpackConfigPromise.then(webpackConfig => {

  // add hot-reload related code to entry chunks
  Object.keys(webpackConfig.entry).forEach(function (value) {
    webpackConfig.entry[value] = [`./build/browser-sync-client?name=${value}`].concat(webpackConfig.entry[value]);
  });

  webpackConfig.plugins = webpackConfig.plugins.filter(plugin => !(plugin instanceof HtmlWebpackPlugin));

  // Create compiler
  const compiler = webpack(webpackConfig);

  // Sets up middleware
  const devMiddleware = webpackMiddleware(compiler, {
    //   noInfo: true,
    publicPath: webpackConfig.devServer.publicPath,
    quiet: true,
    reporter() {
      console.log();
      // console.log(chalk`{yellow Server running at} http://${config.devServer.hostname}:${config.devServer.port}/`);
      if (webpackConfig.devServer.proxy && typeof (webpackConfig.devServer.proxy) == 'string') {
        console.log(chalk`{magenta Proxying:} ${webpackConfig.devServer.proxy}`);
      }
    }
  });

  // Sets up hot reloading middleware
  const hotMiddleware = webpackHotMiddleware(compiler, {
    log: () => { }
  });

  // Virtual Middleware used to ignore files from proxied server
  const virtualMiddleware = (req, res, next) => {
    const regex = new RegExp(webpackConfig.devServer.publicPath, 'igm')
    try {
      if (url.parse(req.url).pathname.match(regex)) { res.end(''); } else { next(); }
    } catch (e) { next(); }
  };

  // Set middlewares in use
  const middleware = [devMiddleware, hotMiddleware, virtualMiddleware];

  // Rewrite rule to replace HTML Entities
  const HTMLEntityRewrite = {
    match: /&#[^\s;]*;/g,
    fn: (req, res, match) => entities.decodeHTML(match)
  };

  // Create server
  const server = browserSync.init({
    https: webpackConfig.devServer.host.startsWith('https'),
    logLevel: 'silent',
    middleware,
    open: webpackConfig.devServer.open,
    port: webpackConfig.devServer.port,
    proxy: webpackConfig.devServer.proxy,
    proxyOptions: { changeOrigin: false },
    reloadOnRestart: true,
    rewriteRules: [HTMLEntityRewrite]
  },
    // Server init callback
    (err, bs) => {
      spinner.stop();

      if (err) throw err;

      spinner.succeed('Server started successfully.');
    });

});
