module.exports = {
  printWidth: 140,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.json5',
      options: {
        parser: 'json',
      },
    },
  ],
};
