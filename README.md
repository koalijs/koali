[![Build Status](https://travis-ci.org/koalijs/koali.svg?branch=master)](https://travis-ci.org/koalijs/koali)

Koali
=======================

An koa-based Node.js web application.

Usage

```javascript

const Koali = require('koali')
const app = new Koali({
  baseDir: __dirname
})

app.use(Koali.router(require('path').join(__dirname, 'routes')).routes())

app.listen(3000)

```
