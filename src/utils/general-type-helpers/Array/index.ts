/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/naming-convention */
import type { Predicate } from '../Predicate';
import type { Refinement } from '../Refinement';
import type { Result } from '../Result/core';
import { isSuccess } from '../Result/core';

// ************* Filtering ************

/**
 * Similar to array.filter(...), but allows to refine the type by passing a
 * refinement
 */
export const filter: {
  <A, B extends A>(as: ReadonlyArray<A>, refinement: Refinement<A, B>): B[];
  <A, B extends A>(bs: ReadonlyArray<B>, predicate: Predicate<A>): B[];
  <A>(as: ReadonlyArray<A>, predicate: Predicate<A>): A[];
} = <A>(array: ReadonlyArray<A>, criteria: Predicate<A>): A[] => {
  return array.filter(criteria);
};

/**
 * Pipeable version of `filter_`
 *
 * Similar to array.filter(...), but allows to refine the type by passing a
 * refinement
 */
export const filter_: {
  <A, B extends A>(refinement: Refinement<A, B>): (as: ReadonlyArray<A>) => Array<B>;
  <A>(predicate: Predicate<A>): <B extends A>(bs: ReadonlyArray<B>) => Array<B>;
  <A>(predicate: Predicate<A>): (as: ReadonlyArray<A>) => Array<A>;
} =
  <A>(predicate: Predicate<A>) =>
  (as: ReadonlyArray<A>) =>
    as.filter(predicate);

/**
 * Filters out the duplicates from an array.
 * May not conserve order.
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

// ************* Destructors ************

/**
 * Returns the first element of the array.
 *
 * When the array is empty, returns undefined
 */
export const headOrUndefined = <A>([a]: A[]): A | undefined => a;

/**
 * Returns all but the first element of an array
 */
export const tail = <A>([, ...as]: A[]): A[] => as;

// ************* Partition ************

/**
 * Group elements of an array into two groups based on the given criteria, which
 * can be either a Refinement (giving 2 separate types) or a simple predicate
 * (keeping uniform types)
 */
export const partition: {
  <A, B extends A>(as: A[], refinement: Refinement<A, B>): [B[], Exclude<A, B>[]];
  <A>(as: A[], predicate: Predicate<A>): [A[], A[]];
} = <A, B extends A>(as: A[], predicate: Predicate<A>): [A[], Exclude<A, B>[]] => {
  const selected: A[] = [];
  const notSelected: Exclude<A, B>[] = [];

  const result = as.reduce(
    (accumulator, current) => {
      if (predicate(current)) {
        accumulator.selected.push(current);
      } else {
        // This is actually safe: since we rely on predicate, we know that current
        // doesn't have type B
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accumulator.notSelected.push(current as any);
      }

      return accumulator;
    },
    { selected, notSelected },
  );

  return [result.selected, result.notSelected];
};

/**
 * Pipeable version of `partition`
 *
 * Group elements of an array into two groups based on the given criteria, which
 * can be either a Refinement (giving 2 separate types) or a simple predicate
 * (keeping uniform types)
 */
export const partition_: {
  <A, B extends A>(refinement: Refinement<A, B>): (as: A[]) => [B[], Exclude<A, B>[]];
  <A>(predicate: Predicate<A>): (as: A[]) => [A[], A[]];
} =
  <A, B extends A>(predicate: Predicate<A>) =>
  (as: A[]): [B[], Exclude<A, B>[]] =>
    partition<A, B>(as, predicate as Refinement<A, B>);

/**
 * Group elements of an array into two groups by transforming them.
 *
 * This is similar to the previously used `discriminatingPartition` with transformation
 * functions.
 *
 * The item will land in the first array if the function returns a Success and
 * in the second one if the function returns a Failure
 */
export const partitionMap = <A, B, C>(as: A[], f: (a: A) => Result<B, C>): [C[], B[]] => {
  const selected: C[] = [];
  const notSelected: B[] = [];

  for (const a of as) {
    const r = f(a);

    if (isSuccess(r)) {
      selected.push(r.value);
    } else {
      notSelected.push(r.error);
    }
  }

  return [selected, notSelected];
};

/**
 * Pipeable version of `partitionMap`
 *
 * Group elements of an array into two groups by transforming them.
 *
 * This is similar to the previously used `discriminatingPartition` with transformation
 * functions.
 *
 * The item will land in the first array if the function returns a Success and
 * in the second one if the function returns a Failure
 */
export const partitionMap_ =
  <A, B, C>(f: (a: A) => Result<B, C>) =>
  (as: A[]): [C[], B[]] =>
    partitionMap(as, f);
