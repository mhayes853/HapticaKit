/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest/error.js"],
  setupFilesAfterEnv: ["<rootDir>/jest/primitives.js"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
