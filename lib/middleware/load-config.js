//const { loadConfig } = require('../loader')
const extend = require('extend2')
//const fs = require('fs')
//const path = require('path')

module.exports = (opts, app) => {
  // Switch to config module
  const config = require('config')
  if (config.has('koali')) extend(true, app.config, config.get('koali'))

  //const dir = path.resolve(process.cwd(), opts.dir)
  //if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
  //  extend(true, app.config, loadConfig(dir, app.env, app.options).koali)
  //}

  return function loadConfig(ctx, next) {
    return next()
  }
}
