// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  setupFiles: ["dotenv/config"],
  testTimeout: 30000,
};
