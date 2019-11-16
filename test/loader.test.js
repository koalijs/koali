const loader = require('../lib/loader')
const path = require('path')
const baseDir = path.join(__dirname, 'app')
const App = require('../index')
const Router = require('@koa/router')

test('load config file', () => {
  expect(loader.loadConfigFile(path.join(baseDir, 'config/default'))).toHaveProperty(
    'session.key',
    's'
  )
  expect(loader.loadConfigFile(path.join(baseDir, 'config/notfound'))).toEqual({})
  expect(function() {
    loader.loadConfigFile(path.join(baseDir, 'config/development'))
  }).toThrow()
  expect(loader.loadConfigFile(path.join(baseDir, 'config/empty'))).toEqual({})
})

test('load config', () => {
  let conf = loader.loadConfig(path.join(baseDir, 'config'), 'development', {
    baseDir: baseDir
  })
  expect(conf).toHaveProperty('session.key', 'sss')
  expect(conf).toHaveProperty('custom.dir', baseDir + '/custom')
})

test('load model', () => {
  const Model = require('../index').Model
  let conf = loader.loadModel(path.join(baseDir, 'model'))
  expect(conf.Device.prototype).toBeInstanceOf(Model)
  expect(conf.UserOrder.prototype).toBeInstanceOf(Model)
  conf = loader.loadModel(path.join(baseDir, 'model'), { recursive: false })
  expect(conf.UserOrder).toBeUndefined()
})

test('load middleware', () => {
  let app = new App()
  let conf = loader.loadMiddleware(path.join(baseDir, 'middleware'), app)
  expect(conf.length).toBeGreaterThan(1)

  app = new App()
  conf = loader.loadMiddleware(path.join(baseDir, 'middleware'), app, ['auth'])
  expect(conf.length).toBe(1)
  expect(conf[0].name).toBe('auth')

  app = new App({ config: { auth: false } })
  conf = loader.loadMiddleware(path.join(baseDir, 'middleware'), app, ['setCurrentUser', 'auth'])
  expect(conf.length).toBe(1)
  expect(conf[0].name).toBe('setCurrentUser')
})

test('load router', () => {
  let router = new Router()
  let conf = loader.loadRouter(path.join(baseDir, 'routes'), router)
  expect(conf.index).toBeInstanceOf(Function)
})
