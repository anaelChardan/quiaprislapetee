/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FailureOf, Result, SuccessOf } from './core';
import { asyncFlatMap, flatMap, map } from './core';

/**
 * If the given Result is a Success, wrap its value in an object with the given property name
 *
 * @example
 * ```
 * const initialResult = R.toSuccess(5);
 * const boundResult = R.bindTo(initialResult, "myResult");
 *
 * // Outputs: { _tag: "success", value: { myResult: 5 } }
 * console.log(boundResult);
 * ```
 */
export const bindTo = <E, A, N extends string>(
  result: Result<E, A>,
  propertyName: N,
): Result<E, { [K in N]: A }> => map(result, (val) => ({ [propertyName]: val }) as any);

/**
 * Pipeable version of `bindTo`
 *
 * If the given Result is a Success, wrap its value in an object with the given property name
 *
 * @example
 * ```
 * const boundResult = pipe(
 *   R.toSuccess(5),
 *   R.bindTo_("myResult")
 * )
 *
 * // Outputs: { _tag: "success", value: { myResult: 5 } }
 * console.log(boundResult);
 * ```
 */
// eslint-disable-next-line no-underscore-dangle
export const bindTo_ =
  <N extends string>(propertyName: N) =>
  <E, A>(result: Result<E, A>): Result<E, { [K in N]: A }> =>
    bindTo(result, propertyName);

/**
 * If the given Result is a Success, chains an operation returning a Result and put its value in the given property name.
 * The initial Result's value must be an object.
 *
 * Equivalent to a `flatMap` where the newly fetched information is added to the previous value.
 *
 * @example
 * ```
 * const initialResult = R.toSuccess({ value1: 5 });
 * const secondResult = R.bind(
 *   initialResult,
 *   'value2',
 *   ({ value1 }) => R.toSuccess(value1 + 2)
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7 } }
 * console.log(secondResult);
 * ```
 */
export const bind = <Res extends Result<any, any>, E2, B, N extends string>(
  r: Res,
  propertyName: Exclude<N, keyof SuccessOf<Res>>,
  f: (a: SuccessOf<Res>) => Result<E2, B>,
): Result<FailureOf<Res> | E2, SuccessOf<Res> & { [K in N]: B }> =>
  flatMap(r, (a) => {
    const result = f(a);

    return map(result, (b) => ({ ...a, [propertyName]: b }) as any);
  });

/**
 * Pipeable version of `bind`
 *
 * If the given Result is a Success, chains an operation returning a Result and put its value in the given property name.
 * The initial Result's value must be an object.
 *
 * Equivalent to a `flatMap` where the newly fetched information is added to the previous value.
 *
 * @example
 * ```
 * const result = pipe(
 *   R.toSuccess({ value1: 5 }),
 *   R.bind_(
 *     'value2',
 *     ({ value1 }) => R.toSuccess(value1 + 2)
 *   )
 * )
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7 } }
 * console.log(result);
 * ```
 */
export const bind_ =
  <Res extends Result<any, any>, E2, B, N extends string>(
    propertyName: Exclude<N, keyof SuccessOf<Res>>,
    f: (a: SuccessOf<Res>) => Result<E2, B>,
  ) =>
  (r: Res): Result<FailureOf<Res> | E2, SuccessOf<Res> & { [K in N]: B }> =>
    bind(r, propertyName, f);

// Note: previous return value definition: { [K in keyof A | N]: K extends keyof A ? A[K] : B }

/**
 * Async version of `bind`
 *
 * If the given Result is a Success, chains an operation returning a Result and put its value in the given property name.
 * The initial Result's value must be an object.
 *
 * Equivalent to a `flatMap` where the newly fetched information is added to the previous value.
 *
 * @example
 * ```
 * const initialResult = R.toSuccess({ value1: 5 });
 * const secondResult = await R.asyncBind(
 *   initialResult,
 *   'value2',
 *   async ({ value1 }) => R.toSuccess(value1 + 2)
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7 } }
 * console.log(secondResult);
 * ```
 */
export const asyncBind = async <Res extends Result<any, any>, E2, B, N extends string>(
  r: Res,
  propertyName: Exclude<N, keyof SuccessOf<Res>>,
  f: (a: SuccessOf<Res>) => Promise<Result<E2, B>>,
): Promise<Result<FailureOf<Res> | E2, SuccessOf<Res> & { [K in N]: B }>> =>
  asyncFlatMap(r, async (a) => {
    const result = await f(a);

    return map(result, (b) => ({ ...a, [propertyName]: b }) as any);
  });

/**
 * Pipeable version of `asyncBind`
 *
 * If the given Result is a Success, chains an operation returning a Result and put its value in the given property name.
 * The initial Result's value must be an object.
 *
 * Equivalent to a `flatMap` where the newly fetched information is added to the previous value.
 *
 * @example
 * ```
 * const result = asyncPipe(
 *   R.toSuccess({ value1: 5 }),
 *   R.asyncBind(
 *     'value2',
 *     async ({ value1 }) => R.toSuccess(value1 + 2)
 *   );
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7 } }
 * console.log(result);
 * ```
 */
