const Validator = require('../lib/validator')
const Model = require('../lib/model')
const i18n = require('./i18n')

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

const jv = new Validator()

jv.addSchema(schema, 'device')

test('template', () => {
  expect(Validator.i18nTemplate.required).toEqual('required')
})

test('parse error', () => {
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
  err = Validator.parseError(new Error('abc'))
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
