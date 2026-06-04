console.log('hello', ...process.argv.slice(2));
console.log(
  Object.entries(process.env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n'),
);
