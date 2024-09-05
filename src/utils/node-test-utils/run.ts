#!/usr/bin/env node
/* eslint-disable radix */

import os from 'node:os';
import { spec as Spec } from 'node:test/reporters';
import { parseArgs } from 'node:util';
import { env } from 'node:process';
import { run } from 'node:test';
import { glob } from 'glob';
import { info } from 'node:console';

export const getFinalTestConcurrency = (concurrency?: string) => {
  if (!concurrency || concurrency === 'true') {
    return true;
  }

  if (concurrency === 'false') {
    return false;
  }

  if (concurrency.includes('%')) {
    return Math.floor(
      (Number.parseInt(concurrency.replace('%', '')) * os.availableParallelism()) / 100,
    );
  }

  return Number.parseInt(concurrency);
};

export const getFinalTestShard = (idxjobs?: string, totjobs?: string) =>
  idxjobs && totjobs
    ? { index: Number.parseInt(idxjobs), total: Number.parseInt(totjobs) }
    : undefined;

// This file resolves the file paths from given globs and runs the test
// runner on file paths
export async function main({
  path,
  only,
  watch,
  shard,
  timeout,
  concurrency,
  globalSetup,
  globalTeardown,
}: {
  path: string;
  only?: boolean;
  watch?: boolean;
  shard?: { index: number; total: number };
  timeout?: number;
  concurrency?: string;
  globalSetup?: () => Promise<void>;
  globalTeardown?: () => Promise<void>;
}) {
  if (globalSetup) {
    await globalSetup();
  }

  run({
    files: path.includes('*') ? await glob(path) : [path],
    concurrency: getFinalTestConcurrency(concurrency),
    only,
    timeout,
    watch,
    shard,
  })
    .on('test:fail', () => {
      process.exitCode = 1;
    })
    .compose(new Spec())
    .pipe(process.stdout);

  if (globalTeardown) {
    await globalTeardown();
  }
}

const options = {
  path: {
    type: 'string',
    description:
      'Path containing at least one test (if not specified, the test runner will immediately exit)',
  },
  help: { type: 'boolean', default: false },
  watch: {
    type: 'boolean',
    default: false,
    description: 'Enable the watcher over a test file, to re-run it in case of changes',
  },
  only: { type: 'boolean', default: false, description: 'Enable the only options on the tests' },
  color: {
    type: 'string',
    default: '3',
    description: 'Tests color: 0 => no color | 1 => 16-color | 2 => 256-color | 3 => 16M-color',
  },
  concurrency: {
    type: 'string',
    description:
      'To define the concurrency, you can use a boolean value (f.e. true/false), a number representing how many CPUs you want to use (f.e. 2), or alternatively a percentage over the total number of CPUs (f.e. 20%)',
  },
  timeout: {
    type: 'string',
    description: 'Max timeout in milliseconds, by default 20_000ms (20s)',
  },
  idxjobs: { type: 'string', description: 'Index of the test job runner (f.e. 1 out of 3)' },
  totjobs: { type: 'string', description: 'Total number of test job runners' },
} as const;

const {
  values: { path, only, concurrency, timeout, watch, idxjobs, totjobs, help, color },
} = parseArgs({ args: process.argv.slice(2), options, allowPositionals: true });

if (help) {
  info(`Welcome to the node-test-utils executable!
If you prefer to run the same code programmatically from TypeScript, instead of using the command line, you can import the main function from this library, since it's available in src/run.ts

Those are the available options you can pass to the test runner command:
${JSON.stringify(options, null, 2)}`);
}

if (path) {
  // Reference: https://nodejs.org/docs/latest-v22.x/api/cli.html#force_color1-2-3
  env.FORCE_COLOR = color;

  main({
    only,
    path,
    concurrency,
    watch,
    timeout: Number.parseInt(timeout || '20000'),
    shard: getFinalTestShard(idxjobs, totjobs),
  });
}
