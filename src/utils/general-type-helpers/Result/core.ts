/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-redeclare */

import { pipe } from '../function';
import type { NonEmptyArray } from '../NonEmptyArray';
import { fromArray } from '../NonEmptyArray';

type Failure<E> = {
  _tag: 'failure';
  error: E;
};

type Success<A> = {
  _tag: 'success';
  value: A;
};

/**
 * Provides a standard way to represent the result of an operation that can
 * fail, such as a database update, a file read, or even a validation check
 *
 * A type representing either a Success or a Failure, which can both contain
 * values of the type E for the Failure's error, or A for the Success' value,
 * respectively
 */
export type Result<E, A> = Failure<E> | Success<A>;

export const isSuccess = <E, A>(result: Result<E, A>): result is Success<A> =>
  result._tag === 'success';

export const isFailure = <E, A>(result: Result<E, A>): result is Failure<E> =>
  result._tag === 'failure';

export const isResult = <E, A>(result: unknown): result is Result<E, A> =>
  (result as Failure<E>)?._tag === 'failure' || (result as Success<A>)?._tag === 'success';

// ************* Constructors ************

/**
 * Lift a value A into a Success<A>
 */
export const toSuccess = <E = never, A = never>(value: A): Result<E, A> => ({
  _tag: 'success',
  value,
});

/**
 * Lift an error value E into an Failure<E>
 */
export const toFailure = <E = never, A = never>(error: E): Result<E, A> => ({
  _tag: 'failure',
  error,
});

/**
 * Takes a default and a nullable value. If the value is not nully, return it in
 * a Success, otherwise return the default value in a Failure.
 */
export const fromNullable = <E, A>(a: A, e: E): Result<E, NonNullable<A>> =>
  a == null ? toFailure(e) : toSuccess(a);

/**
 * Pipeable version of `fromNullable`
 *
 * Takes a default and a nullable value. If the value is not nully, return it in
 * a Success, otherwise return the default value in a Failure.
 */
export const fromNullable_ =
  <E>(e: E) =>
  <A>(a: A): Result<E, NonNullable<A>> =>
    fromNullable(a, e);

/**
 * Takes an Array of A and converts it to NonEmptyArray<A>
 *
 * If the array has at least 1 item, it returns the resulting NEA in a Success
 * If the array is empty, it returns the given error in a Failure
 */
export const toNonEmptyArray = <E, A>(array: A[], error: E): Result<E, NonEmptyArray<A>> =>
  pipe(array, fromArray, fromNullable_(error));

/**
 * Pipeable version of `toNonEmptyArray`
 *
 * Takes an Array of A and converts it to NonEmptyArray<A>
 *
 * If the array has at least 1 item, it returns the resulting NEA in a Success
 * If the array is empty, it returns the given error in a Failure
 */
export const toNonEmptyArray_ =
  <E>(error: E) =>
  <A>(array: A[]): Result<E, NonEmptyArray<A>> =>
    toNonEmptyArray(array, error);

/**
 * Given a function f returning a value A, will execute and try/catch f.
 *
 * If it does not throw, it returns the return value of f in a Success.
 * If it throws, it returns the result of the given onThrow function in a Failure.
 */
export const tryCatch = <E, A>(f: () => A, onThrow: (e: unknown) => E): Result<E, A> => {
  try {
    return toSuccess(f());
  } catch (error) {
    return toFailure(onThrow(error));
  }
};

/**
 * async version of `tryCatch`
 *
 * Given an async function f returning a value A, will execute, await and
 * try/catch f.
 *
 * If it does not throw, it returns the return value of f in a Success.
 * If it throws, it returns the result of the given onThrow function in a Failure.
 */
export const asyncTryCatch = async <E, A>(
  f: () => Promise<A>,
  onThrow: (e: unknown) => E,
): Promise<Result<E, A>> => {
  try {
    return toSuccess(await f());
  } catch (error) {
    return toFailure(onThrow(error));
  }
};

/**
 * Returns the underlying value from the result if it's success, or throws the
 * underlying error otherwise.
 *
 * @param getThrowable - If provided, instead of throwing the result's error
 *   as-is, the error is passed to this function and the returned value is
 *   thrown instead.
 */
export const unwrapOrThrow = <E, A>(
  result: Result<E, A>,
  getThrowable?: (error: E) => unknown,
): A => {
  if (isSuccess(result)) {
    return result.value;
  }
  throw (getThrowable && getThrowable(result.error)) ?? result.error;
};

/**
 * Async version of `unwrapOrThrow`.
 *
 * Returns the underlying value from the result if it's success, or throws the
 * underlying error otherwise.
 *
 * @param getThrowable - If provided, instead of throwing the result's error
 *   as-is, the error is passed to this function and the returned value is
 *   thrown instead. The returned value is awaited before being returned.
 */
