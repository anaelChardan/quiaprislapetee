import assert from 'node:assert';
import { assertMatches } from '@utils/node-test-utils';
import { arrayContaining } from '@utils/node-test-utils/matchers';
import { describe, it } from 'node:test';
import { assertTypeIsTrue, Equals } from '@utils/TypeEquals';
import { pipe } from '../../function';
import type { Result } from '../../Result';
import { toFailure, toSuccess } from '../../Result';
import {
  filter,
  filter_,
  headOrUndefined,
  partition,
  partitionMap,
  partitionMap_,
  partition_,
  tail,
  unique,
} from '../index';

describe('filter()', () => {
  describe('Given an array and a predicate', () => {
    const array = [1, 3, 5];
    const predicate = (n: number) => n > 4;

    it('should return an array containing only elements matching the predicate', () => {
      assertMatches(filter(array, predicate), [5]);
    });
  });

  describe('Given an array and a refinement', () => {
    const array = ['a', 1, 'b', 4];
    const refinement = (n: string | number): n is number => typeof n === 'number';

    it('should return an array containing only elements matching the refinement, with the right type', () => {
      const result = array.filter(refinement);
      assertMatches(result, [1, 4]);

      // Here we prove that result has type `number[]`, so the refinement works
      assertTypeIsTrue<Equals<typeof result, number[]>>();
    });
  });
});

describe('filter_()', () => {
  describe('Given an array and a predicate', () => {
    const array = [1, 3, 5];
    const predicate = (n: number) => n > 4;

    it('should return an array containing only elements matching the predicate', () => {
      assertMatches(filter_(predicate)(array), [5]);
    });
  });

  describe('Given an array and a refinement', () => {
    const array = ['a', 1, 'b', 4];
    const refinement = (n: string | number): n is number => typeof n === 'number';

    it('should return an array containing only elements matching the refinement, with the right type', () => {
      const result = array.filter(refinement);
      assertMatches(result, [1, 4]);

      // Here we prove that result has type `number[]`, so the refinement works
      assertTypeIsTrue<Equals<typeof result, number[]>>();
    });
  });
});

describe('unique()', () => {
  describe('Given an array with unique elements', () => {
    const arr = [1, 2, 3];

    it('returns an array with the same elements', () => {
      assertMatches(unique(arr), arrayContaining([1, 2, 3]));
    });
  });

  describe('Given an array with some duplicate elements', () => {
    const arr = [1, 2, 2, 5, 4, 5];

    it('should return only the unique elements', () => {
      assertMatches(unique(arr), arrayContaining([1, 2, 4, 5]));
    });
  });
});

describe('headOrUndefined()', () => {
  describe('Given an empty array', () => {
    const array: number[] = [];

    it('should return undefined', () => {
      assert.strictEqual(headOrUndefined(array), undefined);
    });
  });

  describe('Given an array with at least 1 element', () => {
    const array = [1, 2, 3];

    it('should return the first item', () => {
      assertMatches(headOrUndefined(array), 1);
    });
  });
});

describe('tail()', () => {
  describe('Given an empty array', () => {
    const array: number[] = [];

    it('should return an empty array', () => {
      assertMatches(tail(array), []);
    });
  });

  describe('Given an array with one element', () => {
    const array = [1];

    it('should return an empty array', () => {
      assertMatches(tail(array), []);
    });
  });

  describe('Given an array with more than one element', () => {
    const array = [1, 2, 3];

    it('should return all but the first element', () => {
      assertMatches(tail(array), [2, 3]);
    });
  });
});

describe('partition()', () => {
  describe('Given an array of xs and a criteria function', () => {
    const xs: ('a' | 'b')[] = ['a', 'b', 'b'];
    const refinement = (x: 'a' | 'b'): x is 'a' => x === 'a';

    it('should return the matching xs on the left and the others on the right', () => {
      const [as, bs] = partition(xs, refinement);

      assert.strictEqual(as.length, 1);
      assert.strictEqual(bs.length, 2);

      // Here we prove that the refinement works
      assertTypeIsTrue<Equals<typeof as, 'a'[]>>();
      assertTypeIsTrue<Equals<typeof bs, 'b'[]>>();
    });
  });
});

describe('partition_()', () => {
  describe('Given an array of xs and a criteria function', () => {
    const xs: ('a' | 'b')[] = ['a', 'b', 'b'];
    const refinement = (x: 'a' | 'b'): x is 'a' => x === 'a';

    it('should return the matching xs on the left and the others on the right', () => {
      const [as, bs] = pipe(xs, partition_(refinement));

      assert.strictEqual(as.length, 1);
      assert.strictEqual(bs.length, 2);

      // Here we prove that the refinement works
      assertTypeIsTrue<Equals<typeof as, 'a'[]>>();
      assertTypeIsTrue<Equals<typeof bs, 'b'[]>>();
    });
  });
});

describe('partitionMap()', () => {
  describe('Given an array of xs and a transform function', () => {
    const xs: ('a' | 'b')[] = ['a', 'b', 'b'];
    const f = (x: 'a' | 'b'): Result<'ah', 'beautiful'> =>
      x === 'a' ? toFailure('ah') : toSuccess('beautiful');

    it('should return the split arrays with transformed values', () => {
      const [beautifuls, ahs] = partitionMap(xs, f);

      assert.strictEqual(beautifuls.length, 2);
      assert.strictEqual(ahs.length, 1);
    });
  });
});

describe('partitionMap_()', () => {
  describe('Given an array of xs and a transform function', () => {
    const xs: ('a' | 'b')[] = ['a', 'b', 'b'];
    const f = (x: 'a' | 'b'): Result<'ah', 'beautiful'> =>
      x === 'a' ? toFailure('ah') : toSuccess('beautiful');

    it('should return the split arrays with transformed values', () => {
      const [beautifuls, ahs] = pipe(xs, partitionMap_(f));

      assert.strictEqual(beautifuls.length, 2);
      assert.strictEqual(ahs.length, 1);
    });
  });
});
