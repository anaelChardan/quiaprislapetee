/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type * as z from 'zod';
import { pipe } from '../function';
import * as NEA from '../NonEmptyArray';
import * as R from '../Result';

/**
 * Represents errors obtained from decoding data with a zod schema.
 * Can combine several errors in `zodErrors`.
 */
export type DecodeError = {
  tag: 'decodeError';
  errorContext?: unknown;
  zodErrors: NEA.NonEmptyArray<z.ZodError<unknown>>;
  stack: string | undefined;
};

const toDecodeError = (
  zodErrors: NEA.NonEmptyArray<z.ZodError<unknown>>,
  errorContext?: unknown,
): DecodeError => ({
  tag: 'decodeError',
  errorContext,
  zodErrors,
  stack: new Error().stack,
});

/**
 * Decodes data according to a given schema and returns a Result
 */
export const decodeToResult = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  data: unknown,
  errorContext?: unknown,
): R.Result<DecodeError, z.TypeOf<Schema>> => {
  const result = schema.safeParse(data);

  return result.success
    ? R.toSuccess(result.data)
    : R.toFailure(toDecodeError([result.error], errorContext));
};

/**
 * Pipeable version of `decodeToResult`
 *
 * Decodes data according to a given schema and returns a Result
 */
export const decodeToResult_ =
  <Schema extends z.ZodTypeAny>(schema: Schema, errorContext?: unknown) =>
  (data: unknown): R.Result<DecodeError, z.TypeOf<Schema>> =>
    decodeToResult(schema, data, errorContext);

/**
 * A function decoding into a Result
 */
type Decoder<T> = (data: unknown) => R.Result<DecodeError, T>;

/**
 * Run a decoder on every item in an array.
 *
 * If all elements are successfully decoded, we get an array of them in a Success.
 * Otherwise, we'll get a single DecodeError in a Failure.
 */
export const sequenceDecoders = <T>(
  decoder: Decoder<T>,
  data: readonly unknown[],
  errorContext?: unknown,
): R.Result<DecodeError, T[]> =>
  pipe(
    // 1. run decoders on the data -> Result<DecodeError, T>[]
    data.map(decoder),
    // 2. gather in one Result -> Result<DecodeError, T[]>
    R.sequence_(combineDecodeErrors),
    // 3. apply the context
    R.mapError_((error) => ({ ...error, errorContext })),
  );

/**
 * Pipeable version of `decodeManyToResult`
 *
 * Small util to run a decoder on an array
 */
export const sequenceDecoders_ =
  <T>(decoder: Decoder<T>) =>
  (data: readonly unknown[]): R.Result<DecodeError, T[]> =>
    sequenceDecoders(decoder, data);

/**
 * Combine two DecodeErrors into one.
 *
 * Particularly useful in combination with `R.sequence`
 */
export const combineDecodeErrors = (a: DecodeError, b: DecodeError): DecodeError => {
  return toDecodeError(
    NEA.concat(a.zodErrors, b.zodErrors),
    `${a.errorContext ?? ''} ${b.errorContext ?? ''}`,
  );
};
