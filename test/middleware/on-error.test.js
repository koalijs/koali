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
        baseDir,
      },
      opts
    )
  )
  app.silent = true
  server = app.listen()
  return app
}

test('no error', async () => {
  createApp()
  app.use(async (ctx) => {
    ctx.body = 'ok'
  })
  await request(server).get('/').expect(200).expect('ok')
})

test('throw http error', async () => {
  createApp()
  app.use(async (ctx) => {
    ctx.throw(400, { data: { test: true } })
  })
  await request(server)
    .get('/')
    .expect(400)
    .expect(/BadRequestError/)
    .expect(/Bad\sRequest/)
})

test('accepts', async () => {
  createApp()
  app.use(async (ctx) => {
    ctx.throw(400, { data: { test: true } })
  })

  await request(server)
    .get('/')
    .set('Accept', 'application/json')
    .expect(400)
    .expect(/BadRequestError/)
    .expect(/Bad\sRequest/)
    .expect(/data/)
    .expect(/test/)

  await request(server)
    .get('/')
    .set('Accept', 'text/html')
    .expect(400)
    .expect(/html/)
    .expect(/Bad\sRequest/)

  await request(server).get('/').set('Accept', 'text/plain').expect(400).expect('Bad Request')
})

test('not expose', async () => {
  createApp()
  app.use(async (ctx) => {
    ctx.throw(500, 'msg')
  })
  await request(server)
    .get('/')
    .expect(500)
    .expect(/InternalServerError/)
    .expect(/Internal\sServer/)
})

test('create not expose empty error', async () => {
  createApp()
  app.use(async () => {
    let err = new Error()
    throw err
  })
  await request(server)
    .get('/')
    .expect(500)
    .expect(/InternalServerError/)
    .expect(/Internal\sServer/)
})

test('create expose empty error', async () => {
  createApp()
  app.use(async () => {
    let err = new Error()
    err.statusCode = 400
    throw err
  })
  await request(server)
    .get('/')
    .expect(400)
    .expect(/BadRequestError/)
    .expect(/Bad\sRequest/)
})

test('create expose error', async () => {
  createApp()
  app.use(async () => {
    let err = new Error('invalid')
    err.statusCode = 400
    throw err
  })
  await request(server)
    .get('/')
    .expect(400)
    .expect(/BadRequestError/)
    .expect(/invalid/)
})

test('create expose error with name', async () => {
  createApp()
  app.use(async () => {
    let err = new Error('invalid')
    err.name = 'ValidationError'
    err.code = 22
    err.statusCode = 400
    throw err
  })
  await request(server)
    .get('/')
    .expect(400)
    .expect(/ValidationError/)
    .expect(/22/)
    .expect(/invalid/)
})

test('i18n', async () => {
  createApp({
    config: {
      i18n: {
        locales: ['zh'],
      },
    },
  })
  app.use(async (ctx) => {
    ctx.throw(500)
  })
  await request(server)
    .get('/')
    .expect(500)
    .expect(/InternalServerError/)
    .expect(/系统错误/)
})
