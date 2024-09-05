/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-throw-literal */
import assert from 'node:assert';
import { objectContaining } from '@utils/node-test-utils/matchers';
import { describe, it, mock } from 'node:test';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { assertMatches, assertHasNotBeenCalled } from '@utils/node-test-utils';
import { asyncPipe, pipe } from '../../function';
import * as R from '../index';

describe('fromNullable()', () => {
  describe('Given a null value', () => {
    const value = null;
    const defaultValue = 'some error';

    it('should return a Failure', () => {
      assertMatches(assertFailure(R.fromNullable(value, defaultValue)), 'some error');
    });
  });

  describe('Given an undefined value', () => {
    const value = undefined;
    const defaultValue = 'some error';

    it('should return a Failure', () => {
      assertMatches(assertFailure(R.fromNullable(value, defaultValue)), 'some error');
    });
  });

  describe('Given a non-nully value', () => {
    const value = 'hey';
    const defaultValue = 'some error';

    it('should return a Success', () => {
      assertMatches(assertSuccess(R.fromNullable(value, defaultValue)), 'hey');
    });
  });

  describe('Given false', () => {
    const value = false;
    const defaultValue = 'some error';

    it('should return a Success', () => {
      assertMatches(assertSuccess(R.fromNullable(value, defaultValue)), false);
    });
  });

  describe('Given an empty string', () => {
    const defaultValue = 'some error';

    it('should return a Success', () => {
      assertMatches(assertSuccess(R.fromNullable('', defaultValue)), '');
    });
  });

  describe('Given 0', () => {
    const value = 0;
    const defaultValue = 'some error';

    it('should return a Success', () => {
      assertMatches(assertSuccess(R.fromNullable(value, defaultValue)), 0);
    });
  });
});

describe('isResult()', () => {
  describe('Given undefined', () => {
    it('should returns false', () => {
      assert.strictEqual(R.isResult(undefined), false);
    });
  });

  describe('Given an object', () => {
    it('should returns false', () => {
      assert.strictEqual(R.isResult({}), false);
    });
  });

  describe('Given an a success result', () => {
    it('should returns true', () => {
      assert.strictEqual(R.isResult(R.toSuccess(1)), true);
    });
  });

  describe('Given an a failure result', () => {
    it('should returns true', () => {
      assert.strictEqual(R.isResult(R.toSuccess(1)), true);
    });
  });
});

describe('toNonEmptyArray()', () => {
  describe('Given an empty array', () => {
    it('should return a Failure', () => {
      assertMatches(assertFailure(R.toNonEmptyArray([], 'some error')), 'some error');
      assertMatches(assertFailure(pipe([], R.toNonEmptyArray_('some error'))), 'some error');
    });
  });

  describe('Given a hydrated array', () => {
    it('should return a Success as a NEA', () => {
      const nea = assertSuccess(R.toNonEmptyArray([1, 2, 3], 'some error'));
      assert.notStrictEqual(nea[0], undefined);
      assertMatches(nea, [1, 2, 3]);

      const nea2 = assertSuccess(pipe([1, 2, 3], R.toNonEmptyArray_('some error')));
      assert.notStrictEqual(nea2[0], undefined);
      assertMatches(nea2, [1, 2, 3]);
    });
  });
});

describe('tryCatch()', () => {
  describe('Given a function that does not throw', () => {
    const f = () => 5;
    const onThrow = (error: unknown) => ({ tag: 'wrappedError', error });

    it('should return its value in a Success', () => {
      assertMatches(assertSuccess(R.tryCatch(f, onThrow)), 5);
    });
  });

  describe('Given a function that throws', () => {
    const f = () => {
      // eslint-disable-next-line no-throw-literal
      throw '🍌';
    };
    const onThrow = (error: unknown) => ({ tag: 'wrappedError', error });

    it('should catch its error and return it in a Failure', () => {
      assertMatches(assertFailure(R.tryCatch(f, onThrow)), {
        tag: 'wrappedError',
        error: '🍌',
      });
    });
  });
});

