import * as R from '@utils/general-type-helpers/Result';
import { MATCHER_TAG_PROPERTY_NAME } from './constants';
import { isUntypedMatcher, type MatcherChecker } from './types';

export type AnyValueMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: 'anyValueMatcher';
};

export const isAnyValueMatcher = (expected: unknown): expected is AnyValueMatcher =>
  isUntypedMatcher(expected) && expected[MATCHER_TAG_PROPERTY_NAME] === 'anyValueMatcher';

/**
 * This matcher will pass whatever the value is
 */
export const anyValue = (): AnyValueMatcher => {
  return { [MATCHER_TAG_PROPERTY_NAME]: 'anyValueMatcher' };
};

export const checkAnyValue: MatcherChecker<AnyValueMatcher> = ({ expected }) => {
  return R.toSuccess({ transformedActual: expected });
};
