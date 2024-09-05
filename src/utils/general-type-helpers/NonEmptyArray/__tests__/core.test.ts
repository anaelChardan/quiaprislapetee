import assert from 'node:assert';
import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import { pipe } from '../../function';
import type { PositiveInteger } from '../../Integer';
import * as NEA from '..';

describe('fromArray()', () => {
  describe('Given an empty array', () => {
    const input: number[] = [];

    it('should return undefined', () => {
      assert.strictEqual(NEA.fromArray(input), undefined);
    });
  });

  describe('Given a non-empty array', () => {
    const input = [1, 4];

    it('should return a NonEmptyArray', () => {
      assertMatches(input, [1, 4]);
    });
  });
});

describe('fromSingleItem()', () => {
  describe('Given an item', () => {
    const item = 5;

    it('should return a non-empty array', () => {
      const result = NEA.fromSingleItem(item);

      assertMatches(result, [5]);
    });
  });
});

describe('concat()', () => {
  describe('given 2 non empty arrays', () => {
    const apples = ['🍎', '🍎', '🍎'] as NEA.NonEmptyArray<'🍎'>;
    const bananas = ['🍌', '🍌'] as NEA.NonEmptyArray<'🍌'>;

    it('should concat the arrays', () => {
      assertMatches(NEA.concat(apples, bananas), ['🍎', '🍎', '🍎', '🍌', '🍌']);
    });
  });
});

describe('map()', () => {
  describe('Given an array and a transformation function', () => {
    const input = [1, 4] as NEA.NonEmptyArray<number>;
    const double = (x: number): number => x * 2;

    it('should apply the function to the whole array and return the result', () => {
      assertMatches(NEA.map(input, double), [2, 8]);
    });
  });
});

describe('mapWithIndex()', () => {
  describe('Given an array and a transformation function', () => {
    const input = [1, 4] as NEA.NonEmptyArray<number>;
    const double = (x: number, index: number): number => x * 2 + index;

    it('should apply the function to the whole array and return the result', () => {
      assertMatches(NEA.mapWithIndex(input, double), [2, 9]);
    });
  });
});

describe('flatMap()', () => {
  describe('Given an array and a transformation function', () => {
    const input = [1, 4] as NEA.NonEmptyArray<number>;
    const doubleAndTriple = (x: number): NEA.NonEmptyArray<number> => [x * 2, x * 3];

    it('should apply the function to the whole array and return the result', () => {
      assertMatches(NEA.flatMap(input, doubleAndTriple), [2, 3, 8, 12]);
    });
  });
});

