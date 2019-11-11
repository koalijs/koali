const Validator = require('../validator')
const assert = require('assert')

module.exports = function validator(schemaOrOptions) {
  assert(schemaOrOptions, 'schema required.')
  let options = schemaOrOptions
  let schema
  if (options.schema) {
    schema = options.schema
    delete options.schema
  } else {
    schema = options
    options = {}
  }

  const target = options.target === undefined ? 'body' : options.target
  const v = new Validator(options)
  let fn
  let dataVar = options.dataVar

  if (typeof schema == 'string') {
    fn = v.getSchema(schema)
    assert(fn, 'no schema with key ' + schema + '.')
    if (!dataVar) dataVar = schema
  } else {
    fn = v.compile(schema)
    if (!dataVar) dataVar = v._getId(schema)
  }

  async function validate(...args) {
    if (validate.$async === true) {
      await fn(...args)
    } else {
      let valid = fn(...args)
      if (!valid) {
        throw new Validator.ValidationError(fn.errors)
      }
    }
  }

  return async function validator(ctx, next) {
    ctx.validate = validate
    if (target) {
      try {
        validate(ctx.request[target])
      } catch (err) {
        if (err instanceof Validator.ValidationError) {
          //format route validation error
          err.expose = true
          err.statusCode = 400
          err.message = Validator.i18nErrorMessage(err.errors, {
            dataVar: dataVar,
            i18n: ctx.i18n
          })
        }
      }
    }
    return next()
  }
}
