import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import * as NEA from '../../NonEmptyArray';
import * as R from '../../Result';
import * as DI from '../date-interval';
import type { ValidDate } from '../valid-date';

function getDateInterval(from: string, to: string): DI.DateInterval {
  const dateInterval = DI.fromString(from, to);
  if (R.isFailure(dateInterval)) {
    throw new Error(`The date interval is not valid, from: ${from}, to: ${to}`);
  }

  return dateInterval.value;
}

describe('date-interval', () => {
  describe('fromString()', () => {
    describe('Given two equivalent dates', () => {
      const date = '2020-01-01';
      it('Returns a success with the date interval', () => {
        const result = DI.fromString(date, date);

        assertMatches(R.isSuccess(result), true);
      });
    });

    describe('Given two differents ordered dates', () => {
      const from = '2020-01-01';
      const to = '2020-01-02';
      it('Returns a success with the date interval', () => {
        const result = DI.fromString(from, to);

        assertMatches(R.isSuccess(result), true);
      });
    });

    describe('Given an invalid from date', () => {
      const from = 'toto';
      const to = '2020-01-01';
      it('Returns a failure with the error', () => {
        const result = DI.fromString(from, to);

        assertMatches(
          result,
          R.toFailure({
            isValidFrom: false,
            isValidEnd: true,
          }),
        );
      });
    });

    describe('Given an invalid to date', () => {
      const from = '2020-01-01';
      const to = 'toto';
      it('Returns a failure with the error', () => {
        const result = DI.fromString(from, to);

        assertMatches(
          result,
          R.toFailure({
            isValidFrom: true,
            isValidEnd: false,
          }),
        );
      });
    });
  });

  describe('fromValidDates()', () => {
    describe('Given two valid dates', () => {
      const dateOne = new Date('2023-01-04 12:23:43') as ValidDate;
      const dateTwo = new Date('2023-01-01 05:32:11') as ValidDate;

      it('should return the proper from and to for any given two dates', () => {
        const result = DI.fromValidDates([dateOne, dateTwo]);

        assertMatches(DI.from(result), dateTwo);
        assertMatches(DI.to(result), dateOne);
      });
    });
  });

  describe('getDaysForInterval()', () => {
    describe('Given two equivalent dates', () => {
      it('returns a range of one date', () => {
        const from = '2020-01-01';
        const dateInterval = getDateInterval(from, from);
        const result = DI.getDaysForInterval(dateInterval);

        assertMatches(result, NEA.fromArray([new Date(from)]));
      });
    });

    describe('Given two different dates', () => {
      const from = '2020-01-01';
      const to = '2020-01-02';

      const dateInterval = getDateInterval(from, to);
      it('returns a range of multiple date', () => {
        const result = DI.getDaysForInterval(dateInterval);
        assertMatches(result, NEA.fromArray([new Date(from), new Date(to)]));
      });
    });

    describe('Given different dates in different months', () => {
      const from = '2020-02-27';
      const to = '2020-03-02';
      const dateInterval = getDateInterval(from, to);

      it('returns a range of multiple date', () => {
        const received = DI.getDaysForInterval(dateInterval);

        const expected = NEA.fromArray([
          new Date(from),
          new Date('2020-02-28'),
          new Date('2020-02-29'),
          new Date('2020-03-01'),
          new Date(to),
        ]);

        assertMatches(received, expected);
      });
    });
  });
  describe('splitInTwoParts', () => {
    describe('Given one day in the interval', () => {
      const from = '2020-01-01';
      const to = '2020-01-01';
      const dateInterval = getDateInterval(from, to);

      it('splits the interval into to parts', () => {
        const received = DI.splitInTwoParts(dateInterval);

        const expected = R.toSuccess({
          firstHalf: getDateInterval(from, from),
          secondHalf: getDateInterval(to, to),
        });

        assertMatches(received, expected);
      });
    });

    describe('Given an even number of days in the interval', () => {
      const from = '2020-01-01';
      const to = '2020-01-06';
      const dateInterval = getDateInterval(from, to);

      it('splits the interval into to parts', () => {
        const received = DI.splitInTwoParts(dateInterval);

        const expected = R.toSuccess({
          firstHalf: getDateInterval(from, '2020-01-03'),
          secondHalf: getDateInterval('2020-01-04', to),
        });

        assertMatches(received, expected);
      });
    });

    describe('Given an odd number of days in the interval', () => {
      const from = '2020-01-01';
      const to = '2020-01-05';
      const dateInterval = getDateInterval(from, to);

      it('splits the interval into to parts', () => {
        const received = DI.splitInTwoParts(dateInterval);

        const expected = R.toSuccess({
          firstHalf: getDateInterval(from, '2020-01-03'),
          secondHalf: getDateInterval('2020-01-04', to),
        });

        assertMatches(received, expected);
      });
    });
  });
});
