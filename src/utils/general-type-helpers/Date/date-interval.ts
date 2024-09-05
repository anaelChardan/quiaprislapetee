/* eslint-disable @typescript-eslint/no-use-before-define */
import { createOpaqueAPI } from '@iadvize-oss/opaque-type';
import addDays from 'date-fns/addDays';
import { pipe } from '../function';
import type { PositiveInteger } from '../Integer';
import * as NEA from '../NonEmptyArray';
import * as R from '../Result';
import type { ValidDate } from './valid-date';
import { ensureValidDate, unsafeEnsureValidDate } from './valid-date';

/**
 * A date interval
 *
 * The brand is here to signal that only this module has the authority to construct those values with the defined constructors.
 * Use `as DateInterval` at your own risk!
 */
type $DateInterval = {
  from: ValidDate;
  to: ValidDate;
};

const { toOpaque, fromOpaque } = createOpaqueAPI<'DateInterval', $DateInterval>('DateInterval');

// We have to export this function to be able to export the type and any function returning it
export { toOpaque as __DO_NOT_USE };
export type DateInterval = ReturnType<typeof toOpaque>;

export type IntervalDateError = {
  isValidFrom: boolean;
  isValidEnd: boolean;
};

/**
 * safe DateInterval constructor
 *
 * Date order does not matter, to and from will be ordered automatically
 *
 * @param fromDate: a string that can be parsed as a date, e.g. '2020-01-01'
 * @param toDate: a string that can be parsed as a date, e.g. '2020-01-01'
 *
 * @deprecated use {@link fromValidDates} instead (also, it can't fail 🎉)
 *
 * @returns R.Result<IntervalDateError, DateInterval>
 */
export function fromString(
  fromDate: string,
  toDate: string,
): R.Result<IntervalDateError, DateInterval> {
  return pipe(validateDateInterval([fromDate, toDate]));
}

/**
 * unsafe DateInterval constructor
 *
 * @param fromDate: a string that can be parsed as a date, e.g. '2020-01-01'
 * @param toDate: a string that can be parsed as a date, e.g. '2020-01-01'
 *
 * @returns DateInterval
 */
export function unsafeFromString(fromDate: string, toDate: string): DateInterval {
  return toOpaque({
    from: unsafeEnsureValidDate(new Date(fromDate)),
    to: unsafeEnsureValidDate(new Date(toDate)),
  });
}

/**
 * Create a date interval from given dates.
 *
 * Will determine `from` and `to` automatically
 */
export function fromValidDates([dateOne, dateTwo]: [ValidDate, ValidDate]): DateInterval {
  const rawDateOne = dateOne.getTime();
  const rawDateTwo = dateTwo.getTime();

  const [fromDate, toDate] = rawDateOne > rawDateTwo ? [dateTwo, dateOne] : [dateOne, dateTwo];

  return toOpaque({
    from: fromDate,
    to: toDate,
  });
}

/**
 * Return the interval number of days
 *
 * @param dateInterval : a DateInterval
 * @returns number
 */
export function numberOfDaysInInterval(dateInterval: DateInterval): number {
  return getDaysForInterval(dateInterval).length;
}

// ************* Destructors ************

/**
 * Split a date interval into two non overlapping intervals
 *
 * If the date interval is one day, it will return the same date interval in the first and the second half
 *
 * @param dateInterval a date interval
 * @returns R.Result<IntervalDateError, { firstHalf: DateInterval, secondHalf: DateInterval}>
 */
export function splitInTwoParts(
  dateInterval: DateInterval,
): R.Result<IntervalDateError, { firstHalf: DateInterval; secondHalf: DateInterval }> {
  const days = getDaysForInterval(dateInterval);

  if (days.length === 1) {
    return R.toSuccess({ firstHalf: dateInterval, secondHalf: dateInterval });
  }

  const half = (days.length % 2 === 0 ? days.length / 2 : (days.length + 1) / 2) as PositiveInteger;

  const firstHalf = NEA.sliceFromStart(days, half);
  // We can assert this because the of the length check above
  const secondHalf = days.slice(half) as NEA.NonEmptyArray<Date>;

  const firstHalfInterval = fromString(firstHalf[0].toString(), NEA.last(firstHalf).toString());

  if (R.isFailure(firstHalfInterval)) {
    return firstHalfInterval;
  }

  const secondHalfInterval = fromString(secondHalf[0].toString(), NEA.last(secondHalf).toString());

  if (R.isFailure(secondHalfInterval)) {
    return secondHalfInterval;
  }

  return R.toSuccess({
    firstHalf: firstHalfInterval.value,
    secondHalf: secondHalfInterval.value,
  });
}

/**
 * "from" as to be lower or equal than "to"
 *
 * @param fromDate: a string that can be parsed as a date, e.g. '2020-01-01'
 * @param toDate: a string that can be parsed as a date, e.g. '2020-01-01'
 *
 * @returns the list of days in an interval, including the "from" and the "to" date
 */
export function getDaysForInterval(dateInterval: DateInterval): NEA.NonEmptyArray<Date> {
  const allDates: Date[] = [];
  let currentDate: Date = from(dateInterval);
  const endDate = to(dateInterval);
  while (currentDate <= endDate) {
    allDates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return NEA.fromArray(allDates) as NEA.NonEmptyArray<Date>;
}

/**
 * Returns the "from" of the DateInterval
 *
 * @param dateInterval DateInterval
 * @returns Date
 */
export function from(dateInterval: DateInterval): Date {
  return fromOpaque(dateInterval).from;
}

/**
 * Returns the "to" of the DateInterval
 *
 * @param dateInterval DateInterval
 * @returns Date
 */
export function to(dateInterval: DateInterval): Date {
  return fromOpaque(dateInterval).to;
}

export function toRawInterval(interval: DateInterval): unknown {
  return fromOpaque(interval);
}

// ************* Internal ************

function validateDateInterval([rawDateOne, rawDateTwo]: [string, string]): R.Result<
  IntervalDateError,
  DateInterval
> {
  const dateOne = ensureValidDate(new Date(rawDateOne));
  const dateTwo = ensureValidDate(new Date(rawDateTwo));

  if (R.isFailure(dateOne) || R.isFailure(dateTwo)) {
    return R.toFailure({
      isValidFrom: R.isSuccess(dateOne),
      isValidEnd: R.isSuccess(dateTwo),
    });
  }

  return R.toSuccess(fromValidDates([dateOne.value, dateTwo.value]));
}
