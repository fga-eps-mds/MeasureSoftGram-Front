module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    "((\\.|/*.)(spec))\\.ts?$"
  ],
  testRegex: "((\\.|/*.)(spec))\\.ts?$",
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}
