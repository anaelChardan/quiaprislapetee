import { chunk, pipe } from '../function';
import * as NEA from '../NonEmptyArray';
import * as R from '../Result';
import * as DI from './date-interval';

/**
 * Returns windowed chunks of the given size from the days between from and to
 *
 * @param from a date in string format like '2020-01-01'
 * @param to a date in string format like '2020-01-01'
 * @param window a number
 *
 * @returns R.Result<DI.IntervalDateError, NEA.NonEmptyArray<NEA.NonEmptyArray<Date>>>
 */
export function rangeBetweenTwoDates(
  from: string,
  to: string,
  window = 1,
): R.Result<DI.IntervalDateError, NEA.NonEmptyArray<NEA.NonEmptyArray<Date>>> {
  return pipe(
    DI.fromString(from, to),
    R.map_(DI.getDaysForInterval),
    R.map_((c) => chunk(c, window)),
  );
}

/**
 * Returns windowed date from the days between from and to
 *
 * @param from a date in string format like '2020-01-01'
 * @param to a date in string format like '2020-01-01'
 * @param window a number
 *
 * @returns R.Result<DI.IntervalDateError, NEA.NonEmptyArray<NEA.NonEmptyArray<Date>>>
 */
export function getDateIntervalsBetweenTwoDates(
  from: string,
  to: string,
  window = 1,
): R.Result<
  DI.IntervalDateError,
  NEA.NonEmptyArray<{
    from: Date;
    to: Date;
  }>
> {
  return pipe(
    rangeBetweenTwoDates(from, to, window),
    R.map_(
      NEA.map_((dateRange: NEA.NonEmptyArray<Date>) => {
        return {
          from: NEA.head(dateRange),
          to: NEA.last(dateRange),
        };
      }),
    ),
  );
}
