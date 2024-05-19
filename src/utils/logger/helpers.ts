import os from 'os';

export function getIpAddress(): string | null {
  const interfaces = Object.values(os.networkInterfaces())
    .flat()
    .filter(<T>(networkInterface: T | undefined): networkInterface is T => {
      return networkInterface !== undefined;
    });

  const mainInterface = interfaces.find(
    ({ family, internal }) => family === 'IPv4' && internal === false,
  );

  return mainInterface ? mainInterface.address : null;
}
