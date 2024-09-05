import { TypeGuardError } from '@utils/oops';

export type Order = 'GT' | 'EQ' | 'LT';

export type CompareFn<T> = (a: T, b: T) => Order;

/**
 * Given a `compare` function returning an Order for two elements, returns a
 * function usable with array `.sort()`
 */
export const getOrderSort =
  <T>(compare: CompareFn<T>) =>
  (a: T, b: T): -1 | 0 | 1 => {
    const result = compare(a, b);

    switch (result) {
      case 'LT':
        return -1;
      case 'EQ':
        return 0;
      case 'GT':
        return 1;
      default:
        throw new TypeGuardError(result, 'Invalid order');
    }
  };

/**
 * Inverts a compare function.
 *
 * For example, for a function `compareNumbersAsc()` which compares 2 numbers
 * in the ascending order, `invert(compareNumbersAsc())` will compare them
 * in the descending order.
 *
 */
export const invert =
  <T>(compare: CompareFn<T>): CompareFn<T> =>
  (a, b) =>
    compare(b, a);

// ************* Common `compare` function ************

/**
 * Provides the Order for a number `a` in comparison with a number `b`
 */
export const compareNumbersAsc = (a: number, b: number): Order => {
  if (a === b) {
    return 'EQ';
  }

  return a < b ? 'LT' : 'GT';
};

export const compareStringsAsc = (a: string, b: string): Order => {
  if (a === b) {
    return 'EQ';
  }

  return a < b ? 'LT' : 'GT';
};
