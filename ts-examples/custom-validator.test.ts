import { expect } from 'chai';
import { PolynImmutable } from '@polyn/immutable'
import * as Ajv from 'ajv'

export function run () {
  'use strict';

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
  };

  const customImmutable = PolynImmutable({ Validator: AjvValidator }).immutable;

  interface IPerson {
    firstName: string;
    lastName: string;
    age: number;
  }

  const Person2 = customImmutable<IPerson, IPerson>('Person', {
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
  });

  const person2 = new Person2({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });

  expect(person2).to.deep.equal({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });

  expect(() => new Person2({
    firstName: 'John',
    lastName: 'Doe',
    age: -1
  })).to.throw(Error, 'Invalid Person: Person.age should be >= 0');


  // This should not compile:
  // new Person2({
  //   firstName: 1,
  //   lastName: 2,
  //   age: -1
  // })
}
