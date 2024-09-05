/* eslint-disable no-plusplus */
import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import {
  assertHasBeenCalled,
  assertHasBeenCalledWith,
  assertHasNotBeenCalled,
  assertMatches,
} from '../../../node-test-utils';
import * as R from '../../Result';
import { assertFailure, assertSuccess } from '../../testing/node';
import { ResultFlow } from '../result-flow';

type Row = {
  id: number;
  name: string;
};

type FindByIdFailure = { reason: 'not-found'; operation: 'findById' };
type UpdateByIdFailure = { reason: 'not-found'; operation: 'updateById' };

const dbMock = [{ id: 1, name: 'test' }] as Row[];
async function findById(id: number): Promise<R.Result<FindByIdFailure, Row>> {
  if (id === -1) {
    throw new Error('index cannot be negative');
  }
  const row = dbMock.find((r) => r.id === id);
  return row ? R.toSuccess(row) : R.toFailure({ reason: 'not-found', operation: 'findById' });
}
async function updateById(
  id: number,
  payload: Omit<Row, 'id'>,
): Promise<R.Result<UpdateByIdFailure, Row>> {
  const row = dbMock.find((r) => r.id === id);
  return row
    ? R.toSuccess({ ...row, ...payload })
    : R.toFailure({ reason: 'not-found', operation: 'updateById' });
}

// domain function
type ValidateFailure = { reason: 'invalid-data'; operation: 'validate' };
const validate = (row: Row, isValid: boolean): R.Result<ValidateFailure, Row> => {
  return isValid
    ? R.toSuccess(row)
    : R.toFailure({ reason: 'invalid-data', operation: 'validate' });
};

type FlowFailure = FindByIdFailure | UpdateByIdFailure | ValidateFailure;

