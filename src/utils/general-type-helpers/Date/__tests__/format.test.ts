import assert from 'node:assert';
import rawFormatDate from 'date-fns/format';
import { describe, it } from 'node:test';
import * as z from 'zod';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { assertMatches } from '@utils/node-test-utils';
import { decodeToResult } from '../../decoding';
import { DATE_FORMATS } from '../date-formats';
import {
  formatDate,
  getFormattedDateSchema,
  parseFormattedDate,
  type FormattedDate,
  unsafeFormatDate,
} from '../format';
import type { ValidDate } from '../valid-date';
import { unsafeEnsureValidDate } from '../valid-date';

describe('formatDate()', () => {
  describe('Given a date', () => {
    const date = unsafeEnsureValidDate(new Date('2022-10-10'));

    it('should return a string version of the date in all formats', () => {
      assertMatches(
        DATE_FORMATS.map((format) => formatDate(date, format)),
        DATE_FORMATS.map((format) => rawFormatDate(date, format)),
      );
    });
  });
});

describe('unsafeFormatDate()', () => {
  describe('Given an invalid date', () => {
    const date = new Date('Nonsense!');

    it('should throw', () => {
      assert.throws(() => unsafeFormatDate(date, 'y-MM-dd'));
    });
  });

  describe('Given a valid date', () => {
    const date = new Date('2022-02-05 09:32:05');

    it('should return a formatted date', () => {
      assertMatches(unsafeFormatDate(date, 'y-MM-dd'), '2022-02-05');
      assertMatches(unsafeFormatDate(date, 'y-MM-dd HH:mm:ss'), '2022-02-05 09:32:05');
    });
  });
});

describe('getFormattedDateSchema()', () => {
  describe('Given an invalid date', () => {
    const formatSchema = getFormattedDateSchema('y-MM-dd');
    const rawDateValue = 'No, sir/madam!';
    const exampleSchema = z.object({
      myFormattedDate: formatSchema,
    });

    it('should fail to parse it', () => {
      assertFailure(decodeToResult(exampleSchema, { myFormattedDate: rawDateValue }));
    });
  });

  describe('Given a valid date', () => {
    const formatSchema = getFormattedDateSchema('y-MM-dd');
    const rawDateValue = '2022-01-01 23:44:22';
    const exampleSchema = z.object({
      myFormattedDate: formatSchema,
    });

    it('should return a formatted date', () => {
      assertMatches(
        assertSuccess(decodeToResult(exampleSchema, { myFormattedDate: rawDateValue })),
        { myFormattedDate: '2022-01-01' },
      );
    });
  });
});

describe('parseFormattedDate()', () => {
  describe('Given a formatted date in all formats', () => {
    const now = new Date() as ValidDate;
    const allFormattedDates = DATE_FORMATS.map((format) => ({
      date: formatDate(now, format),
      format,
    }));

    it('should return a valid date', () => {
      assert.strictEqual(
        allFormattedDates
          .map(({ date, format }) => parseFormattedDate(date, format))
          .filter(Number.isNaN).length,
        0,
      );
    });
  });
});

describe('Formatted date branded type', () => {
  describe('Given a function which only accepts a date in a specific format', () => {
    const aDateInTheExpectedFormat = '10-04' as FormattedDate<'MM-dd'>;
    const aDateInAnotherFormat = '2023-10-04' as FormattedDate<'y-MM-dd'>;

    function myFunctionTakingAFormattedDate(input: FormattedDate<'MM-dd'>): string {
      return input;
    }

    it('should accept a date in the expected format and not other formats', () => {
      myFunctionTakingAFormattedDate(aDateInTheExpectedFormat);

      // 👇 This ts-expect-error is the poor man's type-level test
      // @ts-expect-error we expect this compilation error
      myFunctionTakingAFormattedDate(aDateInAnotherFormat);
    });
  });
});
