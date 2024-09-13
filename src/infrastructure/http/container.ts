import { diContainerClassic } from '@fastify/awilix';
import { Config, Container, setupContainer } from '../../container';

declare module '@fastify/awilix' {
  interface Cradle extends Container {}
  interface RequestCradle {}
}
export function setupFastifyContainer(overridingVariables?: Config) {
  const container = setupContainer(overridingVariables);

  diContainerClassic.register(container.registrations);

  return diContainerClassic;
}
export { diContainerClassic as container };
