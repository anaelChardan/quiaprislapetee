import type originalSet from 'date-fns/set';
import * as z from 'zod';
import type { Brand } from '../Brand';
import type { BRAND_PROPERTY_NAME } from '../helpers/brand';
import type { Result } from '../Result';
import { toFailure, toSuccess } from '../Result';
import { isValidDate } from './is-valid-date';

/**
 * Represents a Date which is does not have the "Invalid date" value.
 * Only build with `ensureValidDate` or `unsafeEnsureValidDate`
 */
export type ValidDate = Brand<Date, 'ValidDate', BRAND_PROPERTY_NAME>;

export type InvalidDateError = {
  tag: 'invalidDate';
};

const toInvalidDateError = (): InvalidDateError => ({ tag: 'invalidDate' });

/**
 * Ensures the given date is valid.
 *
 * Returns a Success with the ValidDate type if the date is valid, and a Failure wit
 * an InvalidDateError if not.
 */
export function ensureValidDate(date: Date): Result<InvalidDateError, ValidDate> {
  if (!isValidDate(date)) {
    return toFailure(toInvalidDateError());
  }

  return toSuccess(date as ValidDate);
}

/**
 * Unsafe version of `ensureValidDate`
 *
 * Ensures the given date is valid.
 *
 * Will throw if the given date is invalid!
 */
export function unsafeEnsureValidDate(date: Date): ValidDate {
  if (!isValidDate(date)) {
    throw new Error('Invalid date');
  }

  return date as ValidDate;
}

/**
 * Given a date format, get a zod schema that will take a date in a
 * `string` form and return a ValidDate
 */
export const validDateSchema = z.date({
  coerce: true,
}) as z.ZodSchema<unknown> as z.ZodSchema<ValidDate>;

// ************* Operations ************

type SetValues = Parameters<typeof originalSet>[1];

/**
 * Safely set a subset of the date's content, in UTC
 *
 * As per the JS Date behaviour, `month` is 0 based (0 = January)
 */
export const setInUTC = (date: ValidDate, values: SetValues): ValidDate => {
  const result = new Date(date);
  result.setUTCHours(
    values.hours ?? date.getUTCHours(),
    values.minutes ?? date.getUTCMinutes(),
    values.seconds ?? date.getUTCSeconds(),
    values.milliseconds ?? date.getUTCMilliseconds(),
  );

  result.setUTCFullYear(values.year ?? date.getUTCFullYear());
  result.setUTCMonth(values.month ?? date.getUTCMonth());
  result.setUTCDate(values.date ?? date.getUTCDate());

  return result as ValidDate;
};

/**
 * Pipeable version of `setInUTC`
 *
 * Safely set a subset of the date's content, in UTC
 *
 * As per the JS Date behaviour, `month` is 0 based (0 = January)
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setInUTC_ =
  (values: SetValues) =>
  (date: ValidDate): ValidDate => {
    return setInUTC(date, values);
  };
