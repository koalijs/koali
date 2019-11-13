const I18n = require('i18n-2')

module.exports = new I18n({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  extension: '.json',
  indent: 2,
  directory: require('path').join(__dirname, 'app/config/locales/')
})
