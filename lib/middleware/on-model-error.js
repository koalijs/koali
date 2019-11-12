const { ValidationError } = require('objection')
const Validator = require('../validator')

/**
 * Format model error message
 *
 */

module.exports = () => {
  return async function onModelError(ctx, next) {
    try {
      await next()
    } catch (err) {
      if (err instanceof ValidationError) {
        if (ValidationError.Type.ModelValidation == err.type) {
          err.expose = true
          Validator.parseError(err, { i18n: ctx.i18n })
        }
      }
      throw err
    }
  }
}