describe('ResultFlow', () => {
  describe('run', () => {
    it('should successfully run the whole flow when all the functions return a success result', async () => {
      const resultFlow = ResultFlow.of<FlowFailure, Row>(async ({ tryTo }) => {
        const row = await tryTo(findById(1));
        await tryTo(validate(row, true));
        return tryTo(updateById(row.id, { name: 'updated-name' }));
      });

      const result = await resultFlow.run();
      const value = assertSuccess(result);
      assertMatches(value, { id: 1, name: 'updated-name' });
    });

    it('should successfully run the whole flow when all the functions return a success result (chain variant)', async () => {
      const result = await ResultFlow.lift(findById(1))
        .chain((row) => validate(row, true))
        .chain((row) => updateById(row.id, { name: 'updated-name' }))
        .run();

      const value = assertSuccess(result);
      assertMatches(value, { id: 1, name: 'updated-name' });
    });

    it('should successfully run the whole flow with tryTo options', async () => {
      const resultFlow = ResultFlow.of<{ kind: 'flow-error'; cause: FlowFailure }, Row>(
        async ({ tryTo }) => {
          const row = await tryTo(findById(1), {
            mapError: (error) => ({ kind: 'flow-error', cause: error }),
          });
          await tryTo(validate(row, true), {
            mapError: (error) => ({ kind: 'flow-error', cause: error }),
          });
          return tryTo(updateById(row.id, { name: 'updated-name' }), {
            mapError: (error) => ({ kind: 'flow-error', cause: error }),
          });
        },
      );

      const result = await resultFlow.run();
      const value = assertSuccess(result);
      assertMatches(value, { id: 1, name: 'updated-name' });
    });

    it('should successfully run the whole flow when using the promise helpers', async () => {
      async function findByIdNullable(id: number): Promise<Row | undefined> {
        return dbMock.find((r) => r.id === id);
      }

      const resultFlow = ResultFlow.of<FlowFailure, Row>(async ({ tryTo, promiseHelpers }) => {
        const toResult = promiseHelpers.fromNullable(findByIdNullable(1), 'error');
        const row = await tryTo(
          promiseHelpers.mapError(toResult, () => ({ reason: 'not-found', operation: 'findById' })),
        );
        await tryTo(validate(row, true));
        return tryTo(updateById(row.id, { name: 'updated-name' }));
      });

      const result = await resultFlow.run();
      const value = assertSuccess(result);
      assertMatches(value, { id: 1, name: 'updated-name' });
    });

    it('should return a failure as soon as a function return a failure result', async () => {
      const mockFn = mock.fn();
      const resultFlow = ResultFlow.of<FlowFailure, Row>(async ({ tryTo }) => {
        // the following operation fails
        const row = await tryTo(findById(2));
        mockFn();
        await tryTo(validate(row, true));
        return tryTo(updateById(1, { name: 'updated' }));
      });

      const result = await resultFlow.run();
      const value = assertFailure(result);
      assertMatches(value, { reason: 'not-found', operation: 'findById' });
      assertHasNotBeenCalled(mockFn);
    });

    it('should return a failure as soon as a function return a failure result (chain variant)', async () => {
      const mockFn = mock.fn();
      const result = await ResultFlow.lift(findById(2))
        .chain((row) => {
          mockFn();
          return validate(row, true);
        })
        .chain((row) => updateById(row.id, { name: 'updated-name' }))
        .run();

      const value = assertFailure(result);
      assertMatches(value, { reason: 'not-found', operation: 'findById' });
      assertHasNotBeenCalled(mockFn);
    });

    it('should return a rejected promise if a function throws', async () => {
      const resultFlow = ResultFlow.of<FlowFailure, string>(async ({ tryTo }) => {
        await tryTo(Promise.reject(new Error('error description')));
        return 'ok';
      });

      await assert.rejects(async () => resultFlow.run(), /error description/);
    });

    it('allows to implement custom logic on a result', async () => {
      const resultFlow = ResultFlow.of<FlowFailure, Row>(async () => {
        let row: Row;
        const rowResult = await findById(2);
        if (R.isFailure<FlowFailure, Row>(rowResult)) {
          row = { id: 0, name: 'default' };
        } else {
          row = rowResult.value;
        }
        return row;
      });

      const result = await resultFlow.run();
      const value = assertSuccess(result);
      assertMatches(value, { id: 0, name: 'default' });
    });

    it('should return a failure result if the `fail` helper is called', async () => {
      const mockFn = mock.fn();
      const resultFlow = ResultFlow.of<{ reason: 'early-fail' }, string>(async ({ fail }) => {
        fail({ reason: 'early-fail' });
        mockFn();
        return 'ok';
      });

      const result = await resultFlow.run();
      const value = assertFailure(result);
      assertMatches(value, { reason: 'early-fail' });
      assertHasNotBeenCalled(mockFn);
    });

    it('should be immutable', async () => {
      let counter = 0;
      const r1 = ResultFlow.lift<string, number>(R.toSuccess(10));
      await r1.run();
      const r2 = r1.ifSuccess(() => counter++);
      await r1.run();
      assert.strictEqual(counter, 0);

      await r2.run();
      await r2.run();
      assert.strictEqual(counter, 2);
    });
  });

  describe('lift', () => {
    it('should lift the Result<E, A> into a `ResultFlow`', async () => {
      const resultFlow = ResultFlow.lift(R.toSuccess(10));
      assertMatches(assertSuccess(await resultFlow.run()), 10);
    });

    it('should lift the () => Result<E, A> into a `ResultFlow`', async () => {
      const resultFlow = ResultFlow.lift(() => R.toSuccess(10));
      assertMatches(assertSuccess(await resultFlow.run()), 10);
    });

    it('should lift the Promise<Result<E, A>> into a `ResultFlow`', async () => {
      const resultFlow = ResultFlow.lift(Promise.resolve(R.toSuccess(10)));
      assertMatches(assertSuccess(await resultFlow.run()), 10);
    });

    it('should lift the () => Promise<Result<E, A>> into a `ResultFlow`', async () => {
      const resultFlow = ResultFlow.lift(() => Promise.resolve(R.toSuccess(10)));
      assertMatches(assertSuccess(await resultFlow.run()), 10);
    });
  });

  describe('isResultFlow', () => {
    it('should return `false` when passed undefined', async () => {
      const isResultFlow = ResultFlow.isResultFlow(undefined);
      assert.strictEqual(isResultFlow, false);
    });

    it('should return `false` when passed an object', async () => {
      const isResultFlow = ResultFlow.isResultFlow({});
      assert.strictEqual(isResultFlow, false);
    });

    it('should return true when passed a `ResultFlow`', async () => {
      const isResultFlow = ResultFlow.isResultFlow(ResultFlow.lift(R.toSuccess(10)));
      assert.strictEqual(isResultFlow, true);
    });
  });

  describe('map', () => {
    it('should map the function over the result when it is a success', async () => {
      const resultFlow = ResultFlow.of<never, number>(async () => {
        return 10;
      });
      const add10 = (n: number) => n + 10;
      const result = await resultFlow.map(add10).run();
      const value = assertSuccess(result);
      assertMatches(value, 20);
    });

    it('should do nothing when the result value is a failure', async () => {
      const resultFlow = ResultFlow.of<'error', number>(async ({ fail }) => {
        fail('error');
        return 10;
      });
      const mapFunction = mock.fn();
      const result = await resultFlow.map(mapFunction).run();

      const value = assertFailure(result);
      assertMatches(value, 'error');
      assertHasNotBeenCalled(mapFunction);
    });

    it('should be immutable', async () => {
      const r1 = ResultFlow.lift(R.toSuccess(10));
      const r2 = r1.map((n) => n + 10);

      assertMatches(assertSuccess(await r1.run()), 10);
      assertMatches(assertSuccess(await r2.run()), 20);
    });
  });

  describe('mapError', () => {
    it('should map the function over the error when it is a failure', async () => {
      const resultFlow = ResultFlow.of<string, number>(async ({ fail }) => {
        fail('error');
        return 10;
      });
      const transformError = (error: string) => `transformed-${error}`;
      const result = await resultFlow.mapError(transformError).run();
      const value = assertFailure(result);
      assertMatches(value, 'transformed-error');
    });

    it('should do nothing when the result value is a success', async () => {
      const resultFlow = ResultFlow.of<'error', number>(async () => {
        return 10;
      });
      const mapErrorFunction = mock.fn();
      const result = await resultFlow.mapError(mapErrorFunction).run();

      const value = assertSuccess(result);
      assertMatches(value, 10);
      assertHasNotBeenCalled(mapErrorFunction);
    });

    it('should be immutable', async () => {
      const r1 = ResultFlow.lift(R.toFailure('error'));
      const r2 = r1.mapError((error) => `${error} - transformed`);

      assertMatches(await r1.run(), R.toFailure('error'));
      assertMatches(await r2.run(), R.toFailure('error - transformed'));
    });
  });

  describe('chain', () => {
    it('should run the function that returns a `ResultFlow` over the result when it is a success', async () => {
      const add10 = (n: number) => ResultFlow.of<never, number>(async () => n + 10);

      const result = await ResultFlow.lift(R.toSuccess(10)).chain(add10).run();
      const value = assertSuccess(result);
      assertMatches(value, 20);
    });

    it('should run the function that returns a `Promise<Result<E, A>>` over the result when it is a success', async () => {
      const add10 = (n: number) => Promise.resolve(R.toSuccess(n + 10));
      const result = await ResultFlow.lift(R.toSuccess(10)).chain(add10).run();
      const value = assertSuccess(result);
      assertMatches(value, 20);
    });

    it('should run the function that returns a `Result<E, A>` over the result when it is a success', async () => {
      const add10 = (n: number) => R.toSuccess(n + 10);
      const result = await ResultFlow.lift(R.toSuccess(10)).chain(add10).run();

      const value = assertSuccess(result);
      assertMatches(value, 20);
    });

    it('should do nothing when the result value is a failure', async () => {
      const resultFlow = ResultFlow.of<'error', number>(async ({ fail }) => {
        fail('error');
        return 10;
      });
      const mockFn = mock.fn();
      const add10 = (n: number) =>
        ResultFlow.of<never, number>(async () => {
          mockFn();
          return n + 10;
        });
      const result = await resultFlow.chain(add10).run();

      const value = assertFailure(result);
      assertMatches(value, 'error');
      assertHasNotBeenCalled(mockFn);
    });

    it('should be immutable', async () => {
      const r1 = ResultFlow.lift(R.toSuccess(10));
      const r2 = r1.chain((n) => R.toSuccess(n + 10));

      assertMatches(assertSuccess(await r1.run()), 10);
      assertMatches(assertSuccess(await r2.run()), 20);
    });
  });

  describe('ifSuccess', () => {
    it('should execute the effect when it is a success', async () => {
      const resultFlow = ResultFlow.of<never, number>(async () => {
        return 10;
      });
      const effect = mock.fn();
      const result = await resultFlow.ifSuccess(effect).run();
      const value = assertSuccess(result);

      assertHasBeenCalledWith(effect, 10);
      assertMatches(value, 10);
    });

    it('should not execute the effect when it is a failure', async () => {
      const resultFlow = ResultFlow.of<'error', number>(async ({ fail }) => {
        fail('error');
        return 10;
      });
      const effect = mock.fn();
      const result = await resultFlow.ifSuccess(effect).run();
      const value = assertFailure(result);

      assertHasNotBeenCalled(effect);
      assertMatches(value, 'error');
    });

    it('should be immutable', async () => {
      let counter = 0;
      const r1 = ResultFlow.lift(R.toSuccess(10));
      const r2 = r1.ifSuccess(() => counter++);

      await r1.run();
      await r2.run();
      assert.strictEqual(counter, 1);
    });
  });

  describe('ifFailure', () => {
    it('should execute the effect when it is a failure', async () => {
      const resultFlow = ResultFlow.of<'error', number>(async ({ fail }) => {
        fail('error');
        return 10;
      });
      const effect = mock.fn();
      const result = await resultFlow.ifFailure(effect).run();
      const value = assertFailure(result);

      assertMatches(value, 'error');
      assertHasBeenCalledWith(effect, 'error');
    });

    it('should not execute the effect when it is a success', async () => {
      const resultFlow = ResultFlow.of<never, number>(async () => {
        return 10;
      });
      const effect = mock.fn();
      const result = await resultFlow.ifFailure(effect).run();
      const value = assertSuccess(result);

      assertMatches(value, 10);
      assertHasNotBeenCalled(effect);
    });

    it('should be immutable', async () => {
      let counter = 0;
      const r1 = ResultFlow.lift(R.toFailure('error'));
      const r2 = r1.ifFailure(() => counter++);

      await r1.run();
      await r2.run();
      assert.strictEqual(counter, 1);
    });
  });

  describe('orElse', () => {
    it('should execute the alternative if the first is a failure', async () => {
      const mockCallback = mock.fn();
      const resultFlow = ResultFlow.lift<string, number>(R.toFailure('error'));
      const alternativeResultFlow = (error: string) => {
        mockCallback(error);
        return ResultFlow.lift(R.toSuccess(20));
      };
      const ifSuccess = mock.fn();
      const result = await resultFlow.ifSuccess(ifSuccess).orElse(alternativeResultFlow).run();
      const value = assertSuccess(result);

      assertMatches(value, 20);
      assertHasNotBeenCalled(ifSuccess);
      assertHasBeenCalledWith(mockCallback, 'error');
    });

    it('should execute the alternative that return a Promise<Result<E, A>> if the first is a failure', async () => {
      const mockCallback = mock.fn();
      const resultFlow = ResultFlow.lift<string, number>(R.toFailure('error'));
      const alternativeResultFlow = (error: string) => {
        mockCallback(error);
        return Promise.resolve(R.toSuccess(20));
      };
      const ifSuccess = mock.fn();
      const result = await resultFlow.ifSuccess(ifSuccess).orElse(alternativeResultFlow).run();
      const value = assertSuccess(result);

      assertMatches(value, 20);
      assertHasNotBeenCalled(ifSuccess);
      assertHasBeenCalledWith(mockCallback, 'error');
    });

    it('should execute the alternative that return a Result<E, A> if the first is a failure', async () => {
      const mockCallback = mock.fn();
      const resultFlow = ResultFlow.lift<string, number>(R.toFailure('error'));
      const alternativeResultFlow = (error: string) => {
        mockCallback(error);
        return R.toSuccess(20);
      };
      const ifSuccess = mock.fn();
      const result = await resultFlow.ifSuccess(ifSuccess).orElse(alternativeResultFlow).run();
      const value = assertSuccess(result);

      assertMatches(value, 20);
      assertHasNotBeenCalled(ifSuccess);
      assertHasBeenCalledWith(mockCallback, 'error');
    });

    it('should not execute the alternative if the first is a success', async () => {
      const mockCallback = mock.fn();

      const resultFlow = ResultFlow.lift<'error', number>(R.toSuccess(10));
      const alternativeResultFlow = () => {
        mockCallback();
        return ResultFlow.lift<never, number>(R.toSuccess(20));
      };

      const ifSuccess = mock.fn();
      const result = await resultFlow.ifSuccess(ifSuccess).orElse(alternativeResultFlow).run();
      const value = assertSuccess(result);

      assertMatches(value, 10);
      assertHasBeenCalled(ifSuccess);
      assertHasNotBeenCalled(mockCallback);
    });

    it('should be immutable', async () => {
      let counter = 0;
      const r1 = ResultFlow.lift<string, number>(R.toFailure('error'));
      const r2 = r1.orElse(() => {
        counter++;
        return R.toSuccess(10);
      });

      await r1.run();
      await r2.run();
      assert.strictEqual(counter, 1);
    });
  });
});