export const asyncUnwrapOrThrow = async <E, A>(
  resultPromise: Result<E, A> | PromiseLike<Result<E, A>>,
  getThrowable?: (error: E) => unknown,
): Promise<A> => {
  const result = await resultPromise;
  if (isSuccess(result)) {
    return result.value;
  }
  throw (getThrowable && (await getThrowable(result.error))) ?? result.error;
};

// ************* Destructors ************

/**
 * Get rid of the Result wrapper, transforming the result via two functions
 */
export const fold = <E, TransformedE, A, TransformedA>(
  result: Result<E, A>,
  onFailure: (error: E) => TransformedE,
  onSuccess: (a: A) => TransformedA,
): TransformedE | TransformedA =>
  result._tag === 'success' ? onSuccess(result.value) : onFailure(result.error);

/**
 * Pipeable version of `fold`
 *
 * Get rid of the Result wrapper, transforming the result via two functions
 */
export const fold_ =
  <E, TransformedE, A, TransformedA>(
    onFailure: (error: E) => TransformedE,
    onSuccess: (a: A) => TransformedA,
  ) =>
  (result: Result<E, A>): TransformedE | TransformedA =>
    result._tag === 'success' ? onSuccess(result.value) : onFailure(result.error);

// ************* Transformations ************

/**
 * If the given Result is a Success, apply the given function to its value
 * Otherwise, do nothing
 */
export const map = <E, A, B>(result: Result<E, A>, f: (a: A) => B): Result<E, B> =>
  result._tag === 'success' ? toSuccess(f(result.value)) : result;

/**
 * Pipeable version of `map`
 *
 * If the given Result is a Success, apply the given function to its value
 * Otherwise, do nothing
 */
export const map_ =
  <A, B>(f: (a: A) => B) =>
  <E>(result: Result<E, A>): Result<E, B> =>
    result._tag === 'success' ? toSuccess(f(result.value)) : result;

/**
 * If the given Result is an Failure, apply the given function to its content
 * Otherwise, do nothing
 */
export const mapError = <E1, E2, A>(result: Result<E1, A>, f: (error: E1) => E2): Result<E2, A> =>
  result._tag === 'failure' ? toFailure(f(result.error)) : result;

/**
 * Pipeable version of `mapError`
 *
 * If the given Result is an Failure, apply the given function to its content
 * Otherwise, do nothing
 */
export const mapError_ =
  <E1, E2>(f: (error: E1) => E2) =>
  <A>(result: Result<E1, A>): Result<E2, A> =>
    result._tag === 'failure' ? toFailure(f(result.error)) : result;

/**
 * Transform the content of the Result, using the relevant function depending on whether the content is a Success or a Failure
 */
export const bimap = <E, TransformedE, A, TransformedA>(
  result: Result<E, A>,
  onFailure: (error: E) => TransformedE,
  onSuccess: (a: A) => TransformedA,
): Result<TransformedE, TransformedA> => {
  if (result._tag === 'success') {
    return toSuccess(onSuccess(result.value));
  }
  return toFailure(onFailure(result.error));
};

/**
 * Pipeable version of `bimap`
 *
 * Transform the content of the Result, using the relevant function depending on whether the content is a Success or a Failure
 */
export const bimap_ =
  <E, TransformedE, A, TransformedA>(
    onFailure: (error: E) => TransformedE,
    onSuccess: (a: A) => TransformedA,
  ) =>
  (result: Result<E, A>): Result<TransformedE, TransformedA> => {
    if (result._tag === 'success') {
      return toSuccess(onSuccess(result.value));
    }
    return toFailure(onFailure(result.error));
  };

// ************* Chaining operations ************

/**
 * If the given result is a Success, execute the function that produces a new Result and return it
 * Otherwise, pass the Failure along
 */
export const flatMap = <E1, E2, A, B>(
  firstResult: Result<E1, A>,
  f: (a: A) => Result<E2, B>,
): Result<E1 | E2, B> => {
  if (firstResult._tag === 'failure') {
    return firstResult;
  }

  return f(firstResult.value);
};

/**
 * Pipeable version of `flatMap`
 *
 * If the given result is a Success, execute the function that produces a new Result and return it
 * Otherwise, pass the Failure along
 */
export const flatMap_ =
  <E2, A, B>(f: (a: A) => Result<E2, B>) =>
  <E1>(firstResult: Result<E1, A>): Result<E1 | E2, B> => {
    if (firstResult._tag === 'failure') {
      return firstResult;
    }

    return f(firstResult.value);
  };

/**
 * Like `flatMap`, allows to chain computations, but if both are Success, keep
 * the Success of firstResult
 */
