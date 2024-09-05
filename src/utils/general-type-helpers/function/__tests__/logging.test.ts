/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, mock } from 'node:test';
import { assertHasBeenCalledWith } from '@utils/node-test-utils';
import { buildLog_, consoleLog_ } from '../logging';
import { pipe } from '../pipe';

const consoleLogMock = mock.method(console, 'log');
const consoleDirMock = mock.method(console, 'dir');

describe('getLogInPipe()', () => {
  describe('Given a logger and a non-object input', () => {
    const input = 4;
    const logger = {
      info: mock.fn(),
    } as any;

    it('should log the input', () => {
      pipe(input, buildLog_(logger)('Some message'));

      assertHasBeenCalledWith(logger.info, 'Some message', { input });
    });
  });

  describe('Given a logger and an object input', () => {
    const input = { amount: 4 };
    const logger = {
      info: mock.fn(),
    } as any;

    it('should log the input', () => {
      pipe(input, buildLog_(logger)('Some message'));

      assertHasBeenCalledWith(logger.info, 'Some message', {
        input: { amount: 4 },
      });
    });
  });

  describe('Given a logger, an input and additional parameters', () => {
    const input = { amount: 4 };
    const additionalParameters = { companyId: '1234' };
    const logger = {
      info: mock.fn(),
    } as any;

    it('should log the input', () => {
      pipe(input, buildLog_(logger)('Some message', 'info', additionalParameters));

      assertHasBeenCalledWith(logger.info, 'Some message', {
        input: { amount: 4 },
        companyId: '1234',
      });
    });
  });
});

describe('consoleLogInPipe()', () => {
  describe('Given some input', () => {
    const input = 4;

    it('should log the input', () => {
      pipe(input, consoleLog_('Some message'));

      assertHasBeenCalledWith(consoleLogMock, 'Some message');
      assertHasBeenCalledWith(consoleDirMock, 4, { depth: null });
    });
  });
});
