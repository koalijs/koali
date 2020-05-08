const extend = require('extend2')
const path = require('path')
const requireAll = require('require-all')
const isPlainObject = require('is-plain-object')
const camelCase = require('camel-case')
const pascalCase = require('pascal-case')

const DEFAULT_FILTER = /^(.*)\.(js|ts|node|coffee)$/

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
  },

  /**
   * Load middleware for app
   *
   * @param {string} dir directory
   * @param {Application} app
   * @param {Array} orderd orderd and filter middleware in the directory
   *
   */
  loadMiddleware(dir, app, orderd, options) {
    options = Object.assign(
      {
        recursive: false,
        dirname: dir,
        filter: DEFAULT_FILTER,
      },
      options
    )
    let ar = []
    let index = -1
    mapObject(true, requireAll(options), (item, key) => {
      key = camelCase(key)
      const opts = app.config[key]
      if (orderd) {
        index = orderd.indexOf(key)
      } else {
        index++
      }
      if (opts !== false && index != -1) {
        ar.push({
          name: key,
          options: opts,
          index: index,
          exports: item,
        })
      }
    })
    ar.sort((first, sec) => first.index - sec.index)
    ar.forEach((item) => {
      app.use(item.exports(item.options, app))
    })
    return ar
  },

  /**
   * Load router
   *
   */

  loadRouter(dir, router, options = {}) {
    return mapObject(
      true,
      requireAll({
        recursive: options.recursive,
        dirname: dir,
        filter: options.filter || DEFAULT_FILTER,
      }),
      (item) => {
        item(router, options)
        return item
      }
    )
  },

  /**
   * Load model class
   *
   * -- model
   * ---- device.js
   * ---- device-info.js
   * ---- user
   * ------ order.js
   *
   * ==>
   * {
   *   Deivce: require('./model/device.js'),
   *   DeviceInfo: require('./model/device-info.js'),
   *   UserOrder: require('./model/user/order.js')
   * }
   *
   */
  loadModel(dir, options) {
    options = Object.assign(
      {
        recursive: true,
        dirname: dir,
        filter: DEFAULT_FILTER,
      },
      options
    )
    let obj = {}
    mapObject(true, requireAll(options), (item, key, parentKeys) => {
      obj[pascalCase(parentKeys.concat(key).join('.'))] = item
    })
    return obj
  },
})

function mapObject(deep, obj, fun, parentKeys) {
  const ret = {}
  parentKeys = parentKeys || []
  for (let key in obj) {
    ret[key] =
      deep && isPlainObject(obj[key])
        ? mapObject(deep, obj[key], fun, parentKeys.concat(key))
        : fun(obj[key], key, parentKeys)
  }
  return ret
}
