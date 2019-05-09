import { expect } from 'chai';
import { array, immutable, Immutable, IValidatedImmutable } from './index';
import { gt } from '@polyn/blueprint'
import * as Ajv from 'ajv'

export interface IPerson extends IValidatedImmutable<IPerson> {
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
}

// immutable ===================================================================
export const Person = immutable<IPerson>('Person', {
  firstName: 'string',
  lastName: 'string',
  age: gt(0)
})

const person: IPerson = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
})

console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }

// patch =======================================================================
const modified = person.patch({ age: 22 })
console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
console.log(modified)
// prints { firstName: 'John', lastName: 'Doe', age: 22 }

// toObject ====================================================================
const mutable = person.toObject()
mutable.age = 22
const modified2 = new Person(mutable)

console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
console.log(modified2)
// prints { firstName: 'John', lastName: 'Doe', age: 22 }

// custom Validator ============================================================
/**
 * Creates a validator that uses ajv to validate data against
 * the given JSON Schema
 * @param {string} name - the name of the model being validated
 * @param {object} schema - the JSON Schema this model should match
 */
function AjvValidator (name: string, schema: any) {
  const makeErrorText = (errors: any[] | null | undefined) => {
    return errors && errors
      .map((error) => `${name}${error.dataPath} ${error.message}`)
      .join(', ')
  }
  return {
    validate: (input: any) => {
      // allErrors: don't exit on first error
      const ajv = new Ajv({ allErrors: true })
      const isValid = ajv.validate(schema, input)

      if (!isValid) {
        throw new Error(`Invalid ${name}: ${makeErrorText(ajv.errors)}`)
      }
    }
  }
}

const customImmutable = Immutable({ Validator: AjvValidator })

const Person2 = customImmutable('Person', {
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

const person2 = new Person2({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
})

console.log(person2)
// prints: ValidatedImmutable { firstName: 'John', lastName: 'Doe', age: 21 }

try {
  const person3 = new Person({
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

// array =======================================================================
const arr1 = [1, 2, 3]
const arr2 = array(arr1).push(4)
expect(arr1).to.deep.equal([1, 2, 3])
expect(arr2).to.deep.equal([1, 2, 3, 4])
console.log(`${arr1} => ${arr2}`)
