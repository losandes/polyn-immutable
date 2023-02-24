import { expect } from 'chai';
import { immutable, IValidatedImmutable } from '@polyn/immutable'

export function run () {
  'use strict';

  // ===========================================================================
  // Example 1:
  // Plain TypeScript Sub-Class Polymorphism

  class Poly {
    readonly prop1: string;

    constructor (input: any) {
      this.prop1 = input.prop1;

      if (new.target === Poly) {
        Object.freeze(this);
      }
    }
  }

  class SubPoly extends Poly {
    readonly prop2: string;

    constructor (input: any) {
      super(input);
      this.prop2 = input.prop2;

      if (new.target === SubPoly) {
        Object.freeze(this);
      }
    }
  }

  // ===========================================================================
  // Example 2:
  // Sub-Class Polymorphism with @polyn/immutable

  interface IPolyn extends IValidatedImmutable<IPolyn> {
    readonly prop1: string;
  }

  const Polyn = immutable<IPolyn>('Polyn', {
    prop1: 'string'
  })

  class SubPolyn extends Polyn implements IPolyn {
    readonly prop2: string;

    constructor (input: any) {
      super(input);
      this.prop2 = input.prop2;

      if (new.target === SubPolyn) {
        Object.freeze(this);
      }
    }
  }

  // They should both meet the same expectations

  const expected = {
    prop1: 'sub-class',
    prop2: 'polymorphism'
  };

  // output should be the same
  expect(new SubPoly(expected)).to.deep.equal(expected);
  expect(new SubPolyn(expected)).to.deep.equal(expected);

  // should not be able to mutate prop1
  expect(() => (<any>new SubPoly(expected)).prop1 = 'broken')
    .to.throw(TypeError);
  expect(() => (<any>new SubPolyn(expected)).prop1 = 'broken')
    .to.throw(TypeError);

  // should not be able to mutate prop2
  expect(() => (<any>new SubPoly(expected)).prop2 = 'broken')
    .to.throw(TypeError);
  expect(() => (<any>new SubPolyn(expected)).prop2 = 'broken')
    .to.throw(TypeError);
}
