const statuses = require('statuses')
const createError = require('http-errors')
const { HttpError } = createError

//TODO: render options

module.exports = () => {
  return async function onerror(ctx, next) {
    try {
      await next()
    } catch (err) {
      if (!(err instanceof HttpError)) {
        //Fix statusCode, expose
        createError(err)
      }

      ctx.app.emit('error', err, ctx)

      const statusCode = err.statusCode

      let errorInfo = {
        statusCode
      }

      if (err.expose) {
        Object.assign(errorInfo, {
          name: err.name && err.name != 'Error' ? err.name : createError[statusCode].name,
          message: err.message || statuses[statusCode],
          code: err.code,
          data: err.data
        })
      } else {
        Object.assign(errorInfo, {
          name: createError[statusCode].name,
          message: statuses[statusCode]
        })
      }

      //Maybe i18n http-error message
      if (ctx.i18n && errorInfo.message == statuses[statusCode]) {
        errorInfo.message = ctx.i18n.__(statuses[statusCode])
      }

      // output.
      ctx.status = statusCode
      const type = ctx.accepts('json', 'html')
      if (type === 'json') {
        ctx.body = {
          error: errorInfo.name,
          statusCode: errorInfo.statusCode,
          code: errorInfo.code,
          data: errorInfo.data,
          message: errorInfo.message
        }
      } else if (type === 'html') {
        ctx.type = 'html'
        ctx.body = '<html><body><p>' + errorInfo.message + '</p></body></html>'
      } else {
        ctx.body = errorInfo.message
      }
    }
  }
}
