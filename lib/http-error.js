const STATUS_CODES = require('http').STATUS_CODES

module.exports = {
  async InternalError(ctx, next) {
    try {
      await next()
    } catch (err) {
      if (!err.expose && !ctx.silent) {
        ctx.app.emit('error', err, ctx)
      }

      const statusCode = err.statusCode || 500
      const msg = STATUS_CODES[statusCode] || 'Internal Server Error'

      await render(
        {
          code: err.code,
          codeName: err.codeName || toIdentifier(msg),
          expose: err.expose,
          statusCode: statusCode,
          message: err.expose ? err.message || msg : statusCode == 500 ? 'System error.' : msg
        },
        ctx,
        next
      )
    }
  },

  async NotFound(ctx) {
    ctx.throw(404, 'The page ' + ctx.path + ' was not found on this server.')
  }
}

async function render(obj, ctx) {
  ctx.status = obj.statusCode
  var type = ctx.accepts('json', 'html')
  if (type === 'json') {
    ctx.body = {
      error: obj.codeName,
      status_code: obj.statusCode,
      code: obj.code,
      message: obj.message
    }
  } else if (type === 'html') {
    ctx.type = 'html'
    ctx.body = '<html><body><p>' + obj.message + '</p></body></html>'
  } else {
    ctx.body = obj.message
  }
}

function toIdentifier(str) {
  return str
    .split(' ')
    .map(function(token) {
      return token.slice(0, 1).toUpperCase() + token.slice(1)
    })
    .join('')
    .replace(/[^ _0-9a-z]/gi, '')
}
