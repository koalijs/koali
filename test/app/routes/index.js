module.exports = router => {
  router.get('/', async ctx => {
    ctx.body = 'Hello world'
  })
}
