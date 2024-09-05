import * as R from '@utils/general-type-helpers/Result';
import { MATCHER_TAG_PROPERTY_NAME } from './constants';
import { isUntypedMatcher, type MatcherChecker } from './types';

export type StringMatchingMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: 'stringMatchingMatcher';
  regexp: RegExp;
};

export const isStringMatchingMatcher = (expected: unknown): expected is StringMatchingMatcher =>
  isUntypedMatcher(expected) && expected[MATCHER_TAG_PROPERTY_NAME] === 'stringMatchingMatcher';

export const stringMatching = (regexp: RegExp): StringMatchingMatcher => {
  return { [MATCHER_TAG_PROPERTY_NAME]: 'stringMatchingMatcher', regexp };
};

export const checkStringMatching: MatcherChecker<StringMatchingMatcher> = ({
  actual,
  expected,
}) => {
  if (typeof actual !== 'string') {
    return R.toFailure({
      message: 'stringMatching: actual is not a string',
      transformedActual: actual,
    });
  }

  return expected.regexp.test(actual)
    ? R.toSuccess({ transformedActual: expected })
    : R.toFailure({
        message: 'stringMatching: actual does not match the regex',
        transformedActual: actual,
      });
};
