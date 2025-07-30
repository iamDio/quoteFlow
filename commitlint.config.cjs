module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation
        'style', // formatting, missing semicolons, etc
        'refactor', // code change that neither fixes a bug nor adds a feature
        'test', // adding tests
        'chore', // maintenance
        'perf', // performance improvements
        'ci', // CI/CD changes
        'build', // build system changes
        'revert', // reverting previous commit
      ],
    ],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72],
  },
};
