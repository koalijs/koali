/**
 * Default config for middleware
 */

const path = require('path')

module.exports = options => {
  return {
    configDir: path.join(options.baseDir, 'config'),

    i18n: {
      extension: '.json',
      indent: 2,
      locales: ['en'],
      directory: path.join(options.baseDir, 'config/locales')
    },
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
    model: {
      directory: path.join(options.baseDir, 'model/')
    },
    logger: false
  }
}
