const App = require('../lib/application')

test('constructor', () => {
  let app = new App({
    env: 'development',
    baseDir: __dirname
  })
  expect(app.proxy).toBeTruthy()
})

test('load config', () => {
  let app = new App({
    env: 'development',
    baseDir: __dirname
  })
  expect(app.config).toHaveProperty('session.key', 'sss')
  expect(app.config).toHaveProperty('custom.dir', __dirname + '/custom')
  expect(app.config).toHaveProperty('i18n.extension', '.json')
  app = new App({
    env: 'other',
    baseDir: __dirname
  })
  expect(app.config).toHaveProperty('session.key', 's')
})
