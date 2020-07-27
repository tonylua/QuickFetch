module.exports = {
  globals: {
    "ts-jest": {
      babelConfig: true,
    },
  },
  modulePaths: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "json", "jsx", "vue", "ts", "tsx"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "!**/node_modules/**"],
  coveragePathIgnorePatterns: [],
  coverageReporters: ["text"],
};
