import os from 'node:os';
import { describe, it, mock } from 'node:test';
import { deepEqual, strictEqual } from 'node:assert';
import { getFinalTestConcurrency, getFinalTestShard } from '../run';

describe('run', () => {
  describe('getFinalTestConcurrency', () => {
    describe('given nothing passed', () => {
      const result = getFinalTestConcurrency();
      it('should return true', () => {
        strictEqual(result, true);
      });
    });

    describe('given true', () => {
      const result = getFinalTestConcurrency('true');
      it('should return true', () => {
        strictEqual(result, true);
      });
    });

    describe('given false', () => {
      const result = getFinalTestConcurrency('false');
      it('should return false', () => {
        strictEqual(result, false);
      });
    });

    describe('given a string including a number', () => {
      const result = getFinalTestConcurrency('4');
      it('should return the number', () => {
        strictEqual(result, 4);
      });
    });

    describe('given a percentage', () => {
      mock.method(os, 'availableParallelism', () => 16);
      const result1 = getFinalTestConcurrency('50%');
      const result2 = getFinalTestConcurrency('25%');
      const result3 = getFinalTestConcurrency('20%');
      mock.reset();
      it('should return the number calculated', () => {
        strictEqual(result1, 8);
        strictEqual(result2, 4);
        strictEqual(result3, 3);
      });
    });
  });

  describe('getFinalTestShard', () => {
    describe('given nothing passed', () => {
      const result = getFinalTestShard();
      it('should return undefined', () => {
        strictEqual(result, undefined);
      });
    });

    describe('given only the idx jobs passed passed', () => {
      const result = getFinalTestShard('1');
      it('should return undefined', () => {
        strictEqual(result, undefined);
      });
    });

    describe('given bodh idx and tot jobs passed passed', () => {
      const result = getFinalTestShard('1', '4');
      it('should return an object', () => {
        deepEqual(result, { index: 1, total: 4 });
      });
    });
  });
});
