const Model = require('../lib/model')
const makeKnex = require('knex')

let knex
beforeAll(async () => {
  knex = makeKnex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: ':memory:', //"./mydb.sqlite"
    },
  })

  Model.knex(knex)

  await knex.schema
    .createTable('users', function (table) {
      table.increments('id').unsigned().primary()
      table.string('name').notNullable()
      table.string('password')
      table.bool('tall')
      table.bool('male')
      table.integer('age').defaultTo(1)
      table.timestamps(true, true)
    })
    .createTable('user_orders', function (table) {
      table.increments('id').unsigned().primary()
      table.integer('user_id').notNullable()
      table.string('title')
      table.timestamps(true, true)
      table.foreign('user_id', 'user').references('id').inTable('users')
    })
    .createTable('user_messages', function (table) {
      table.increments('id').unsigned().primary()
      table.integer('user_id').notNullable()
      table.string('msg')
      table.timestamps(true, true)
      table.foreign('user_id', 'user').references('id').inTable('users')
    })
})

afterAll(() => {
  knex.destroy()
})

class User extends Model {}

class UserOrder extends Model {
  static get timestamps() {
    return true
  }
}

class UserMessage extends Model {
  static get timestamps() {
    return { create: false, update: 'updated_at' }
  }

  static tableMetadata() {
    return null
  }
}

test('table name', () => {
  expect(User.tableName).toBe('users')
  expect(UserOrder.tableName).toBe('user_orders')
})

test('upsert', async () => {
  //clean
  let name = 'upsert'
  let user = await User.query().findOne({ name })
  expect(user).toBeFalsy()

  //insert
  let res = await User.query().where({ name }).upsert({ name, password: 'pass' })
  expect(res.password).toEqual('pass')
  expect(res.age).toBeUndefined()

  user = await User.query().findOne({ name })
  expect(user.age).toEqual(1)
  expect(user).toBeTruthy()
  expect(user.password).toEqual('pass')

  //update
  res = await User.query().where({ name }).upsert({ name, password: 'pass1' })
  expect(res).toEqual(1)
  user = await User.query().findOne({ name })
  expect(user.password).toEqual('pass1')
  await user.$query().delete()
  user = await User.query().findOne({ name })
  expect(user).toBeFalsy()
})

test('upsert and fetch', async () => {
  //clean
  let name = 'upsert-and-fetch'
  let user = await User.query().findOne({ name })
  expect(user).toBeFalsy()

  user = await User.query().where({ name }).upsertAndFetch({ name, password: 'pass' })

  expect(user).toBeTruthy()
  expect(user.password).toEqual('pass')

  user = await User.query().where({ name }).upsertAndFetch({ name, password: 'pass1' })
  expect(user.password).toEqual('pass1')
  await user.$query().delete()
  user = await User.query().findOne({ name })
  expect(user).toBeFalsy()
})

test('timestamps', async () => {
  let user = await User.query().insert({ name: 'name', password: 'pass' })
  //Default
  expect(user.created_at).toBeUndefined()
  expect(user.updated_at).toBeUndefined()

  user = await User.query().findById(user.id)
  expect(user.updated_at).toBeTruthy()

  let newUser = await user.$query().patchAndFetch({ name: 'n2' })

  expect(newUser.updated_at).toEqual(user.updated_at)

  let order = await UserOrder.query().insert({ title: 'tt', user_id: user.id })

  expect(order.created_at).toBeTruthy()
  expect(order.updated_at).toBeTruthy()

  order = await UserOrder.query().findById(order.id)

  await new Promise((res) => {
    setTimeout(res, 100)
  })

  let newOrder = await UserOrder.query().patchAndFetchById(order.id, { title: 't2' })

  expect(newOrder.updated_at).not.toEqual(order.updated_at)
  expect(newOrder.created_at).toEqual(order.created_at)

  let msg = await UserMessage.query().insert({ msg: 'tt', user_id: user.id })
  expect(msg.created_at).toBeUndefined()
  expect(msg.updated_at).toBeTruthy()
})

test('table metadata', async () => {
  expect(User.tableMetadata()).toBeNull()
  let data = await User.fetchTableMetadata()
  expect(data.columns).toContain('id')
  expect(data.columnInfo).toHaveProperty('id')
  data = await User.tableMetadata()
  expect(data.columnInfo).toHaveProperty('name')

  data = await User.fetchTableMetadata()
  expect(data.columnInfo).toHaveProperty('name')

  data = await User.fetchTableMetadata({ force: true, knex: knex, table: 'users' })
  expect(data.columnInfo).toHaveProperty('name')
  data = await User.fetchTableMetadata({ force: true, parentBuilder: User.query() })
  expect(data.columnInfo).toHaveProperty('name')

  data = await UserMessage.fetchTableMetadata()
  expect(data.columnInfo).toHaveProperty('msg')
  data = await UserMessage.fetchTableMetadata()
  expect(data.columnInfo).toHaveProperty('msg')
})

test('json schema', async () => {
  const { jsonSchemaFromMetadata } = require('../lib/model-json-schema')
  let data = await User.fetchTableMetadata()
  let schema = jsonSchemaFromMetadata(User, data)
  expect(schema.type).toEqual('object')
  expect(schema.properties).toHaveProperty('name')
  expect(schema.properties).toHaveProperty('created_at')
  expect(schema.properties.name).toHaveProperty('type', 'string')
  expect(schema.properties.password.type).toEqual(['string', 'null'])
  expect(schema.properties.tall.type).toEqual(['integer', 'boolean', 'null'])
  expect(schema.properties.male.type).toEqual(['integer', 'boolean', 'null'])

  schema = jsonSchemaFromMetadata(User, data, null, { ignore: ['created_at'] })
  expect(schema.properties).not.toHaveProperty('created_at')

  schema = jsonSchemaFromMetadata(
    User,
    data,
    { properties: { birthday: {} } },
    { ignore: ['created_at'] }
  )
  expect(schema.properties).toHaveProperty('birthday')

  /* eslint require-atomic-updates: off */
  User.idColumn = ['id', 'name']
  schema = jsonSchemaFromMetadata(User, data)
  expect(schema.properties).not.toHaveProperty('name')
  User.idColumn = 'id'

  schema = jsonSchemaFromMetadata(User, null, null)
  expect(schema).toBeNull()

  schema = jsonSchemaFromMetadata(User, {}, null)
  expect(schema).toBeNull()

  schema = User.jsonSchemaFromMetadata()
  expect(schema.properties).toHaveProperty('name')
})
