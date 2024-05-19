const tsconfig = require('./tsconfig.json');
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

const baseConfig = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>/src'],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: false,
            dynamicImport: true,
          },
          transform: null,
          target: 'es2021',
          loose: false,
          externalHelpers: true,
          keepClassNames: true,
        },
      },
    ],
  },
  moduleNameMapper,
};

/** @type {import('jest').Config} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/database/migrations/**',
    '!**/database/scripts/**',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/fixtures/**',
  ],
  coverageReporters: ['json-summary', 'lcov', 'json', 'text-summary'],
  projects: [
    {
      ...baseConfig,
      displayName: 'unit-tests',
      testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
    },
    {
      ...baseConfig,
      displayName: 'service-tests',
      testMatch: ['<rootDir>/src/__tests__/service/**/*.test.ts'],
    },
  ],
};
