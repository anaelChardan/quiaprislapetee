import * as fc from 'fast-check';
import type { ValidDate } from '../valid-date';

/**
 * Property test valid date arbitrary (= "generator")
 */
export const validDateArbitrary = fc
  .date()
  .filter((date): date is ValidDate => !Number.isNaN(date.getTime()));
