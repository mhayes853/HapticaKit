/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest/primitives.js"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
