/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "./native": "<rootDir>/src/__mocks__/native.js",
  },
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