describe('asyncTryCatch()', () => {
  describe('Given a function that does not throw', () => {
    const f = async () => 5;
    const onThrow = (error: unknown) => ({ tag: 'wrappedError', error });

    it('should return its value in a Success', async () => {
      assertMatches(assertSuccess(await R.asyncTryCatch(f, onThrow)), 5);
    });
  });

  describe('Given a function that throws', () => {
    const f = async () => {
      // eslint-disable-next-line no-throw-literal
      throw '🍌';
    };
    const onThrow = (error: unknown) => ({ tag: 'wrappedError', error });

    it('should catch its error and return it in a Failure', async () => {
      assertMatches(assertFailure(await R.asyncTryCatch(f, onThrow)), {
        tag: 'wrappedError',
        error: '🍌',
      });
    });
  });
});

describe('map()', () => {
  describe('Given a Success and a function', () => {
    const result = R.toSuccess(5);
    const double = (n: number): number => n * 2;

    it('should return the transformed Result', () => {
      assertMatches(
        R.map(result, double),
        objectContaining({
          _tag: 'success',
          value: 10,
        }),
      );
    });
  });

  describe('Given a Failure and a function', () => {
    const result = R.toFailure('an error occurred');
    const double = mock.fn();

    it('should return the Failure as it was and not call the function', () => {
      assertMatches(
        R.map(result, double),
        objectContaining({
          _tag: 'failure',
          error: 'an error occurred',
        }),
      );

      assertHasNotBeenCalled(double);
    });
  });
});

describe('mapError()', () => {
  describe('Given a Failure and a function', () => {
    const result = R.toFailure('an error');
    const wrapError = (message: string): { kind: 'unknown'; message: string } => ({
      kind: 'unknown',
      message,
    });

    it('should return the transformed Failure', () => {
      assertMatches(
        R.mapError(result, wrapError),
        objectContaining({
          _tag: 'failure',
          error: { kind: 'unknown', message: 'an error' },
        }),
      );
    });
  });

  describe('Given a Success and a function', () => {
    const result = R.toSuccess(5);
    const wrapError = mock.fn();

    it('should return the Success as it was and not call the function', () => {
      assertMatches(
        R.mapError(result, wrapError),
        objectContaining({
          _tag: 'success',
          value: 5,
        }),
      );

      assertHasNotBeenCalled(wrapError);
    });
  });
});