describe('chunk()', () => {
  describe('Given an array of values of even size', () => {
    const valuesEven = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as NEA.NonEmptyArray<number>;

    it('Returns the array of multiple parts with equal size', () => {
      const result = NEA.chunk(valuesEven, 5);

      assertMatches(result, [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ]);
    });

    it('Returns the array of multiple parts with not equal size', () => {
      const result = NEA.chunk(valuesEven, 3);

      assertMatches(result, [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });
  });

  describe('Given an array of values of odd size', () => {
    const valuesOdd = [1, 2, 3, 4, 5, 6, 7, 8, 9] as NEA.NonEmptyArray<number>;

    it('Returns the array of multiple parts with not equal size', () => {
      const result = NEA.chunk(valuesOdd, 5);

      assertMatches(result, [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9],
      ]);
    });

    it('Returns the array of multiple parts with equal size', () => {
      const result = NEA.chunk(valuesOdd, 3);

      assertMatches(result, [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
    });
  });
});

describe('filter()', () => {
  describe('Given a non-empty array and a filter that will make it empty', () => {
    const input: NEA.NonEmptyArray<number> = [10, 20];
    const criteria = (n: number): boolean => n < 5;

    it('should return undefined', () => {
      const result = NEA.filter(input, criteria);

      assert.strictEqual(result, undefined);
    });
  });

  describe('Given a non-empty array and a filter that will keep at least one element', () => {
    const input: NEA.NonEmptyArray<number | string> = [10, 20, 'some stuff'];
    // Testing that the type guard works
    const criteria = (n: number | string): n is number => typeof n === 'number';

    it('should return a non-empty array', () => {
      const result = NEA.filter(input, criteria);

      assertMatches(result, [10, 20]);
    });
  });
});

describe('filter_()', () => {
  describe('Given a non-empty array and a filter that will make it empty', () => {
    const input: NEA.NonEmptyArray<number> = [10, 20];
    const criteria = (n: number): boolean => n < 5;

    it('should return undefined', () => {
      const result = pipe(input, NEA.filter_(criteria));

      assert.strictEqual(result, undefined);
    });
  });

  describe('Given a non-empty array and a filter that will keep at least one element', () => {
    const input: NEA.NonEmptyArray<number | string> = [10, 20, 'some stuff'];
    // Testing that the type guard works
    const criteria = (n: number | string): n is number => typeof n === 'number';

    it('should return a non-empty array', () => {
      const result = pipe(input, NEA.filter_(criteria));

      assertMatches(result, [10, 20]);
    });
  });
});

describe('unique()', () => {
  describe('Given a non-empty array without duplicates', () => {
    const input: NEA.NonEmptyArray<number> = [10, 20];

    it('should return the same array', () => {
      const result = NEA.unique(input);

      assertMatches(result, [10, 20]);
    });
  });

  describe('Given a non-empty array with duplicates', () => {
    const input: NEA.NonEmptyArray<number> = [10, 20, 20];

    it('should return an array without duplicates', () => {
      const result = NEA.unique(input);

      assertMatches(result, [10, 20]);
    });
  });
});

describe('sort()', () => {
  describe('Given an array and a sort function', () => {
    const input = [1, 4, 2, 77, 32] as NEA.NonEmptyArray<number>;
    const sortDescending = (a: number, b: number): 1 | -1 => (a > b ? -1 : 1);

    it('should return a sorted array, without mutating the original array', () => {
      assertMatches(NEA.sort(input, sortDescending), [77, 32, 4, 2, 1]);
      assertMatches(input[0], 1);
    });
  });
});

describe('head()', () => {
  describe('Given a non-empty array', () => {
    const input = [1, 4] as NEA.NonEmptyArray<number>;

    it('should return the first element', () => {
      assertMatches(NEA.head(input), 1);
    });
  });
});

describe('last()', () => {
  describe('Given a non-empty array', () => {
    const input: NEA.NonEmptyArray<number> = [1, 2, 3];

    it('should return the last element', () => {
      const result = NEA.last(input);

      assertMatches(result, 3);
    });
  });
});

describe('sliceFromStart', () => {
  describe('Given a non-empty array and an end < its length', () => {
    const input: NEA.NonEmptyArray<number> = [1, 2, 3];
    const end = 2 as PositiveInteger;

    it('should return the expected slice of the array', () => {
      const result = NEA.sliceFromStart(input, end);

      assertMatches(result, [1, 2]);
    });
  });

  describe('Given a non-empty array and an end = its length', () => {
    const input: NEA.NonEmptyArray<number> = [1, 2, 3];
    const end = 3 as PositiveInteger;

    it('should return the whole array', () => {
      const result = NEA.sliceFromStart(input, end);

      assertMatches(result, [1, 2, 3]);
    });
  });

  describe('Given a non-empty array and an end > its length', () => {
    const input: NEA.NonEmptyArray<number> = [1, 2, 3];
    const end = 4 as PositiveInteger;

    it('should return the whole array', () => {
      const result = NEA.sliceFromStart(input, end);

      assertMatches(result, [1, 2, 3]);
    });
  });
});

describe('map_(), flatMap_() and sort_()', () => {
  describe('Given a string of operations', () => {
    const getAge = (user: { age: number }): number => user.age;
    const sortDesc = (a: number, b: number) => (a > b ? -1 : 1);
    const doubleAndTriple = (x: number): NEA.NonEmptyArray<number> => [x * 2, x * 3];
    const users: NEA.NonEmptyArray<{ name: string; age: number }> = [
      { name: 'John', age: 23 },
      { name: 'Christina', age: 45 },
    ];

    it('should execute them', () => {
      const result = pipe(
        users,
        NEA.map_(getAge),
        NEA.sort_(sortDesc),
        NEA.flatMap_(doubleAndTriple),
        NEA.head,
      );

      assertMatches(result, 90);
    });
  });
});
