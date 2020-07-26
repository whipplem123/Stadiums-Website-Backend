module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts', '**/resources/*.test.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
