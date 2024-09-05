/* eslint-disable no-restricted-syntax */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { type AcceptableValueTypes, checkValueOfType, valueOfType } from '../value-of-type';

const testValues: [AcceptableValueTypes, unknown, unknown][] = [
  [String, 15, 'hi'],
  [Number, 'hi', 10],
  [Symbol, 'hi', Symbol('testSymbol')],
  [Boolean, 'hi', true],
  [Function, 'hi', () => {}],
  [BigInt, 'hi', BigInt(100)],
  [Date, 'hi', new Date()],
  [Object, 'hi', {}],
];

describe('checkValueOfType', () => {
  describe("Given the value isn't of the expected type", () => {
    it('should fail', () => {
      for (const [valueType, actual] of testValues) {
        const { transformedActual } = assertFailure(
          checkValueOfType({ actual, expected: valueOfType(valueType) }),
        );
        assert.deepStrictEqual(transformedActual, actual);
      }
    });
  });

  describe('Given the value is of the expected type', () => {
    it('should succeed', () => {
      for (const [valueType, , actual] of testValues) {
        const { transformedActual } = assertSuccess(
          checkValueOfType({ actual, expected: valueOfType(valueType) }),
        );
        assert.deepStrictEqual(transformedActual, valueOfType(valueType));
      }
    });
  });
});
