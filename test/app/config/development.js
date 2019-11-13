module.exports = options => {
  return {
    custom: {
      dir: options.baseDir + '/custom'
    },
    session: {
      key: 'sss'
    }
  }
}
