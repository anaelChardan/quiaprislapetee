import { MATCHER_TAG_PROPERTY_NAME } from './constants';
import { isUntypedMatcher } from './types';

export type ObjectContainingMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: 'objectContainingMatcher';
  obj: object;
};

export const isObjectContainingMatcher = (expected: unknown): expected is ObjectContainingMatcher =>
  isUntypedMatcher(expected) && expected[MATCHER_TAG_PROPERTY_NAME] === 'objectContainingMatcher';

export const objectContaining = (obj: object): ObjectContainingMatcher => {
  return { [MATCHER_TAG_PROPERTY_NAME]: 'objectContainingMatcher', obj };
};
