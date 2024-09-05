/* eslint-disable no-plusplus */
import fc from 'fast-check';
import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import { compareNumbersAsc, compareStringsAsc, getOrderSort, invert, type Order } from '..';

describe('getOrderSort()', () => {
  describe('Given items and a comparison function', () => {
    type Item = {
      id: string;
      size: number;
    };
    const items: Item[] = [
      { id: 'one', size: 10 },
      { id: 'two', size: 15 },
      { id: 'three', size: 2 },
      { id: 'four', size: 10 },
    ];
    const compareBySize = (a: Item, b: Item): Order => {
      if (a.size === b.size) {
        return 'EQ';
      }

      return a.size < b.size ? 'LT' : 'GT';
    };

    it('should sort the array as expected', () => {
      const result = [...items].sort(getOrderSort(compareBySize));

      assertMatches(result, [
        { id: 'three', size: 2 },
        { id: 'one', size: 10 },
        { id: 'four', size: 10 },
        { id: 'two', size: 15 },
      ]);
    });
  });
});

describe('invert()', () => {
  describe('Given items and a comparison function', () => {
    type Item = {
      id: string;
      size: number;
    };
    const items: Item[] = [
      { id: 'one', size: 10 },
      { id: 'two', size: 15 },
      { id: 'three', size: 2 },
      { id: 'four', size: 10 },
    ];
    const compareBySize = (a: Item, b: Item): Order => {
      if (a.size === b.size) {
        return 'EQ';
      }

      return a.size < b.size ? 'LT' : 'GT';
    };

    it('should sort the array in the inverse order', () => {
      const result = [...items].sort(getOrderSort(invert(compareBySize)));

      assertMatches(result, [
        { id: 'two', size: 15 },
        { id: 'one', size: 10 },
        { id: 'four', size: 10 },
        { id: 'three', size: 2 },
      ]);
    });
  });
});

describe('compareNumbersAsc()', () => {
  it('should sort numbers in ascending order', () => {
    // Equal numbers
    assertMatches(compareNumbersAsc(1, 1), 'EQ');

    fc.assert(
      fc.property(fc.array(fc.integer()), (data) => {
        const sortedData = data.sort(getOrderSort(compareNumbersAsc));
        for (let i = 1; i < data.length; ++i) {
          assertMatches(sortedData[i - 1] <= sortedData[i]!, true);
        }
      }),
    );
  });
});

describe('compareStringsAsc()', () => {
  it('should sort strings in ascending alphabetical order', () => {
    // Equal strings
    assertMatches(compareStringsAsc('a', 'a'), 'EQ');

    fc.assert(
      fc.property(fc.array(fc.string()), (data) => {
        const sortedData = data.sort(getOrderSort(compareStringsAsc));
        for (let i = 1; i < data.length; ++i) {
          assertMatches(sortedData[i - 1] <= sortedData[i]!, true);
        }
      }),
    );
  });
});
