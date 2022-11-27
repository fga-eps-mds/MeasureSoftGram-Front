const aliases = require('./settings/alias').reduce((acc, alias) => {
  acc[`^${alias.name}(.*)$`] = `<rootDir>${alias.path}$1`;
  return acc;
}, {});

module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  testRegex: '((\\.|/*.)(spec))\\.tsx?$',
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    ...aliases
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: ['<rootDir>/tests/jestSetup.ts'],
  testEnvironment: 'jsdom',
  reporters: [
    'default',
    [
      'jest-sonar',
      {
        outputDirectory: '.',
        outputName: 'coverage.xml'
      }
    ]
  ]
};
