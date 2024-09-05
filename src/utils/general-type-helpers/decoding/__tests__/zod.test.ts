/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it } from 'node:test';
import * as z from 'zod';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { assertMatches, objectContaining } from '@utils/node-test-utils';
import { assertTypeIsTrue, Equals } from '@utils/TypeEquals';
import type { DecodeError } from '../zod';
import { combineDecodeErrors, decodeToResult, sequenceDecoders } from '../zod';

describe('decodeToResult()', () => {
  describe('Given a schema and invalid data', () => {
    const schema = z.object({ name: z.string() });
    const data = { id: '5' };

    it('should return a Failure', () => {
      assertFailure(decodeToResult(schema, data));
    });
  });

  describe('Given a schema and invalid data and a context', () => {
    const schema = z.object({ name: z.string() });
    const errorContext = 'Here is my context';
    const data = { id: '5' };

    it('should return a Failure', () => {
      assertMatches(
        assertFailure(decodeToResult(schema, data, errorContext)),
        objectContaining({
          errorContext,
        }),
      );
    });
  });

  describe('Given a schema and valid data', () => {
    const schema = z.object({ name: z.string() });
    const data = { name: 'Milou' };

    it('should return a Success', () => {
      const result = assertSuccess(decodeToResult(schema, data));

      assertMatches(result, { name: 'Milou' });
    });
  });

  describe('Given a schema with a transform and valid data', () => {
    const schema = z
      .object({ some_prop: z.string() })
      .transform((obj) => ({ someProp: obj.some_prop }));
    const data = { some_prop: 'Milou' };

    it('should return a Success', () => {
      const result = assertSuccess(decodeToResult(schema, data));

      assertMatches(result, { someProp: 'Milou' });

      assertTypeIsTrue<Equals<{ someProp: string }, typeof result>>();
    });
  });
});

describe('sequenceDecoders()', () => {
  describe('Given a schema and an array with some invalid data', () => {
    const schema = z.object({ name: z.string() });
    const data = [{ id: '5' }, { name: 'Milou' }];
    const decoder = (d: unknown) => decodeToResult(schema, d);

    it('should return a Failure', () => {
      assertFailure(sequenceDecoders(decoder, data));
    });
  });

  describe('Given a schema, an array with some invalid data and a context', () => {
    const schema = z.object({ name: z.string() });
    const errorContext = 'Here is my context';
    const data = [{ id: '5' }, { name: 'Milou' }, { id: '10' }];
    const decoder = (d: unknown) => decodeToResult(schema, d, errorContext);

    it('should return a Failure', () => {
      assertMatches(
        assertFailure(sequenceDecoders(decoder, data, errorContext)),
        objectContaining({
          errorContext,
        }),
      );
    });
  });

  describe('Given a schema and an array with only valid data', () => {
    const schema = z.object({ name: z.string() });
    const data = [{ name: 'Tintin' }, { name: 'Milou' }];
    const decoder = (d: unknown) => decodeToResult(schema, d);

    it('should return a Success', () => {
      const result = assertSuccess(sequenceDecoders(decoder, data));

      assertMatches(result, [{ name: 'Tintin' }, { name: 'Milou' }]);
    });
  });
});

describe('combineDecodeErrors()', () => {
  describe('Given two DecodeErrors', () => {
    const error1 = {
      tag: 'decodeError',
      zodErrors: [{ id: 'one' } as any as z.ZodError<unknown>],
    } as DecodeError;
    const error2 = {
      tag: 'decodeError',
      zodErrors: [
        { id: 'two' } as any as z.ZodError<unknown>,
        { id: 'three' } as any as z.ZodError<unknown>,
      ],
      stack: undefined,
    } as DecodeError;

    it('should return one error with all the zod errors inside', () => {
      assertMatches(
        combineDecodeErrors(error1, error2),
        objectContaining({
          tag: 'decodeError',
          zodErrors: [{ id: 'one' }, { id: 'two' }, { id: 'three' }],
          errorContext: ' ',
        }),
      );
    });
  });
});
