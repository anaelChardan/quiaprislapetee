import assert from 'node:assert';
import * as R from '@utils/general-type-helpers/Result';
import { diff } from 'jest-diff';
import { checkMatchers, convertStructuresForDiff } from '../matchers/matcher-helpers';

// We're explicitly allowing `any` on purpose to avoid "implicit any" with some
// input
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assertMatches = (actual: any, expected: unknown, message?: string) => {
  const matcherCheckResult = checkMatchers({ actual, expected });

  if (R.isFailure(matcherCheckResult)) {
    const diffResult = diff(
      convertStructuresForDiff(expected),
      convertStructuresForDiff(matcherCheckResult.error.transformedActual),
    );

    const errorMessage = `The actual value does not match expected (${matcherCheckResult.error.message})
      \n${diffResult}`;

    throw new assert.AssertionError({
      operator: 'assertMatches',
      message: message ? `${message}\n${errorMessage}` : errorMessage,
    });
  }
};
