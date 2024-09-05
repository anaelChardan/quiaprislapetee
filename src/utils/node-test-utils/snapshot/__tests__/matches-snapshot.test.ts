import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { mock as mockModule } from 'cjs-mock';
import type * as mod from '../matches-snapshot';
import { serializeSnapshotData } from '../snapshot-util';

describe('Read mode', () => {
  describe('Given the snapshot file cannot be read', () => {
    const data = 'some-data';
    const assertionKey = 'should contain some-data';

    const { assertMatchesSnapshot }: typeof mod = mockModule('../matches-snapshot', {
      'node:fs': {
        readFileSync: mock.fn(() => {
          throw new Error('Oh no');
        }),
      },
    });

    it('should throw', () => {
      assert.throws(() => assertMatchesSnapshot(data, assertionKey), {
        message: 'Snapshot file cannot be read',
      });
    });
  });

  describe('Given the snapshot file does not include the given assertion key', () => {
    const data = 'some-data';
    const assertionKey = 'should contain some-data';

    const { assertMatchesSnapshot } = mockModule('../matches-snapshot', {
      'node:fs': {
        readFileSync: mock.fn(
          () => `
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[\`Some other assertion\`]: \`
""Some content"
"
\`;
         `,
        ),
      },
    });

    it('should throw', () => {
      assert.throws(() => assertMatchesSnapshot(data, assertionKey), {
        message: `Snapshot does not include the given assertion key`,
      });
    });
  });

  describe('Given the snapshot content does not match the data', () => {
    const data = 'some-data';
    const assertionKey = 'should contain some-data';

    const { assertMatchesSnapshot } = mockModule('../matches-snapshot', {
      'node:fs': {
        readFileSync: mock.fn(
          () => `
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[\`Some other assertion\`]: \`
""Some content"
"
\`;

exports[\`should contain some-data\`]: \`
"the-actual-snapshot-data
on-two-lines
"
\`;

exports[\`one more tiiime\`]: \`
"It's in your head now"
\`;

         `,
        ),
      },
    });

    it('should throw', () => {
      assert.throws(
        () => assertMatchesSnapshot(data, assertionKey),
        (error: { message: string }) => error.message.includes(`Snapshot content does not match`),
      );
    });
  });

  describe('Given the snapshot content matches the string data', () => {
    const data = 'some-data';
    const assertionKey = 'should contain some-data';
    const readFileSync = mock.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (path: string) => `
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[\`Some other assertion\`]: \`
""Some content"
"
\`;

exports[\`should contain some-data\`]: \`
"some-data"
\`;

exports[\`one more tiiime\`]: \`
"It's in your head now"
\`;

     `,
    );

    const { assertMatchesSnapshot } = mockModule('../matches-snapshot', {
      'node:fs': {
        readFileSync,
      },
    });

    it('should pass', () => {
      assert.doesNotThrow(() => assertMatchesSnapshot(data, assertionKey));
      assert.match(
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        readFileSync.mock.calls[0]?.arguments?.[0]!,
        /src\/snapshot\/__tests__\/__snapshots__\/matches-snapshot\.test\.ts\.snap/,
      );
    });
  });

  describe('Given the snapshot content matches the JSON data', () => {
    const data = { some: 'data' };
    const assertionKey = 'should contain some-data';
    const readFileSync = mock.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (path: string) => `
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[\`Some other assertion\`]: \`
""Some content"
"
\`;

exports[\`should contain some-data\`]: \`
${serializeSnapshotData(data)}
\`;

exports[\`one more tiiime\`]: \`
"It's in your head now"
\`;

     `,
    );

    const { assertMatchesSnapshot } = mockModule('../matches-snapshot', {
      'node:fs': {
        readFileSync,
      },
    });

    it('should pass', () => {
      assert.doesNotThrow(() => assertMatchesSnapshot(data, assertionKey));
      assert.match(
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        readFileSync.mock.calls[0]?.arguments?.[0]!,
        /src\/snapshot\/__tests__\/__snapshots__\/matches-snapshot\.test\.ts\.snap/,
      );
    });
  });
});

describe('Update mode', () => {});
