import { assertSuccess } from '@utils/general-type-helpers/testing/node';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { anyValue, checkAnyValue } from '../any-value';

describe('checkAnyValue()', () => {
  describe('Given a null value', () => {
    const expected = anyValue();
    const actual = null;

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkAnyValue({ expected, actual }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });

  describe('Given an undefined value', () => {
    const expected = anyValue();
    const actual = undefined;

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkAnyValue({ expected, actual }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });

  describe('Given a number value', () => {
    const expected = anyValue();
    const actual = 10;

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkAnyValue({ expected, actual }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });

  describe('Given a string value', () => {
    const expected = anyValue();
    const actual = 'str';

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkAnyValue({ expected, actual }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });

  describe('Given an array value', () => {
    const expected = anyValue();
    const actual: unknown[] = [];

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkAnyValue({ expected, actual }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });

  describe('Given an object value', () => {
    const expected = anyValue();
    const actual = {};

    it('should succeed', () => {
      const { transformedActual } = assertSuccess(checkAnyValue({ expected, actual }));
      assert.deepStrictEqual(transformedActual, expected);
    });
  });
});
