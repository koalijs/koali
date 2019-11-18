const { loadModel } = require('../loader')
const fs = require('fs')
const path = require('path')

module.exports = (opts, app) => {
  const dir = path.resolve(process.cwd(), opts.dir)

  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    app.context.model = Object.assign(app.context.model || {}, loadModel(dir, opts))
  }

  return function loadModel(ctx, next) {
    return next()
  }
}
