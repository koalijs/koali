module.exports = () => {
  return async function notFound(ctx, next) {
    await next()
    if (ctx.status !== 404 || ctx.body) {
      return
    }
    ctx.throw(404, 'The page ' + ctx.path + ' was not found on this server.')
  }
}
