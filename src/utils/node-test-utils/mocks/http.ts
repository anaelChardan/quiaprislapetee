import { URL } from 'node:url';
import { MockAgent, setGlobalDispatcher } from 'undici';

export const httpMock = () => {
  const mockAgent = new MockAgent({
    keepAliveTimeout: 10, // ms
    keepAliveMaxTimeout: 10, // ms
  });
  setGlobalDispatcher(mockAgent);

  return ({
    fullUrl,
    data,
    method = 'GET',
    code = 200,
  }: {
    fullUrl: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    code?: number;
    data?: object;
  }) => {
    const { protocol, host } = new URL(fullUrl);
    const mock = mockAgent.get(`${protocol}//${host}`);
    mock.intercept({ path: fullUrl, method }).reply(code, data);

    return mockAgent;
  };
};
