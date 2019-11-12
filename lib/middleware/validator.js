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
  let dataPath = options.dataPath

  if (typeof schema == 'string') {
    fn = v.getSchema(schema)
    assert(fn, 'no schema with key ' + schema + '.')
    if (!dataPath) dataPath = schema
  } else {
    fn = v.compile(schema)
    if (!dataPath) dataPath = v._getId(schema)
  }

  async function validate(...args) {
    try {
      if (fn.$async === true) {
        await fn(...args)
      } else {
        let valid = fn(...args)
        if (!valid) {
          throw new Validator.ValidationError(fn.errors)
        }
      }
    } catch (err) {
      if (err instanceof Validator.ValidationError) {
        //format validation error
        err.expose = true
        err.statusCode = 400
        Validator.parseError(err, {
          dataPath: dataPath,
          i18n: this.i18n
        })
      }
      throw err
    }
  }

  return async function validator(ctx, next) {
    ctx.validate = validate.bind(ctx)
    if (target) {
      await ctx.validate(ctx.request[target])
    }
    return next()
  }
}
