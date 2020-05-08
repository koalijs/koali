const I18n = require('i18n-2')

module.exports = (opts) => {
  return function i18n(ctx, next) {
    ctx.i18n = new I18n(opts)
    I18n.registerMethods(ctx.state, ctx)
    //TODO: setLocale
    return next()
  }
}
