import * as R from '@utils/general-type-helpers/Result';
import { MATCHER_TAG_PROPERTY_NAME } from './constants';
import { isUntypedMatcher, type MatcherChecker } from './types';

export type StringIncludingMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: 'stringIncludingMatcher';
  str: string;
};

export const isStringIncludingMatcher = (expected: unknown): expected is StringIncludingMatcher =>
  isUntypedMatcher(expected) && expected[MATCHER_TAG_PROPERTY_NAME] === 'stringIncludingMatcher';

export const stringIncluding = (string: string): StringIncludingMatcher => {
  return { [MATCHER_TAG_PROPERTY_NAME]: 'stringIncludingMatcher', str: string };
};

export const checkStringIncluding: MatcherChecker<StringIncludingMatcher> = ({
  actual,
  expected,
}) => {
  if (typeof actual !== 'string') {
    return R.toFailure({
      message: 'stringIncluding: actual is not a string',
      transformedActual: actual,
    });
  }

  return actual.includes(expected.str)
    ? R.toSuccess({ transformedActual: expected })
    : R.toFailure({ message: 'stringIncluding: actual', transformedActual: actual });
};
