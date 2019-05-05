module.exports = (test) => {
  const { immutable } = test.sut

  return test('given `immutable`', {
    'when an immutable is constructed with valid input': {
      when: () => {
        const expected = {
          requiredString: 'hello',
          optionalString: 'world',
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
      'it should throw if you set a value with strict mode': (expect) => (err, when) => {
        'use strict'

        expect(err).to.be.null
        const { actual } = when
        const shouldThrow = () => { actual.requiredString = 'primitive-test' }

        expect(shouldThrow).to.throw(TypeError)
        expect(shouldThrow, 'error should contain blueprint name').to.throw('#<Sut>')
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
        expect(err.message).to.equal('Unexpected token -')
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
    }
  })
}
