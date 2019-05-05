module.exports = {
  name: 'immutable',
  factory: ({ blueprint }) => {
    /**
     * Freezes an array, and all of the array's values, recursively
     * @param {array} input - the array to freeze
     */
    const makeArrayValuesImmutable = (input) => {
      return input.map((val) => {
        if (Array.isArray(val)) {
          return makeArrayValuesImmutable(val)
        } else if (typeof val === 'object') {
          return new Immutable(val)
        } else {
          return val
        }
      })
    }

    /**
     * Freezes an object, and all of it's values, recursively
     * @param {object} input - the object to freeze
     */
    const Immutable = class {
      constructor (input) {
        Object.keys(input).forEach((key) => {
          if (Array.isArray(input[key])) {
            this[key] = makeArrayValuesImmutable(input[key])
          } else if (typeof input[key] === 'object') {
            this[key] = new Immutable(input[key])
          } else {
            this[key] = input[key]
          }
        })

        if (new.target === Immutable) {
          Object.freeze(this)
        }
      }
    }

    /**
     * Creates a blueprint and returns a function for creating new instances
     * of objects that get validated against the given blueprint. All of the
     * properties on the returned value are immutable
     * @curried
     * @param {string} name - the name of the immutable
     * @param {object} model - the blueprint
     */
    const immutable = (name, model) => {
      // TODO: maybe validate the name to return more useful errors than "Unexpected token -"

      const bp = blueprint(name, model)

      if (bp.err) {
        throw bp.err
      }

      /**
       * Validates, and then freezes an object, and all of it's values, recursively
       * @param {object} input - the object to freeze
       */
      const ValidatedImmutable = class extends Immutable {
        constructor (input) {
          const validationResult = bp.validate(input)

          if (validationResult.err) {
            throw validationResult.err
          }

          super(input)

          if (new.target === ValidatedImmutable) {
            Object.freeze(this)
          }
        }
      }

      // class names don't allow special characters, nor executable JS
      // so it should be safe to use eval here, as long as we limit
      // the variables to the class name. This returns a class with the
      // $name property, so TypeErrors indicate the correct class name
      //
      // eslint-disable-next-line no-eval
      return eval(`ValidatedImmutable => class ${name} extends ValidatedImmutable {
        constructor (...args) {
          super(...args)
          if (new.target === ${name}) {
            Object.freeze(this)
          }
        }
      }`)(ValidatedImmutable)
    }

    return { immutable }
  }
}
