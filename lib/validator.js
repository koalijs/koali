const ajv = require('ajv')
const decamelize = require('decamelize')
const { memoize } = require('./util')

const snakeCaseLabel = memoize(str => {
  str = decamelize(str.replace(/\./g, ' '), ' ')
  return str.substr(0, 1).toUpperCase() + str.substring(1)
})

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

module.exports = class Validator extends ajv {
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
