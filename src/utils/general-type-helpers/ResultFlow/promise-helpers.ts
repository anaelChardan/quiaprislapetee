import * as R from '../Result';

export interface PromiseHelpers {
  fromNullable<E, A>(promise: Promise<A>, error: E): Promise<R.Result<E, NonNullable<A>>>;
  mapError<E, A, E2>(
    promise: Promise<R.Result<E, A>>,
    mapper: (error: E) => E2,
  ): Promise<R.Result<E2, A>>;
}

export const fromNullable: PromiseHelpers['fromNullable'] = async (promise, error) => {
  const value = await promise;
  return R.fromNullable(value, error);
};

export const mapError: PromiseHelpers['mapError'] = async (promise, mapper) => {
  const result = await promise;
  return R.mapError(result, mapper);
};
