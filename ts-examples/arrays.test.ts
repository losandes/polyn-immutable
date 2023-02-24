import { expect } from 'chai';
import { array } from '@polyn/immutable';

export function run () {
  'use strict';

  const arr1 = [1, 2, 3];
  const arr2 = array(arr1).push(4);
  expect(arr1).to.deep.equal([1, 2, 3]);
  expect(arr2).to.deep.equal([1, 2, 3, 4]);
}
