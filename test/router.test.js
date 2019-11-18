const App = require('../')
const request = require('supertest')
const path = require('path')

process.env.NODE_CONFIG_DIR = path.join(__dirname, 'app/config2')
const baseDir = path.join(__dirname, 'app')

function createApp() {
  return new App({
    env: 'test',
    baseDir
  })
}

let app
let server
beforeEach(() => {
  app = createApp()
  server = app.listen()
})

afterEach(() => {
  server.close()
})

test('dir', async () => {
  app.use(App.router(path.join(baseDir, 'routes')).routes())
  await request(server)
    .get('/')
    .expect(200)
    .expect('Hello world')
})

test('dir in options', async () => {
  app.use(App.router({ dir: path.join(baseDir, 'routes') }).routes())
  await request(server)
    .get('/')
    .expect(200)
    .expect('Hello world')
})

test('404', async () => {
  app.use(App.router().routes())
  await request(server)
    .get('/')
    .expect(404)
})
