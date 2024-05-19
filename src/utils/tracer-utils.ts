import type { SpanOptions, TracerOptions } from 'dd-trace';
import tracer from 'dd-trace';
import { HTTP_STATUS_CODE } from 'dd-trace/ext/tags';
import { HTTP_HEADERS } from 'dd-trace/ext/formats';
import type { fetch } from 'undici';

type UnknownFunction = (...args: unknown[]) => unknown;

/**
 * Wraps a function with distributed tracing using Datadog's dd-trace library.
 *
 * @param operationName - The name of the operation being traced.
 * @param fn - The function to be wrapped with tracing.
 * @param options - Optional tracer and span options.
 * @returns A wrapped function that includes distributed tracing.
 */
export function withTrace(
  operationName: string,
  fn: UnknownFunction,
  options: TracerOptions & SpanOptions = {},
) {
  return tracer.wrap(
    operationName,
    {
      resource: fn.name,
      ...options,
    },
    fn,
  );
}

/**
 * Wraps all functions in an object with distributed tracing using Datadog's dd-trace library.
 *
 * @param obj - The object containing the functions to be wrapped with tracing.
 * @param options - Optional tracer and span options.
 */
export const withTraceInAllFunctions = <T extends Record<string, unknown>>(
  operationName: string,
  obj: T,
  options: TracerOptions & SpanOptions = {},
) =>
  new Proxy(obj, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      if (typeof value === 'function') {
        const opt = {
          ...options,
          resource: prop.toString(),
        };
        return withTrace(operationName, value as UnknownFunction, opt).bind(target);
      }
      return value;
    },
  });

type Fetch = typeof fetch;
/**
 * Adds Datadog headers to a fetch request to propagate the trace context.
 * This is a workaround for the lack of support for distributed tracing in undici.
 * @see https://github.com/DataDog/dd-trace-js/labels/integration-fetch
 * @see https://github.com/DataDog/dd-trace-js/pull/3258/files#diff-5dcc83eaa5b985693bc04427bb02a48428e01f90f99e616c8dc2f660878341dfR25
 */
export const withDatadogHeaders = (originalFetch: Fetch): Fetch => {
  const f: Fetch = async (url, init) => {
    const activeSpan = tracer.scope().active();
    if (!activeSpan) {
      // do nothing if there is no active span
      return originalFetch(url, init);
    }

    const span = activeSpan.tracer().startSpan('fetch', {
      childOf: activeSpan.context(),
    });

    const headers: Record<string, string> = {};
    span.tracer().inject(span.context(), HTTP_HEADERS, headers);

    try {
      const response = await originalFetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...headers,
        },
      });
      // Based on https://github.com/DataDog/dd-trace-js/blob/db16b8d0bb54ae0869142e280e2d541c247283a9/packages/datadog-plugin-http/src/client.js#L89-L90
      span.setTag(HTTP_STATUS_CODE, response.status);
      span.finish();
      return response;
    } catch (err) {
      const error = err as Error;
      // Based on https://github.com/DataDog/dd-trace-js/blob/db16b8d0bb54ae0869142e280e2d541c247283a9/packages/datadog-plugin-http/src/client.js#L113
      // taken from https://github.com/DataDog/dd-trace-js/blob/master/packages/dd-trace/src/constants.js#L24
      /* eslint-disable @typescript-eslint/naming-convention */
      const ERROR_TYPE = 'error.type';
      const ERROR_MESSAGE = 'error.message';
      const ERROR_STACK = 'error.stack';
      /* eslint-enable @typescript-eslint/naming-convention */

      span.addTags({
        [ERROR_TYPE]: error.name,
        [ERROR_MESSAGE]: error.message,
        [ERROR_STACK]: error.stack,
      });

      span.finish();
      throw error;
    }
  };

  return f;
};
