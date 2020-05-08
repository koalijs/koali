module.exports = {
  // Super fast memoize for single argument functions.
  memoize(func) {
    const cache = new Map()

    return (input) => {
      let output = cache.get(input)

      if (output === undefined) {
        output = func(input)
        cache.set(input, output)
      }

      return output
    }
  },
}
