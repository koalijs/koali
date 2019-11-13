/**
 * Default config for middleware
 */

const path = require('path')

module.exports = options => {
  return {
    configDir: path.join(options.baseDir, 'config'),
    modelDir: path.join(options.baseDir, 'model'),
    routerDir: path.join(options.baseDir, 'routes'),

    coreMiddleware: [
      'i18n',
      'onError',
      'logger',
      'session',
      'bodyParser',
      'loadModel',
      'onModelError'
    ],

    i18n: {
      extension: '.json',
      indent: 2,
      locales: ['en'],
      directory: path.join(options.baseDir, 'config/locales')
    },

    onError: {},
    session: {
      prefix: 'session-',
      signed: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      key: 'session'
    },
    bodyParser: {
      enableTypes: ['text', 'json', 'form'],
      extendTypes: {
        text: ['text/xml']
      }
    },
    loadModel: {
      directory: path.join(options.baseDir, 'model')
    },
    onModelError: {},
    logger: false
  }
}
