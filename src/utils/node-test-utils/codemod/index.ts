/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { glob } from 'glob';
import { execSync } from 'node:child_process';
import { debug, error, info } from 'node:console';
import fs, { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyStringReplacements } from './apply-string-replacements';

// Include all desired patterns from .grit/patterns
// Order matters for import transformers!
const gritPatterns = [
  'expect_replacements.md',
  'expect_to_match_snapshot_simple.md',
  'mock_fn.md',
  'simplify_gth_utils_usage.md',
  'import_gth_utils_from_jest.md',
  'import_gth_utils_transform_star.md',
  // Those ones don't work yet
  // 'wip_expect_to_match_snapshot.md',
  // 'wip_import_gth_utils_if_needed.md',
];

/**
 * Wishlist:
 * - Transform multiline `toEqual(expect.objectContaining({someDate: expect.anyDate()}))`
 * - Transform `jest.mock` + mocking behaviour to use of `cjs-mock`
 * - Transform `jest.spyOn`
 */
export async function main({
  inputFilePathsOrGlobs,
  prettierPath = './node_modules/.bin/prettier',
  eslintPath = './node_modules/.bin/eslint',
  gritPath = './node_modules/.bin/grit',
  gritPatternsPath = './node_modules/@utils/node-test-utils/.grit/patterns',
}: {
  inputFilePathsOrGlobs: string[];
  prettierPath?: string;
  eslintPath?: string;
  gritPath?: string;
  gritPatternsPath?: string;
}) {
  try {
    info("ℹ️ Please install @getgrit/launcher on the project where you'll run this codemod tool!");
    info(`ℹ️ Starting the Jest -> node test codemod in ${inputFilePathsOrGlobs.join(' ')}`);

    if (inputFilePathsOrGlobs.length < 1) {
      error('❌ You must provide test paths');
      process.exit(1);
    }

    const globs = await Promise.all(
      inputFilePathsOrGlobs.map(async (p) => {
        // Poor man's glob detection
        const isGlob = p.includes('*');

        if (!isGlob) {
          return [p];
        }

        return glob(p);
      }),
    );

    const allFiles = globs.flatMap((paths) => paths);

    info(`🚀 Starting to process ${allFiles.length} test files`);

    // Disabling trailing commas as they cause issues in code mods
    executeCommand(
      `${prettierPath} ${inputFilePathsOrGlobs.join(' ')} --write --trailing-comma=none`,
    );

    // Not glob-compatible
    for (const gritPattern of gritPatterns) {
      executeCommand(
        `${gritPath} apply ${join(gritPatternsPath, gritPattern)} ${allFiles.join(' ')} --force`,
      );
    }

    for (const testFile of allFiles) {
      info('⏳ Processing: ', testFile);
      writeFileSync(testFile, applyStringReplacements(fs.readFileSync(testFile).toString()));
    }

    info('⏳ Running the formatter');
    executeCommand(`${prettierPath} ${inputFilePathsOrGlobs.join(' ')} --write`);
    info('⏳ Running the linter');
    executeCommand(`${eslintPath} ${inputFilePathsOrGlobs.join(' ')} --fix`);
    info('✅ Codemod done');
  } catch (err) {
    error('Error', err);

    if (err instanceof Error && 'stdout' in err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error('Error output', (err as any).stdout.toString());
    }
  }
}

function executeCommand(command: string) {
  debug(`About to run command: ${command}`);
  execSync(command);
}
