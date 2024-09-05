/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Brand } from '../Brand';
import { pipe } from '../function';
import type { BRAND_PROPERTY_NAME } from '../helpers/brand';
import * as R from '../Result';
import type { PositiveInteger } from './types';

/**
 * Any integer, except for BoundedInteger which requires type arguments
 */
export type AnyInteger = Integer | PositiveInteger;

// ************* Integer ************

/**
 * Any integer in JS's allowed range
 *
 * Construct with `toInteger`
 */
export type Integer = Brand<number, 'Integer', BRAND_PROPERTY_NAME>;

export const toInteger = (n: number): R.Result<NotSafeIntegerError, Integer> =>
  pipe(
    checkSafeInteger(n),
    R.map_((number) => number as Integer),
  );

type ConstantInteger<N extends number> = `${N}` extends `${string}.${string}` ? never : N;

/**
 * Apply the Integer type to a constant that fits the criteria.
 *
 * ⚠️ Pass the constant directly, e.g. `toIntegerFromConstant(10)`
 * If the constant has type `number`, it won't typecheck properly.
 */
export const toIntegerFromConstant = <N extends number>(n: ConstantInteger<N>): Integer =>
  n as unknown as Integer;

// ************* Positive Integer ************

/**
 * Safely construct a PositiveInteger
 */
export const toPositiveInteger = (
  n: number,
): R.Result<NotPositiveError | NotSafeIntegerError, PositiveInteger> =>
  pipe(
    checkPositive(n),
    R.flatMap_(checkSafeInteger),
    R.map_((number) => number as PositiveInteger),
  );

const checkPositive = <T extends number>(n: T): R.Result<NotPositiveError, T> =>
  n > 0 ? R.toSuccess(n) : R.toFailure({ tag: 'notPositiveError' });

export type NotPositiveError = {
  tag: 'notPositiveError';
};

type ConstantPositiveInteger<N extends ConstantInteger<number>> = N extends 0
  ? never
  : `${N}` extends `-${string}`
    ? never
    : `${N}` extends `${string}.${string}`
      ? never
      : N;

/**
 * Apply the PositiveInteger type to a constant that fits the criteria.
 *
 * ⚠️ Pass the constant directly, e.g. `toIntegerFromConstant(10)`
 * If the constant has type `number`, it won't typecheck properly.
 */
export const toPositiveIntegerFromConstant = <N extends number>(
  n: ConstantPositiveInteger<N>,
): PositiveInteger => n as unknown as PositiveInteger;

// ************* Bounded integer ************

/**
 * Construct with {@link toBoundedInteger}
 * Provide integers where LowerBound <= UpperBound
 */
export type BoundedInteger<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LowerBound extends number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UpperBound extends number,
> = Brand<number, 'BoundedInteger', BRAND_PROPERTY_NAME>;

/**
 * Constructs a `BoundedInteger`
 *
 * Provide integers where LowerBound <= UpperBound
 */
export const toBoundedInteger =
  <LowerBound extends Integer, UpperBound extends Integer>(bounds: {
    lowerBound: LowerBound;
    upperBound: UpperBound;
  }) =>
  (
    n: number,
  ): R.Result<NotSafeIntegerError | NotInBoundError, BoundedInteger<LowerBound, UpperBound>> =>
    pipe(
      checkSafeInteger(n),
      R.flatMap_(checkInBounds(bounds)),
      R.map_((number) => number as BoundedInteger<LowerBound, UpperBound>),
    );

const checkInBounds =
  ({ lowerBound, upperBound }: { lowerBound: number; upperBound: number }) =>
  (n: number): R.Result<NotInBoundError, number> =>
    n >= lowerBound && n <= upperBound ? R.toSuccess(n) : R.toFailure({ tag: 'notInBound' });

export type NotInBoundError = {
  tag: 'notInBound';
};

// ************* Others ************

/**
 * Check if a number is lower than the higher JS safe integer bound
 */
export const checkSafeInteger = <T extends number>(n: T): R.Result<NotSafeIntegerError, T> =>
  Number.isSafeInteger(n) ? R.toSuccess(n) : R.toFailure({ tag: 'notSafeIntegerError' });

export type NotSafeIntegerError = {
  tag: 'notSafeIntegerError';
};

export { type PositiveInteger } from './types';
