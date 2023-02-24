import { expect } from 'chai';
import { gt, optional, IValidatorArg } from '@polyn/blueprint';
import { immutable, IValidatedImmutable } from '@polyn/immutable';
import { v4 as uuid } from 'uuid';

const UUID_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export function run () {
  'use strict';

  // ===========================================================================
  // Example 1:
  // An immutable is created with an interface, IPerson, to explain the output,
  // and a different interface, IPersonInput to explain the arguments this
  // immutable accepts. It also uses `optional.withDefault` to bridge the
  // gap between the two interfaces: to generate an ID when one isn't given.

  interface IPerson extends IValidatedImmutable<IPerson> {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly age: number;
  }

  // notice the `id` is optional
  interface IPersonInput {
    readonly id?: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly age: number;
  }

  const Person = immutable<IPerson, IPersonInput>('Person', {
    id: optional(UUID_REGEX).withDefault(uuid),
    firstName: 'string',
    lastName: 'string',
    age: gt(0)
  });

  const person: IPerson = new Person({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });

  expect(UUID_REGEX.test(person.id)).to.equal(true);
  expect(person.firstName).to.equal('John');
  expect(person.lastName).to.equal('Doe');
  expect(person.age).to.equal(21);
  expect(() => new Person({
    firstName: '',
    lastName: '',
    age: -1
  })).to.throw(Error, 'Invalid Person: expected `firstName` {string} to not be an empty string, expected `lastName` {string} to not be an empty string, expected `age` to be greater than 0');


  // The following examples should not compile (uncomment to test):
  // new Person()
  // new Person({})
  // new Person({
  //   firstName: 1,
  //   lastName: 1,
  //   age: '21'
  // })

  // ===========================================================================
  // Example 2:
  // If you don't provide a 2nd Type argument to `immutable`, it will
  // require an argument of type `any`. If you want your code to express
  // this statically, that works too:

  const ILikeAnyStatic = immutable<IPerson, any>('Person', {
    id: optional(UUID_REGEX).withDefault(uuid),
    firstName: 'string',
    lastName: 'string',
    age: gt(0)
  });

  // ===========================================================================
  // Example 3:
  // Leveraging this to transform input data works as long as the first
  // property on your blueprint performs the transformation (this is required
  // because it's the first property to be executed).

  interface ICsvInput {
    csv: string;
  }

  interface IPersonCsvOutput extends IPerson, ICsvInput {}

  const IPersonFromCsv = immutable<IPersonCsvOutput, ICsvInput>('PersonCSV', {
    csv: ({ value, input }: IValidatorArg) => {
      // note this is **not** an ok csv parser - that's not what I'm demonstrating
      const values = value.split(',');
      input.id = parseInt(values[0]);
      input.firstName = values[1];
      input.lastName = values[2];
      input.age = parseInt(values[3]);

      return { value };
    },
    id: gt(0),
    firstName: 'string',
    lastName: 'string',
    age: gt(0)
  });

  expect(new IPersonFromCsv({ csv: '1,John,Doe,21' })).to.deep.equal({
    csv: '1,John,Doe,21',
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });
}
