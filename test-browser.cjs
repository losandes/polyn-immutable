const test = require('./test-browser-server.cjs')

test().then((context) => {
  context.server.close()
  process.exit(context.lastEvent.totals.failed)
})
