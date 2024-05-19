import path from 'node:path';
import fs from 'node:fs/promises';
import { app } from '@infrastructure/http/web';

(async function () {
  await app.ready();

  const openApi = app.swagger({ yaml: true });

  await fs.writeFile(path.join(process.cwd(), 'dist', 'openapi.yaml'), openApi, 'utf8');

  await app.close();
})();
