module.exports = (test, dependencies) => {
  const {
    immutable,
    array,
    PolynImmutable,
    blueprint,
    registerValidator,
    registerBlueprint,
    Ajv,
  } = dependencies

  // PREP ======================================================================
  const { makeModel, makeOne, makeTwo } = (() => {
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
        objArr: 'any[]',
        arrArr: 'any[]',
        obj: 'object',
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
        objArr: [{ one: 1 }, { two: 2 }, { three: 3 }],
        arrArr: [[1, 2], [3, 4]],
        obj: { foo: 'bar' },
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
        objArr: [{ four: 4 }, { five: 5 }, { six: 6 }],
        arrArr: [[5, 6], [7, 8]],
        obj: { foo: 'baz' },
      }
    }

    const makeModel = () => {
      const model = types()
      model.grandParent = types()
      model.grandParent.parent = types()
      model.grandParent.parent.child = types()

      return model
    }

    const makeOne = (options) => {
      const one = oneValues()
      one.grandParent = oneValues()
      one.grandParent.parent = oneValues()
      one.grandParent.parent.child = oneValues()

      if (options && options.noFuncs) {
        delete one.func
        delete one.grandParent.func
        delete one.grandParent.parent.func
        delete one.grandParent.parent.child.func
      }

      return one
    }

    const makeTwo = (options) => {
      const two = twoValues()
      two.grandParent = twoValues()
      two.grandParent.parent = twoValues()
      two.grandParent.parent.child = twoValues()

      if (options && options.noFuncs) {
        delete two.func
        delete two.grandParent.func
        delete two.grandParent.parent.func
        delete two.grandParent.parent.child.func
      }

      return two
    }

    return { types, oneValues, twoValues, makeModel, makeOne, makeTwo }
  })()

  // TEST ======================================================================
  return test('given `immutable`', {
    'when initialized with a valid name': {
      when: () => {
        return immutable('Sut', {
          requiredString: 'string',
          optionalString: 'string?',
        })
      },
      'it should return an instanceof ValidatedImmutable': (expect) => (err, Sut) => {
        expect(err).to.be.null
        const name = (Sut.prototype.constructor && Sut.prototype.constructor.name) ||
          Sut.constructor.name
        expect(name).to.equal('ValidatedImmutable')
      },
      'it should return a constructor': (expect) => (err, Sut) => {
        expect(err).to.be.null
        const expected = {
          requiredString: 'one',
          optionalString: 'two',
        }

        expect(new Sut(expected)).to.deep.equal(expected)
      },
    }, // ctor valid name
    'when initialized with an invalid name': {
      when: () => {
        const Sut = immutable(null, {
          requiredString: 'string',
          optionalString: 'string?',
        })

        return new Sut({
          requiredString: null,
          optionalString: 1,
        })
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('blueprint requires a name {string}, and a schema {object}')
      },
    }, // ctor invalid name
    'when initialized with an existing blueprint': {
      when: () => {
        const Sut = immutable(blueprint('ConstructedWithBlueprint', {
          str: 'string',
        }))
        const expected = {
          str: 'hello',
        }
        const actual = new Sut(expected)

        return { Sut, expected, actual }
      },
      'it should return the value': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual } = when

        expect(actual).to.deep.equal(expected)
      },
    }, // ctor existing blueprint
    'when initialized with an invalid blueprint': {
      'it should throw': (expect) => {
        expect(() => { immutable('name', null) })
          .to.throw('blueprint requires a name {string}, and a schema {object}')
      },
    }, // ctor invalid blueprint
    'when initialized without a name': {
      'it should throw': (expect) => {
        expect(() => { immutable(null, { str: 'string' }) })
          .to.throw('blueprint requires a name {string}, and a schema {object}')
      },
    }, // ctor without name
    'when initialized with a validator that intercepts values': {
      when: () => {
        registerValidator('productTypeWithDefault', ({ value }) => {
          if (/^book|magazine$/.test(value)) {
            return { value }
          }

          return { value: 'product' }
        })
        const Product = immutable('Product', {
          type1: 'productTypeWithDefault',
          type2: 'productTypeWithDefault',
        })
        return new Product({
          type2: 'movie',
        })
      },
      'it should use the intercepted values': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.type1).to.equal('product')
        expect(actual.type2).to.equal('product')
      },
    }, // value interception
    'when initialized with functionsOnPrototype option': {
      when: () => {
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

        return { p1, p2 }
      },
      'it should be comparable with deep equals': (expect) => (err, { p1, p2 }) => {
        expect(err).to.be.null
        expect(p1).to.deep.equal(p2)
      },
    }, // value interception returns function
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
      'it should freeze the primitives, recursively (_not_ strict mode)': (expect) => (err, when) => {
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
      'it should clone functions defined in another scope': (expect) => {
        let func = () => 1
        const FuncImmutable = immutable('functionReference', {
          func: 'function',
        })
        const actual = new FuncImmutable({ func })
        expect(actual.func()).to.equal(1)
        func = () => 2
        expect(actual.func()).to.equal(1)
      },
      'it should clone functions defined in another scope (strict mode)': (expect) => {
        'use strict'
        let func = () => 1
        const FuncImmutable = immutable('functionReference', {
          func: 'function',
        })
        const actual = new FuncImmutable({ func })
        expect(actual.func()).to.equal(1)
        func = () => 2
        expect(func()).to.equal(2)
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

        expect(() => actual.arr.push(4), 'push').to.throw(TypeError, 'Cannot add property')
        expect(() => actual.arr.pop(), 'pop').to.throw(TypeError, 'Cannot delete property')
        expect(() => actual.arr.splice(1, 1), 'splice').to.throw(TypeError)
        expect(() => actual.arr.shift(), 'shift').to.throw(TypeError)
        expect(() => actual.arr.unshift(), 'unshift').to.throw(TypeError)
        expect(() => actual.arr.sort(), 'sort').to.throw(TypeError)
        expect(() => actual.arr.reverse(), 'reverse').to.throw(TypeError)
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
      },
    }, // constructed with valid input
    'when an immutable is constructed with an instance of another immutable': {
      when: () => {
        const Sut1 = immutable('doubleFreezeInputTest1', {
          requiredString: 'string',
          optionalString: 'string?',
        })

        const Sut2 = immutable('doubleFreezeInputTest2', {
          requiredString: 'string',
        })

        const sut1 = new Sut1({ requiredString: 'one', optionalString: 'two' })
        return {
          expected: { requiredString: 'one' },
          actual: new Sut2(sut1),
        }
      },
      'it should return the value': (expect) => (err, { expected, actual }) => {
        expect(err).to.be.null
        expect(actual).to.deep.equal(expected)
      },
    }, // constructed with another immutable
    'when an immutable is constructed with invalid input': {
      when: () => {
        const Sut = immutable('invalidInputTest', {
          requiredString: 'string',
          optionalString: 'string?',
        })

        return new Sut({
          requiredString: null,
          optionalString: 1,
        })
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('Invalid invalidInputTest: expected `requiredString` {null} to be {string}, expected `optionalString` {number} to be {string}')
      },
    }, // invalid input
    'when an immutable is constructed with null input': {
      when: () => {
        const Sut = immutable('nullInputTest', {
          requiredString: 'string',
          optionalString: 'string?',
        })

        return new Sut(null)
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('Invalid nullInputTest: expected `requiredString` {null} to be {string}')
      },
    }, // null input
    'when an immutable is constructed with undefined input': {
      when: () => {
        const Sut = immutable('undefinedInputTest', {
          requiredString: 'string',
          optionalString: 'string?',
        })

        return new Sut()
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.equal('Invalid undefinedInputTest: expected `requiredString` {undefined} to be {string}')
      },
    }, // undefined input
    'when an immutable is constructed with a valid null value in the input': {
      when: () => {
        const Sut = immutable('nullInputTest', {
          requiredString: 'string',
          optionalObj: 'object?',
        })
        const expected = {
          requiredString: 'one',
          optionalObj: null,
        }
        const actual = new Sut(expected)

        return { expected, actual }
      },
      'it should return the value': (expect) => (err, context) => {
        expect(err).to.be.null
        const { expected, actual } = context

        expect(actual).to.deep.equal(expected)
      },
    }, // null value in input
    'when an instance of an immutable is enumerated with Object.keys': {
      when: () => {
        const Sut = immutable('prototypeKeys', { str: 'string', child: { str: 'string' } })
        const sut = new Sut({ str: 'foo', child: { str: 'foo' } })
        const parentKeys = Object.keys(sut)
        const childKeys = Object.keys(sut.child)

        return { parentKeys, childKeys }
      },
      'prototype functions should not show up': (expect) => (err, { parentKeys, childKeys }) => {
        expect(err).to.be.null
        expect(parentKeys.includes('patch')).to.equal(false)
        expect(parentKeys.includes('toObject')).to.equal(false)
        expect(parentKeys.indexOf('patch')).to.equal(-1)
        expect(parentKeys.indexOf('toObject')).to.equal(-1)

        expect(childKeys.includes('patch')).to.equal(false)
        expect(childKeys.includes('toObject')).to.equal(false)
        expect(childKeys.indexOf('patch')).to.equal(-1)
        expect(childKeys.indexOf('toObject')).to.equal(-1)
      },
    }, // prototype Object.keys
    'when an instance of an immutable is `patch`ed': {
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
      },
    }, // patch
    'when an instance of an immutable is cast `toObject`': {
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
      },
      'it should not throw on null values': (expect) => {
        registerBlueprint('ToObjectNullTestBp', {
          foo: 'string',
        })
        const Sut = immutable('ToObjectNullTest', {
          foo: 'string',
          bar: 'ToObjectNullTestBp?',
        })
        const expected = {
          foo: 'hello',
          bar: null,
        }
        const sut = new Sut(expected)

        expect(sut.toObject()).to.deep.equal({
          foo: 'hello',
          bar: null,
        })
      },
    }, // toObject
    'when an instance of an immutable is cast `toObject` with options': {
      when: () => {
        const Sut = immutable('ToObjectWithOptionsTest', makeModel())
        const input = makeOne()
        const sut = new Sut(input)
        const expected = makeOne()
        delete expected.func
        delete expected.grandParent.func
        delete expected.grandParent.parent.func
        delete expected.grandParent.parent.child.func

        return { expected, sut }
      },
      'and `removeFunctions` is true, it should return all of the values, except for functions': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, sut } = when

        expect(sut.toObject({ removeFunctions: true })).to.deep.equal(expected)
      },
    },
    'when the schema is retrieved for an instance of immutable': {
      when: () => {
        const Sut = immutable('ToObjectTest', makeModel())
        const sut = new Sut(makeOne())
        const actual = sut.getSchema()

        return { actual }
      },
      'it shoud return the schema': (expect) => (err, result) => {
        expect(err).to.equal(null)
        expect(result.actual).to.deep.equal(makeModel())
      },
    },
    'when `isPolynImmutable` is called on an instance of immutable': {
      when: () => {
        const Sut = immutable('ToObjectTest', makeModel())
        const sut = new Sut(makeOne())
        const actual = sut.isPolynImmutable()

        return { actual }
      },
      'it shoud return the true': (expect) => (err, result) => {
        expect(err).to.equal(null)
        expect(result.actual).to.equal(true)
      },
    },
    'when the scope of properties used to construct an instance of an immutable change ': {
      when: () => {
        const makeFixture = () => {
          // define an immutable with a property that returns a function
          const MakeNumber = immutable('MakeNumber', {
            makeOne: 'function',
            plusOne: 'number',
            innerRef: 'string',
            ref: 'function',
            child: {
              makeOne: 'function',
              plusOne: 'number',
              innerRef: 'string',
              ref: 'function',
            },
          })

          const makeFixture = function (num) {
            let plusOne = num + 1
            let innerRef = 'foo'

            return {
              makeOne: () => num,
              plusOne,
              innerRef,
              mutate: () => {
                plusOne = -1
                innerRef = 'bar'
              },
              ref: () => {
                return {
                  makeOne: (() => num)(),
                  plusOne,
                  innerRef,
                }
              },
            }
          }

          const expectedBeforeMutation = {
            makeOne: 1,
            plusOne: 2,
            innerRef: 'foo',
            ref: {
              makeOne: 1,
              plusOne: 2,
              innerRef: 'foo',
            },
            child: {
              makeOne: 2,
              plusOne: 3,
              innerRef: 'foo',
              ref: {
                makeOne: 2,
                plusOne: 3,
                innerRef: 'foo',
              },
            },
          }

          const expectedAfterMutation = {
            makeOne: 1,
            plusOne: 2,
            innerRef: 'foo',
            ref: {
              makeOne: 1,
              plusOne: -1,
              innerRef: 'bar',
            },
            child: {
              makeOne: 2,
              plusOne: 3,
              innerRef: 'foo',
              ref: {
                makeOne: 2,
                plusOne: -1,
                innerRef: 'bar',
              },
            },
          }

          const parent = {
            fixture: makeFixture(1),
          }
          parent.fixture.child = makeFixture(2)
          const actual = new MakeNumber(parent.fixture)

          return { parent, actual, expectedBeforeMutation, expectedAfterMutation }
        }

        return makeFixture
      },
      'make sure the fixture is in a good state to start': (expect) => (err, makeFixture) => {
        'use strict'

        expect(err).to.be.null

        const { actual, expectedBeforeMutation } = makeFixture()

        expect(actual.makeOne()).to.equal(expectedBeforeMutation.makeOne)
        expect(actual.plusOne).to.equal(expectedBeforeMutation.plusOne)
        expect(actual.innerRef).to.equal(expectedBeforeMutation.innerRef)
        expect(actual.ref()).to.deep.equal(expectedBeforeMutation.ref)
        expect(actual.child.makeOne()).to.equal(expectedBeforeMutation.child.makeOne)
        expect(actual.child.plusOne).to.equal(expectedBeforeMutation.child.plusOne)
        expect(actual.child.innerRef).to.equal(expectedBeforeMutation.child.innerRef)
        expect(actual.child.ref()).to.deep.equal(expectedBeforeMutation.child.ref)
      },
      'the original state can change': (expect) => (err, makeFixture) => {
        'use strict'

        expect(err).to.be.null

        const { parent, expectedAfterMutation } = makeFixture()

        // mutate the state in the original scope
        parent.fixture.mutate()
        parent.fixture.child.mutate()

        // it should change the original state
        expect(parent.fixture.makeOne()).to.equal(expectedAfterMutation.makeOne)
        expect(parent.fixture.plusOne).to.equal(expectedAfterMutation.plusOne)
        expect(parent.fixture.innerRef).to.equal(expectedAfterMutation.innerRef)
        expect(parent.fixture.ref()).to.deep.equal(expectedAfterMutation.ref)
        expect(parent.fixture.child.makeOne()).to.equal(expectedAfterMutation.child.makeOne)
        expect(parent.fixture.child.plusOne).to.equal(expectedAfterMutation.child.plusOne)
        expect(parent.fixture.child.innerRef).to.equal(expectedAfterMutation.child.innerRef)
        expect(parent.fixture.child.ref()).to.deep.equal(expectedAfterMutation.child.ref)
      },
      'references outside of the scope of the immutable are NOT broken - they CAN mutate': (expect) => (err, makeFixture) => {
        'use strict'

        expect(err).to.be.null

        const { parent, actual, expectedAfterMutation } = makeFixture()

        // mutate the state in the original scope
        parent.fixture.mutate()
        parent.fixture.child.mutate()

        // references outside of the scope of the immutable are NOT broken - they CAN mutate
        expect(actual.makeOne()).to.equal(expectedAfterMutation.makeOne)
        expect(actual.plusOne).to.equal(expectedAfterMutation.plusOne)
        expect(actual.innerRef).to.equal(expectedAfterMutation.innerRef)
        expect(actual.ref()).to.deep.equal(expectedAfterMutation.ref)
        expect(actual.child.makeOne()).to.equal(expectedAfterMutation.child.makeOne)
        expect(actual.child.plusOne).to.equal(expectedAfterMutation.child.plusOne)
        expect(actual.child.innerRef).to.equal(expectedAfterMutation.child.innerRef)
        expect(actual.child.ref()).to.deep.equal(expectedAfterMutation.child.ref)
      },
    }, // scope
    'when a new `Immutable` is constructed/configured': {
      'it should let you set the Validator': (expect) => {
        const expected = {
          name: 'NewImmutable:Validator',
          schema: { str: 'string' },
          input: { str: 'foo' },
        }
        const actual = {}

        function Validator (name, schema) {
          actual.name = name
          actual.schema = schema

          return {
            validate: (input) => {
              actual.input = input
              return true
            },
          }
        }
        const { immutable } = new PolynImmutable({ Validator })
        const Sut = immutable(expected.name, expected.schema)
        const sut = new Sut(expected.input)

        expect(sut).to.not.be.null
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
          },
          validInput: {
            firstName: 'John',
            lastName: 'Doe',
            age: 21,
          },
          invalidInput: {
            firstName: 1,
            lastName: 2,
            age: -1,
          },
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
            },
          }
        }
        const { immutable } = new PolynImmutable({ Validator })
        const Sut = immutable(expected.name, expected.schema)
        const actualValid = new Sut(expected.validInput)
        const actualInvalid = () => new Sut(expected.invalidInput)

        expect(actualValid).to.deep.equal(expected.validInput)
        expect(actualInvalid).to.throw(Error, 'Invalid NewImmutable:JSONSchema: NewImmutable:JSONSchema.firstName should be string, NewImmutable:JSONSchema.lastName should be string, NewImmutable:JSONSchema.age should be >= 0')
      },
    }, // setValidator
    'when an immutable is extended with a static property': {
      when: () => {
        const Sut = immutable('staticExtensionTest', {
          requiredString: 'string',
          optionalObj: 'object?',
        })

        Sut.staticProp = 'static'
        Sut.staticFunc = () => 'static'

        return Sut
      },
      'it should allow static properties, and have no effect on them': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.staticProp).to.equal('static')
        expect(actual.staticFunc()).to.equal('static')
        actual.staticProp = 'static2'
        expect(actual.staticProp).to.equal('static2')
      },
    },
    'when `immutable.array` is used': {
      given: () => [3, 1, 2],
      'and `push` is executed with a new value': {
        when: (original) => ({
          original,
          actual: array(original).push(4, 5),
        }),
        'it should return a new array with the value(s) appended to it': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original).to.deep.equal([3, 1, 2])
          expect(actual).to.deep.equal([3, 1, 2, 4, 5])
        },
      },
      'and `pop` is executed': {
        when: (original) => ({
          original,
          actual: array(original).pop(),
        }),
        'it should return a new array with the last element having been removed': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original).to.deep.equal([3, 1, 2])
          expect(actual).to.deep.equal([3, 1])
        },
      },
      'and `shift` is executed': {
        when: (original) => ({
          original,
          actual: array(original).shift(),
        }),
        'it should return a new array with the first element having been removed': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original).to.deep.equal([3, 1, 2])
          expect(actual).to.deep.equal([1, 2])
        },
      },
      'and `unshift` is executed': {
        when: (original) => ({
          original,
          actual: array(original).unshift(4, 5),
        }),
        'it should return a new array with the value(s) added at the beginning of the array': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original).to.deep.equal([3, 1, 2])
          expect(actual).to.deep.equal([4, 5, 3, 1, 2])
        },
      },
      'and `sort` is executed without a comparer function': {
        when: (original) => ({
          original,
          actual: array(original).sort(),
        }),
        'it should return a new array with sorted values': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original).to.deep.equal([3, 1, 2])
          expect(actual).to.deep.equal([1, 2, 3])
        },
      },
      'and `sort` is executed with a comparer function': {
        when: (original) => ({
          original,
          actual: array(original).sort((a, b) => b - a),
        }),
        'it should return a new array with sorted values': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original).to.deep.equal([3, 1, 2])
          expect(actual).to.deep.equal([3, 2, 1])
        },
      },
      'and `reverse` is executed': {
        when: (original) => ({
          original,
          actual: array(original).reverse(),
        }),
        'it should return a new array with the values in opposite order': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original, 'original').to.deep.equal([3, 1, 2])
          expect(actual, 'actual').to.deep.equal([2, 1, 3])
        },
      },
      'and `slice` is executed': {
        when: (original) => ({
          original,
          actual: array(original).slice(0, 2),
        }),
        'it should return a new array with the values in opposite order': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original, 'original').to.deep.equal([3, 1, 2])
          expect(actual, 'actual').to.deep.equal([3, 1])
        },
      },
      'and `splice` is executed with 0 as the 2nd arg': {
        when: (original) => ({
          original,
          actual: array(original).splice(1, 0, 4),
        }),
        'it should return a new array with the 3rd arg inserted at the index that matches the 1st arg': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original, 'original').to.deep.equal([3, 1, 2])
          expect(actual, 'actual').to.deep.equal([3, 4, 1, 2])
        },
      },
      'and `splice` is executed with a number greater than 0 as the 2nd arg': {
        when: (original) => ({
          original,
          actual: array(original).splice(1, 1, 4),
          actual2: array(original).splice(1, 2, 4, 5),
        }),
        'it should return a new array replacing the number of elements indicated by the 2nd arg with the args that follow it': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual, actual2 } = result
          expect(original, 'original').to.deep.equal([3, 1, 2])
          expect(actual, 'actual').to.deep.equal([3, 4, 2])
          expect(actual2, 'actual2').to.deep.equal([3, 4, 5])
        },
      },
      'and `remove` is executed': {
        when: (original) => ({
          original,
          actual: array(original).remove(1),
        }),
        'it should removed the element at the given index': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original, 'original').to.deep.equal([3, 1, 2])
          expect(actual, 'actual').to.deep.equal([3, 2])
        },
      },
      'and `copy` is executed': {
        when: (original) => {
          const result = {
            original,
            actual: array(original).copy(),
          }

          result.actual.pop() // mutate the copy
          return result
        },
        'it should return a clone of the array': (expect) => (err, result) => {
          expect(err).to.equal(null)
          const { original, actual } = result
          expect(original, 'original').to.deep.equal([3, 1, 2])
          expect(actual, 'actual').to.deep.equal([3, 1])
        },
      },
    },
    '// benchmark': {
      when: () => {
        const times = 1000
        const objects = []
        const immutables = []

        const objStart = new Date().getTime()

        for (let i = 0; i < times; i += 1) {
          objects.push(makeOne())
        }

        const objEnd = new Date().getTime()

        const immutableStart = new Date().getTime()
        const Sut = immutable('benchmark', makeModel())
        const val = makeOne()

        for (let i = 0; i < times; i += 1) {
          immutables.push(new Sut(val))
        }

        const immutableEnd = new Date().getTime()

        return {
          objDuration: objEnd - objStart,
          immutableDuration: immutableEnd - immutableStart,
        }
      },
      /* eslint-disable no-console */
      'compared to regular objects (note ~1/2+ the time is blueprint validation)': (expect) => (err, results) => {
        expect(err).to.be.null

        console.log(`Duration for creating objects (ms): ${results.objDuration}`)
        console.log(`Duration for creating immutables (ms): ${results.immutableDuration}`)
      },
      /* eslint-enable no-console */
    },
  })
}
