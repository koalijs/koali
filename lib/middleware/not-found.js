module.exports = () => {
  return function notFound(ctx) {
    ctx.throw(404, 'The page ' + ctx.path + ' was not found on this server.')
  }
}
