/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { pipe } from '@utils/general-type-helpers/function';

export const applyStringReplacements = (fileContents: string): string => {
  return pipe(
    fileContents,
    replaceBeforeAfter,
    runImportsReplacement,
    runMatchersImportsRemplacements,
  );
};

const runImportsReplacement = (contents: string): string =>
  pipe(
    contents,
    addImport(/describe\(/, /from ["']node:test["']/, "import { describe, it } from 'node:test';"),
    addImport(/assert\./, /from ["']node:assert["']/, "import assert from 'node:assert';"),
    addImport(
      /assertMatches\(/,
      /^some-impossible-line$/,
      "import { assertMatches } from '@utils/node-test-utils';",
    ),
    addImport(
      /assertHasBeenCalled\(/,
      /^some-impossible-line$/,
      "import { assertHasBeenCalled } from '@utils/node-test-utils';",
    ),
    addImport(
      /assertHasNotBeenCalled\(/,
      /^some-impossible-line$/,
      "import { assertHasNotBeenCalled } from '@utils/node-test-utils';",
    ),
    addImport(
      /assertHasBeenCalledWith\(/,
      /^some-impossible-line$/,
      "import { assertHasBeenCalledWith } from '@utils/node-test-utils';",
    ),
    addImport(
      /assertMatchesSnapshot\(/,
      /^some-impossible-line$/,
      "import { assertMatchesSnapshot } from '@utils/node-test-utils/snasphot';",
    ),
    addImport(
      /assertSuccess\(/,
      // We're confident the import happens on one line
      /^import {.*assertSuccess.*} from '@spendesk\/general-type-helpers\/node'/gm,
      "import { assertSuccess } from '@utils/general-type-helpers/node';",
    ),
    addImport(
      /assertFailure\(/,
      // We're confident the import happens on one line
      /^import {.*assertFailure.*} from '@spendesk\/general-type-helpers\/node'/gm,
      "import { assertFailure } from '@utils/general-type-helpers/node';",
    ),
    addImport(/\s*after\(/, /^some-impossible-line$/, "import { after } from 'node:test';"),
    addImport(/\s*before\(/, /^some-impossible-line$/, "import { before } from 'node:test';"),
    addImport(/\s*mock.fn\(/, /^some-impossible-line$/, "import { mock } from 'node:test';"),
  );

const runMatchersImportsRemplacements = (contents: string): string =>
  pipe(
    contents,
    addImport(
      /\s*arrayContaining\(/,
      /^some-impossible-line$/,
      "import { arrayContaining } from '@utils/node-test-utils/matchers';",
    ),
    addImport(
      /\s*objectContaining\(/,
      /^some-impossible-line$/,
      "import { objectContaining } from '@utils/node-test-utils/matchers';",
    ),
    addImport(
      /\s*valueOfType\(/,
      /^some-impossible-line$/,
      "import { valueOfType } from '@utils/node-test-utils/matchers';",
    ),
    addImport(
      /\s*stringIncluding\(/,
      /^some-impossible-line$/,
      "import { stringIncluding } from '@utils/node-test-utils/matchers';",
    ),
    addImport(
      /\s*stringMatching\(/,
      /^some-impossible-line$/,
      "import { stringMatching } from '@utils/node-test-utils/matchers';",
    ),
  );

const addImport =
  (needToImportDetectionRegex: RegExp, alreadyImported: RegExp, importLineToAdd: string) =>
  (fileContents: string) => {
    if (!fileContents.match(needToImportDetectionRegex) || fileContents.match(alreadyImported)) {
      return fileContents;
    }

    const lines = fileContents.split('\n');
    const lastImportLineIndex = findLastImportLineIndex(lines);

    return lines
      .map((line, index) => (index === lastImportLineIndex ? `${line}\n${importLineToAdd}` : line))
      .join('\n');
  };

const findLastImportLineIndex = (lines: string[]): number => {
  let lastImportLineIndex = 0;
  for (const [index, line] of lines.entries()) {
    if (/from ["'].*["'];/.test(line)) {
      lastImportLineIndex = index;
    }
  }

  return lastImportLineIndex;
};

const replaceBeforeAfter = (fileContents: string): string =>
  pipe(
    fileContents,
    (contents) => contents.replace(/(\s*)afterAll\(/g, '$1after('),
    (contents) => contents.replace(/(\s*)beforeAll\(/g, '$1before('),
  );
