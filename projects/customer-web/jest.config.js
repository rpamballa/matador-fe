module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  passWithNoTests: true,
  moduleNameMapper: {
    '^@matador/shared$': '<rootDir>/projects/shared/src/public-api.ts',
    '^@matador/shared/(.*)$': '<rootDir>/projects/shared/src/lib/$1',
  },
};
