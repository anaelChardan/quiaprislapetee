import { MATCHER_TAG_PROPERTY_NAME } from './constants';
import { isUntypedMatcher } from './types';

export type ArrayContainingMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: 'arrayContainingMatcher';
  arr: unknown[];
};

export const isArrayContainingMatcher = (expected: unknown): expected is ArrayContainingMatcher =>
  isUntypedMatcher(expected) && expected[MATCHER_TAG_PROPERTY_NAME] === 'arrayContainingMatcher';

export const arrayContaining = (arr: unknown[]): ArrayContainingMatcher => {
  return { [MATCHER_TAG_PROPERTY_NAME]: 'arrayContainingMatcher', arr };
};
