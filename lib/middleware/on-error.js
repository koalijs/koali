const statuses = require('statuses')
const camelCase = require('camelcase')
const { memoize } = require('../util')

const camelCaseId = memoize(str => camelCase(str, { pascalCase: true }))

module.exports = () => {
  return async function errorHanlder(ctx, next) {
    try {
      await next()
    } catch (err) {
      if (!err.expose) {
        ctx.app.emit('error', err, ctx)
      }

      const statusCode = err.statusCode || 500
      const statusMsg = statuses[statusCode] || 'Internal Server Error'
      const name = err.name && err.name != 'Error' ? err.name : camelCaseId(statusMsg)
      const msg = err.expose ? err.message : statusMsg

      ctx.status = statusCode
      const type = ctx.accepts('json', 'html')
      if (type === 'json') {
        ctx.body = {
          error: name,
          status_code: statusCode,
          code: err.code,
          message: msg
        }
      } else if (type === 'html') {
        ctx.type = 'html'
        ctx.body = '<html><body><p>' + msg + '</p></body></html>'
      } else {
        ctx.body = msg
      }
    }
  }
}
