/* eslint-disable @typescript-eslint/naming-convention */
import rawFormatDate from 'date-fns/format';
import rawParse from 'date-fns/parse';
import * as z from 'zod';
import { type Brand } from '../Brand';
import { pipe } from '../function';
import { type BRAND_PROPERTY_NAME } from '../helpers/brand';
import { fold_ } from '../Result';
import type { DATE_FORMATS } from './date-formats';
import { isValidDate } from './is-valid-date';
import type { ValidDate } from './valid-date';
import { ensureValidDate } from './valid-date';

/**
 * Date formats accepted by `formatDate`
 */
export type DateFormat = (typeof DATE_FORMATS)[number];

/**
 * Branded type representing a date encoded in a specific format
 */
export type FormattedDate<Format extends DateFormat> = Brand<string, Format, BRAND_PROPERTY_NAME>;

/**
 * Format a ValidDate to the given format. For a reference of accepted formats,
 * see https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md
 *
 * To ensure a Date object is valid (i.e. not "Invalid date"), see
 * `ensureValidDate`
 */
export function formatDate<Format extends DateFormat>(
  date: ValidDate,
  format: Format,
): FormattedDate<Format> {
  return rawFormatDate(date, format) as FormattedDate<Format>;
}

/**
 * Pipeable version of `formatDate`
 *
 * Format a ValidDate to the given format. For a reference of accepted formats,
 * see https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md
 *
 * To ensure a Date object is valid (i.e. not "Invalid date"), see
 * `ensureValidDate`
 */
export const formatDate_ =
  <Format extends DateFormat>(format: Format) =>
  (date: ValidDate) =>
    formatDate(date, format);

/**
 * Unsafe version of `formatDate`
 *
 * Format a date to the given format. For a reference of accepted formats,
 * see https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md
 *
 * Will throw if the passed date is not valid!
 *
 * For a safe alternative, see the combined use of `ensureValidDate` and
 * `formatDate`
 */
export function unsafeFormatDate<Format extends DateFormat>(
  date: Date,
  format: Format,
): FormattedDate<Format> {
  if (!isValidDate(date)) {
    throw new Error('Cannot format an invalid date');
  }

  return rawFormatDate(date, format) as FormattedDate<Format>;
}

/**
 * Given a date format, get a zod schema that will take a date in a
 * `string` form and format it properly
 */
export const getFormattedDateSchema = <Format extends DateFormat>(
  format: Format,
): z.ZodEffects<z.ZodString, FormattedDate<Format>, string> =>
  z.string().transform((value, context) =>
    pipe(
      new Date(value),
      ensureValidDate,
      fold_(() => {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The date is invalid`,
        });
        return z.NEVER;
      }, formatDate_(format)),
    ),
  );

/**
 * Get a ValidDate from a FormattedDate.
 *
 * Caveat: depending on the format, more information may need to be created to
 * get a full date object. This will have the same behaviour as
 * https://date-fns.org/v2.29.3/docs/parse, with referenceDate being now.
 *
 * This is guaranteed not to produce 'Invalid date' values, because the formats
 * are checked by us and tested.
 */
export const parseFormattedDate = <Format extends DateFormat>(
  formattedDate: FormattedDate<Format>,
  format: Format,
): ValidDate => rawParse(formattedDate, format, new Date()) as ValidDate;

/**
 * Pipeable version of parseFormattedDate
 *
 * Get a ValidDate from a FormattedDate.
 *
 * Caveat: depending on the format, more information may need to be created to
 * get a full date object. This will have the same behaviour as
 * https://date-fns.org/v2.29.3/docs/parse, with referenceDate being now.
 *
 * This is guaranteed not to produce 'Invalid date' values, because the formats
 * are checked by us and tested.
 */
export const parseFormattedDate_ =
  <Format extends DateFormat>(format: Format) =>
  (formattedDate: FormattedDate<Format>): ValidDate =>
    parseFormattedDate(formattedDate, format);
