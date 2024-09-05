/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import { describe, it, mock } from 'node:test';
import { assertFailure, assertSuccess } from '@utils/general-type-helpers/testing/node';
import { assertMatches, assertHasNotBeenCalled } from '@utils/node-test-utils';
import { asyncPipe, pipe } from '../../function';
import * as R from '../index';

describe('bindTo()', () => {
  describe('Given a Failure', () => {
    const result = R.toFailure('some error');

    it('should not change anything', () => {
      assertMatches(assertFailure(R.bindTo(result, 'myKey')), 'some error');
      assertMatches(assertFailure(pipe(result, R.bindTo_('myKey'))), 'some error');
    });
  });

  describe('Given a Success', () => {
    const result = R.toSuccess(5);

    it('should wrap its value in an object, assigning the given property name', () => {
      assertMatches(assertSuccess(R.bindTo(result, 'myKey')), {
        myKey: 5,
      });
      assertMatches(assertSuccess(pipe(result, R.bindTo_('myKey'))), {
        myKey: 5,
      });
    });
  });
});

describe('bind()', () => {
  describe('Given a Failure and an operation', () => {
    const result: R.Result<'some error', { foo: string }> = R.toFailure('some error');
    const f = mock.fn<any>();

    it('should return the Failure and not call the operation', () => {
      assertMatches(assertFailure(R.bind(result, 'myKey', f)), 'some error');
      assertMatches(assertFailure(pipe(result, R.bind_('myKey', f))), 'some error');
      assertHasNotBeenCalled(f);
    });
  });

  describe('Given a Success and an operation returning a Failure', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(() => R.toFailure('some error'));

    it('should return the Failure returned by the operation', () => {
      assertMatches(assertFailure(R.bind(result, 'myKey', f)), 'some error');
      assertMatches(assertFailure(pipe(result, R.bind_('myKey', f))), 'some error');
    });
  });

  describe('Given a Success and an operation returning a Success', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(({ amount, taxRate }) => R.toSuccess(amount * taxRate));

    it('should run the operation and assign its value to the expected property', () => {
      assertMatches(assertSuccess(R.bind(result, 'taxAmount', f)), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
      assertMatches(assertSuccess(pipe(result, R.bind_('taxAmount', f))), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
    });
  });
});

describe('asyncBind()', () => {
  describe('Given a Failure and an operation', () => {
    const result: R.Result<'some error', string> = R.toFailure('some error');
    const f = mock.fn<any>();

    it('should return the Failure and not call the operation', async () => {
      assertMatches(assertFailure(await R.asyncBind(result, 'myKey', f)), 'some error');
      assertMatches(assertFailure(await asyncPipe(result, R.asyncBind_('myKey', f))), 'some error');
      assertHasNotBeenCalled(f);
    });
  });

  describe('Given a Success and an operation returning a Failure', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(async () => R.toFailure('some error'));

    it('should return the Failure returned by the operation', async () => {
      assertMatches(assertFailure(await R.asyncBind(result, 'myKey', f)), 'some error');
      assertMatches(assertFailure(await asyncPipe(result, R.asyncBind_('myKey', f))), 'some error');
    });
  });

  describe('Given a Success and an operation returning a Success', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(async ({ amount, taxRate }) => R.toSuccess(amount * taxRate));

    it('should run the operation and assign its value to the expected property', async () => {
      assertMatches(assertSuccess(await R.asyncBind(result, 'taxAmount', f)), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
      assertMatches(assertSuccess(await asyncPipe(result, R.asyncBind_('taxAmount', f))), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
    });
  });
});

describe('bindAll()', () => {
  describe('Given a Failure and an operation', () => {
    const result: R.Result<'some error', string> = R.toFailure('some error');
    const f = mock.fn<any>();

    it('should return the Failure and not call the operation', () => {
      assertMatches(assertFailure(R.bindAll(result, f)), 'some error');
      assertMatches(assertFailure(pipe(result, R.bindAll_(f))), 'some error');
      assertHasNotBeenCalled(f);
    });
  });

  describe('Given a Success and an operation returning a Failure', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(() => R.toFailure('some error'));

    it('should return the Failure returned by the operation', () => {
      assertMatches(assertFailure(R.bindAll(result, f)), 'some error');
      assertMatches(assertFailure(pipe(result, R.bindAll_(f))), 'some error');
    });
  });

  describe('Given a Success and an operation returning a Success', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(({ amount, taxRate }) => R.toSuccess({ taxAmount: amount * taxRate }));

    it('should run the operation and assign its value to the expected property', () => {
      assertMatches(assertSuccess(R.bindAll(result, f)), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
      assertMatches(assertSuccess(pipe(result, R.bindAll_(f))), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
    });
  });
});

describe('asyncBindAll()', () => {
  describe('Given a Failure and an operation', () => {
    const result: R.Result<'some error', string> = R.toFailure('some error');
    const f = mock.fn<any>();

    it('should return the Failure and not call the operation', async () => {
      assertMatches(assertFailure(await R.asyncBindAll(result, f)), 'some error');
      assertMatches(assertFailure(await asyncPipe(result, R.asyncBindAll_(f))), 'some error');
      assertHasNotBeenCalled(f);
    });
  });

  describe('Given a Success and an operation returning a Failure', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(async () => R.toFailure('some error'));

    it('should return the Failure returned by the operation', async () => {
      assertMatches(assertFailure(await R.asyncBindAll(result, f)), 'some error');
      assertMatches(assertFailure(await asyncPipe(result, R.asyncBindAll_(f))), 'some error');
    });
  });

  describe('Given a Success and an operation returning a Success', () => {
    const result = R.toSuccess({ amount: 5, taxRate: 0.1 });
    const f = mock.fn(async ({ amount, taxRate }) => R.toSuccess({ taxAmount: amount * taxRate }));

    it('should run the operation and assign its value to the expected property', async () => {
      assertMatches(assertSuccess(await R.asyncBindAll(result, f)), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
      assertMatches(assertSuccess(await asyncPipe(result, R.asyncBindAll_(f))), {
        amount: 5,
        taxRate: 0.1,
        taxAmount: 0.5,
      });
    });
  });
});
