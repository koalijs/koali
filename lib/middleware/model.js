module.exports = () => {
  return function model(ctx, next) {
    return next()
  }
}