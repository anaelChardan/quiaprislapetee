import assert from 'node:assert';
import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import * as R from '../../../Result';
import { assertFailure, assertSuccess } from '../result';

describe('assertSuccess()', () => {
  describe('Given a Success', () => {
    const result = R.toSuccess(10);

    it('should return the value', async () => {
      assertMatches(assertSuccess(result), 10);
    });
  });

  describe('Given a Failure', () => {
    const result = R.toFailure('some error');

    it('should return the value', async () => {
      assert.throws(() => assertSuccess(result));
    });
  });
});

describe('assertFailure()', () => {
  describe('Given a Failure', () => {
    const result = R.toFailure('some error');

    it('should return the error', async () => {
      assertMatches(assertFailure(result), 'some error');
    });
  });

  describe('Given a Success', () => {
    const result = R.toSuccess(10);

    it('should return the value', async () => {
      assert.throws(() => assertFailure(result));
    });
  });
});
