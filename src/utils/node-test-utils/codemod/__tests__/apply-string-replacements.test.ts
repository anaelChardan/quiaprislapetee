import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { resolve } from 'node:path';
import { applyStringReplacements } from '../apply-string-replacements';
import { assertMatches } from '../../assertions';

describe('Given a test file content with every thing things to replace', () => {
  const inputContent = readFileSync(resolve(__dirname, `./test-input-sample.txt`)).toString();
  const expectedOutput = readFileSync(resolve(__dirname, './test-output-sample.txt')).toString();

  // TODO test imports

  it('should run all the replacements', () => {
    assertMatches(applyStringReplacements(inputContent), expectedOutput);
  });
});
