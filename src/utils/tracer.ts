import { tracer } from 'dd-trace';

const datadogTracer = tracer.init({
  logInjection: true,
  runtimeMetrics: true,
});

const blocklist = ['/healthcheck', '/metrics', '/swagger.json'];

datadogTracer.use('http', { blocklist });
datadogTracer.use('fastify', { blocklist, enabled: true, measured: true, middleware: false });
datadogTracer.use('pino');
