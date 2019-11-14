const koali = (module.exports = require('./lib/application'))
koali.Model = require('./lib/model')
koali.router = require('./lib/router')
koali.validator = require('./lib/middleware/validator')
