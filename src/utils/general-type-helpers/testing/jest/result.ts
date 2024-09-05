import * as R from '../../Result';

/**
 * TO BE USED IN TESTS ONLY
 *
 * Asserts that the value is a Success, stopping the test if it isn't
 */
export const assertSuccess = <E, A>(result: R.Result<E, A>): A => {
  if (R.isSuccess(result)) {
    return result.value;
  }

  // Logging the failure to understand why the assertion failed
  // eslint-disable-next-line no-console
  console.log('unexpected failure', result.error);

  // This expect will always be wrong because of the test above,
  // but it will display nicely what data the given Result contains
  expect(result).toEqual({
    _tag: 'success',
  });

  // This won't actually get called because we know the expect will always be false
  throw new Error('Passed result is not a Success');
};
/**
 * TO BE USED IN TESTS ONLY
 *
 * Asserts that the value is a Failure, stopping the test if it isn't
 */
export const assertFailure = <E, A>(result: R.Result<E, A>): E => {
  if (R.isFailure(result)) {
    return result.error;
  }

  // This expect will always be wrong because of the test above,
  // but it will display nicely what data the given Result contains
  expect(result).toEqual({
    _tag: 'error',
  });

  // This won't actually get called because we know the expect will always be false
  throw new Error('Passed result is not a Failure');
};
