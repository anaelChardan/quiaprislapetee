import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import {
  assertHasBeenCalled,
  assertHasBeenCalledTimes,
  assertHasBeenCalledWith,
  assertHasNotBeenCalled,
} from '../has-been-called';
import { objectContaining } from '../../matchers/object-containing';

describe('assertHasBeenCalled', () => {
  describe('Given a mock function that has not been called', () => {
    const mockFn = mock.fn();

    it('should fail', () => {
      assert.throws(() => assertHasBeenCalled(mockFn));
    });
  });

  describe('Given a mock function that has been called', () => {
    const mockFn = mock.fn();

    it('should pass', () => {
      mockFn();
      assertHasBeenCalled(mockFn);
    });
  });
});

describe('assertHasNotBeenCalled', () => {
  describe('Given a mock function that has been called', () => {
    const mockFn = mock.fn();

    it('should fail', () => {
      mockFn();
      assert.throws(() => assertHasNotBeenCalled(mockFn));
    });
  });

  describe('Given a mock function that has not been called', () => {
    const mockFn = mock.fn();

    it('should pass', () => {
      assertHasNotBeenCalled(mockFn);
    });
  });
});

describe('assertHasBeenCalledTimes', () => {
  describe('Given a mock function that has been called a different amount of times than expected', () => {
    const mockFn = mock.fn();

    it('should fail', () => {
      mockFn();
      assert.throws(() => assertHasBeenCalledTimes(mockFn, 5));
    });
  });

  describe('Given a mock function that has been called the expected amount of times', () => {
    const mockFn = mock.fn();

    it('should pass', () => {
      mockFn();
      mockFn();
      assertHasBeenCalledTimes(mockFn, 2);
    });
  });
});

describe('assertHasBeenCalledWith', () => {
  describe('Given a mock function that has not been called with the expected values', () => {
    const mockFn = mock.fn();

    it('should fail', () => {
      mockFn(1, 2);
      assert.throws(() => assertHasBeenCalledWith(mockFn, 'some-string'));
    });
  });

  describe('Given a mock function that has been called with the expected values', () => {
    const mockFn = mock.fn();

    it('should pass', () => {
      mockFn();
      mockFn(5, { foo: 'bar', baz: 10 });
      assertHasBeenCalledWith(mockFn, 5, objectContaining({ foo: 'bar' }));
    });
  });
});
