import pino, { type SerializerFn } from 'pino';
import { TypeGuardError } from '@utils/oops';
import {
  type LoggerFactory,
  type LoggerData,
  type Logger,
  type DefaultLoggerInstanceData,
} from './types';
import { getIpAddress } from './helpers';

export type TransportType = 'stdout' | 'console';
export type LoggingLevel = 'debug' | 'info' | 'warn' | 'error';
export type PinoRootLogger = pino.Logger;
export type PinoLogger = Logger;
export type PinoLoggerFactory<InstanceData extends LoggerData> = LoggerFactory<
  PinoLogger,
  InstanceData
> & {
  getRootLogger: () => PinoRootLogger;
};

function generateStdOutTransportTarget({
  minimumLoggingLevel,
}: {
  minimumLoggingLevel: LoggingLevel;
}): pino.TransportTargetOptions {
  return {
    target: 'pino/file',
    level: minimumLoggingLevel,
  };
}

function generateConsoleTransportTarget({
  minimumLoggingLevel,
  humanReadable,
}: {
  minimumLoggingLevel: LoggingLevel;
  humanReadable: boolean;
}): pino.TransportTargetOptions {
  return {
    target: 'pino-pretty',
    level: minimumLoggingLevel,
    options: {
      minimumLevel: minimumLoggingLevel,
      sync: true,
      singleLine: humanReadable === false,
      ignore: 'pid,ppid,host',
      messageFormat: '[{component}] {message}',
    },
  };
}

function computeTransport({
  transportType,
  minimumLoggingLevel,
  humanReadable = false,
}: {
  transportType: TransportType;
  minimumLoggingLevel: LoggingLevel;
  humanReadable?: boolean;
}): pino.TransportTargetOptions {
  switch (transportType) {
    case 'stdout':
      return generateStdOutTransportTarget({ minimumLoggingLevel });
    case 'console':
      return generateConsoleTransportTarget({
        minimumLoggingLevel,
        humanReadable,
      });
    default:
      throw new TypeGuardError(transportType, `Unknown transportType: ${transportType}`, {
        transportType,
      });
  }
}

export function buildPinoLoggerFactory<
  BaseData extends LoggerData = Record<string, never>,
  InstanceData extends LoggerData = DefaultLoggerInstanceData,
  DynamicData extends LoggerData = Record<string, never>,
>({
  transportType,
  humanReadable = false,
  silent = false,
  minimumLoggingLevel = 'debug',
  baseData,
  dynamicDataGetter,
  correlationIdGetter,
  dataRedaction,
  serializers,
}: {
  transportType: TransportType;
  humanReadable?: boolean;
  silent?: boolean;
  minimumLoggingLevel?: LoggingLevel;
  baseData: BaseData;
  dynamicDataGetter?: () => DynamicData;
  dataRedaction?: {
    paths: string[];
    strategy: 'redact' | 'remove';
  };
  serializers?: { [key: string]: SerializerFn };
  /**
   * @deprecated `dynamicDataGetter` should be used instead
   */
  correlationIdGetter?: () => string;
}): PinoLoggerFactory<InstanceData> {
  const { pid, ppid } = process;
  const rootLogger = pino({
    transport: computeTransport({
      transportType,
      minimumLoggingLevel,
      humanReadable,
    }),
    enabled: !silent,
    level: minimumLoggingLevel,
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    messageKey: 'message',
    formatters: {
      level: (label) => ({ level: label }),
      log: (data) =>
        Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value instanceof Error
              ? {
                  name: value.name,
                  message: value.message,
                  stack: value.stack?.split('\n'),
                }
              : value,
          ]),
        ),
    },
    hooks: {
      logMethod(this, parameters, method) {
        if (parameters.length >= 2) {
          const [parameter1, parameter2, ...remainingParameters] = parameters;

          return method.apply(this, [parameter2, parameter1, ...remainingParameters]);
        }

        return method.apply(this, parameters);
      },
    },
    base: {
      ...(baseData ?? {}),
      logger: 'pino',
      pid,
      ppid,
      host: getIpAddress(),
    },
    mixin: () => ({
      ...(correlationIdGetter ? { correlationId: correlationIdGetter() } : {}),
      ...(dynamicDataGetter ? dynamicDataGetter() : {}),
    }),
    ...(dataRedaction
      ? {
          redact: {
            paths: dataRedaction.paths,
            remove: dataRedaction.strategy === 'remove',
          },
        }
      : {}),
    serializers,
  });

  function createLogger(instanceData: InstanceData): Logger {
    return rootLogger.child(instanceData);
  }

  /**
   * This method should only be used to pass the rootLogger to Fastify
   */
  function getRootLogger(): PinoRootLogger {
    return rootLogger;
  }

  return {
    createLogger,
    getRootLogger,
  };
}
