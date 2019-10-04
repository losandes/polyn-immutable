const { expect } = require('chai')
const blueprint = require('@polyn/blueprint')
const immutable = require('./index.js')
const Ajv = require('ajv')

const suite = require('supposed')
  .Suite({
    assertionLibrary: expect,
    inject: { ...blueprint, ...immutable, ...{ Ajv } }
  })

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i
}).run()
