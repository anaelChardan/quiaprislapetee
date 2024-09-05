/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { identity, pipe } from '../function';
import * as NEA from '../NonEmptyArray';
import type { FailureOf, Result } from './core';
import { fold, isFailure, toFailure, toSuccess } from './core';

/**
 * Processes an array of Results in the following way:
 * - If there is at least one Failure, will return on Failure with a non-empty array of errors
 * - Else, will return one Success with an array of the successes' contents
 */
export function sequenceResults<T extends Result<any, any>[]>(
  results: [...results: T],
): Result<
  NEA.NonEmptyArray<
    {
      [K in keyof T]: [T[K]] extends [Result<infer E, any>] ? E : never;
    }[number]
  >,
  { [K in keyof T]: [T[K]] extends [Result<any, infer A>] ? A : never }
> {
  const failures = pipe(results.filter(isFailure), NEA.fromArray);

  if (failures) {
    return pipe(
      failures,
      NEA.map_(({ error }) => error),
      toFailure,
    );
  }

  // This assertion is safe because we have checked for the presence of failures above
  const allSuccessValues = results.map((result) =>
    fold(result, () => undefined, identity),
  ) as any as {
    [K in keyof T]: [T[K]] extends [Result<any, infer A>] ? A : never;
  };

  return toSuccess(allSuccessValues);
}

/**
 * A more general version of `sequenceResults`, which allows to customise error
 * combination
 *
 * Processes an array of Results:
 * - If there is at least one Failure, it will combine all the errors with
 *   `errorCombinator` and return a Failure
 * - Else, will return one Success with an array of the successes' contents
 */
export function sequence<
  Arr extends ReadonlyArray<Result<unknown, unknown>>,
  E extends FailureOf<Arr[number]>,
>(
  results: readonly [...results: Arr],
  errorCombinator: ErrorCombinator<E>,
): Result<
  E,
  {
    [K in keyof Arr]: [Arr[K]] extends [Result<any, infer A1>] ? A1 : never;
  }
> {
  const failures = NEA.fromArray(results.filter(isFailure));

  if (failures) {
    const [firstError, ...otherErrors] = NEA.map(failures, ({ error }) => error);
    // Assertions are safe: we can't be more accurate because the definition needs
    // to be derived from Arr
    const combinedErrors = (otherErrors as E[]).reduce(errorCombinator, firstError as E);

    return toFailure(combinedErrors);
  }

  // This assertion is safe because we have checked for the presence of failures above
  const allSuccessValues = results.map((result) =>
    fold(result, () => undefined, identity),
  ) as any as {
    [K in keyof Arr]: [Arr[K]] extends [Result<any, infer A1>] ? A1 : never;
  };

  return toSuccess(allSuccessValues);
}

/**
 * Pipeable version of `sequence`
 *
 * A more general version of `sequenceResults`, which allows to customise error
 * combination
 *
 * Processes an array of Results:
 * - If there is at least one Failure, it will combine all the errors with
 *   `errorCombinator` and return a Failure
 * - Else, will return one Success with an array of the successes' contents
 */
export const sequence_ =
  <Arr extends ReadonlyArray<Result<unknown, unknown>>, E extends FailureOf<Arr[number]>>(
    errorCombinator: ErrorCombinator<E>,
  ) =>
  (
    results: readonly [...results: Arr],
  ): Result<
    E,
    {
      [K in keyof Arr]: [Arr[K]] extends [Result<any, infer A1>] ? A1 : never;
    }
  > =>
    sequence(results, errorCombinator);

type ErrorCombinator<E> = (e1: E, e2: E) => E;

/**
 * Always returns the first error
 */
export const firstErrorCombinator = <E>(
  a: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  b: E,
): E => a;
