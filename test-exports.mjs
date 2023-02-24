import Ajv from 'ajv'
import { expect } from 'chai'
import supposed from 'supposed'
import blueprint from '@polyn/blueprint'
import {
  immutable,
  PolynImmutable,
  array,
} from '@polyn/immutable'

const suite = supposed.Suite({
  name: '@polyn/immutable (mjs exports)',
  assertionLibrary: expect,
  inject: {
    ...blueprint,
    ...{
      immutable,
      PolynImmutable,
      array,
    },
    ...{ Ajv },
  },
})

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
}).run()
