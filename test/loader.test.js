const loader = require('../lib/loader')
const path = require('path')
const baseDir = require('path').join(__dirname, 'app')

test('load config file', () => {
  expect(loader.loadConfigFile(path.join(baseDir, 'config/default'))).toHaveProperty(
    'session.key',
    's'
  )
  expect(loader.loadConfigFile(path.join(baseDir, 'config/notfound'))).toEqual({})
  expect(function() {
    loader.loadConfigFile(path.join(baseDir, 'config/development'))
  }).toThrow()
})

test('load config', () => {
  let conf = loader.loadConfig(path.join(baseDir, 'config'), 'development', {
    baseDir: baseDir
  })
  expect(conf).toHaveProperty('session.key', 'sss')
  expect(conf).toHaveProperty('custom.dir', baseDir + '/custom')
})
