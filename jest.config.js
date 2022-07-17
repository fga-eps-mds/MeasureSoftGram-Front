module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  testRegex: '((\\.|/*.)(spec))\\.tsx?$',
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jsdom'
};
