import { describe, it } from 'node:test';
import { request } from 'undici';
import { strictEqual } from 'node:assert';
import { httpMock } from '../http';

const mockHttp = httpMock();

describe('httpMock', () => {
  describe('given a valid mock props', () => {
    const fullUrl = 'http://localhost/foo/bar';
    mockHttp({ fullUrl });

    it('should properly return the fetch data', async () => {
      const { statusCode } = await request(fullUrl);
      strictEqual(statusCode, 200);
    });
  });
});
