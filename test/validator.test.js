const Validator = require('../lib/validator')
const Model = require('../lib/model')
const i18n = require('./i18n')

const schema = {
  type: 'object',
  required: ['app'],
  properties: {
    email: { type: 'string', maxLength: 7, format: 'email' },
    num: { type: 'integer', minimum: 5 },
    str: { type: 'string', minLength: 5 },
    number: { type: 'integer', minimum: 5 },
    ar: { type: 'array', uniqueItems: true },
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
  str: 'xxx',
  number: 'xxxx',
  ar: [1, 1, 1],
  sub: {
    str: 'abcedff'
  }
}

const correctData = {
  email: 'a@b.co',
  num: 7,
  app: 'app',
  str: 'xxxxxxxx',
  number: 5,
  ar: [1, 2, 3],
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

test('keyword', () => {
  Validator.i18nTemplate.range = 'should in [%(min)s, %(max)s]'

  const jv = new Validator({
    keywords: {
      range: {
        type: 'number',
        validate: function vvv(schema, data) {
          vvv.errors = [
            {
              keyword: 'range',
              message: `should between ${schema[0]} to ${schema[1]}`,
              params: {
                min: schema[0],
                max: schema[1]
              }
            }
          ]
          return data > schema[0] && data < schema[1]
        },
        errors: true
      }
    }
  })
  let validate = jv.compile({
    type: 'object',
    properties: {
      num: { range: [1, 10] },
      num1: { range: [1, 10] }
    }
  })
  validate({ num: 11, num1: 12 })
  let err = Validator.parseError(new Validator.ValidationError(validate.errors), { i18n })
  expect(err.message).toMatch('should in [1, 10]')
})
