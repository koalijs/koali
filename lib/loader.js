const extend = require('extend2')
const path = require('path')

const loader = (module.exports = {
  /**
   * Load config from directory by default and env.
   * @param {String} [dir] directory
   * @param {String} [env] env like `development`
   * @param {Object} [options] options for exec config function
   *
   */
  loadConfig(dir, env, options) {
    return extend(
      true,
      {},
      loader.loadConfigFile(path.join(dir, 'default'), options),
      loader.loadConfigFile(path.join(dir, env), options)
    )
  },

  /**
   * Try load config from file.
   * Not throw error if module not found.
   *
   */
  loadConfigFile(file, options) {
    try {
      let conf = require(file)
      if (typeof conf == 'function') {
        conf = conf(options)
      }
      return conf || {}
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        return {}
      }
      throw err
    }
  }
})
