const ajv = require('ajv')
const noCase = require('no-case')
const { memoize } = require('./util')

const snakeCaseLabel = memoize(str => {
  str = noCase(str)
  return str.substr(0, 1).toUpperCase() + str.substring(1)
})

const template = {
  required: 'required',
  maxLength(params, i18n) {
    return i18n.__n(
      'should not be longer than %s character',
      'should not be longer than %s characters',
      params.limit
    )
  },

  minLength(params, i18n) {
    return i18n.__n(
      'should not be shorter than %s character',
      'should not be shorter than %s characters',
      params.limit
    )
  },

  format(params, i18n) {
    return i18n.__('should match format "%s"', i18n.__(params.format))
  },

  type(params, i18n) {
    return i18n.__('should be "%s"', i18n.__(params.type))
  },

  $ref: "can\\'t resolve reference %(ref)s",

  additionalProperties: 'should not have additional properties',

  anyOf: 'should match some schema in "anyOf"',

  const: 'should be equal to constant',

  enum: 'should be equal to one of predefined values',

  exclusiveMaximum: 'should be %(comparison)s %(limit)s',

  exclusiveMinimum: 'should be %(comparison)s %(limit)s',

  minimum: 'should be %(comparison)s %(limit)s',

  maximum: 'should be %(comparison)s %(limit)s'
}

module.exports = class Validator extends ajv {
  /**
   * @param {Object} [opts.keywords] add keyword in opts
   *
   */
  constructor(opts) {
    opts = Object.assign({}, opts, {
      errorDataPath: 'property',
      allErrors: true
    })
    super(opts)
    if (opts.keywords) {
      Object.keys(opts.keywords).forEach(key => {
        this.addKeyword(key, opts.keywords[key])
      })
    }
  }

  static get i18nTemplate() {
    return template
  }

  /**
   * Make error data readable
   * Translate error message if i18n support.
   * @param {Error} [err] input error object
   *
   * @return {Error}
   *
   */
  static parseError(err, { dataPath, i18n, separator = '\n' } = {}) {
    dataPath = err.dataPath || dataPath
    let data = err.errors || err.data
    // Objection.js has hash error data
    // https://github.com/Vincit/objection.js/blob/794a036b6e621af38631378eed85188dfb973d3f/lib/model/AjvValidator.js#L144
    data = Array.isArray(data) ? arrayErrorToHash(data) : data //objection.js error hash

    if (!data) return err

    err.message = Object.keys(data)
      .map(key => {
        let label = dataPath ? dataPath + '.' + key : key
        label = snakeCaseLabel(label)
        if (i18n) label = i18n.__(label)

        return data[key]
          .map(err => {
            err.label = label
            if (i18n) {
              const tmpl = template[err.keyword]
              if (tmpl) {
                // i18n error message.
                err.message =
                  typeof tmpl == 'function' ? tmpl(err.params, i18n) : i18n.__(tmpl, err.params)
              }
            }
            return label + ' ' + err.message
          })
          .join(separator)
      })
      .join(separator)

    err.data = data
    return err
  }
}

function arrayErrorToHash(errors) {
  let errorHash = {}

  for (const error of errors) {
    // Unknown properties are reported in `['propertyName']` notation,
    // so replace those with dot-notation, see:
    // https://github.com/epoberezkin/ajv/issues/671
    let key = error.dataPath.replace(/\['([^' ]*)'\]/g, '.$1').substring(1)

    // More than one error can occur for the same key in Ajv, merge them in the array:
    const array = errorHash[key] || (errorHash[key] = [])

    // Use unshift instead of push so that the last error ends up at [0],
    // preserving previous behavior where only the last error was stored.
    array.unshift({
      message: error.message,
      keyword: error.keyword,
      params: error.params
    })
  }

  return errorHash
}
