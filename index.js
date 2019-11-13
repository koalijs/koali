const koali = (module.exports = require('./lib/application'))
koali.Model = require('./lib/model')
koali.validator = require('./lib/middleware/validator')
