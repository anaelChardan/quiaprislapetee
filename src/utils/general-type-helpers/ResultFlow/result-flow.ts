/* eslint-disable @typescript-eslint/no-throw-literal */
import * as R from '../Result';
import * as PromiseHelpers from './promise-helpers';

export interface ResultFlowHelpers<E> {
  tryTo<A>(result: R.Result<E, A> | Promise<R.Result<E, A>>): Promise<A>;
  tryTo<A, E2>(
    result: R.Result<E2, A> | Promise<R.Result<E2, A>>,
    options: {
      mapError: (value: E2) => E;
    },
  ): Promise<A>;
  fail(error: E): never;
  promiseHelpers: PromiseHelpers.PromiseHelpers;
}

const unwrap = <E, A>(result: R.Result<E, A>): A => {
  if (R.isSuccess(result)) {
    return result.value;
  }

  throw R.toFailure(result.error);
};

export class ResultFlow<E, A> {
  private constructor(private runPromise: (helpers: ResultFlowHelpers<E>) => Promise<A>) {}

  private helpers: ResultFlowHelpers<E> = {
    tryTo<A1, E2>(
      result: R.Result<E2, A1> | Promise<R.Result<E2, A1>>,
      options?: {
        mapError?: (value: E2) => E;
      },
    ): Promise<A1> {
      return options?.mapError
        ? PromiseHelpers.mapError(Promise.resolve(result), options.mapError).then(unwrap)
        : Promise.resolve(result).then(unwrap);
    },
    fail(error: E): never {
      throw R.toFailure(error);
    },
    promiseHelpers: PromiseHelpers,
  };

  static of<E, A>(
    builderFunction: (helpers: ResultFlowHelpers<E>) => Promise<A>,
  ): ResultFlow<E, A> {
    return new ResultFlow<E, A>(builderFunction);
  }

  static isResultFlow(value: unknown): value is ResultFlow<unknown, unknown> {
    return value instanceof ResultFlow;
  }

  static lift<E, A>(
    value:
      | Promise<R.Result<E, A>>
      | R.Result<E, A>
      | (() => Promise<R.Result<E, A>>)
      | (() => R.Result<E, A>),
  ): ResultFlow<E, A> {
    return ResultFlow.of<E, A>(async ({ tryTo }) => {
      return typeof value === 'function' ? tryTo(value()) : tryTo(value);
    });
  }

  async run(): Promise<R.Result<E, A>> {
    try {
      return R.toSuccess(await this.runPromise(this.helpers));
    } catch (e: unknown) {
      if (R.isResult<E, A>(e)) {
        return e;
      }
      throw e;
    }
  }

  map<A2>(f: (value: A) => A2): ResultFlow<E, A2> {
    return ResultFlow.of<E, A2>(() => {
      return this.runPromise(this.helpers).then(f);
    });
  }

  mapError<E2>(f: (value: E) => E2): ResultFlow<E2, A> {
    return ResultFlow.of<E2, A>(async ({ fail }) => {
      const result = await this.run();
      if (R.isFailure(result)) {
        fail(f(result.error));
      }
      return (result as { value: A }).value;
    });
  }

  chain<E2, A2>(
    f: (value: A) => ResultFlow<E2, A2> | Promise<R.Result<E2, A2>> | R.Result<E2, A2>,
  ): ResultFlow<E | E2, A2> {
    return ResultFlow.of<E | E2, A2>(async ({ tryTo }) => {
      const result = await tryTo(this.run());
      const fResult = f(result);
      return ResultFlow.isResultFlow(fResult) ? tryTo(fResult.run()) : tryTo(fResult);
    });
  }

  ifSuccess(f: (value: A) => void): ResultFlow<E, A> {
    return ResultFlow.of<E, A>(async ({ tryTo }) => {
      const result = await tryTo(this.run());
      f(result);
      return result;
    });
  }

  ifFailure(f: (value: E) => void): ResultFlow<E, A> {
    return ResultFlow.of<E, A>(async ({ fail }) => {
      const result = await this.run();
      if (R.isFailure(result)) {
        f(result.error);
        fail(result.error);
      }
      return (result as { value: A }).value;
    });
  }

  orElse<E2>(
    alternative: (error: E) => ResultFlow<E2, A> | Promise<R.Result<E2, A>> | R.Result<E2, A>,
  ): ResultFlow<E | E2, A> {
    return ResultFlow.of<E | E2, A>(async ({ tryTo }) => {
      const result = await this.run();
      if (R.isSuccess(result)) {
        return result.value;
      }

      const alternativeResult = alternative(result.error);
      return ResultFlow.isResultFlow(alternativeResult)
        ? tryTo(alternativeResult.run())
        : tryTo(alternativeResult);
    });
  }
}
