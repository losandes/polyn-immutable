module.exports = {
  name: 'immutable',
  factory: (Blueprint) => {
    'use strict'
    const { is, blueprint } = Blueprint
    const config = {}

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

      if (bp.err) {
        throw bp.err
      }

      return {
        validate: (input) => {
          const validationResult = bp.validate(input)

          if (validationResult.err) {
            throw validationResult.err
          }
        }
      }
    }

    /**
     * Freezes an array, and all of the array's values, recursively
     * @param {array} input - the array to freeze
     */
    const freezeArray = (input) => {
      return Object.freeze(input.map((val) => {
        if (is.array(val)) {
          return freezeArray(val)
        } else if (is.object(val)) {
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
          } else if (is.object(input[key])) {
            this[key] = new Immutable(input[key])
          } else {
            this[key] = input[key]
          }
        })

        if (new.target === Immutable) {
          Object.freeze(this)
        }
      }

      toObject () {
        return toObject(this)
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
     * Creates a new object from the given, `that`, and overwrites properties
     * on it with the given, `input`
     * @curried
     * @param {any} that - the object being patched
     * @param {any} input - the properties being written
     */
    const toObject = (that) => {
      const shallowClone = Object.assign({}, that)
      const output = {}

      Object.keys(shallowClone).forEach((key) => {
        if (typeof shallowClone[key].toObject === 'function') {
          output[key] = shallowClone[key].toObject()
        } else if (is.array(shallowClone[key])) {
          output[key] = Object.assign([], shallowClone[key])
        } else if (is.object(shallowClone[key])) {
          output[key] = Object.assign({}, shallowClone[key])
        } else {
          output[key] = shallowClone[key]
        }
      })

      return output
    }

    const push = (arr) => (newEntry) => {
      return [ ...arr, newEntry ]
    }

    const pop = (arr) => () => {
      return arr.slice(0, -1)
    }

    const shift = (arr) => () => {
      return arr.slice(1)
    }

    const unshift = (arr) => (newEntry) => {
      return [ newEntry, ...arr ]
    }

    const sort = (arr) => (compareFunction) => {
      return [ ...arr ].sort(compareFunction)
    }

    const reverse = (arr) => () => {
      return [ ...arr ].reverse()
    }

    const splice = (arr) => (start, deleteCount, ...items) => {
      return [ ...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount) ]
    }

    const remove = (arr) => (index) => {
      return arr.slice(0, index).concat(arr.slice(index + 1))
    }

    const copy = (arr) => () => {
      return [ ...arr ]
    }

    function ImmutableInstance (config) {
      config = { ...{ Validator }, ...config }

      /**
       * Creates a blueprint and returns a function for creating new instances
       * of objects that get validated against the given blueprint. All of the
       * properties on the returned value are immutable
       * @curried
       * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
       * @param {object} schema - the blueprint schema
       */
      return (name, schema) => {
        const validator = new config.Validator(name, schema)

        /**
         * Validates, and then freezes an object, and all of it's values, recursively
         * @param {object} input - the object to freeze
         */
        const ValidatedImmutable = class extends Immutable {
          constructor (input) {
            validator.validate(input)

            super(input)

            if (new.target === ValidatedImmutable) {
              Object.freeze(this)
            }
          }

          patch (input) {
            return new ValidatedImmutable(patch(this)(input))
          }
        }

        return ValidatedImmutable
      }
    }

    return {
      immutable: new ImmutableInstance(),
      Immutable: ImmutableInstance,
      patch,
      array: (arr) => {
        return {
          push: push(arr),
          pop: pop(arr),
          shift: shift(arr),
          unshift: unshift(arr),
          sort: sort(arr),
          reverse: reverse(arr),
          splice: splice(arr),
          remove: remove(arr),
          copy: copy(arr)
        }
      }
    }
  }
}
