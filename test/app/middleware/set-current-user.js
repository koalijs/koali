module.exports = () => {
  return function (ctx, next) {
    return next()
  }
}
