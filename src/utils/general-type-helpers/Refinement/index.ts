/**
 * A function that refines the given type, thanks to the `is` operator.
 *
 * Example: (x: number | string): x is number => typeof x === "number"
 */
export interface Refinement<A, B extends A> {
  (a: A): a is B;
}
