# Codemod user manual

This document describes how to use the codemod to transition from Jest to the Node test runner.

## Step 1: add the temporary dependencies

```
npm install --save-dev @utils/node-test-utils @getgrit/launcher
npm install --save-dev tsx
// 👆 If you haven't installed it already
```

## Step 2: add a temporary runner file

Create a new file, for instance in a `scripts` folder, such as `./scripts/run-node-test-codemod.ts`

```ts
// In ./scripts/run-node-test-codemod.ts
import { runCodemod } from '@utils/node-test-utils';

runCodemod({
  // The paths of test files
  inputFilePathsOrGlobs: ['./src/**/__tests__/**/*.test.ts'],
  // Path to the prettier executable
  prettierPath: './node_modules/.bin/prettier',
  // Path to the eslint executable
  eslintPath: './node_modules/.bin/eslint',
  // Path to the grit executable
  gritPath: './node_modules/.bin/grit',
  // Path to the grit patterns
  gritPatternsPath: './node_modules/@utils/node-test-utils/.grit/patterns',
});
```

## Step 3: run the codemod

This will update the files in place, and run prettier and eslint fix on them.

```
npx tsx ./scripts/run-node-test-codemod.ts
```

Note: it is possible that some duplicate imports are not fixed by one eslint fix run.
If so, you can simply re-run the codemod and this issue should get fixed.

## Step 4: fix the errors

Lint, Typescript compilation and runtime errors may occur after the codemod is ran.

Here are known cases where manual fixes are needed:

### 1. `mock.fn()` now results in a type error

Root cause: `jest.fn()` is of type `any`, whereas `mock.fn()` will have the type of its implementation.
Usually, fixing this is as simple as doing: `const myMockFn = mock.fn<any>()`.

### 2. Jest mocks

🚧 Documentation under construction

## Step 5: replace test scripts

Replace test scripts in `package.json` with the following:

```
    "test": "npm run test:single -- --path './src/**/*.test.ts'",
    "test:coverage": "nyc --reporter=lcov --reporter=text npm run test",
    "test:single": "tsx ../node-test-utils/src/run.ts --timeout 60000"
```

To enable coverage via nyc:

- Run: `npm install --save-dev nyc`
- Create a new file named `.nycrc.json` containing the following:

```
{
  "check-coverage": true,
  "branches": 90,
  "lines": 90,
  "functions": 90,
  "statements": 90,
  "include": ["src/**"],
  "exclude": ["**/__tests__/**"]
}
```

## Step 6: Cleanup and miscellaneous

- Add the following line to `.gitignore`:

```
.nyc_output
coverage/
```

- Remove `@getgrit/launcher` from `devDependencies` in `package.json` and run `npm install`
- Remove `./scripts/run-node-test-codemod.ts`
- Remove `jest.config.js`
