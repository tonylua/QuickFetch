module.exports = {
  moduleFileExtensions: [
    'js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!lodash-es)"
  ],
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
