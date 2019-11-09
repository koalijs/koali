const I18n = require('../lib/i18n.js')
const JSONSchema = require('../lib/json-schema.js')
const Model = require('../lib/model')

const schema = {
  type: 'object',
  required: ['app'],
  properties: {
    email: { type: 'string', minLength: 1, maxLength: 7, format: 'email' },
    num: { type: 'integer', minimum: 5 },
    sub: {
      type: 'object',
      required: ['pro', 'req'],
      properties: {
        str: { type: 'string', minLength: 1, maxLength: 5 }
      }
    }
  }
}

const data = {
  email: 'test.gmail.com',
  num: 2,
  sub: {
    str: 'abcedff'
  }
}

const correctData = {
  email: 'a@b.co',
  num: 7,
  app: 'app',
  sub: {
    pro: 'ok',
    req: 'ok',
    str: 'abc'
  }
}

class Device extends Model {
  static get tableName() {
    return 'devices'
  }

  static get jsonSchema() {
    return schema
  }

  static get jsonSchemaName() {
    return 'device'
  }
}

const i18n = new I18n({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  directory: require('path').join(__dirname, 'locales/')
})
const jv = new JSONSchema()

jv.addSchema(schema, 'device')

test('json schema i18n error message', () => {
  let validate = jv.getSchema('device')
  let valid = validate(correctData)
  expect(valid).toBeTruthy()
  valid = validate(data)
  expect(valid).toBeFalsy()
  let msg = JSONSchema.i18nErrorMessage(validate.errors, { root: 'device', i18n })
  expectMessage(msg)
  msg = JSONSchema.i18nErrorMessage(validate.errors)
  expect(msg).toMatch(/^app\sis/)
  msg = JSONSchema.i18nErrorMessage(validate.errors, { root: 'device' })
  expect(msg).toMatch(/^device\sapp\sis/)
  msg = null
  try {
    Device.fromJson(data)
  } catch (err) {
    msg = JSONSchema.i18nErrorMessage(err.data, { root: err.schemaName, i18n })
  }
  expectMessage(msg)
})

function expectMessage(msg) {
  expect(msg).toMatch('device sub pro: 必填')
  expect(msg).toMatch('设备APP: 必填')
  expect(msg).toMatch('格式必须是邮箱')
}

test('json schema koa middleware', async () => {
  await expect(
    jv.koa('dd')({ method: 'get', request: { query: data } }, function() {})
  ).rejects.toThrow('no schema')
  await expect(
    jv.koa('device')({ method: 'get', request: { query: data } }, function() {})
  ).rejects.toThrow('device app is a required property')
  await expect(
    jv.koa('device')({ method: 'get', i18n, request: { query: data } }, function() {})
  ).rejects.toThrow('设备APP: 必填')
  await expect(
    jv.koa('device')({ method: 'get', i18n, request: { query: correctData } }, function() {})
  ).resolves.toBeUndefined()
  await expect(
    JSONSchema.koaI18nModelValidationError()({ i18n }, function() {
      Device.fromJson(data)
    })
  ).rejects.toThrow('设备APP: 必填')
})
