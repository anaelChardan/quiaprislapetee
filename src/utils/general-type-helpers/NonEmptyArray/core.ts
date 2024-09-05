/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-redeclare */

// Importing from types to avoid a dependency cycle
import type { PositiveInteger } from '../Integer/types';

/**
 * An array with at least one element
 */
export interface NonEmptyArray<A> extends Array<A> {
  0: A;
}

// ************* Constructors ************

/**
 * Generates a non-empty array from a simple array, returning undefined if
 * the input array is empty
 */
export const fromArray = <X>(xs: X[]): NonEmptyArray<X> | undefined =>
  xs.length > 0 ? (xs as NonEmptyArray<X>) : undefined;

/**
 * Lifts an item into a non-empty array with a single element
 */
export const fromSingleItem = <X>(x: X): NonEmptyArray<X> => [x];

/**
 * Combines two non-empty arrays into one, putting elements of the second array
 * after the elements of the first.
 */
export function concat<A, B>(first: A[], second: NonEmptyArray<B>): NonEmptyArray<A | B>;
export function concat<A, B>(first: NonEmptyArray<A>, second: B[]): NonEmptyArray<A | B>;
export function concat<A, B extends A>(first: A[], second: B[]): (A | B)[] {
  return first.concat(second);
}

/**
 * Pipeable version of `concat`
 *
 * Combines two non-empty arrays into one, putting elements of the second array
 * after the elements of the first.
 */
export function concat_<B>(second: NonEmptyArray<B>): <A>(first: A[]) => NonEmptyArray<A | B>;
export function concat_<B>(second: B[]): <A>(first: NonEmptyArray<A>) => NonEmptyArray<A | B>;
export function concat_<B>(second: B[]): <A>(first: NonEmptyArray<A>) => Array<A | B> {
  return <A>(first: NonEmptyArray<A | B>) => concat(first, second);
}

// ************* Transformations ************

/**
 * The equivalent of array's map(), but conserving the type
 */
export const map = <X, Y>(xs: NonEmptyArray<X>, f: (x: X) => Y): NonEmptyArray<Y> =>
  xs.map(f) as NonEmptyArray<Y>;

/**
 * Pipeable version of `map`
 *
 * The equivalent of array's map(), but conserving the type
 */
export const map_ =
  <X, Y>(f: (x: X) => Y) =>
  (xs: NonEmptyArray<X>): NonEmptyArray<Y> =>
    xs.map(f) as NonEmptyArray<Y>;

/**
 * The equivalent of array's map(), but conserving the type, with the index
 */
export const mapWithIndex = <X, Y>(
  xs: NonEmptyArray<X>,
  f: (x: X, index: number) => Y,
): NonEmptyArray<Y> => xs.map(f) as NonEmptyArray<Y>;

/**
 * Pipeable version of `map`
 *
 * The equivalent of array's map(), but conserving the type, with the index
 */
export const mapWithIndex_ =
  <X, Y>(f: (x: X, index: number) => Y) =>
  (xs: NonEmptyArray<X>): NonEmptyArray<Y> =>
    xs.map(f) as NonEmptyArray<Y>;

/**
 * The equivalent of array's flatMap, but conserving the type
 *
 * Can only work if the given function returns a non-empty array, otherwise use
 * the regular flatMap() function
 */
export const flatMap = <X, Y>(
  xs: NonEmptyArray<X>,
  f: (x: X) => NonEmptyArray<Y>,
): NonEmptyArray<Y> => xs.flatMap(f) as NonEmptyArray<Y>;

/**
 * Pipeable version of `flatMap`
 *
 * The equivalent of array's flatMap, but conserving the type
 */
export const flatMap_ =
  <X, Y>(f: (x: X) => NonEmptyArray<Y>) =>
  (xs: NonEmptyArray<X>): NonEmptyArray<Y> =>
    xs.flatMap(f) as NonEmptyArray<Y>;

/**
 * Splits a non-empty array into chunks of the given size. The last chunk will
 * contain the remainder of items, up to the `chunkSize`
 */
