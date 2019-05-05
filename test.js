const { expect } = require('chai')
const { blueprint } = require('@polyn/blueprint')
const { immutable } = require('./index.js')
const suite = require('supposed')
  .Suite({ assertionLibrary: expect })

suite.sut = { immutable, blueprint }
console.log('TEST', suite.sut)
suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i
}).run()
