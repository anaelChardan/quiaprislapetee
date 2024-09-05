/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert';
import { type Mock } from 'node:test';
import { assertMatches } from './assert-matches';

export const assertHasBeenCalled = (mockFn: Mock<Function>) => {
  if (mockFn.mock.calls.length < 1) {
    throw new assert.AssertionError({
      operator: 'assertHasBeenCalled',
      message: 'The function has not been called',
    });
  }
};

export const assertHasNotBeenCalled = (mockFn: Mock<Function>) => {
  if (mockFn.mock.calls.length > 0) {
    throw new assert.AssertionError({
      operator: 'assertHasNotBeenCalled',
      message: 'The function has been called',
    });
  }
};

export const assertHasBeenCalledTimes = (mockFn: Mock<Function>, times: number) => {
  const actualCallTimes = mockFn.mock.calls.length;

  if (actualCallTimes !== times) {
    throw new assert.AssertionError({
      actual: actualCallTimes,
      expected: times,
      operator: 'assertHasBeenCalledTimes',
      message: `Expected the function to be called ${times} times, was called ${actualCallTimes} times`,
    });
  }
};

export const assertHasBeenCalledWith = (
  mockFn: Mock<Function>,
  ...expectedArguments: unknown[]
) => {
  const errorMessageDiffs: string[] = [];
  for (const call of mockFn.mock.calls) {
    try {
      assertMatches(call.arguments, expectedArguments);
      return;
    } catch (error) {
      if (error instanceof assert.AssertionError) {
        const [, ...diffLines] = error.message.split('\n');
        errorMessageDiffs.push(diffLines.join('\n'));
      }

      continue;
    }
  }

  const nicelyFormattedErrorMessageDiffs = errorMessageDiffs
    .map((diff, index) => `Diff for call nb ${index + 1}:\n${diff}`)
    .join('\n\n');

  throw new assert.AssertionError({
    operator: 'assertHasBeenCalledWith',
    message: `The function was not called with the expected arguments${nicelyFormattedErrorMessageDiffs ? `\n${nicelyFormattedErrorMessageDiffs}` : ''}`,
  });
};
