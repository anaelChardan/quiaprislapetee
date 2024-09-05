/**
 * A function returning a boolean from a given input. Typically used in array
 * functions like `filter` and `find`.
 *
 * Example: (n: number): boolean => n > 5;
 */
export interface Predicate<A> {
  (a: A): boolean;
}
