/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
export type Logger = {
  debug(message: string, data?: object): void;
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, data?: object): void;
};

/**
 * console.log the given input.
 *
 * @example
 * ```
 * const logInPipe = getLogInPipe(logger);
 *
 * const result = pipe(
 *   someInput,
 *   step1,
 *   logInPipe("after step 1"),
 *   step2,
 *   logInPipe("after step 2"),
 * )
 * ```
 */
export const buildLog_ =
  (logger: Logger) =>
  (message: string, method: keyof Logger = 'info', additionalLoggingParameters?: object) =>
  <T>(input: T): T => {
    logger[method](message, { ...additionalLoggingParameters, input });
    return input;
  };

/**
 * console.log the given input.
 *
 * @example
 * ```
 * const result = pipe(
 *   someInput,
 *   step1,
 *   consoleLogInPipe("after step 1"),
 *   step2,
 *   consoleLogInPipe("after step 2"),
 * )
 * ```
 */
export const consoleLog_ =
  (message: string) =>
  <T>(input: T): T => {
    console.log(message);
    console.dir(input, { depth: null });

    return input;
  };
