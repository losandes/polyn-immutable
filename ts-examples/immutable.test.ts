import { expect } from 'chai';
import { immutable, IValidatedImmutable } from '..'
import { gt } from '@polyn/blueprint'

export function run () {
  'use strict';

  interface IPerson extends IValidatedImmutable<IPerson> {
    readonly firstName: string;
    readonly lastName: string;
    readonly age: number;
  }

  // immutable
  // =============================================================================
  const Person = immutable<IPerson>('Person', {
    firstName: 'string',
    lastName: 'string',
    age: gt(0)
  })

  const person: IPerson = new Person({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });

  expect(person).to.deep.equal({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });

  // patch
  // =============================================================================
  const modified = person.patch({ age: 22 })
  expect(person).to.deep.equal({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });
  expect(modified).to.deep.equal({
    firstName: 'John',
    lastName: 'Doe',
    age: 22
  });

  // toObject
  // =============================================================================
  const mutable = person.toObject()
  mutable.age = 22
  const modified2 = new Person(mutable)

  expect(person).to.deep.equal({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
  });
  expect(modified2).to.deep.equal({
    firstName: 'John',
    lastName: 'Doe',
    age: 22
  });
}
