import { describe, it } from 'node:test';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import assert from 'node:assert';
import { checkStringMatching, stringMatching } from '../string-matching';

describe('checkStringMatching()', () => {
  describe("Given the value doesn't match the type", () => {
    const expected = stringMatching(/^b.*r$/);
    const actual = 5;

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkStringMatching({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe("Given the value doesn't match the given regex", () => {
    const expected = stringMatching(/^b.*r$/);
    const actual = 'baz';

    it('should fail', () => {
      const { transformedActual } = assertFailure(checkStringMatching({ actual, expected }));
      assert.deepStrictEqual(transformedActual, actual);
    });
  });

  describe('Given the value matches the given regex', () => {
    const expected = stringMatching(/^b.*r$/);
    const actual = 'baaaar';

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkStringMatching({ actual, expected }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});
