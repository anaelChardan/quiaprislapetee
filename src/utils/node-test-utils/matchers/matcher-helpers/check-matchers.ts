/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
import assert from 'node:assert';
import * as R from '@utils/general-type-helpers/Result';
import { type MatchResult, type MatcherChecker } from '../types';
import { checkAnyValue, isAnyValueMatcher } from '../any-value';
import { checkStringIncluding, isStringIncludingMatcher } from '../string-including';
import { checkStringMatching, isStringMatchingMatcher } from '../string-matching';
import { checkValueOfType, isValueOfTypeMatcher } from '../value-of-type';
import { type ArrayContainingMatcher, isArrayContainingMatcher } from '../array-containing';
import { type ObjectContainingMatcher, isObjectContainingMatcher } from '../object-containing';

export const checkMatchers = ({
  actual,
  expected,
}: {
  actual: unknown;
  expected: unknown;
}): MatchResult => {
  if (isAnyValueMatcher(expected)) {
    return checkAnyValue({ actual, expected });
  }
  if (isStringIncludingMatcher(expected)) {
    return checkStringIncluding({ actual, expected });
  }
  if (isStringMatchingMatcher(expected)) {
    return checkStringMatching({ actual, expected });
  }
  if (isValueOfTypeMatcher(expected)) {
    return checkValueOfType({ actual, expected });
  }
  if (Array.isArray(expected) || isArrayContainingMatcher(expected)) {
    return checkArray({ actual, expected });
  }
  if ((typeof expected === 'object' && expected !== null) || isObjectContainingMatcher(expected)) {
    return checkObject({ actual, expected });
  }

  return checkPrimitiveValue({ actual, expected });
};

const checkPrimitiveValue: MatcherChecker<unknown> = ({ actual, expected }) => {
  try {
    assert.strictEqual(actual, expected);
  } catch {
    return R.toFailure({ message: 'matchPrimitiveValue', transformedActual: actual });
  }

  return R.toSuccess({ transformedActual: actual });
};

const checkArray: MatcherChecker<unknown[] | ArrayContainingMatcher> = ({ actual, expected }) => {
  if (!Array.isArray(actual)) {
    return R.toFailure({
      message: 'checkArray: actual is not an array',
      transformedActual: actual,
    });
  }

  // exact array match
  if (Array.isArray(expected)) {
    const transformedActual: unknown[] = [];
    let hasFailed = false;

    // Checking all keys match each exactly based on index
    for (const index of actual.keys()) {
      const valueMatchResult = checkMatchers({ actual: actual[index], expected: expected[index] });

      if (R.isFailure(valueMatchResult)) {
        hasFailed = true;
        transformedActual.push(valueMatchResult.error.transformedActual);
      } else {
        transformedActual.push(valueMatchResult.value.transformedActual);
      }
    }

    // Exact match length check
    if (expected.length !== actual.length) {
      return R.toFailure({
        message: 'checkArray: arrays have different lengths',
        transformedActual,
      });
    }

    return hasFailed
      ? R.toFailure({
          message: 'checkArray: checking has failed for an item of the array',
          transformedActual,
        })
      : R.toSuccess({ transformedActual: expected });
  }

  // partial array match: each item of the expected array must be in actual
  // at least once, no matter the order
  const result = expected.arr.every((expectedItem) =>
    actual.some((actualItem) => {
      const matcherResult = checkMatchers({ actual: actualItem, expected: expectedItem });

      return R.isSuccess(matcherResult);
    }),
  );

  if (!result) {
    return R.toFailure({
      message: 'checkArray: some of the values were not matched',
      transformedActual: actual,
    });
  }

  return R.toSuccess({ transformedActual: expected });
};

const checkObject: MatcherChecker<ObjectContainingMatcher | object> = ({ actual, expected }) => {
  if (
    typeof actual !== 'object' ||
    actual === null ||
    typeof expected !== 'object' ||
    expected === null
  ) {
    return R.toFailure({
      message: 'checkObject: actual or expected is not an object',
      transformedActual: actual,
    });
  }

  const expectedObj = isObjectContainingMatcher(expected) ? expected.obj : expected;

  const transformedActual: Record<string, unknown> = {};
  let hasFailed = false;

  for (const key in expectedObj) {
    const propMatchResult = checkMatchers({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actual: (actual as any)[key],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expected: (expectedObj as any)[key],
    });

    if (R.isFailure(propMatchResult)) {
      hasFailed = true;
    }

    // Only set the key if it exists on actual, else the transformation would add
    // non-existing keys on the input
    if (key in actual) {
      transformedActual[key] = R.isFailure(propMatchResult)
        ? propMatchResult.error.transformedActual
        : propMatchResult.value.transformedActual;
    }
  }

  // exact object match check
  if (
    !isObjectContainingMatcher(expected) &&
    Object.keys(actual).length !== Object.keys(expected).length
  ) {
    return R.toFailure({
      message: 'checkObject: objects have a different number of keys',
      transformedActual: { ...actual, ...transformedActual },
    });
  }

  return hasFailed
    ? R.toFailure({ message: 'checkObject: checking has failed for a property', transformedActual })
    : R.toSuccess({ transformedActual: expected });
};
