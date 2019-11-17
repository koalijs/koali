module.exports = () => {
  return function notFound(ctx, next) {
    return next().then(() => {
      if (ctx.status !== 404 || ctx.body) {
        return
      }
      if (ctx.i18n) {
        ctx.throw(404, ctx.i18n.__('The page %s was not found on this server.', ctx.path))
      } else {
        ctx.throw(404, 'The page ' + ctx.path + ' was not found on this server.')
      }
    })
  }
}