export const asyncBind_ =
  <Res extends Result<any, any>, E2, B, N extends string>(
    propertyName: Exclude<N, keyof SuccessOf<Res>>,
    f: (a: SuccessOf<Res>) => Promise<Result<E2, B>>,
  ) =>
  (r: Res): Promise<Result<FailureOf<Res> | E2, SuccessOf<Res> & { [K in N]: B }>> =>
    asyncBind(r, propertyName, f);

/**
 * If the given result is a Success, chains an operation returning a Result and if successful,
 * returns an object combining all the properties of the initial Success and all of the properties of the operation's Success.
 * The initial Result's value must be an object.
 *
 * ⚠️ If the previous result and the new one share properties, the ones from the operation will override previous values!
 *
 * @example
 * ```
 * const initialResult = R.toSuccess({ value1: 5 });
 * const secondResult = R.bindAll(
 *   initialResult,
 *   ({ value1 }) => R.toSuccess({
 *     value2: value1 + 2,
 *     value3: value1 - 3
 *   })
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7, value3: 2 } }
 * console.log(secondResult);
 * ```
 */
export const bindAll = <E, A, E2, B extends { [key: string]: any }>(
  r: Result<E, A>,
  f: (a: A) => Result<E2, B>,
): Result<E | E2, A & B> => {
  return flatMap(r, (a) => {
    const result = f(a);

    return map(result, (b) => ({
      ...a,
      ...b,
    }));
  });
};

/**
 * Pipeable version of `bindAll`
 *
 * If the given result is a Success, chains an operation returning a Result and if successful,
 * returns an object combining all the properties of the initial Success and all of the properties of the operation's Success.
 * The initial Result's value must be an object.
 *
 * ⚠️ If the previous result and the new one share properties, the ones from the operation will override previous values!
 *
 * @example
 * ```
 * const result = pipe(
 *   R.toSuccess({ value1: 5 }),
 *   R.bindAll_(
 *     ({ value1 }) => R.toSuccess({
 *       value2: value1 + 2,
 *       value3: value1 - 3
 *     })
 *   )
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7, value3: 2 } }
 * console.log(result);
 * ```
 */
export const bindAll_ =
  <E, A, E2, B extends { [key: string]: any }>(f: (a: A) => Result<E2, B>) =>
  (r: Result<E, A>): Result<E | E2, A & B> =>
    bindAll(r, f);

/**
 * Async version of `bindAll`
 *
 * If the given result is a Success, chains an operation returning a promise of a Result and if successful,
 * returns an object combining all the properties of the initial Success and all of the properties of the operation's Success.
 * The initial Result's value must be an object.
 *
 * ⚠️ If the previous result and the new one share properties, the ones from the operation will override previous values!
 *
 * @example
 * ```
 * const initialResult = R.toSuccess({ value1: 5 });
 * const secondResult = await R.asyncBindAll(
 *   initialResult,
 *   async ({ value1 }) => R.toSuccess({
 *     value2: value1 + 2,
 *     value3: value1 - 3
 *   })
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7, value3: 2 } }
 * console.log(secondResult);
 * ```
 */
export const asyncBindAll = <E, A, E2, B extends { [key: string]: any }>(
  r: Result<E, A>,
  f: (a: A) => Promise<Result<E2, B>>,
): Promise<Result<E | E2, A & B>> => {
  return asyncFlatMap(r, async (a) => {
    const result = await f(a);

    return map(result, (b) => ({
      ...a,
      ...b,
    }));
  });
};

/**
 * Pipeable version of `asyncBindAll`
 *
 * If the given result is a Success, chains an operation returning a promise of a Result and if successful,
 * returns an object combining all the properties of the initial Success and all of the properties of the operation's Success.
 * The initial Result's value must be an object.
 *
 * ⚠️ If the previous result and the new one share properties, the ones from the operation will override previous values!
 *
 * @example
 * ```
 * const result = await asyncPipe(
 *   R.toSuccess({ value1: 5 }),
 *   R.asyncBindAll_(
 *     async ({ value1 }) => R.toSuccess({
 *       value2: value1 + 2,
 *       value3: value1 - 3
 *     })
 *   )
 * );
 *
 * // Outputs: { _tag: "success", value: { value1: 5, value2: 7, value3: 2 } }
 * console.log(result);
 * ```
 */
export const asyncBindAll_ =
  <E, A, E2, B extends { [key: string]: any }>(f: (a: A) => Promise<Result<E2, B>>) =>
  (r: Result<E, A>): Promise<Result<E | E2, A & B>> =>
    asyncBindAll(r, f);
