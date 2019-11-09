const I18n2 = require('i18n-2')

class I18n extends I18n2 {
  constructor(opt) {
    super(Object.assign({}, I18n.defaultOptions, opt))
  }

  static koa(opt) {
    return async function i18n(ctx, next) {
      ctx.i18n = new I18n(opt)
      I18n.registerMethods(ctx.state, ctx)
      //TODO: setLocale
      return next()
    }
  }
}

I18n.defaultOptions = {
  extension: '.json',
  indent: 2
}

module.exports = I18n
