const App = require('../../index')
const request = require('supertest')
const path = require('path')
process.env.NODE_CONFIG_DIR = path.join(__dirname, '../app/config')
const baseDir = path.join(__dirname, '../app')

let app
let server
beforeEach(() => {
  app = null
  server = null
})

afterEach(() => {
  server.close()
})

function createApp(opts) {
  app = new App(
    Object.assign(
      {
        env: 'test',
        baseDir
      },
      opts
    )
  )
  server = app.listen()
  return app
}

test('found', async () => {
  createApp()
  app.use(async ctx => {
    ctx.body = 'ok'
  })
  await request(server)
    .get('/')
    .expect(200)
    .expect('ok')
})

test('not found', async () => {
  createApp({
    config: {
      i18n: false
    }
  })
  await request(server)
    .get('/')
    .set('Accept', 'application/json')
    .expect(404)
    .expect(/NotFoundError/)
    .expect(/not found on/)
})

test('i18n', async () => {
  createApp({
    config: {
      i18n: {
        locales: ['zh']
      }
    }
  })
  await request(server)
    .get('/')
    .set('Accept', 'application/json')
    .expect(404)
    .expect(/不存在/)
})
