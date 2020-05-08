const koa = require('koa')
const path = require('path')
const extend = require('extend2')
const { loadConfig, loadMiddleware } = require('./loader')

module.exports = class Application extends koa {
  /**
   * Initialize a new `Application`.
   *
   * @api public
   */

  /**
   * @param {boolean} [options.proxy=true] Trust proxy headers
   * @param {String} [options.baseDir=process.cwd()] Application directory
   * @param {Object} [options.config={}] Default config for override config in koali core.
   *
   */

  constructor(options) {
    if (typeof options == 'string') {
      options = { baseDir: options }
    }
    options = Object.assign(
      {
        proxy: true,
        baseDir: process.cwd(),
        config: {},
      },
      options
    )
    super(options)
    this.options = options

    this.config = extend(
      true,
      {},
      loadConfig(path.join(__dirname, 'config'), this.env, this.options),
      options.config
    )

    if (this.config.preload) this.loadCoreMiddleware()
  }

  /**
   * Load middleware from directory
   *
   */
  loadMiddleware(dir, orderd, options) {
    loadMiddleware(path.resolve(this.options.baseDir, dir), this, orderd, options)
  }

  /**
   * Load core middleware
   *
   */
  loadCoreMiddleware(orderd) {
    this.loadMiddleware(path.join(__dirname, 'middleware'), orderd || this.config.coreMiddleware)
  }
}
