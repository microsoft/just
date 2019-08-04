import { hello } from '../helloworld';
describe('hello', () => {
  it('says hello', () => {
    const result = hello('world');
    expect(result).toBe('hello world');
  });
});
