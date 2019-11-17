const { ValidationError } = require('objection')
const Validator = require('../validator')

/**
 * Format model error message
 *
 */

module.exports = () => {
  return function onModelError(ctx, next) {
    return next().catch(err => {
      // TODO: other type error
      if (err instanceof ValidationError) {
        if (ValidationError.Type.ModelValidation == err.type) {
          err.statusCode = 400
          Validator.parseError(err, { i18n: ctx.i18n })
        }
      }
      throw err
    })
  }
}
