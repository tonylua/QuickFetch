module.exports = {
  moduleFileExtensions: [
    'js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.js",
    "!**/node_modules/**"
  ],
  coveragePathIgnorePatterns: [
  ],
  coverageReporters: [
    "text"
  ]
};
