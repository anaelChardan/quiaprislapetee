import { describe, it } from 'node:test';
import assert from 'node:assert';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { checkMatchers } from '../check-matchers';
import { stringIncluding } from '../../string-including';
import { arrayContaining } from '../../array-containing';
import { valueOfType } from '../../value-of-type';
import { objectContaining } from '../../object-containing';

describe('Given an exact array', () => {
  const expected = [1, 2, 3, 'bar', stringIncluding('quz')];

  describe('When actual is not an array', () => {
    const actual = 'foo';

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual is a different array', () => {
    const actual = ['foo'];

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual has more items', () => {
    const actual = [1, 2, 3, 'bar', 'quz', 'baz'];

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, [1, 2, 3, 'bar', stringIncluding('quz'), 'baz']);
    });
  });

  describe('When actual has same length but different items', () => {
    const actual = [1, 2, 3, 'foo', 'baz'];

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual has the same content', () => {
    const actual = [1, 2, 3, 'bar', 'quz'];

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});

describe('Given a partial array with arrayContaining', () => {
  const expected = arrayContaining([1, valueOfType(Number), 3, 1, 'bar']);

  describe('When actual is not an array', () => {
    const actual = 'foo';

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual does not contain all the expected items', () => {
    const actual = [1, 2, 3];

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      // We expect no item to be transformed if we don't find all of the expected values
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual has all the expected items', () => {
    // Out of order, has 1 only once on purpose to mirror Jest's behaviour
    const actual = [3, 1, 'hey', 'baz', 2, 'bar'];

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});

describe('Given an object definition', () => {
  const expected = {
    a: 5,
    b: objectContaining({
      c: stringIncluding('hi'),
    }),
    d: {
      e: 'foo',
    },
  };

  describe('When actual is not an object', () => {
    const actual = 5;

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual does not match the input', () => {
    const actual = { a: 10, b: { c: 'hi' }, d: { e: 'foo' } };

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, { ...actual, b: expected.b });
    });
  });

  describe('When actual has more keys than the input', () => {
    const actual = { a: 5, b: { c: 'hi' }, d: { e: 'foo' }, f: 'bar' };

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, { ...actual, b: expected.b });
    });
  });

  describe('When actual matches the input', () => {
    const actual = { a: 5, b: { c: 'hi' }, d: { e: 'foo' } };

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});

describe('Given a partial object defined with objectContaining', () => {
  const expected = objectContaining({
    a: 5,
    b: objectContaining({
      c: stringIncluding('hi'),
    }),
  });

  describe('When actual is not an object', () => {
    const actual = 5;

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual does not match the structure', () => {
    const actual = { a: 10 };

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('When actual matches the structure', () => {
    const actual = { a: 5, b: { c: 'hi', d: 10 }, e: 'Some other property' };

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkMatchers({ actual, expected }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});
