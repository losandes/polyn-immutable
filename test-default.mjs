import Ajv from 'ajv'
import { expect } from 'chai'
import supposed from 'supposed'
import blueprint from '@polyn/blueprint'
import immutable from '@polyn/immutable'

const suite = supposed.Suite({
  name: '@polyn/immutable (mjs default)',
  assertionLibrary: expect,
  inject: { ...blueprint, ...immutable, ...{ Ajv } },
})

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
}).run()
