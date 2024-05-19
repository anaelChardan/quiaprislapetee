import config from 'config';
import { buildPinoLoggerFactory } from './pinoLoggerFactory';
import { getCorrelationId } from './correlation-id-storage';

/**
 * In the context of external service, we want to enforce that common log data are set
 * through the deployment configuration and not through the code
 *
 * @see https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/
 */

type BaseData = Record<string, never>;
type InstanceData = Record<string, never>;
type DynamicData = { correlationId: string };

const pinoLoggerFactory = buildPinoLoggerFactory<BaseData, InstanceData, DynamicData>({
  ...config.get('logger'),
  baseData: {},
  dynamicDataGetter: () => ({ correlationId: getCorrelationId() }),
});

const rootLogger = pinoLoggerFactory.getRootLogger();
const logger = pinoLoggerFactory.createLogger({});

export default { logger, rootLogger };
