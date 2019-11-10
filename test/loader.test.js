const loader = require('../lib/loader')
const path = require('path')

test('load config file', () => {
  expect(loader.loadConfigFile(path.join(__dirname, 'config/default'))).toHaveProperty(
    'session.key',
    's'
  )
  expect(loader.loadConfigFile(path.join(__dirname, 'config/notfound'))).toEqual({})
  expect(function() {
    loader.loadConfigFile(path.join(__dirname, './config/development'))
  }).toThrow()
})

test('load config', () => {
  let conf = loader.loadConfig(path.join(__dirname, 'config'), 'development', {
    baseDir: __dirname
  })
  expect(conf).toHaveProperty('session.key', 'sss')
  expect(conf).toHaveProperty('custom.dir', __dirname + '/custom')
})
