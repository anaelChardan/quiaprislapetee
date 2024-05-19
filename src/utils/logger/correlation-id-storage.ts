import {
  type ContinuationLocalStorage,
  buildContinuationLocalStorage,
} from '@utils/continuous-local-storage';

export const correlationIdLocalStorage = buildContinuationLocalStorage<string>({
  storeKey: 'correlationId',
});

export const getCorrelationId = (
  correlationIdStorage: ContinuationLocalStorage<string> = correlationIdLocalStorage,
) => correlationIdStorage.get() ?? '';
