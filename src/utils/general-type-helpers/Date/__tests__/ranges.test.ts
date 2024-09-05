import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import * as NEA from '../../NonEmptyArray';
import * as R from '../../Result';
import { getDateIntervalsBetweenTwoDates, rangeBetweenTwoDates } from '../ranges';

describe('range', () => {
  describe('rangeBetweenTwoDates()', () => {
    describe('Given two dates and a window', () => {
      const startDate = '2020-01-29';
      const endDate = '2020-02-03';
      it('Returns the right result', () => {
        const received = rangeBetweenTwoDates(startDate, endDate, 2);

        const expected = R.toSuccess(
          NEA.fromArray([
            NEA.fromArray([new Date('2020-01-29'), new Date('2020-01-30')]),
            NEA.fromArray([new Date('2020-01-31'), new Date('2020-02-01')]),
            NEA.fromArray([new Date('2020-02-02'), new Date('2020-02-03')]),
          ]),
        );

        assertMatches(received, expected);
      });
    });
  });

  describe('getDateIntervalsBetweenTwoDates()', () => {
    describe('Given two dates and a window', () => {
      const startDate = '2020-01-29';
      const endDate = '2020-02-04';

      it('Returns the right result', () => {
        const received = getDateIntervalsBetweenTwoDates(startDate, endDate, 3);

        const expected = R.toSuccess(
          NEA.fromArray([
            {
              from: new Date('2020-01-29'),
              to: new Date('2020-01-31'),
            },
            {
              from: new Date('2020-02-01'),
              to: new Date('2020-02-03'),
            },
            {
              from: new Date('2020-02-04'),
              to: new Date('2020-02-04'),
            },
          ]),
        );

        assertMatches(received, expected);
      });
    });
  });
});
