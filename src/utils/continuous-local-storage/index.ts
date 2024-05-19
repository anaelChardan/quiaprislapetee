import cls from 'cls-hooked';
import { EventEmitter } from 'events';

export interface ContinuationLocalStorage<T> {
  get(): T | undefined;
  setAndRun(
    data: T,
    run: () => Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    containerToRebind?: any,
  ): Promise<void>;
  bindEmitter(emitter: EventEmitter): void;
}

export function buildContinuationLocalStorage<T>({
  storeKey,
}: {
  storeKey: string;
}): ContinuationLocalStorage<T> {
  const store = cls.createNamespace(storeKey);

  // see https://medium.com/@evgeni.kisel/add-correlation-id-in-node-js-applications-fde759eed5e3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rebindOnFinished = (container: any): void => {
    // eslint-disable-next-line no-underscore-dangle
    if (container.__onFinished) {
      // __onFinished is used by package (on-finished) that are used by Koa
      // itself (Application.handleRequest) to run tasks once response ended
      // lib creates 1 field to store all on finish listeners in queue
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      container.__onFinished = store.bind(container.__onFinished);
    }
  };

  return {
    get(): T | undefined {
      return store.get(storeKey);
    },
    setAndRun(
      data: T,
      run: () => Promise<void>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      containerToRebind?: any,
    ): Promise<void> {
      return store.runPromise(async () => {
        store.set(storeKey, data);
        // this is needed only for Koa
        // TODO: find a way to not have to do this
        if (containerToRebind) {
          rebindOnFinished(containerToRebind);
        }
        await run();
      });
    },
    bindEmitter(emitter: EventEmitter): void {
      store.bindEmitter(emitter);
    },
  };
}
