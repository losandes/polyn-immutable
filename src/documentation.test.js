module.exports = (test, dependencies) => {
  const {
    immutable,
    PolynImmutable,
    blueprint,
    gt,
    is,
    Ajv,
  } = dependencies

  const log = function (...args) {
    // console.log.apply(this, args)
  }

  return test('documentation', {
    'usage => node': () => {
      // const { immutable } = require('@polyn/immutable')

      const Product = immutable('Product', {
        id: 'string',
        title: 'string',
        description: 'string',
        price: 'decimal:2',
        type: /^book|magazine|card$/,
        metadata: {
          keywords: 'string[]',
          isbn: 'string?',
        },
      })

      const product = new Product({
        id: '5623c1263b952eb796d79e03',
        title: 'Swamplandia',
        description: 'From the celebrated...',
        price: 9.99,
        type: 'book',
        metadata: {
          keywords: ['swamp'],
          isbn: '0-307-26399-1',
        },
      })

      /* console. */ log(product)

      try {
        const product2 = new Product({
          id: '5623c1263b952eb796d79e03',
          title: null, // this is required!
          description: 'From the celebrated...',
          price: 9.99,
          type: 'book',
          metadata: {
            keywords: ['swamp'],
            isbn: '0-307-26399-1',
          },
        })
        /* console. */ log('SHOULD NOT GET HERE', product2)
      } catch (e) {
        /* console. */ log(e.message)
        // will print Invalid Product: Product.title {string} is invalid
      }
    },
    'updating-models-with-patch': () => {
      // const { immutable } = require('@polyn/immutable')
      const { gt } = require('@polyn/blueprint')

      const Person = immutable('Person', {
        firstName: 'string',
        lastName: 'string',
        age: gt(0),
      })

      const person = new Person({
        firstName: 'John',
        lastName: 'Doe',
        age: 21,
      })

      /* console. */ log(person)
      // prints { firstName: 'John', lastName: 'Doe', age: 21 }

      const modified = person.patch({ age: 22 })

      /* console. */ log(person)
      // prints { firstName: 'John', lastName: 'Doe', age: 21 }
      /* console. */ log(modified)
      // prints { firstName: 'John', lastName: 'Doe', age: 22 }
    },
    'updating-models-with-toobject': () => {
      // const { immutable } = require('@polyn/immutable')
      const { gt } = require('@polyn/blueprint')

      const Person = immutable('Person', {
        firstName: 'string',
        lastName: 'string',
        age: gt(0),
      })

      const person = new Person({
        firstName: 'John',
        lastName: 'Doe',
        age: 21,
      })

      /* console. */ log(person)
      // prints { firstName: 'John', lastName: 'Doe', age: 21 }

      const mutable = person.toObject()
      mutable.age = 22
      const modified = new Person(mutable)

      /* console. */ log(person)
      // prints { firstName: 'John', lastName: 'Doe', age: 21 }
      /* console. */ log(modified)
      // prints { firstName: 'John', lastName: 'Doe', age: 22 }
    },
    'scope-its-not-managed': (expect) => {
      'use strict'

      // define an immutable
      const MakeNumber = immutable('MakeNumber', {
        makeOne: 'function',
        gettersAndSetters: {
          immutableTwo: 'number',
          get: 'function',
          set: 'function',
        },
        one: 'number',
      })

      // define variables that meet the immutable's schema
      let makeOne = () => 1
      const makeTwo = () => {
        let nonDeterministicNumber = 2

        return {
          immutableTwo: nonDeterministicNumber,
          get: () => nonDeterministicNumber,
          set: (num) => {
            nonDeterministicNumber = num
          },
        }
      }
      let one = 1

      // create an instance of our immutable, using the variables
      // we defined above
      const makeNumber = new MakeNumber({
        makeOne,
        gettersAndSetters: makeTwo(),
        one,
      })

      // each of `makeNumber.makeOne()`, and `makeNumber.one` returns 1
      expect(makeNumber.makeOne()).to.equal(1)
      expect(makeNumber.one).to.equal(1)

      // each of `gettersAndSetters.immutableTwo`, and
      // `gettersAndSetters.get()` returns 2
      expect(makeNumber.gettersAndSetters.immutableTwo).to.equal(2)
      expect(makeNumber.gettersAndSetters.get()).to.equal(2)

      // mutate the original properties
      makeOne = () => 2
      one = 2
      // note that this doesn't throw
      // immutable doesn't mutate the values you pass to it

      // now, each of `makeOne()`, and `one` in this
      // immediate scope returns 2
      expect(makeOne()).to.equal(2)
      expect(one).to.equal(2)

      // however, each of the immutable `makeNumber.makeOne()`,
      // and `makeNumber.one` still returns 1
      expect(makeNumber.makeOne()).to.equal(1)
      expect(makeNumber.one).to.equal(1)

      // execute the function that mutates the inner scope of makeTwo
      makeNumber.gettersAndSetters.set(3)

      // The immutable `makeNumber.gettersAndSetters.immutableTwo`
      // still returns 2
      expect(makeNumber.gettersAndSetters.immutableTwo).to.equal(2)

      // but `makeNumber.gettersAndSetters.get()` now returns 3
      // because it's a factory that exposes the inner scope
      expect(makeNumber.gettersAndSetters.get()).to.equal(3)
    },
    cookbook: {
      'using-json-schema-with-ajv': () => {
        // const { PolynImmutable } = require('@polyn/immutable')

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
            },
          }
        }

        const { immutable } = new PolynImmutable({ Validator: AjvValidator })

        const Person = immutable('Person', {
          $id: 'https://example.com/person.schema.json',
          $schema: 'http://json-schema.org/schema#',
          title: 'Person',
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'The person\'s first name.',
            },
            lastName: {
              type: 'string',
              description: 'The person\'s last name.',
            },
            age: {
              description: 'Age in years which must be equal to or greater than zero.',
              type: 'integer',
              minimum: 0,
            },
          },
        })

        const person = new Person({
          firstName: 'John',
          lastName: 'Doe',
          age: 21,
        })

        /* console. */ log(person)
        // prints: ValidatedImmutable { firstName: 'John', lastName: 'Doe', age: 21 }

        try {
          const person2 = new Person({
            firstName: 1,
            lastName: 2,
            age: -1,
          })
          /* console. */ log('SHOULD NOT GET HERE', person2)
        } catch (e) {
          /* console. */ log(e.message)
          // prints ( `\` line breaks for readability):
          // Invalid Person: \
          // Person.firstName should be string, \
          // Person.lastName should be string, \
          // Person.age should be >= 0
        }
      },
      'using-a-different-version-of-blueprint': () => {
        // const { blueprint, gt, is } = require('@polyn/blueprint')
        // const { PolynImmutable } = require('@polyn/immutable')

        const isBlueprint = (input) => {
          return is.object(input) &&
            is.string(input.name) &&
            is.function(input.validate) &&
            is.object(input.schema)
        }

        function Validator (name, schema) {
          let bp

          if (isBlueprint(name)) {
            // a blueprint was passed as the first argument
            bp = name
          } else {
            bp = blueprint(name, schema)
          }

          if (bp.err) {
            throw bp.err
          }

          return {
            validate: (input) => {
              const validationResult = bp.validate(input)

              if (validationResult.err) {
                throw validationResult.err
              }

              return validationResult
            },
          }
        }

        const { immutable } = new PolynImmutable({ Validator })

        const Person = immutable('Person', {
          firstName: 'string',
          lastName: 'string',
          age: gt(0),
        })

        const person = new Person({
          firstName: 'John',
          lastName: 'Doe',
          age: 21,
        })

        /* console. */ log(person)
        // prints: ValidatedImmutable { firstName: 'John', lastName: 'Doe', age: 21 }

        try {
          const person2 = new Person({
            firstName: 1,
            lastName: 2,
            age: -1,
          })
          /* console. */ log('SHOULD NOT GET HERE', person2)
        } catch (e) {
          /* console. */ log(e.message)
          // prints ( `\` line breaks for readability):
          // Invalid Person: \
          // Person.firstName should be string, \
          // Person.lastName should be string, \
          // Person.age should be >= 0
        }
      },
      'schema-inheritance': () => {
        const { registerBlueprint } = require('@polyn/blueprint')
        // const { immutable } = require('@polyn/immutable')

        /**
         * Using blueprint's `registerBlueprint`, we can establish
         * types we can use in our schemas.
         */
        registerBlueprint('Author', {
          firstName: 'string',
          lastName: 'string',
        })

        /**
         * Create an immutable object
         */
        const Product = immutable('Product', {
          id: 'string',
          title: 'string',
          description: 'string',
          price: 'decimal:2',
          type: /^book|magazine|card$/,
          metadata: {
            keywords: 'string[]',
          },
        })

        /**
         * Using `schema`, we can inherit the schema of
         * another immutable. This example demonstrates
         * subtype polymorphism of both the primary schema,
         * and a nested schema
         */
        const Book = immutable('Book', {
          ...Product.schema,
          ...{
            metadata: {
              ...Product.schema.metadata,
              ...{
                isbn: 'string',
                authors: 'Author[]',
              },
            },
          },
        })

        const product = new Product({
          id: '5623c1263b952eb796d79e02',
          title: 'Happy Birthday',
          description: 'A birthday card',
          price: 9.99,
          type: 'card',
          metadata: {
            keywords: ['bday'],
          },
        })

        const book = new Book({
          id: '5623c1263b952eb796d79e03',
          title: 'Swamplandia',
          description: 'From the celebrated...',
          price: 9.99,
          type: 'book',
          metadata: {
            keywords: ['swamp'],
            isbn: '0-307-26399-1',
            authors: [{
              firstName: 'Karen',
              lastName: 'Russell',
            }],
          },
        })

        /* console. */ log(product)
        /* console. */ log(book)
      },
      'deep-equals-with-functions => functions-on-the-prototype': (expect) => {
        // const { expect } = 'chai'
        // const { immutable } = require('@polyn/immutable')

        const Product = immutable('Product', {
          type: /^book$/i,
          comparableType: ({ input }) => {
            return {
              value: () => input.toLowerCase(),
            }
          },
        }, { functionsOnPrototype: true })

        const p1 = new Product({ type: 'book' })
        const p2 = new Product({ type: 'book' })

        expect(p1).to.deep.equal(p2)
      },
      'deep-equals-with-functions => cast-to-object-without-functions)': (expect) => {
        // const { expect } = 'chai'
        // const { immutable } = require('@polyn/immutable')

        const Product = immutable('Product', {
          type: /^book$/i,
          comparableType: ({ input }) => {
            return {
              value: () => input.toLowerCase(),
            }
          },
        })

        const p1 = new Product({ type: 'book' })
        const p2 = new Product({ type: 'book' })

        expect(p1.toObject({ removeFunctions: true }))
          .to.deep.equal(p2.toObject({ removeFunctions: true }))
      },
    },
  })
}
