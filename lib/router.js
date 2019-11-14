const KoaRouter = require('@koa/router')
const { loadRouter } = require('./loader')

module.exports = function router(opts, loaderOpts) {
  opts = opts || {}
  if (typeof opts == 'string') {
    opts = { dir: opts }
  }
  const router = new KoaRouter(opts)
  if (opts.dir) {
    loadRouter(opts.dir, router, loaderOpts)
  }
  return router
}
