const Ajv = require('ajv')
const { expect } = require('chai')
const supposed = require('supposed')
const blueprint = require('@polyn/blueprint')
const immutable = require('@polyn/immutable')

const suite = supposed.Suite({
  name: '@polyn/immutable (cjs)',
  assertionLibrary: expect,
  inject: { ...blueprint, ...immutable, ...{ Ajv } },
})

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
}).run()
