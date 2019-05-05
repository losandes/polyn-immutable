module.exports = (test) => {
  const { immutable, patch, blueprint } = test.sut

  return test('given `immutable`', {
    'when an immutable is constructed with valid input': {
      when: () => {
        const expected = {
          requiredString: 'hello',
          optionalString: 'world',
          date: new Date('2019-05-05T00:00:00.000Z'),
          regex: /[A-B]/g,
          bool: false,
          num: 1,
          decimal: 1.10,
          func: () => 1,
          arr: [1, 2, 3],
          objArr: [{ one: 1 }, { two: 2 }, { three: 3 }],
          grandParent: {
            requiredString: 'hello',
            optionalString: 'world',
            func: () => 1,
            arr: [1, 2, 3],
            objArr: [{ one: 1 }, { two: 2 }, { three: 3 }],
            parent: {
              requiredString: 'hello',
              optionalString: 'world',
              func: () => 1,
              arr: [1, 2, 3],
              objArr: [{ one: 1 }, { two: 2 }, { three: 3 }],
              child: {
                requiredString: 'hello',
                optionalString: 'world',
                func: () => 1,
                arr: [1, 2, 3],
                objArr: [{ one: 1 }, { two: 2 }, { three: 3 }]
              }
            }
          }
        }
        const Sut = immutable('Sut', {
          requiredString: 'string',
          optionalString: 'string?',
          date: 'date',
          regex: 'regexp',
          bool: 'boolean',
          num: 'number',
          decimal: 'decimal',
          func: 'function',
          arr: 'number[]',
          objArr: 'any[]',
          grandParent: {
            requiredString: 'string',
            optionalString: 'string?',
            func: 'function',
            arr: 'number[]',
            objArr: 'any[]',
            parent: {
              requiredString: 'string',
              optionalString: 'string?',
              func: 'function',
              arr: 'number[]',
              objArr: 'any[]',
              child: {
                requiredString: 'string',
                optionalString: 'string?',
                func: 'function',
                arr: 'number[]',
                objArr: 'any[]'
              }
            }
          }
        })
        const actual = new Sut(expected)

        return { expected, actual, Sut }
      },
      'it should return the value': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, actual, Sut } = when

        expect(actual).to.deep.equal(expected)
        expect(actual instanceof Sut).to.equal(true)
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
      'it should include the blueprint name in the TypeError (strict mode)': (expect) => (err, when) => {
        'use strict'

        expect(err).to.be.null
        const { actual } = when

        expect(() => { actual.requiredString = 'primitive-test' })
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
        expect(err.message).to.equal('Invalid invalidInputTest: invalidInputTest.requiredString {string} is invalid, invalidInputTest.optionalString {string} is invalid')
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
        expect(err.message).to.equal('Invalid nullInputTest: nullInputTest.requiredString {string} is invalid')
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
    }, // null input
    'when an immutable is constructed with an invalid name': {
      when: () => {
        const Sut = immutable('invalid-input-test', {
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
        expect(err.message).to.equal('The name, \'invalid-input-test\', has characters that aren\'t compatible with JavaScript class names: Unexpected token -')
      }
    },
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
        const { expected, actual, Sut } = when

        expect(actual).to.deep.equal(expected)
        expect(actual instanceof Sut).to.equal(true)
      }
    },
    'when an immutable is constructed with an invalid blueprint': {
      'it should throw': (expect) => {
        expect(() => { immutable('name', null) })
          .to.throw('blueprint requires a name {string}, and a blueprint {object}')
      }
    },
    'when an immutable is constructed without a name': {
      'it should throw': (expect) => {
        expect(() => { immutable(null, { str: 'string' }) })
          .to.throw('blueprint requires a name {string}, and a blueprint {object}')
      }
    },
    'when an eval hack is attempted in the immutable\'s name': {
      when: () => {
        return immutable('invalidInputTest; console.log(\'EVIL!\')', {
          requiredString: 'string',
          optionalString: 'string?'
        })
      },
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
        expect(err.message).to.contain('Unexpected')
      }
    },
    'when an immutable is patched': {
      when: () => {
        const Sut = immutable('PatchTest', {
          str1: 'string',
          str2: 'string',
          arr1: 'number[]',
          arr2: 'number[]',
          nest: {
            str1: 'string',
            str2: 'string',
            arr1: 'number[]',
            arr2: 'number[]',
          }
        })

        const input = {
          str1: 'original',
          str2: 'original',
          arr1: [1, 2, 3],
          arr2: [1, 2, 3],
          nest: {
            str1: 'nest-original',
            str2: 'nest-original',
            arr1: [1, 2, 3],
            arr2: [1, 2, 3]
          }
        }

        const expected = {
          str1: 'original',
          str2: 'patched',
          arr1: [1, 2, 3],
          arr2: [3, 4, 5],
          nest: {
            str1: 'nest-original',
            str2: 'nest-patched',
            arr1: [1, 2, 3],
            arr2: [3, 4, 5]
          }
        }

        const actual = new Sut(input)
        const patched = patch(actual)({
          str2: expected.str2,
          arr2: expected.arr2,
          nest: {
            str2: expected.nest.str2,
            arr2: expected.nest.arr2
          }
        })

        return { expected, patched }
      },
      'it should only patch the values that are given': (expect) => (err, when) => {
        expect(err).to.be.null
        const { expected, patched } = when

        expect(patched).to.deep.equal(expected)
      }
    }
  })
}
