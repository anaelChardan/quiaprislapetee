import { assertMatches } from '@utils/node-test-utils';
import { describe, it } from 'node:test';
import { pipe } from '../pipe';

describe('pipe()', () => {
  describe('Given an initial value and some functions', () => {
    const initialValue = 1;
    const double = (n: number): number => n * 2;
    const add =
      (n1: number) =>
      (n2: number): number =>
        n1 + n2;

    it('should execute functions in succession', () => {
      const result = pipe(initialValue, double, add(3), double);
      assertMatches(result, 10);
      const result2 = pipe(initialValue, double, add(3), double, add(3));
      assertMatches(result2, 13);
      const result3 = pipe(initialValue, double, add(3), double, add(3), double);
      assertMatches(result3, 26);
      const result4 = pipe(initialValue, double, add(3), double, add(3), double, add(3));
      assertMatches(result4, 29);
      const result5 = pipe(initialValue, double, add(3), double, add(3), double, add(3), double);
      assertMatches(result5, 58);
      const result6 = pipe(
        initialValue,
        double,
        add(3),
        double,
        add(3),
        double,
        add(3),
        double,
        add(3),
      );
      assertMatches(result6, 61);
    });
  });

  describe('Given the maximum number of arguments', () => {
    const strLen = (s: string): number => s.length;
    const numToStr = (n: number): string => `${n}`;

    it('should return the expected result', async () => {
      assertMatches(
        pipe(
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
