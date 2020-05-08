/**
 * Default config for middleware
 */

const path = require('path')

module.exports = (options) => {
  return {
    preload: true,

    coreMiddleware: [
      'loadConfig',
      'i18n',
      'onError',
      'notFound',
      'logger',
      'session',
      'bodyParser',
      'loadModel',
      'onModelError',
    ],

    loadConfig: {
      dir: path.join(options.baseDir, 'config'),
    },

    loadModel: {
      dir: path.join(options.baseDir, 'model'),
    },

    i18n: {
      extension: '.json',
      indent: 2,
      locales: ['en'],
      directory: path.join(options.baseDir, 'config/locales'),
    },

    onError: {},
    notFound: {},
    session: {
      prefix: 'session-',
      signed: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      key: 'session',
    },
    bodyParser: {
      enableTypes: ['text', 'json', 'form'],
      extendTypes: {
        text: ['text/xml'],
      },
    },

    onModelError: {},
    logger: false,
  }
}
