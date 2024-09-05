/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as R from '@utils/general-type-helpers/Result';
import { MATCHER_TAG_PROPERTY_NAME } from './constants';
import { isUntypedMatcher, type MatcherChecker } from './types';

export type AcceptableValueTypes =
  | StringConstructor
  | NumberConstructor
  | SymbolConstructor
  | BooleanConstructor
  | FunctionConstructor
  | DateConstructor
  | BigIntConstructor
  | ObjectConstructor;

export type ValueOfTypeMatcher = {
  [MATCHER_TAG_PROPERTY_NAME]: 'valueOfTypeMatcher';
  valueType: AcceptableValueTypes;
};

export const isValueOfTypeMatcher = (expected: unknown): expected is ValueOfTypeMatcher =>
  isUntypedMatcher(expected) && expected[MATCHER_TAG_PROPERTY_NAME] === 'valueOfTypeMatcher';

// TODO add a special "Nullable" or "Falsy" type? Or another method: `falsyValue` / `truthyValue`?
export const valueOfType = (valueType: AcceptableValueTypes): ValueOfTypeMatcher => ({
  [MATCHER_TAG_PROPERTY_NAME]: 'valueOfTypeMatcher',
  valueType,
});

export const checkValueOfType: MatcherChecker<ValueOfTypeMatcher> = ({ actual, expected }) => {
  return isActualOfExpectedValueType(actual, expected.valueType)
    ? R.toSuccess({ transformedActual: expected })
    : R.toFailure({
        message: 'valueOfType: value does not match the type',
        transformedActual: actual,
      });
};

const isActualOfExpectedValueType = (actual: unknown, expectedValueType: AcceptableValueTypes) => {
  if (expectedValueType == String) {
    return typeof actual === 'string' || actual instanceof String;
  }

  if (expectedValueType == Number) {
    return typeof actual === 'number' || actual instanceof Number;
  }

  if (expectedValueType == Function) {
    return typeof actual === 'function' || actual instanceof Function;
  }

  if (expectedValueType == Boolean) {
    return typeof actual === 'boolean' || actual instanceof Boolean;
  }

  if (expectedValueType == BigInt) {
    return typeof actual === 'bigint' || actual instanceof BigInt;
  }

  if (expectedValueType == Symbol) {
    return typeof actual === 'symbol' || actual instanceof Symbol;
  }

  if (expectedValueType == Date) {
    return actual instanceof Date;
  }

  if (expectedValueType == Object) {
    return typeof actual === 'object';
  }

  return actual instanceof expectedValueType;
};
