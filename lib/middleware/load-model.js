const { loadModel } = require('../loader')
var fs = require('fs')

module.exports = (opts, app) => {
  if (fs.existsSync(opts.dir) && fs.statSync(opts.dir).isDirectory()) {
    app.context.model = loadModel(opts.dir, opts)
  }
  return function loadModel(ctx, next) {
    return next()
  }
}
