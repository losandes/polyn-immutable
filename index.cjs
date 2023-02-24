const blueprint = require('@polyn/blueprint')
const immutable = require('./src/immutable').factory(blueprint)

module.exports = Object.freeze({
  ...immutable,
})
