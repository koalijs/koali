const App = require('../lib/application')
const baseDir = require('path').join(__dirname, 'app')

test('constructor', () => {
  let app = new App({
    env: 'development',
    baseDir: baseDir
  })
  expect(app.proxy).toBeTruthy()
})

test('load config', () => {
  let app = new App({
    env: 'development',
    baseDir: baseDir
  })
  expect(app.config).toHaveProperty('session.key', 'sss')
  expect(app.config).toHaveProperty('custom.dir', baseDir + '/custom')
  expect(app.config).toHaveProperty('i18n.extension', '.json')
  expect(app.config.logger).toBeInstanceOf(Object)
  app = new App({
    env: 'other',
    baseDir: baseDir
  })
  expect(app.config).toHaveProperty('session.key', 's')
  expect(app.config.logger).toBe(false)
})
