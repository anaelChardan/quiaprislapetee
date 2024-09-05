import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { pipe } from '../../function';
import * as R from '../index';

describe('sequenceResults()', () => {
  describe('Given an empty array', () => {
    const results: R.Result<unknown, unknown>[] = [];

    it('should return Success with an empty array', () => {
      const result = assertSuccess(R.sequenceResults(results));

      assertMatches(result, []);
    });
  });

  describe('Given results with failures', () => {
    const results: R.Result<'error1' | 'error2', number>[] = [
      R.toSuccess(1),
      R.toFailure('error2'),
      R.toSuccess(5),
      R.toFailure('error1'),
    ];

    it('should return an array of the content of the failures', () => {
      const result = assertFailure(R.sequenceResults(results));

      assertMatches(result, ['error2', 'error1']);
    });
  });

  describe('Given results with only successes', () => {
    const results: [
      R.Result<'error1' | 'error2', number>,
      R.Result<'error1' | 'error2', string>,
      R.Result<'error1' | 'error2', { id: string }>,
    ] = [R.toSuccess(1), R.toSuccess('twelve'), R.toSuccess({ id: '5' })];

    it('should return an array of the content of the successes', () => {
      const result = assertSuccess(R.sequenceResults(results));

      assertMatches(result, [1, 'twelve', { id: '5' }]);
    });
  });
});

describe('sequence()', () => {
  describe('Given an empty array and a combinator', () => {
    const results: R.Result<unknown, unknown>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const combinator = (a: unknown, b: unknown): unknown => undefined;

    it('should return Success with an empty array', () => {
      const result = assertSuccess(R.sequence(results, combinator));

      assertMatches(result, []);
    });
  });

  describe('Given results with failures and the first error combinator', () => {
    const results: R.Result<'error1' | 'error2', number>[] = [
      R.toSuccess(1),
      R.toFailure('error2'),
      R.toSuccess(5),
      R.toFailure('error1'),
    ];

    it('should return the first error', () => {
      const result = assertFailure(R.sequence(results, R.firstErrorCombinator));

      assertMatches(result, 'error2');
    });
  });

  describe('Given results with only successes and the first error combinator', () => {
    const results: [
      R.Result<'error1' | 'error2', number>,
      R.Result<'error1' | 'error2', string>,
      R.Result<'error1' | 'error2', { id: string }>,
    ] = [R.toSuccess(1), R.toSuccess('twelve'), R.toSuccess({ id: '5' })];

    it('should return an array of the content of the successes', () => {
      const result = assertSuccess(R.sequence(results, R.firstErrorCombinator));

      assertMatches(result, [1, 'twelve', { id: '5' }]);
    });
  });
});

describe('sequence_()', () => {
  describe('Given an empty array and a combinator', () => {
    const results: R.Result<unknown, unknown>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const combinator = (a: unknown, b: unknown): unknown => undefined;

    it('should return Success with an empty array', () => {
      const result = pipe(results, R.sequence_(combinator), assertSuccess);

      assertMatches(result, []);
    });
  });

  describe('Given results with failures and the first error combinator', () => {
    const results: R.Result<'error1' | 'error2' | 'error3', number>[] = [
      R.toSuccess(1),
      R.toFailure('error2'),
      R.toSuccess(5),
      R.toFailure('error1'),
      R.toFailure('error3'),
    ];

    it('should return the first error', () => {
      const result = pipe(results, R.sequence_(R.firstErrorCombinator), assertFailure);

      assertMatches(result, 'error2');
    });
  });

  describe('Given results with failures and a simple concat combinator', () => {
    const results: R.Result<'error1' | 'error2' | 'error3', number>[] = [
      R.toSuccess(1),
      R.toFailure('error2'),
      R.toSuccess(5),
      R.toFailure('error1'),
      R.toFailure('error3'),
    ];

    it('should return the first error', () => {
      const result = pipe(results, R.sequence_(R.firstErrorCombinator), assertFailure);

      assertMatches(result, 'error2');
    });
  });

  describe('Given results with only successes and the first error combinator', () => {
    const results: [
      R.Result<'error1' | 'error2', number>,
      R.Result<'error1' | 'error2', string>,
      R.Result<'error1' | 'error2', { id: string }>,
    ] = [R.toSuccess(1), R.toSuccess('twelve'), R.toSuccess({ id: '5' })];

    it('should return an array of the content of the successes', () => {
      const result = pipe(results, R.sequence_(R.firstErrorCombinator), assertSuccess);

      assertMatches(result, [1, 'twelve', { id: '5' }]);
    });
  });
});