export const flatMapFirst = <E1, E2, A, B>(
  firstResult: Result<E1, A>,
  f: (a: A) => Result<E2, B>,
): Result<E1 | E2, A> => {
  if (firstResult._tag === 'failure') {
    return firstResult;
  }

  const secondResult = f(firstResult.value);

  if (secondResult._tag === 'failure') {
    return secondResult;
  }

  return firstResult;
};

/**
 * Pipeable version of `flatMapFirst_`
 *
 * Like `flatMap`, allows to chain computations, but if both are Success, keep
 * the Success of firstResult
 */
export const flatMapFirst_ =
  <E2, A, B>(f: (a: A) => Result<E2, B>) =>
  <E1>(firstResult: Result<E1, A>): Result<E1 | E2, A> =>
    flatMapFirst(firstResult, f);

/**
 * If the given result is a Failure, execute a function that produces a new Result and return it
 * Otherwise, pass the Success along
 */
export const flatMapError = <E1, E2, A, B>(
  result: Result<E1, A>,
  f: (e: E1) => Result<E2, B>,
): Result<E2, A | B> => {
  if (result._tag === 'success') {
    return result;
  }

  return f(result.error);
};

/**
 * Pipeable version of `flatMap`
 *
 * If the given result is a Failure, execute a function that produces a new Result and return it
 * Otherwise, pass the Success along
 */
export const flatMapError_ =
  <E1, E2, A, B>(f: (e: E1) => Result<E2, B>) =>
  (result: Result<E1, A>): Result<E2, A | B> =>
    flatMapError(result, f);

/**
 * Asynchronous version of `flatMap`
 *
 * Allows to chain an async computations if the given `firstResult` is a Success.
 * Otherwise, it simply returns the Failure.
 */
export const asyncFlatMap = async <E1, E2, A, B>(
  firstResult: Result<E1, A>,
  f: (a: A) => Promise<Result<E2, B>>,
): Promise<Result<E1 | E2, B>> => (isSuccess(firstResult) ? f(firstResult.value) : firstResult);

/**
 * Pipeable version of `asyncFlatMap`
 *
 * Allows to chain an async computations if the given `firstResult` is a Success.
 * Otherwise, it simply returns the Failure.
 */
export const asyncFlatMap_ =
  <E2, A, B>(f: (a: A) => Promise<Result<E2, B>>) =>
  async <E1>(firstResult: Result<E1, A>): Promise<Result<E1 | E2, B>> =>
    asyncFlatMap(firstResult, f);

/**
 * Asynchronous version of `asyncFlatMapFirst`
 *
 * Like `flatMap`, allows to chain computations, but if both are Success, keep
 * the Success of firstResult
 */
export const asyncFlatMapFirst = async <E1, E2, A, B>(
  firstResult: Result<E1, A>,
  f: (a: A) => Promise<Result<E2, B>>,
): Promise<Result<E1 | E2, A>> => {
  if (firstResult._tag === 'failure') {
    return firstResult;
  }

  const secondResult = await f(firstResult.value);

  if (secondResult._tag === 'failure') {
    return secondResult;
  }

  return firstResult;
};

/**
 * Pipeable version of `asyncFlatMapFirst`
 *
 * Like `flatMap`, allows to chain computations, but if both are Success, keep
 * the Success of firstResult
 */
export const asyncFlatMapFirst_ =
  <E2, A, B>(f: (a: A) => Promise<Result<E2, B>>) =>
  async <E1>(firstResult: Result<E1, A>): Promise<Result<E1 | E2, A>> =>
    asyncFlatMapFirst(firstResult, f);

/**
 * Asynchronous version of `flatMapError`
 *
 * If the given result is a Failure, execute a function that produces a new Result and return it
 * Otherwise, pass the Success along
 */
export const asyncFlatMapError = async <E1, E2, A, B>(
  result: Result<E1, A>,
  f: (e: E1) => Promise<Result<E2, B>>,
): Promise<Result<E2, A | B>> => {
  if (result._tag === 'success') {
    return result;
  }

  return f(result.error);
};

/**
 * Pipeable version of `asyncFlatMapError`
 *
 * If the given result is a Failure, execute a function that produces a new Result and return it
 * Otherwise, pass the Success along
 */
export const asyncFlatMapError_ =
  <E1, E2, A, B>(f: (e: E1) => Promise<Result<E2, B>>) =>
  async (result: Result<E1, A>): Promise<Result<E2, A | B>> =>
    asyncFlatMapError(result, f);

/**
 * Extracts the underlying type from the Success variant of a Result.
 *
 * `SuccessOf<Result<F, S>>` is the same as `S`.
 */
export type SuccessOf<T> = T extends Success<infer S> ? S : never;

/**
 * Extracts the underlying type from the Failure variant of a Result.
 *
 * `FailureOf<Result<F, S>>` is the same as `F`.
 */
export type FailureOf<T> = T extends Failure<infer F> ? F : never;

export type PromiseResult<E, A> = Promise<Result<E, A>>;
