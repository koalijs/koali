const JSONSchema = require('../json-schema')

module.exports = opts => {
  return JSONSchema.koaI18nModelValidationError(opts)
}
