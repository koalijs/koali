const Model = require('../lib/model')

class User extends Model {}

class UserOrder extends Model {}

test('table name', () => {
  expect(User.tableName).toBe('users')
  expect(UserOrder.tableName).toBe('user_orders')
})
