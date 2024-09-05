import { assertMatches } from '@utils/node-test-utils';
import { describe, it } from 'node:test';
import type { NonEmptyArray as NEA } from '../../NonEmptyArray';
import { fromArray } from '../../NonEmptyArray';
import { chunk } from '../chunk';

describe('chunk()', () => {
  describe('Given an array of values of even size', () => {
    const valuesEven: NEA<number> = fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) as NEA<number>;

    it('Returns the array of multiple parts with equal size', () => {
      const result = chunk(valuesEven, 5);

      assertMatches(result, [fromArray([1, 2, 3, 4, 5]), fromArray([6, 7, 8, 9, 10])]);
    });

    it('Returns the array of multiple parts with not equal size', () => {
      const result = chunk(valuesEven, 3);

      assertMatches(result, [
        fromArray([1, 2, 3]),
        fromArray([4, 5, 6]),
        fromArray([7, 8, 9]),
        fromArray([10]),
      ]);
    });
  });

  describe('Given an array of values of odd size', () => {
    const valuesOdd: NEA<number> = fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9]) as NEA<number>;

    it('Returns the array of multiple parts with not equal size', () => {
      const result = chunk(valuesOdd, 5);

      assertMatches(result, [fromArray([1, 2, 3, 4, 5]), fromArray([6, 7, 8, 9])]);
    });

    it('Returns the array of multiple parts with equal size', () => {
      const result = chunk(valuesOdd, 3);

      assertMatches(result, [fromArray([1, 2, 3]), fromArray([4, 5, 6]), fromArray([7, 8, 9])]);
    });
  });
});
