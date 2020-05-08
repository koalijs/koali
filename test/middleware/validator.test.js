const i18n = require('../i18n')
const validator = require('../../lib/middleware/validator')

const schema = {
  type: 'object',
  required: ['app'],
  properties: {
    email: { type: 'string', minLength: 1, maxLength: 7, format: 'email' },
    num: { type: 'integer' },
  },
}
const schemaWithId = Object.assign({ $id: 'device' }, schema)

const asyncSchema = {
  type: 'object',
  $async: true,
  required: ['app'],
  properties: {
    email: { type: 'string', minLength: 1, maxLength: 8, format: 'email' },
    num: { type: 'integer' },
  },
}

const ctx = { request: { body: { email: 'xxxxxxxxxxxxxx' } } }
const validCtx = { request: { body: { app: 'ok', email: 'a@b.co' } } }
const next = async function () {}

test('invalid options', async () => {
  await expect(() => {
    validator()
  }).toThrow('schema required')

  await expect(() => {
    validator({ schema: 'id' })
  }).toThrow('no schema')

  await expect(() => {
    validator({ schemas: [schema], schema: 'id' })
  }).toThrow('no schema')
})

test('schema', async () => {
  await expect(validator(schema)(ctx, next)).rejects.toThrow('App is a required property')

  await expect(validator({ schemas: [schemaWithId], schema: 'device' })(ctx, next)).rejects.toThrow(
    'Device app is a required property'
  )

  await expect(validator({ schema: schema })(ctx, next)).rejects.toThrow(
    'App is a required property'
  )

  await expect(validator({ schema: schemaWithId })(ctx, next)).rejects.toThrow(
    'Device app is a required property'
  )

  await expect(
    validator({ schema: schemaWithId })(validCtx, function () {
      throw new Error('other error')
    })
  ).rejects.toThrow('other error')

  await expect(validator({ schema: schema })(validCtx, next)).resolves.toBeUndefined()
})

test('async', async () => {
  await expect(validator({ schema: asyncSchema })(validCtx, next)).resolves.toBeUndefined()

  await expect(validator({ schema: asyncSchema })(ctx, next)).rejects.toThrow(
    'App is a required property'
  )
})

test('i18n', async () => {
  await expect(
    validator({ schema: schemaWithId })(Object.assign({ i18n }, ctx), next)
  ).rejects.toThrow('设备APP 必填')
})

test('target', async () => {
  await expect(validator({ schema: schema, target: false })(ctx, next)).resolves.toBeUndefined()
  let curCtx = Object.assign({}, ctx)
  await expect(
    validator({ schema: schema, target: false })(curCtx, async () => {
      await ctx.validate({})
    })
  ).rejects.toThrow('App is a required property')
})

test('data path', async () => {
  await expect(validator({ schema: schemaWithId, dataPath: 'user' })(ctx, next)).rejects.toThrow(
    'User app is a required property'
  )

  await expect(
    validator({ schemas: [schemaWithId], schema: 'device', dataPath: 'user' })(ctx, next)
  ).rejects.toThrow('User app is a required property')
})

test('uncaught error', async () => {
  await expect(
    validator({
      keywords: {
        range: {
          type: 'number',
          validate: function vvv() {
            throw new Error('uncaught')
          },
          errors: true,
        },
      },
      schema: {
        type: 'object',
        properties: {
          num: { range: [1, 10] },
        },
      },
    })({ request: { body: { num: 5 } } }, next)
  ).rejects.toThrow('uncaught')
})
