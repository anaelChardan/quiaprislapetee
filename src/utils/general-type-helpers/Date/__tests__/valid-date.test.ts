import assert from 'node:assert';
import { describe, it } from 'node:test';
import * as z from 'zod';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { assertMatches } from '@utils/node-test-utils';
import { decodeToResult } from '../../decoding';
import {
  ensureValidDate,
  setInUTC,
  type ValidDate,
  unsafeEnsureValidDate,
  validDateSchema,
} from '../valid-date';

describe('ensureValidDate()', () => {
  describe('Given an invalid date', () => {
    const date = new Date('Nonsense!');

    it('should return a Failure', () => {
      assertFailure(ensureValidDate(date));
    });
  });

  describe('Given a valid date', () => {
    const date = new Date('2022-10-10');

    it('should return a Success', () => {
      assertMatches(assertSuccess(ensureValidDate(date)).toISOString(), date.toISOString());
    });
  });
});

describe('unsafeEnsureValidDate()', () => {
  describe('Given an invalid date', () => {
    const date = new Date('Nonsense!');

    it('should throw', () => {
      assert.throws(() => unsafeEnsureValidDate(date));
    });
  });

  describe('Given a valid date', () => {
    const date = new Date('2022-10-10');

    it('should return the value', () => {
      assertMatches(unsafeEnsureValidDate(date).toISOString(), date.toISOString());
    });
  });
});

describe('validDateSchema', () => {
  describe('Given an invalid date string', () => {
    const rawDateValue = 'No, sir/madam!';
    const exampleSchema = z.object({
      myDate: validDateSchema,
    });

    it('should fail to parse it', () => {
      assertFailure(decodeToResult(exampleSchema, { myDate: rawDateValue }));
    });
  });

  describe('Given an invalid date', () => {
    const rawDateValue = new Date('No, sir/madam!');
    const exampleSchema = z.object({
      myDate: validDateSchema,
    });

    it('should fail to parse it', () => {
      assertFailure(decodeToResult(exampleSchema, { myDate: rawDateValue }));
    });
  });

  describe('Given a valid date string', () => {
    const rawDateValue = '2022-01-01 23:44:22';
    const exampleSchema = z.object({
      myDate: validDateSchema,
    });

    it('should return a parsed date', () => {
      assertMatches(assertSuccess(decodeToResult(exampleSchema, { myDate: rawDateValue })), {
        myDate: new Date(rawDateValue),
      });
    });
  });

  describe('Given a valid date', () => {
    const rawDateValue = new Date('2022-01-01 23:44:22');
    const exampleSchema = z.object({
      myDate: validDateSchema,
    });

    it('should return a parsed date', () => {
      assertMatches(assertSuccess(decodeToResult(exampleSchema, { myDate: rawDateValue })), {
        myDate: new Date(rawDateValue),
      });
    });
  });
});

describe('setUTCTime()', () => {
  describe('Given a date and a time set', () => {
    const date = new Date('2022-01-01T23:44:22.000Z') as ValidDate;
    const values = {
      minutes: 0,
    };

    it('should return the date with the time set', () => {
      assertMatches(setInUTC(date, values).toISOString(), '2022-01-01T23:00:22.000Z');
    });
  });

  describe('Given a date and a weird time set', () => {
    const date = new Date('2022-01-01T11:44:22.000Z') as ValidDate;
    const values = {
      minutes: 77,
    };

    it('should return the date with the time set', () => {
      // 77 minutes is 60 (+1 h) + 17
      assertMatches(setInUTC(date, values).toISOString(), '2022-01-01T12:17:22.000Z');
    });
  });

  describe('Given a date and date set to 12am', () => {
    const date = new Date('2022-01-01T11:44:22.000Z') as ValidDate;
    const values = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };

    it('should return the date with the time set', () => {
      const result = setInUTC(date, values);

      assertMatches(result.toISOString(), '2022-01-01T00:00:00.000Z');
    });
  });
});
