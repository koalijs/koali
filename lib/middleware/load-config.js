const { loadConfig } = require('../loader')
const extend = require('extend2')
const fs = require('fs')
const path = require('path')

module.exports = (opts, app) => {
  const dir = path.resolve(process.cwd(), opts.dir)

  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    extend(true, app.config, loadConfig(dir, app.env, app.options))
  }

  return function loadConfig(ctx, next) {
    return next()
  }
}
