module.exports = {
  name: 'immutable',
  factory: ({ is, blueprint }) => {
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
    }

    /**
     * Creates a blueprint and returns a function for creating new instances
     * of objects that get validated against the given blueprint. All of the
     * properties on the returned value are immutable
     * @curried
     * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
     * @param {object} schema - the blueprint schema
     */
    const immutable = (name, schema) => {
      let bpName, bp

      if (is.object(name) && is.string(name.name) && is.function(name.validate)) {
        // a blueprint was passed as the first argument
        bp = name
        bpName = name.name
      } else {
        bp = blueprint(name, schema)
        bpName = name
      }

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

      try {
        // class names don't allow special characters, nor executable JS
        // so it should be safe to use eval here, as long as we limit
        // the variables to the class name. This returns a class with the
        // $name property, so TypeErrors indicate the correct class name
        //
        // TODO: should we accept config that doesn't use eval, and just returns ValidatedImmutable?
        //
        // eslint-disable-next-line no-eval
        return eval(`(ValidatedImmutable) => class ${bpName} extends ValidatedImmutable {
          constructor (...args) {
            super(...args)

            if (new.target === ${bpName}) {
              Object.freeze(this)
            }
          }
        }`)(ValidatedImmutable)
      } catch (e) {
        if (e.message.indexOf('Unexpected') > -1) {
          throw new Error(`The name, '${bpName}', has characters that aren't compatible with JavaScript class names: ${e.message}`)
        }

        throw e
      }
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

    const patch = (that) => (input) => {
      [ ...that, ...input ]
    }

    return {
      immutable,
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
