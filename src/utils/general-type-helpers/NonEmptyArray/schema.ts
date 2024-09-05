import * as z from 'zod';
import type { NonEmptyArray } from './core';

/**
 * Get a zod schema that applies the NonEmptyArray type for a given item schema
 *
 * @example
 * ```ts
 * const itemSchema = z.string();
 * const neaStringArray = getNonEmptyArraySchema(itemSchema);
 *
 * // success: true ✅
 * const result1 = neaStringArray.safeParse(["some", "string", "values"]);
 * // success: false ❌
 * const result2 = neaStringArray.safeParse(["some", 42, undefined]);
 * // success: false ❌
 * const result3 = neaStringArray.safeParse([]);
 * ```
 */
export const getNonEmptyArraySchema = <Schema extends z.ZodTypeAny>(
  itemSchema: Schema,
): z.Schema<NonEmptyArray<z.TypeOf<Schema>>> => z.array(itemSchema).nonempty();
