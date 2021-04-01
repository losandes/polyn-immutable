module.exports = {
  name: 'immutable',
  factory: (Blueprint) => {
    'use strict'
    const { is, blueprint } = Blueprint

    /**
     * Returns true if the object matches the (@polyn/blueprint).blueprint signature
     * @param {any} input - the value to test
     */
    const isBlueprint = (input) => {
      return is.object(input) &&
        is.string(input.name) &&
        is.function(input.validate) &&
        is.object(input.schema)
    }

    /**
     * Returns true if the object matches the (@polyn/immutable).immutable signature
     * @param {any} input - the value to test
     */
    const isImmutable = (input) => {
      const proto = Object.getPrototypeOf(input)
      return is.object(input) && (
        is.function(input.isPolynImmutable) ||
        is.function(proto && proto.isPolynImmutable)
      )
    }

    /**
     * The default validator uses @polyn/blueprint for vaidation
     * This can be overrided, to use things like ajv and JSON Schemas
     * @param {string} name - the name of the model
     * @param {object} schema - the blueprint schema
     */
    function Validator (name, schema) {
      let bp

      if (isBlueprint(name)) {
        // a blueprint was passed as the first argument
        bp = name
      } else {
        bp = blueprint(name, schema)
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

    /**
     * Creates a new object from the given, `that`, and overwrites properties
     * on it with the given, `input`
     * @curried
     * @param {any} that - the object being patched
     * @param {any} input - the properties being written
     */
    const patch = (that) => (input) => {
      const output = Object.assign({}, that)

      Object.keys(input).forEach((key) => {
        if (is.array(input[key])) {
          output[key] = input[key]
        } else if (is.object(input[key])) {
          output[key] = patch(output[key])(input[key])
        } else {
          output[key] = input[key]
        }
      })

      return output
    }

    /**
     * Creates a new, mutable object from the given, `that`
     * @curried
     * @param {any} that - the object being patched
     * @param {any} options - whether or not to remove functions
     */
    const toObject = (that, options) => {
      const shallowClone = Object.assign({}, that)
      const output = {}
      const { removeFunctions } = {
        ...{
          removeFunctions: false,
        },
        ...options,
      }

      Object.keys(shallowClone).forEach((key) => {
        if (shallowClone[key] && typeof shallowClone[key].toObject === 'function') {
          output[key] = shallowClone[key].toObject(options)
        } else if (is.array(shallowClone[key])) {
          output[key] = Object.assign([], shallowClone[key])
        } else if (is.object(shallowClone[key])) {
          output[key] = Object.assign({}, shallowClone[key])
        } else if (is.function(shallowClone[key]) && removeFunctions === true) {
          // do nothing
        } else {
          output[key] = shallowClone[key]
        }
      })

      return output
    }

    const push = (arr) => (...newEntry) => [...arr, ...newEntry]
    const pop = (arr) => () => arr.slice(0, -1)
    const shift = (arr) => () => arr.slice(1)
    const unshift = (arr) => (...newEntry) => [...newEntry, ...arr]
    const sort = (arr) => (compareFunction) => [...arr].sort(compareFunction)
    const reverse = (arr) => () => [...arr].reverse()
    const copy = (arr) => () => [...arr]
    const slice = (arr) => (...args) => arr.slice(...args)
    const splice = (arr) => (start, deleteCount, ...items) =>
      [...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount)]
    const remove = (arr) => (index) =>
      arr.slice(0, index).concat(arr.slice(index + 1))

    function PolynImmutable (config) {
      config = { ...{ Validator }, ...config }

      /**
       * Creates a Validator (@polyn/blueprint by default) and returns a
       * function for creating new instances of objects that get validated
       * against the given schema. All of the properties on the returned
       * value are immutable
       * @curried
       * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
       * @param {object} schema - the blueprint schema
       */
      const immutable = (name, schema, options) => {
        const validator = new config.Validator(name, schema)
        const { functionsOnPrototype } = {
          ...{
            functionsOnPrototype: false,
          },
          ...options,
        }

        // NOTE the classes, and freezeArray are in here, so their
        // prototypes don't cross-contaminate

        /**
         * Freezes an array, and all of the array's values, recursively
         * @param {array} input - the array to freeze
         */
        const freezeArray = (input) => {
          return Object.freeze(input.map((val) => {
            if (is.array(val)) {
              return freezeArray(val)
            } else if (is.object(val) && !isImmutable(val)) {
              return new Immutable(val)
            } else {
              return val
            }
          }))
        }

        /**
         * Freezes an object, and all of it's values, recursively
         * @param {object} input - the object to freeze
         */
        const Immutable = class {
          constructor (input) {
            Object.keys(input).forEach((key) => {
              if (is.array(input[key])) {
                this[key] = freezeArray(input[key])
              } else if (is.object(input[key]) && !isImmutable(input[key])) {
                this[key] = new Immutable(input[key])
              } else if (functionsOnPrototype && is.function(input[key])) {
                Immutable.prototype[key] = input[key]
              } else {
                this[key] = input[key]
              }
            })

            if (new.target === Immutable) {
              Object.freeze(this)
            }
          }

          toObject (options) {
            return toObject(this, options)
          }

          isPolynImmutable () {
            return true
          }
        }

        /**
         * Validates, and then freezes an object, and all of it's values, recursively
         * @param {object} input - the object to freeze
         */
        class ValidatedImmutable extends Immutable {
          constructor (input) {
            const result = validator.validate(input)

            super((result && result.value) || input)

            if (new.target === ValidatedImmutable) {
              Object.freeze(this)
            }
          }

          patch (input) {
            return new ValidatedImmutable(patch(this)(input))
          }

          getSchema () {
            return schema
          }
        }

        return ValidatedImmutable
      }

      return { immutable }
    }

    return {
      immutable: new PolynImmutable().immutable,
      PolynImmutable,
      patch,
      makeMutableClone: toObject,
      array: (arr) => {
        return {
          push: push(arr),
          pop: pop(arr),
          shift: shift(arr),
          unshift: unshift(arr),
          sort: sort(arr),
          reverse: reverse(arr),
          splice: splice(arr),
          slice: slice(arr),
          remove: remove(arr),
          copy: copy(arr),
        }
      },
    }
  },
}
