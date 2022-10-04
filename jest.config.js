const patterns = '[/\\\\]node_modules[/\\\\](?!parse-md|globby|slash|js-yaml).+\\.(js|jsx)$';

module.exports = {
    testEnvironment: "node",
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'mjs'],
    transform: {
      '^.+.m?js$': 'babel-jest'
    },
    transformIgnorePatterns: [
        patterns,
      ],
}