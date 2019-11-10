const koa = require('koa')
const path = require('path')
const extend = require('extend2')
const { loadConfig } = require('./loader')

module.exports = class Application extends koa {
  /**
   * Initialize a new `Application`.
   *
   * @api public
   */

  /**
   * @param {boolean} [options.proxy=true] Trust proxy headers
   * @param {String} [options.baseDir=process.cwd()] Application directory
   * @param {Object} [options.config={}] Default app config
   *
   */

  constructor(options) {
    options = Object.assign(
      {
        proxy: true,
        baseDir: process.cwd(),
        config: {}
      },
      options
    )
    super(options)
    this.options = options

    let config = extend(
      true,
      {},
      options.config,
      loadConfig(path.join(__dirname, 'config'), this.env, this.options)
    )
    if (config.configDir) extend(true, config, loadConfig(config.configDir, this.env, this.options))

    this.config = config
  }
}
