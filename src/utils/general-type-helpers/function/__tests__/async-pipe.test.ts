import { describe, it } from 'node:test';
import { assertMatches } from '@utils/node-test-utils';
import { asyncPipe } from '../async-pipe';

describe('asyncPipe()', () => {
  describe('Given an initial value and some functions, some async', () => {
    const initialValue = 1;
    const double = (n: number): number => n * 2;
    const add =
      (n1: number) =>
      async (n2: number): Promise<number> =>
        n1 + n2;

    it('should execute functions in succession, returning a promise', async () => {
      const result = await asyncPipe(initialValue, double, add(3), double);

      assertMatches(result, 10);
    });
  });

  describe('Given the maximum number of arguments', () => {
    const strLen = (s: string): number => s.length;
    const numToStr = (n: number): string => `${n}`;

    it('should return the expected result', async () => {
      assertMatches(
        await asyncPipe(
          1,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
          strLen,
          numToStr,
        ),
        '1',
      );
    });
  });
});
