const Ajv = require('ajv')

module.exports = (test) => {
  const { immutable, Immutable, blueprint, registerValidator } = test.sut

  // PREP ======================================================================
  const types = () => {
    return {
      requiredString: 'string',
      optionalString: 'string?',
      maybeNullString: 'string?',
      maybeUndefinedString: 'string?',
      date: 'date',
      regex: 'regexp',
      bool: 'boolean',
      num: 'number',
      decimal: 'decimal',
      func: 'function',
      arr: 'number[]',
      objArr: 'any[]'
    }
  }

  const oneValues = () => {
    return {
      requiredString: 'one',
      optionalString: 'one',
      maybeNullString: 'one',
      maybeUndefinedString: 'one',
      date: new Date('2019-05-04T00:00:00.000Z'),
      regex: /[A-Z]/g,
      bool: false,
      num: 1,
      decimal: 1.10,
      func: () => 1,
      arr: [1, 2, 3],
      objArr: [{ one: 1 }, { two: 2 }, { three: 3 }]
    }
  }

  const twoValues = () => {
    return {
      requiredString: 'two',
      optionalString: 'two',
      maybeNullString: null,
      maybeUndefinedString: undefined,
      date: new Date('2019-05-05T00:00:00.000Z'),
      regex: /[1-9]/g,
      bool: true,
      num: 2,
      decimal: 2.20,
      func: () => 2,
      arr: [4, 5, 6],
      objArr: [{ four: 4 }, { five: 5 }, { six: 6 }]
    }
  }

  const makeModel = () => {
    const model = types()
    model.grandParent = types()
    model.grandParent.parent = types()
    model.grandParent.parent.child = types()

    return model
  }

  const makeOne = () => {
    const one = oneValues()
    one.grandParent = oneValues()
    one.grandParent.parent = oneValues()
    one.grandParent.parent.child = oneValues()

    return one
  }

  const makeTwo = () => {
    const two = twoValues()
    two.grandParent = twoValues()
    two.grandParent.parent = twoValues()
    two.grandParent.parent.child = twoValues()

    return two
  }

  // TEST ======================================================================
  return test('given `immutable`', {
    'when an immutable is constructed with valid input': {
      when: () => {
        const Sut = immutable('Constructor', makeModel())
        const expected = makeOne()
        const actual = new Sut(expected)

        return { expected, actual, Sut }
      },
      'it should return the value': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        expect(actual).to.deep.equal(expected)
      },
      'it should return a class that supports `instanceof`': (expect) => (err, when) => {
        expect(err).to.be.null
        const { actual, Sut } = when

        expect(actual instanceof Sut).to.equal(true)
      },
      'it should freeze the primitives, recursively (strict mode)': (expect) => (err, when) => {
        'use strict'
        expect(err).to.be.null
        const { actual } = when

        expect(() => { actual.requiredString = 'primitive-test' })
          .to.throw(TypeError, 'Cannot assign to read only property')
        expect(() => { actual.grandParent.requiredString = 'primitive-test' })
          .to.throw(TypeError, 'Cannot assign to read only property')
        expect(() => { actual.grandParent.parent.requiredString = 'primitive-test' })
          .to.throw(TypeError, 'Cannot assign to read only property')
        expect(() => { actual.grandParent.parent.child.requiredString = 'primitive-test' })
          .to.throw(TypeError, 'Cannot assign to read only property')
      },
      '// it should include the blueprint name in the TypeError (strict mode)': (expect) => (err, when) => {
        'use strict'

        expect(err).to.be.null
        const { actual } = when

        expect(() => { actual.requiredString = 'primitive-test' })
          .to.throw(TypeError, '#<Sut>')

        expect(() => { actual.grandParent.requiredString = 'primitive-test' })
          .to.throw(TypeError, '#<Sut>')
      },
      'it should freeze the primitives, recursively': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        actual.requiredString = 'primitive-test'
        expect(actual.requiredString).to.equal(expected.requiredString)

        actual.grandParent.requiredString = 'primitive-test'
        expect(actual.grandParent.requiredString).to.equal(expected.grandParent.requiredString)

        actual.grandParent.parent.requiredString = 'primitive-test'
        expect(actual.grandParent.parent.requiredString).to.equal(expected.grandParent.parent.requiredString)

        actual.grandParent.parent.child.requiredString = 'primitive-test'
        expect(actual.grandParent.parent.child.requiredString).to.equal(expected.grandParent.parent.child.requiredString)
      },
      'it should freeze the functions': (expect) => (err, when) => {
        expect(err).to.be.null
        const { actual } = when

        actual.func = () => 2
        expect(actual.func()).to.equal(1)

        actual.grandParent.func = () => 2
        expect(actual.grandParent.func()).to.equal(1)

        actual.grandParent.parent.func = () => 2
        expect(actual.grandParent.parent.func()).to.equal(1)

        actual.grandParent.parent.child.func = () => 2
        expect(actual.grandParent.parent.child.func()).to.equal(1)
      },
      'it should freeze function references': (expect) => {
        let func = () => 1
        const Immutable = immutable('functionReference', {
          func: 'function'
        })
        const actual = new Immutable({ func })
        expect(actual.func()).to.equal(1)
        func = () => 2
        expect(actual.func()).to.equal(1)
      },
      'it should freeze function references (strict mode doesn\'t throw)': (expect) => {
        'use strict'
        let func = () => 1
        const Immutable = immutable('functionReference', {
          func: 'function'
        })
        const actual = new Immutable({ func })
        expect(actual.func()).to.equal(1)
        func = () => 2
        expect(actual.func()).to.equal(1)
      },
      'it should freeze the objects': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        actual.grandParent = { foo: 'bar' }
        expect(actual.grandParent.requiredString).to.equal(expected.grandParent.requiredString)

        actual.grandParent.parent = { foo: 'bar' }
        expect(actual.grandParent.parent.requiredString).to.equal(expected.grandParent.parent.requiredString)

        actual.grandParent.parent.child = { foo: 'bar' }
        expect(actual.grandParent.parent.child.requiredString).to.equal(expected.grandParent.parent.child.requiredString)
      },
      'it should freeze the arrays': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        actual.arr = [3, 4, 5]
        expect(actual.arr).to.deep.equal(expected.arr)

        actual.grandParent.arr = [3, 4, 5]
        expect(actual.grandParent.arr).to.deep.equal(expected.grandParent.arr)

        actual.grandParent.parent.arr = [3, 4, 5]
        expect(actual.grandParent.parent.arr).to.deep.equal(expected.grandParent.parent.arr)

        actual.grandParent.parent.child.arr = [3, 4, 5]
        expect(actual.grandParent.parent.child.arr).to.deep.equal(expected.grandParent.parent.child.arr)
      },
      'it should freeze the values inside the arrays': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        actual.objArr[0].one = 2
        expect(actual.objArr).to.deep.equal(expected.objArr)

        actual.grandParent.objArr[0].one = 2
        expect(actual.grandParent.objArr).to.deep.equal(expected.grandParent.objArr)

        actual.grandParent.parent.objArr[0].one = 2
        expect(actual.grandParent.parent.objArr).to.deep.equal(expected.grandParent.parent.objArr)

        actual.grandParent.parent.child.objArr[0].one = 2
        expect(actual.grandParent.parent.child.objArr).to.deep.equal(expected.grandParent.parent.child.objArr)
      },
      'it should NOT allow to mutate array contents': (expect) => (err, when) => {
        expect(err).to.be.null
        const { actual } = when

        expect(() => actual.arr.push(4)).to.throw(TypeError, 'Cannot add property')
        expect(() => actual.arr.pop()).to.throw(TypeError, 'Cannot delete property')
        expect(() => actual.arr.splice(1, 1)).to.throw(TypeError, 'Cannot add/remove sealed array elements')
        expect(() => actual.arr.shift()).to.throw(TypeError, 'Cannot add/remove sealed array elements')
        expect(() => actual.arr.unshift()).to.throw(TypeError, 'Cannot assign to read only property')
        expect(() => actual.arr.sort()).to.throw(TypeError, 'Cannot assign to read only property')
        expect(() => actual.arr.reverse()).to.throw(TypeError, 'Cannot assign to read only property')
      },
      'it should not allow property deletion': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        delete actual.requiredString
        expect(actual).to.deep.equal(expected)
      },
      'it should not allow property deletion (strict mode)': (expect) => (err, when) => {
        'use strict'
        expect(err).to.be.null
        const { actual } = when

        expect(() => { delete actual.requiredString }).to.throw(TypeError, 'Cannot delete property')
      }
    }, // constructed with valid input
    'when an immutable is constructed with invalid input': {
      when: () => {
        const Sut = immutable('invalidInputTest', {
          requiredString: 'string',
          optionalString: 'string?'
        })

        return new Sut({
          requiredString: null,
          optionalString: 1
        })
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('Invalid invalidInputTest: expected `requiredString` {null} to be {string}, expected `optionalString` {number} to be {string}')
      }
    }, // invalid input
    'when an immutable is constructed with null input': {
      when: () => {
        const Sut = immutable('nullInputTest', {
          requiredString: 'string',
          optionalString: 'string?'
        })

        return new Sut(null)
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('Invalid nullInputTest: expected `requiredString` {null} to be {string}')
      }
    }, // null input
    'when an immutable is constructed with a valid null value in the input': {
      when: () => {
        const Sut = immutable('nullInputTest', {
          requiredString: 'string',
          optionalObj: 'object?'
        })
        const expected = {
          requiredString: 'one',
          optionalObj: null
        }
        const actual = new Sut(expected)

        return { expected, actual }
      },
      'it should return the value': (expect) => (err, context) => {
        expect(err).to.be.null
        const { expected, actual } = context

        expect(actual).to.deep.equal(expected)
      }
    }, // null value in input
    'when an immutable is constructed with an invalid name': {
      when: () => {
        const Sut = immutable(null, {
          requiredString: 'string',
          optionalString: 'string?'
        })

        return new Sut({
          requiredString: null,
          optionalString: 1
        })
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('blueprint requires a name {string}, and a schema {object}')
      }
    }, // ctor invalid name
    'when an immutable is constructed with an existing blueprint': {
      when: () => {
        const Sut = immutable(blueprint('ConstructedWithBlueprint', {
          str: 'string'
        }))
        const expected = {
          str: 'hello'
        }
        const actual = new Sut(expected)

        return { Sut, expected, actual }
      },
      'it should return the value': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        expect(actual).to.deep.equal(expected)
      }
    }, // ctor existing blueprint
    'when an immutable is constructed with an invalid blueprint': {
      'it should throw': (expect) => {
        expect(() => { immutable('name', null) })
          .to.throw('blueprint requires a name {string}, and a schema {object}')
      }
    }, // ctor invalid blueprint
    'when an immutable is constructed without a name': {
      'it should throw': (expect) => {
        expect(() => { immutable(null, { str: 'string' }) })
          .to.throw(`blueprint requires a name {string}, and a schema {object}`)
      }
    }, // ctor without name
    'when an immutable is constructed with a validator that intercepts values': {
      when: () => {
        registerValidator('productTypeWithDefault', ({ value }) => {
          if (/^book|magazine$/.test(value)) {
            return { value }
          }

          return { value: 'product' }
        })
        const Product = immutable('Product', {
          type1: 'productTypeWithDefault',
          type2: 'productTypeWithDefault'
        })
        return new Product({
          type2: 'movie'
        })
      },
      'it should use the intercepted values': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.type1).to.equal('product')
        expect(actual.type2).to.equal('product')
      }
    }, // value interception
    'when an immutable is patched': {
      when: () => {
        const Sut = immutable('PatchTest', makeModel())
        const expectedOriginal = makeOne()
        const actualOriginal = new Sut(expectedOriginal)
        const expected = makeTwo()
        const actual = actualOriginal.patch(expected)

        return { expectedOriginal, actualOriginal, expected, actual, Sut }
      },
      'it should only patch the values that are given': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        expect(actual).to.deep.equal(expected)
      },
      'it should return a class that supports `instanceof`': (expect) => (err, when) => {
        expect(err).to.be.null
        const { actual, Sut } = when

        expect(actual instanceof Sut).to.equal(true)
      },
      'it should not mutate the original object': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expectedOriginal, actualOriginal } = when

        expect(actualOriginal).to.deep.equal(expectedOriginal)
      }
    }, // patch
    'when `toObject` is called': {
      when: () => {
        const Sut = immutable('ToObjectTest', makeModel())
        const expected = makeOne()
        const sut = new Sut(expected)

        return { expected, sut }
      },
      'it should return all of the values': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, sut } = when

        expect(sut.toObject()).to.deep.equal(expected)
      },
      'the values should be writable': (expect) => (err, when) => {
        'use strict'
        expect(err).to.be.null
        const { sut } = when
        const actual = sut.toObject()
        const expected = makeTwo()

        Object.keys(expected).forEach((key) => {
          if (key === 'grandParent') return

          actual[key] = expected[key]
        })

        Object.keys(expected.grandParent).forEach((key) => {
          if (key === 'parent') return

          actual.grandParent[key] = expected.grandParent[key]
        })

        Object.keys(expected.grandParent.parent).forEach((key) => {
          if (key === 'child') return

          actual.grandParent.parent[key] = expected.grandParent.parent[key]
        })

        Object.keys(expected.grandParent.parent.child).forEach((key) => {
          actual.grandParent.parent.child[key] = expected.grandParent.parent.child[key]
        })

        expect(actual).to.deep.equal(expected)
        expect(actual.func()).to.equal(2)
        expect(actual.grandParent.func()).to.equal(2)
        expect(actual.grandParent.parent.func()).to.equal(2)
        expect(actual.grandParent.parent.child.func()).to.equal(2)
      }
    }, // toObject
    'prototype functions should not show up as Object.keys': (expect) => {
      const Sut = immutable('prototypeKeys', { str: 'string', child: { str: 'string' } })
      const sut = new Sut({ str: 'foo', child: { str: 'foo' } })
      const parentKeys = Object.keys(sut)
      const childKeys = Object.keys(sut.child)

      expect(parentKeys.includes('patch')).to.equal(false)
      expect(parentKeys.includes('toObject')).to.equal(false)
      expect(parentKeys.indexOf('patch')).to.equal(-1)
      expect(parentKeys.indexOf('toObject')).to.equal(-1)

      expect(childKeys.includes('patch')).to.equal(false)
      expect(childKeys.includes('toObject')).to.equal(false)
      expect(childKeys.indexOf('patch')).to.equal(-1)
      expect(childKeys.indexOf('toObject')).to.equal(-1)
    },
    'when a new `Immutable` is constructed': {
      'it should let you set the Validator': (expect) => {
        const expected = {
          name: 'NewImmutable:Validator',
          schema: { str: 'string' },
          input: { str: 'foo' }
        }
        let actual = {}

        function Validator (name, schema) {
          actual.name = name
          actual.schema = schema

          return {
            validate: (input) => {
              actual.input = input
              return true
            }
          }
        }
        const immutable = new Immutable({ Validator })
        const Sut = immutable(expected.name, expected.schema)
        const sut = new Sut(expected.input)

        expect(actual.name).to.equal(expected.name)
        expect(actual.schema).to.deep.equal(expected.schema)
        expect(actual.input).to.deep.equal(expected.input)
      },
      'it should support using JSON Schema': (expect) => {
        const expected = {
          name: 'NewImmutable:JSONSchema',
          schema: {
            $id: 'https://example.com/person.schema.json',
            $schema: 'http://json-schema.org/schema#',
            title: 'Person',
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
                description: 'The person\'s first name.'
              },
              lastName: {
                type: 'string',
                description: 'The person\'s last name.'
              },
              age: {
                description: 'Age in years which must be equal to or greater than zero.',
                type: 'integer',
                minimum: 0
              }
            }
          },
          validInput: {
            firstName: 'John',
            lastName: 'Doe',
            age: 21
          },
          invalidInput: {
            firstName: 1,
            lastName: 2,
            age: -1
          }
        }

        function Validator (name, schema) {
          const makeErrorText = (errors) => {
            return errors
              .map((error) => `${name}${error.dataPath} ${error.message}`)
              .join(', ')
          }
          return {
            validate: (input) => {
              const ajv = new Ajv({ allErrors: true })
              const isValid = ajv.validate(schema, input)

              if (!isValid) {
                throw new Error(`Invalid ${name}: ${makeErrorText(ajv.errors)}`)
              }
            }
          }
        }
        const immutable = new Immutable({ Validator })
        const Sut = immutable(expected.name, expected.schema)
        const actualValid = new Sut(expected.validInput)
        const actualInvalid = () => new Sut(expected.invalidInput)

        expect(actualValid).to.deep.equal(expected.validInput)
        expect(actualInvalid).to.throw(Error, 'Invalid NewImmutable:JSONSchema: NewImmutable:JSONSchema.firstName should be string, NewImmutable:JSONSchema.lastName should be string, NewImmutable:JSONSchema.age should be >= 0')
      }
    }, // setValidator
    '// benchmark': {
      when: () => {
        const times = 1000

        const objStart = new Date().getTime()

        for (let i = 0; i < times; i += 1) {
          makeOne()
        }

        const objEnd = new Date().getTime()

        const immutableStart = new Date().getTime()
        const Sut = immutable('benchmark', makeModel())
        const val = makeOne()

        for (let i = 0; i < times; i += 1) {
          let one = new Sut(val)
        }

        const immutableEnd = new Date().getTime()

        return {
          objDuration: objEnd - objStart,
          immutableDuration: immutableEnd - immutableStart
        }
      },
      'compared to regular objects (note ~1/2+ the time is validation)': (expect) => (err, results) => {
        expect(err).to.be.null

        console.log(`Duration for creating objects (ms): ${results.objDuration}`)
        console.log(`Duration for creating immutables (ms): ${results.immutableDuration}`)
      }
    },
    'documentation': {
      '// usage': () => {
        // const { immutable } = require('@polyn/immutable')

        const Product = immutable('Product', {
          id: 'string',
          title: 'string',
          description: 'string',
          price: 'decimal:2',
          type: /^book|magazine|card$/,
          metadata: {
            keywords: 'string[]',
            isbn: 'string?'
          }
        })

        const product = new Product({
          id: '5623c1263b952eb796d79e03',
          title: 'Swamplandia',
          description: 'From the celebrated...',
          price: 9.99,
          type: 'book',
          metadata: {
            keywords: ['swamp'],
            isbn: '0-307-26399-1'
          }
        })

        console.log(product)

        try {
          const product2 = new Product({
            id: '5623c1263b952eb796d79e03',
            title: null, // this is required!
            description: 'From the celebrated...',
            price: 9.99,
            type: 'book',
            metadata: {
              keywords: ['swamp'],
              isbn: '0-307-26399-1'
            }
          })
        } catch (e) {
          console.log(e.message)
          // will print Invalid Product: Product.title {string} is invalid
        }
      },
      '// patch': () => {
        // const { immutable } = require('@polyn/immutable')
        const { gt } = require('@polyn/blueprint')

        const Person = immutable('Person', {
          firstName: 'string',
          lastName: 'string',
          age: gt(0)
        })

        const person = new Person({
          firstName: 'John',
          lastName: 'Doe',
          age: 21
        })

        console.log(person)
        // prints { firstName: 'John', lastName: 'Doe', age: 21 }

        const modified = person.patch({ age: 22 })

        console.log(person)
        // prints { firstName: 'John', lastName: 'Doe', age: 21 }
        console.log(modified)
        // prints { firstName: 'John', lastName: 'Doe', age: 22 }
      },
      '// toObject': () => {
        // const { immutable } = require('@polyn/immutable')
        const { gt } = require('@polyn/blueprint')

        const Person = immutable('Person', {
          firstName: 'string',
          lastName: 'string',
          age: gt(0)
        })

        const person = new Person({
          firstName: 'John',
          lastName: 'Doe',
          age: 21
        })

        console.log(person)
        // prints { firstName: 'John', lastName: 'Doe', age: 21 }

        const mutable = person.toObject()
        mutable.age = 22
        const modified = new Person(mutable)

        console.log(person)
        // prints { firstName: 'John', lastName: 'Doe', age: 21 }
        console.log(modified)
        // prints { firstName: 'John', lastName: 'Doe', age: 22 }
      },
      '// ajv': () => {
        // const { Immutable } = require('@polyn/immutable')

        /**
         * Creates a validator that uses ajv to validate data against
         * the given JSON Schema
         * @param {string} name - the name of the model being validated
         * @param {object} schema - the JSON Schema this model should match
         */
        function AjvValidator (name, schema) {
          const makeErrorText = (errors) => {
            return errors && errors
              .map((error) => `${name}${error.dataPath} ${error.message}`)
              .join(', ')
          }
          return {
            validate: (input) => {
              // allErrors: don't exit on first error
              const ajv = new Ajv({ allErrors: true })
              const isValid = ajv.validate(schema, input)

              if (!isValid) {
                throw new Error(`Invalid ${name}: ${makeErrorText(ajv.errors)}`)
              }
            }
          }
        }

        const immutable = new Immutable({ Validator: AjvValidator })

        const Person = immutable('Person', {
          $id: 'https://example.com/person.schema.json',
          $schema: 'http://json-schema.org/schema#',
          title: 'Person',
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'The person\'s first name.'
            },
            lastName: {
              type: 'string',
              description: 'The person\'s last name.'
            },
            age: {
              description: 'Age in years which must be equal to or greater than zero.',
              type: 'integer',
              minimum: 0
            }
          }
        })

        const person = new Person({
          firstName: 'John',
          lastName: 'Doe',
          age: 21
        })

        console.log(person)
        // prints: ValidatedImmutable { firstName: 'John', lastName: 'Doe', age: 21 }

        try {
          const person2 = new Person({
            firstName: 1,
            lastName: 2,
            age: -1
          })
        } catch (e) {
          console.log(e.message)
          // prints ( `\` line breaks for readability):
          // Invalid Person: \
          // Person.firstName should be string, \
          // Person.lastName should be string, \
          // Person.age should be >= 0
        }
      }
    }
  })
}
