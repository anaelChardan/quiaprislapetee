import * as z from 'zod';

/**
 * @internal
 *
 * Find out if a Date is valid (not 'Invalid date')
 */
export const isValidDate = (date: Date) =>
  z.date().safeParse(date) && !Number.isNaN(date.getTime());
