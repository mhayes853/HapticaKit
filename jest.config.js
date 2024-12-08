/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "./native": "<rootDir>/__mocks__/native.js",
  },
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
