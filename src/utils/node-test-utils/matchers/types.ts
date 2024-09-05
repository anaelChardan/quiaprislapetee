import type * as R from '@utils/general-type-helpers/Result';
import { MATCHER_TAG_PROPERTY_NAME } from './constants';

export type UntypedMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: string;
} & Record<string, unknown>;

export const isUntypedMatcher = (expected: unknown): expected is UntypedMatcher =>
  typeof expected === 'object' && expected !== null && MATCHER_TAG_PROPERTY_NAME in expected;

export type MatcherChecker<Expected> = (input: {
  actual: unknown;
  expected: Expected;
}) => MatchResult;

export type MatchResult = R.Result<
  { message: string; transformedActual: unknown },
  { transformedActual: unknown }
>;