export const chunk = <T>(
  data: NonEmptyArray<T>,
  chunkSize: number,
): NonEmptyArray<NonEmptyArray<T>> => {
  const result: Array<NonEmptyArray<T>> = [];
  for (let index = 0; index < data.length; index += chunkSize) {
    result.push(fromArray(data.slice(index, index + chunkSize)) as NonEmptyArray<T>);
  }

  return fromArray(result) as NonEmptyArray<NonEmptyArray<T>>;
};

/**
 * Pipeable version of `chunk`
 *
 * Splits a non-empty array into chunks of the given size. The last chunk will
 * contain the remainder of items, up to the `chunkSize`
 */
export const chunk_ =
  (chunkSize: number) =>
  <T>(data: NonEmptyArray<T>): NonEmptyArray<NonEmptyArray<T>> =>
    chunk(data, chunkSize);

// ************* Filtering ************

type FilterCriteria<X, Y = X> = Y extends X
  ? // If Y is equivalent to X, no type narrowing necessary
    (x: X) => boolean
  : // Else, we need the criteria to be a type guard function
    (x: X | Y) => x is Y;

/**
 * The equivalent of array's `filter`, but converting the type and applying
 * a type guard if given.
 */
export const filter = <X, Y = X>(
  xs: NonEmptyArray<X>,
  f: FilterCriteria<X, Y>,
): NonEmptyArray<Y> | undefined => {
  // Sadly we have to cast because the criteria doesn't get correctly inferred,
  // but we're protected by the type definition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fromArray(xs.filter(f) as any[] as Y[]);
};

/**
 * Pipeable version of `filter`
 *
 * The equivalent of array's `filter`, but converting the type and applying
 * a type guard if given.
 */
export const filter_ =
  <X, Y = X>(f: FilterCriteria<X, Y>) =>
  (xs: NonEmptyArray<X>): NonEmptyArray<Y> | undefined =>
    filter(xs, f);

/**
 * Filter out duplicates from a non-empty array.
 *
 * Conserves the NonEmptyArray type.
 */
export const unique = <X>(xs: NonEmptyArray<X>): NonEmptyArray<X> =>
  [...new Set(xs)] as NonEmptyArray<X>;

// ************* Sorting ************

/**
 * A function used for sorting arrays
 *
 * If a is before b, it should return -1, if a and b are equal, it should return 0, and else it should return 1
 */
type SortFn<X> = (a: X, b: X) => 1 | 0 | -1;

/**
 * Sorts the non-empty array with the passed function
 *
 * **Note**. Due to how array.sort() works, the input array will be duplicated
 * to avoid mutating it
 */
export const sort = <X>(xs: NonEmptyArray<X>, sortFn: SortFn<X>): NonEmptyArray<X> =>
  [...xs].sort(sortFn) as NonEmptyArray<X>;

/**
 * Pipeable version of `sort`
 *
 * Sorts the non-empty array with the passed function
 *
 * **Note**. Due to how array.sort() works, the input array will be duplicated
 * to avoid mutating it
 */
export const sort_ =
  <X>(sortFn: SortFn<X>) =>
  (xs: NonEmptyArray<X>): NonEmptyArray<X> =>
    [...xs].sort(sortFn) as NonEmptyArray<X>;

// ************* Destructors ************

/**
 * Returns the first element of the array
 *
 * The advantage of this function is that we're sure we have this element,
 * unlike on an array where xs[0] should be of type X | undefined
 */
export const head = <X>(xs: NonEmptyArray<X>): X => xs[0];

/**
 * Returns the last element of the array
 *
 * The advantage of this function is that we're sure we have this element,
 * unlike on an array where xs[0] should be of type X | undefined
 */
export const last = <X>(xs: NonEmptyArray<X>): X => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return xs.at(-1)!;
};

/**
 * Slices a non-empty array from the start (0).
 * We know the result is a non empty array, because there is at least one element.
 */
export const sliceFromStart = <X>(xs: NonEmptyArray<X>, end: PositiveInteger): NonEmptyArray<X> =>
  xs.slice(0, end) as NonEmptyArray<X>;

/**
 * Pipeable version of `sliceFromStart`
 *
 * Slices a non-empty array from the start (0).
 * We know the result is a non empty array, because there is at least one element.
 */
export const sliceFromStart_ =
  <X>(end: PositiveInteger) =>
  (xs: NonEmptyArray<X>): NonEmptyArray<X> =>
    sliceFromStart(xs, end);
