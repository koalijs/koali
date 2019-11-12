const i18n = require('../config/i18n')
const onModelError = require('../../lib/middleware/on-model-error')()
const Model = require('../../lib/model')

class Device extends Model {
  static get jsonSchema() {
    return schema
  }
}
const schema = {
  type: 'object',
  required: ['app'],
  properties: {
    email: { type: 'string', minLength: 1, maxLength: 7, format: 'email' },
    num: { type: 'integer' }
  }
}

const data = { email: 'xxxxxxxxxxxxxx' }
const validData = { app: 'ok', email: 'a@b.co' }

test('validation error', async () => {
  await expect(
    onModelError({}, async () => {
      Device.fromJson(data)
    })
  ).rejects.toThrow('Device app is a required property')

  await expect(
    onModelError({ i18n }, async () => {
      Device.fromJson(data)
    })
  ).rejects.toThrow('设备APP 必填')

  await expect(
    onModelError({}, async () => {
      Device.fromJson(validData)
    })
  ).resolves.toBeUndefined()

  await expect(
    onModelError({}, async () => {
      throw new Error('other error')
    })
  ).rejects.toThrow('other error')

  await expect(
    onModelError({}, async () => {
      throw new Model.ValidationError({ message: 'other error' })
    })
  ).rejects.toThrow('other error')
})
