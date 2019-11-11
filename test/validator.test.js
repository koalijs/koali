const I18n = require('i18n-2')
const Validator = require('../lib/validator')
const Model = require('../lib/model')

const schema = {
  type: 'object',
  required: ['app'],
  properties: {
    email: { type: 'string', minLength: 1, maxLength: 7, format: 'email' },
    num: { type: 'integer', minimum: 5 },
    sub: {
      type: 'object',
      required: ['maxAge', 'req'],
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
    maxAge: 'ok',
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
  extension: '.json',
  indent: 2,
  directory: require('path').join(__dirname, 'locales/')
})
const jv = new Validator()

jv.addSchema(schema, 'device')

test('json schema i18n error message', () => {
  let validate = jv.getSchema('device')
  let valid = validate(correctData)
  expect(valid).toBeTruthy()
  valid = validate(data)
  expect(valid).toBeFalsy()
  let err = Validator.parseError(new Validator.ValidationError(validate.errors), {
    dataPath: 'device',
    i18n
  })
  expectMessage(err.message)
  err = Validator.parseError(new Validator.ValidationError(validate.errors))
  expect(err.message).toMatch(/^App\sis/)
  err = Validator.parseError(new Validator.ValidationError(validate.errors), { dataPath: 'device' })
  expect(err.message).toMatch(/^Device\sapp\sis/)
  err = null
  try {
    Device.fromJson(data)
  } catch (e) {
    err = Validator.parseError(e, { i18n })
  }
  expectMessage(err.message)
})

function expectMessage(msg) {
  expect(msg).toMatch('Device sub max age 必填')
  expect(msg).toMatch('设备APP 必填')
  expect(msg).toMatch('格式必须是邮箱')
}

//test('json schema koa middleware', async () => {
//  await expect(
//    jv.koa('dd')({ method: 'get', request: { query: data } }, function() {})
//  ).rejects.toThrow('no schema')
//  await expect(
//    jv.koa('device')({ method: 'get', request: { query: data } }, function() {})
//  ).rejects.toThrow('device app is a required property')
//  await expect(
//    jv.koa('device')({ method: 'get', i18n, request: { query: data } }, function() {})
//  ).rejects.toThrow('设备APP: 必填')
//  await expect(
//    jv.koa('device')({ method: 'get', i18n, request: { query: correctData } }, function() {})
//  ).resolves.toBeUndefined()
//  await expect(
//    Validator.koaI18nModelValidationError()({ i18n }, function() {
//      Device.fromJson(data)
//    })
//  ).rejects.toThrow('设备APP: 必填')
//})
