/**
 * Restricts keys that may interfere with logging or observability tools.
 */
export type LoggerData = Record<string, unknown> & {
  message?: never;
};

export interface Logger {
  debug: (message: string, data?: LoggerData) => void;
  info: (message: string, data?: LoggerData) => void;
  warn: (message: string, data?: LoggerData) => void;
  error: (message: string, data?: LoggerData) => void;
}

/**
 * By default, the use of the C4 model is encouraged, and therefore `component` should be passed
 * when creating a new logger instance.
 *
 * To support former use cases, such as the one present in the monolith, a custom InstanceData type
 * can be used, such as one containing a `serviceName` field.
 *
 * Instance data should be used to pass information that is specific to the logger instance and which
 * can not be set Unified Service Tagging
 *
 * @see https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/
 * @see https://c4model.com/#:~:text=inter%2Dprocess%20communication.-,Component,-The%20word%20%22component
 */
export type DefaultLoggerInstanceData = { component: string };

export interface LoggerFactory<
  T extends Logger,
  InstanceData extends LoggerData = DefaultLoggerInstanceData,
> {
  createLogger(instanceData: InstanceData): T;
}
