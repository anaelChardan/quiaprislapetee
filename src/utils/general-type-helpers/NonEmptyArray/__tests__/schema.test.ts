import { describe, it } from 'node:test';
import * as z from 'zod';
import { assertMatches } from '@utils/node-test-utils';
import { assertTypeIsTrue } from '@utils/TypeEquals';
import { Equals } from 'effect/Types';
import { getNonEmptyArraySchema } from '../schema';
import type { NonEmptyArray } from '../core';

describe('getNonEmptyArraySchema()', () => {
  describe('Given an item schema and an invalid input', () => {
    const itemSchema = z.string();
    const items = ['val', 42];

    it('should fail to parse the input', () => {
      assertMatches(getNonEmptyArraySchema(itemSchema).safeParse(items).success, false);
    });
  });

  describe('Given an item schema and an empty array', () => {
    const itemSchema = z.string();
    const items: unknown[] = [];

    it('should fail to parse the input', () => {
      assertMatches(getNonEmptyArraySchema(itemSchema).safeParse(items).success, false);
    });
  });

  describe('Given an item schema and a valid array', () => {
    const itemSchema = z.string();
    const items = ['val', 'val2'];

    it('should parse the input successfully', () => {
      assertMatches(getNonEmptyArraySchema(itemSchema).safeParse(items).success, true);
    });
  });

  describe('Given an item schema with a transform and a valid array', () => {
    const itemSchema = z
      .object({ some_key: z.string() })
      .transform(({ some_key }) => ({ someKey: some_key }));
    const items = [{ some_key: 'val' }];

    it('should parse the input successfully', () => {
      const result = getNonEmptyArraySchema(itemSchema).safeParse(items);
      assertMatches(result.success, true);

      if (result.success) {
        assertTypeIsTrue<Equals<NonEmptyArray<{ someKey: string }>, typeof result.data>>();
      }
    });
  });
});
