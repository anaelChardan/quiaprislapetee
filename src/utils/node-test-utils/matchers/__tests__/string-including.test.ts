import { describe, it } from 'node:test';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import assert from 'node:assert';
import { checkStringIncluding, stringIncluding } from '../string-including';

describe('checkStringIncluding()', () => {
  describe("Given the value doesn't match the type", () => {
    const expected = stringIncluding('bar');
    const actual = 5;

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkStringIncluding({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe("Given the value doesn't include the given string", () => {
    const expected = stringIncluding('bar');
    const actual = 'baz';

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkStringIncluding({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('Given the value includes the given string', () => {
    const expected = stringIncluding('bar');
    const actual = 'I went to a bar yesterday';

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkStringIncluding({ actual, expected }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});
