/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import { Oops } from '@utils/oops';
import { AssertionError } from 'node:assert';
import { diff } from 'jest-diff';
import { readFileSync } from 'node:fs';
import { serializeSnapshotData } from './snapshot-util';

// TODO handle --updateSnapshot flag
export const assertMatchesSnapshot = (actual: { toString: () => string }, assertionKey: string) => {
  const { stack } = new Error();

  if (!stack) {
    throw new Oops('Could not get stack');
  }

  const splitStack = stack.split('\n');
  // Matches lines like "at /some/path/accounting-integrations-service/src/foo/__tests__/bar.test.ts:123:33"
  // or "at node_assert_1.default.throws.message (/some/path/accounting-integrations-service/src/foo/__tests__/bar.test.ts:83:27)"
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const testFilePathResult = splitStack[2]!.match(/(?:\/[^:\n]+)(?=:)/);

  if (!testFilePathResult) {
    throw new Oops('Could not get file path');
  }

  const [testFilePath] = testFilePathResult;

  if (!testFilePath) {
    throw new Oops('Could not get file path');
  }

  const splitTestFilePath = testFilePath.split('/');
  const testFileName = splitTestFilePath.pop();
  const pathWithoutFile = splitTestFilePath.join('/');

  const snapshotPath = `${pathWithoutFile}/__snapshots__/${testFileName}.snap`;

  const fileContents = readFileContentsOrThrow(snapshotPath);

  // Skipping the header comment
  const [, , ...splitFileContentsWithoutHeader] = fileContents.split(`\n`);
  const fileContentsWithoutHeader = splitFileContentsWithoutHeader.join('\n');

  // Splitting on every end of test
  const blocks = fileContentsWithoutHeader.split(`\`;`).map((block) => block.trim());

  const assertionBlock = blocks.find((block) => block.startsWith(`exports[\`${assertionKey}\`]`));

  if (!assertionBlock) {
    throw new AssertionError({
      operator: 'assertMatchesSnapshot',
      message: `Snapshot does not include the given assertion key`,
      expected: assertionKey,
    });
  }

  const blockContent = getBlockContent(assertionBlock);

  const serializedActual = serializeSnapshotData(actual);
  const diffResult = diff(blockContent, serializedActual);

  if (diffResult && !diffResult.includes('Compared values have no visual difference.')) {
    throw new AssertionError({
      message: `Snapshot content does not match\n${diffResult}`,
      operator: 'assertMatchesSnapshot',
    });
  }
};

const readFileContentsOrThrow = (path: string) => {
  try {
    return readFileSync(path).toString();
  } catch (error) {
    console.error('File read error', error);
    throw new AssertionError({
      operator: 'assertMatchesSnapshot',
      message: 'Snapshot file cannot be read',
      expected: path,
    });
  }
};

/**
 * In the form of:
 * ```
 * exports[\`Some other assertion\`]
 * "Some content"
 * "More content"
 * `;
 * ```
 *
 * Expected result:
 * ```
 * "Some content"
 * "More content"
 * ```
 */
const getBlockContent = (fullBlock: string): string => {
  // Skipping the `exports[...]` row
  const [, ...splitBlockContent] = fullBlock.split('\n');
  return splitBlockContent.join('\n');
};
