/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { isAnyValueMatcher } from '../any-value';
import { isArrayContainingMatcher } from '../array-containing';
import { isObjectContainingMatcher } from '../object-containing';
import { isStringIncludingMatcher } from '../string-including';
import { isStringMatchingMatcher } from '../string-matching';
import { isValueOfTypeMatcher } from '../value-of-type';

export function convertStructuresForDiff(expected: unknown): unknown {
  if (typeof expected !== 'object' || expected === null) {
    return expected;
  }

  if (isArrayContainingMatcher(expected)) {
    return {
      $$typeof: Symbol.for('jest.asymmetricMatcher'),
      getExpectedType: () => 'array',
      toString: () => `ArrayContaining`,
      sample: convertStructuresForDiff(expected.arr),
      inverse: false,
    };
  }

  if (isObjectContainingMatcher(expected)) {
    return {
      $$typeof: Symbol.for('jest.asymmetricMatcher'),
      getExpectedType: () => 'object',
      toString: () => `ObjectContaining`,
      sample: convertStructuresForDiff(expected.obj),
      inverse: false,
    };
  }

  if (isValueOfTypeMatcher(expected)) {
    return {
      asymmetricMatch: () => {},
      $$typeof: Symbol.for('jest.asymmetricMatcher'),
      getExpectedType: () => expected.valueType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toAsymmetricMatcher: () => `ValueOfType<${fnNameFor(expected.valueType as any)}>`,
    };
  }

  if (isStringIncludingMatcher(expected)) {
    return {
      asymmetricMatch: () => {},
      $$typeof: Symbol.for('jest.asymmetricMatcher'),
      getExpectedType: () => 'string',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toAsymmetricMatcher: () => `StringIncluding<"${expected.str}">`,
    };
  }

  if (isStringMatchingMatcher(expected)) {
    return {
      asymmetricMatch: () => {},
      $$typeof: Symbol.for('jest.asymmetricMatcher'),
      getExpectedType: () => 'string',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toAsymmetricMatcher: () => `StringMatching<${expected.regexp}>`,
    };
  }
  if (isAnyValueMatcher(expected)) {
    return {
      asymmetricMatch: () => {},
      $$typeof: Symbol.for('jest.asymmetricMatcher'),
      getExpectedType: () => 'any',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toAsymmetricMatcher: () => `AnyValue`,
    };
  }

  if (Array.isArray(expected)) {
    return expected.map(convertStructuresForDiff);
  }

  const newExpected: Record<string, unknown> = {};
  for (const key in expected) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newExpected[key] = convertStructuresForDiff((expected as any)[key]);
  }
  return newExpected;
}

const functionToString = Function.prototype.toString;

function fnNameFor(func: () => unknown) {
  if (func.name) {
    return func.name;
  }

  const matches = functionToString.call(func).match(/^(?:async)?\s*function\s*\*?\s*([\w$]+)\s*\(/);
  return matches ? matches[1] : '<anonymous>';
}
