const I18n2 = require('i18n-2')

class I18n extends I18n2 {
  static koa(opt) {
    return async function i18n(ctx, next) {
      ctx.i18n = new I18n(opt)
      I18n.registerMethods(ctx.state, ctx)
      //TODO: setLocale
      return next()
    }
  }
}

module.exports = I18n
