require('./test-browser-server').then((context) => {
  context.server.close()
  process.exit(context.lastEvent.totals.failed)
})
