const App = require('../lib/application')
const path = require('path')
const baseDir = path.join(__dirname, 'app')
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'app/config')

test('constructor', () => {
  let app = new App({
    env: 'development',
    baseDir: baseDir,
  })
  expect(app.proxy).toBeTruthy()

  app = new App(baseDir)
  expect(app.proxy).toBeTruthy()
  expect(app.options.baseDir).toBe(baseDir)
})

test('unconfigured app', () => {
  let app = new App({
    env: 'development',
    baseDir: path.join(__dirname, 'empty-app'),
  })
  expect(app.proxy).toBeTruthy()
})

test('config and model dir are not directory', () => {
  let app = new App({
    env: 'development',
    baseDir: baseDir,
    config: {
      loadModel: {
        dir: path.join(baseDir, 'config/default.js'),
      },
    },
  })
  expect(app.context.model).toBeUndefined()
})

test('load config', () => {
  let app = new App({
    env: 'development',
    baseDir: baseDir,
    config: {
      logger: false,
    },
  })

  expect(app.config.logger).toBeFalsy()
  app = new App({
    env: 'development',
    baseDir: baseDir,
  })
  expect(app.config.logger).toBeTruthy()
  expect(app.config).toHaveProperty('session.key', 'sss')
  expect(app.config).toHaveProperty('custom.dir', '/custom')
  expect(app.config).toHaveProperty('i18n.extension', '.json')
  expect(app.config.logger).toBeInstanceOf(Object)
})

test('load core middleware', () => {
  let app = new App({
    env: 'development',
    baseDir: baseDir,
    config: {
      logger: false,
    },
  })
  expect(app.context.model).toHaveProperty('Device')

  app = new App({
    env: 'development',
    baseDir: baseDir,
    config: {
      coreMiddleware: ['loadConfig'],
    },
  })
  expect(app.context.model).toBeUndefined()
  let model = {}
  app.context.model = model
  app.loadCoreMiddleware(['loadModel'])
  expect(app.context.model).toHaveProperty('Device')
  expect(app.context.model).toBe(model)
})
