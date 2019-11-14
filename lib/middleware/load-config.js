const { loadConfig } = require('../loader')
const extend = require('extend2')
var fs = require('fs')

module.exports = (opts, app) => {
  if (fs.existsSync(opts.dir) && fs.statSync(opts.dir).isDirectory()) {
    extend(true, app.config, loadConfig(opts.dir, app.env, app.options))
  }
  return function loadConfig(ctx, next) {
    return next()
  }
}