describe('flatMap()', () => {
  describe('Given a Success and an operation that succeeds', () => {
    const result = R.toSuccess(2);
    const isDivisibleByTwo = (n: number): R.Result<'not divisible by two', number> =>
      n % 2 === 0 ? R.toSuccess(n) : R.toFailure('not divisible by two');

    it('should return a Success', () => {
      assertMatches(
        R.flatMap(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
    });
  });

  describe('Given a Success and an operation that fails', () => {
    const result = R.toSuccess(3);
    const isDivisibleByTwo = (n: number): R.Result<'not divisible by two', number> =>
      n % 2 === 0 ? R.toSuccess(n) : R.toFailure('not divisible by two');

    it('should return a Failure', () => {
      assertMatches(
        R.flatMap(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
    });
  });

  describe('Given a Failure', () => {
    const result = R.toFailure('some error');
    const isDivisibleByTwo = mock.fn<any>();

    it('should return a Failure and not call the function', () => {
      assertMatches(
        R.flatMap(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );

      assertHasNotBeenCalled(isDivisibleByTwo);
    });
  });
});

describe('flatMapFirst()', () => {
  describe('Given a Success and an operation that succeeds', () => {
    const result = R.toSuccess(2);
    const validateNumber = (n: number): R.Result<'not divisible by two', void> =>
      n % 2 === 0 ? R.toSuccess(undefined) : R.toFailure('not divisible by two');

    it("should return a Success with the first Success' value", () => {
      assertMatches(
        R.flatMapFirst(result, validateNumber),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
      assertMatches(
        pipe(result, R.flatMapFirst_(validateNumber)),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
    });
  });

  describe('Given a Success and an operation that fails', () => {
    const result = R.toSuccess(3);
    const validateNumber = (n: number): R.Result<'not divisible by two', void> =>
      n % 2 === 0 ? R.toSuccess(undefined) : R.toFailure('not divisible by two');

    it('should return a Failure', () => {
      assertMatches(
        R.flatMapFirst(result, validateNumber),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
      assertMatches(
        pipe(result, R.flatMapFirst_(validateNumber)),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
    });
  });

  describe('Given a Failure', () => {
    const result = R.toFailure('some error');
    const isDivisibleByTwo = mock.fn<any>();

    it('should return a Failure and not call the function', () => {
      assertMatches(
        R.flatMapFirst(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );
      assertMatches(
        pipe(result, R.flatMapFirst_(isDivisibleByTwo)),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );

      assertHasNotBeenCalled(isDivisibleByTwo);
    });
  });
});

describe('flatMapError()', () => {
  describe('Given a failure and a recovery operation that succeeds', () => {
    const result = R.toFailure('some error' as const);
    const recover = () => R.toSuccess('recovered!' as const);

    it('should return a success', () => {
      assertMatches(
        R.flatMapError(result, recover),
        objectContaining({
          _tag: 'success',
          value: 'recovered!',
        }),
      );
    });
  });

  describe('Given a failure and a recovery operation that fails', () => {
    const result = R.toFailure('some error' as const);
    const recover = () => R.toFailure('Failed again :(' as const);

    it('should return a failure', () => {
      assertMatches(
        R.flatMapError(result, recover),
        objectContaining({
          _tag: 'failure',
          error: 'Failed again :(',
        }),
      );
    });
  });

  describe('Given a success and a recovery operation', () => {
    const result = R.toSuccess('some value' as const);
    const recover = mock.fn<any>();

    it('should return the original success and not call the recovery function', () => {
      assertMatches(
        R.flatMapError(result, recover),
        objectContaining({
          _tag: 'success',
          value: 'some value',
        }),
      );

      assertHasNotBeenCalled(recover);
    });
  });
});

describe('asyncFlatMap()', () => {
  describe('Given a Success and an async operation that succeeds', () => {
    const result = R.toSuccess(2);
    const isDivisibleByTwo = async (
      n: number,
    ): Promise<R.Result<'not divisible by two', number>> =>
      n % 2 === 0 ? R.toSuccess(n) : R.toFailure('not divisible by two');

    it('should resolve to a Success', async () => {
      assertMatches(
        await R.asyncFlatMap(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMap_(isDivisibleByTwo)),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
    });
  });

  describe('Given a Success and an operation that fails', () => {
    const result = R.toSuccess(3);
    const isDivisibleByTwo = async (
      n: number,
    ): Promise<R.Result<'not divisible by two', number>> =>
      n % 2 === 0 ? R.toSuccess(n) : R.toFailure('not divisible by two');

    it('should resolve to a Failure', async () => {
      assertMatches(
        await R.asyncFlatMap(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMap_(isDivisibleByTwo)),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
    });
  });

  describe('Given a Failure', () => {
    const result = R.toFailure('some error');
    const isDivisibleByTwo = mock.fn<any>();

    it('should resolve to a Failure and not call the function', async () => {
      assertMatches(
        await R.asyncFlatMap(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMap_(isDivisibleByTwo)),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );

      assertHasNotBeenCalled(isDivisibleByTwo);
    });
  });
});

describe('asyncFlatMapFirst()', () => {
  describe('Given a Success and an async operation that succeeds', () => {
    const result = R.toSuccess(2);
    const validateNumber = async (n: number): Promise<R.Result<'not divisible by two', void>> =>
      n % 2 === 0 ? R.toSuccess(undefined) : R.toFailure('not divisible by two');

    it("should return a Success with the first Success' value", async () => {
      assertMatches(
        await R.asyncFlatMapFirst(result, validateNumber),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMapFirst_(validateNumber)),
        objectContaining({
          _tag: 'success',
          value: 2,
        }),
      );
    });
  });

  describe('Given a Success and an operation that fails', () => {
    const result = R.toSuccess(3);
    const validateNumber = async (n: number): Promise<R.Result<'not divisible by two', void>> =>
      n % 2 === 0 ? R.toSuccess(undefined) : R.toFailure('not divisible by two');

    it('should resolve to a Failure', async () => {
      assertMatches(
        await R.asyncFlatMapFirst(result, validateNumber),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMapFirst_(validateNumber)),
        objectContaining({
          _tag: 'failure',
          error: 'not divisible by two',
        }),
      );
    });
  });

  describe('Given a Failure', () => {
    const result = R.toFailure('some error');
    const isDivisibleByTwo = mock.fn<any>();

    it('should resolve to a Failure and not call the function', async () => {
      assertMatches(
        await R.asyncFlatMapFirst(result, isDivisibleByTwo),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMapFirst_(isDivisibleByTwo)),
        objectContaining({
          _tag: 'failure',
          error: 'some error',
        }),
      );

      assertHasNotBeenCalled(isDivisibleByTwo);
    });
  });
});

describe('asyncFlatMapError()', () => {
  describe('Given a failure and an async recovery operation that succeeds', () => {
    const result = R.toFailure('some error' as const);
    const recover = async () => R.toSuccess('recovered!' as const);

    it('should return a success', async () => {
      assertMatches(
        await R.asyncFlatMapError(result, recover),
        objectContaining({
          _tag: 'success',
          value: 'recovered!',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMapError_(recover)),
        objectContaining({
          _tag: 'success',
          value: 'recovered!',
        }),
      );
    });
  });

  describe('Given a failure and an async recovery operation that fails', () => {
    const result = R.toFailure('some error' as const);
    const recover = async () => R.toFailure('Failed again :(' as const);

    it('should return a failure', async () => {
      assertMatches(
        await R.asyncFlatMapError(result, recover),
        objectContaining({
          _tag: 'failure',
          error: 'Failed again :(',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMapError_(recover)),
        objectContaining({
          _tag: 'failure',
          error: 'Failed again :(',
        }),
      );
    });
  });

  describe('Given a success and an async recovery operation', () => {
    const result = R.toSuccess('some value' as const);
    const recover = mock.fn<any>();

    it('should return the original success and not call the recovery function', async () => {
      assertMatches(
        await R.asyncFlatMapError(result, recover),
        objectContaining({
          _tag: 'success',
          value: 'some value',
        }),
      );
      assertMatches(
        await asyncPipe(result, R.asyncFlatMapError_(recover)),
        objectContaining({
          _tag: 'success',
          value: 'some value',
        }),
      );

      assertHasNotBeenCalled(recover);
    });
  });
});

describe('map_(), mapError_(), flatMap_() and flatMapError_()', () => {
  describe('Given several operations', () => {
    const double = (n: number): number => n * 2;
    const validateDivisibleBy3 = (n: number): R.Result<'invalidNumber', number> =>
      n % 3 === 0 ? R.toSuccess(n) : R.toFailure('invalidNumber');
    const wrapValidationError = (
      message: string,
    ): { kind: 'validationError'; message: string } => ({
      kind: 'validationError',
      message,
    });
    const recover = () => R.toSuccess("It's a failure");

    it('should return the right result after executing them', () => {
      const result1 = pipe(
        4,
        validateDivisibleBy3,
        R.map_(double),
        R.mapError_(wrapValidationError),
      );

      assertMatches(
        result1,
        objectContaining({
          _tag: 'failure',
          error: { kind: 'validationError', message: 'invalidNumber' },
        }),
      );

      const result2 = pipe(
        3,
        R.toSuccess,
        R.map_(double),
        R.flatMap_(validateDivisibleBy3),
        R.mapError_(wrapValidationError),
      );

      assertMatches(result2, objectContaining({ _tag: 'success', value: 6 }));

      const result3 = pipe(4, validateDivisibleBy3, R.map_(double), R.flatMapError_(recover));

      assertMatches(
        result3,
        objectContaining({
          _tag: 'success',
          value: "It's a failure",
        }),
      );
    });
  });
});

describe('fold()', () => {
  const onSuccess = (n: number): number => n * 2;
  const onFailure = (message: string): string => `an error occurred: ${message}`;

  describe('Given a Success and an onSuccess function', () => {
    const result = R.toSuccess(5);

    it('should return the transformed value', () => {
      assertMatches(R.fold(result, onFailure, onSuccess), 10);
    });
  });

  describe('Given a Failure and a transform function', () => {
    const result = R.toFailure('some error');

    it('should return the result', () => {
      assertMatches(R.fold(result, onFailure, onSuccess), 'an error occurred: some error');
    });
  });
});

describe('fold_()', () => {
  const onSuccess = (n: number): number => n * 2;
  const onFailure = (message: string): string => `an error occurred: ${message}`;

  describe('Given a Success and an onSuccess function', () => {
    const result = R.toSuccess(5);

    it('should return the transformed value', () => {
      assertMatches(pipe(result, R.fold_(onFailure, onSuccess)), 10);
    });
  });

  describe('Given a Failure and a transform function', () => {
    const result = R.toFailure('some error');

    it('should return the result', () => {
      assertMatches(pipe(result, R.fold_(onFailure, onSuccess)), 'an error occurred: some error');
    });
  });
});

describe('bimap()', () => {
  const onSuccess = (n: number): number => n * 2;
  const onFailure = (message: string): string => `an error occurred: ${message}`;

  describe('Given a Success and an onSuccess function', () => {
    const result = R.toSuccess(5);

    it('should return the transformed value', () => {
      assertMatches(R.bimap(result, onFailure, onSuccess), R.toSuccess(10));
    });
  });

  describe('Given a Failure and a transform function', () => {
    const result = R.toFailure('some error');

    it('should return the result', () => {
      assertMatches(
        R.bimap(result, onFailure, onSuccess),
        R.toFailure('an error occurred: some error'),
      );
    });
  });
});

describe('bimap_()', () => {
  const onSuccess = (n: number): number => n * 2;
  const onFailure = (message: string): string => `an error occurred: ${message}`;

  describe('Given a Success and an onSuccess function', () => {
    const result = R.toSuccess(5);

    it('should return the transformed value', () => {
      assertMatches(pipe(result, R.bimap_(onFailure, onSuccess)), R.toSuccess(10));
    });
  });

  describe('Given a Failure and a transform function', () => {
    const result = R.toFailure('some error');

    it('should return the result', () => {
      assertMatches(
        pipe(result, R.bimap_(onFailure, onSuccess)),
        R.toFailure('an error occurred: some error'),
      );
    });
  });
});

describe('unwrapOrThrow()', () => {
  describe('Given a Success', () => {
    const result = R.toSuccess('foo');

    it('returns the underlying value', () => {
      assertMatches(R.unwrapOrThrow(result), 'foo');
    });
  });

  describe('Given a Failure', () => {
    const result = R.toFailure({ failureMessage: 'some failure' });

    it('throws the underlying error', () => {
      assert.throws(() => R.unwrapOrThrow(result), { failureMessage: 'some failure' });
    });

    describe('Given a function to get a custom throwable', () => {
      it('throws its result', () => {
        assert.throws(
          () => R.unwrapOrThrow(result, () => ({ failureMessage: 'some custom failure' })),
          { failureMessage: 'some custom failure' },
        );
      });
    });
  });
});

describe('asyncUnwrapOrThrow()', () => {
  describe('Given a Success', () => {
    const result = Promise.resolve(R.toSuccess('foo'));

    it('returns the underlying value', async () => {
      assertMatches(await R.asyncUnwrapOrThrow(result), 'foo');
    });
  });

  describe('Given a Failure', () => {
    const result = Promise.resolve(R.toFailure({ failureMessage: 'an unknown failure' }));

    it('throws the underlying error', async () => {
      await assert.rejects(async () => R.asyncUnwrapOrThrow(result), {
        failureMessage: 'an unknown failure',
      });
    });

    describe('Given a function to get a custom throwable', () => {
      it('throws its result', async () => {
        await assert.rejects(
          async () =>
            R.asyncUnwrapOrThrow(result, async (error: { failureMessage: string }) => ({
              failureMessage: `${error.failureMessage} with a custom message`,
            })),
          { failureMessage: 'an unknown failure with a custom message' },
        );
      });
    });
  });
});
