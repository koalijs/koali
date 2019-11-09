const ajv = require('ajv')
const { ValidationError } = require('objection')

const template = {
  required: 'required',
  maxLength: function(params, i18n) {
    return i18n.__n(
      'should not be longer than %s character',
      'should not be longer than %s characters',
      params.limit
    )
  },
  format: function(params, i18n) {
    return i18n.__('should match format "%s"', i18n.__(params.format))
  }
}

class JSONSchema extends ajv {
  constructor(opt) {
    super(
      Object.assign({}, opt, {
        errorDataPath: 'property',
        allErrors: true
      })
    )
  }

  static get i18nTemplate() {
    return template
  }

  static i18nErrorMessage(errors, opt) {
    opt = opt || {}
    const root = opt.root
    const i18n = opt.i18n
    const separator = opt.separator === undefined ? '\n' : opt.separator
    errors = Array.isArray(errors)
      ? errors
      : Object.keys(errors).reduce((ar, key) => {
          // objection.js errors
          errors[key].forEach(err => {
            ar.push(Object.assign({ dataPath: '.' + key }, err))
          })
          return ar
        }, [])
    return errors
      .map(err => {
        let key = err.dataPath.replace(/\['([^' ]*)'\]/g, '.$1')
        key = (root ? root + key : key.substring(1)).replace(/\./g, ' ')
        if (i18n) {
          key = i18n.__(key)
          let msg = err.message
          const tmpl = template[err.keyword]
          if (tmpl) {
            msg = typeof tmpl == 'function' ? tmpl(err.params, i18n) : i18n.__(tmpl, err.params)
          }
          return key + i18n.__(': ') + msg
        } else {
          return key + ' ' + err.message
        }
      })
      .join(separator)
  }

  /**
   * koa schema middleware
   *
   */
  koa(schemaOrkey, keyOrTarget, target) {
    const self = this
    let key = keyOrTarget
    if (arguments.length == 3) {
      this.addSchema(schemaOrkey, key)
    } else {
      key = schemaOrkey
      target = keyOrTarget
    }

    return validator

    async function validator(ctx, next) {
      target = target || ('get' == (ctx.method || 'get').toLowerCase() ? 'query' : 'body')
      let data = ctx.request[target]
      let validate = self.getSchema(key)
      if (!validate) throw new Error('no schema with key or ref "' + key + '"')

      try {
        if (validate.$async === true) {
          await validate(data)
        } else {
          let valid = validate(data)
          if (!valid) {
            throw new ajv.ValidationError(validate.errors)
          }
        }
      } catch (err) {
        if (err instanceof ajv.ValidationError) {
          //format route validation error
          err.expose = true
          err.message = JSONSchema.i18nErrorMessage(err.errors, {
            root: key,
            i18n: ctx.i18n
          })
        }
        throw err
      }
      return next()
    }
  }

  static koaI18nModelValidationError() {
    return async function i18nModelValidationError(ctx, next) {
      try {
        await next()
      } catch (err) {
        if (err instanceof ValidationError) {
          //Model validation
          if (err.type == ValidationError.Type.ModelValidation && err.schemaName) {
            err.expose = true
            //format model validation error.
            err.originalMessage = err.message
            err.message = JSONSchema.i18nErrorMessage(err.data, {
              root: err.schemaName,
              i18n: ctx.i18n
            })
          }
        }
        throw err
      }
    }
  }
}

module.exports = JSONSchema
