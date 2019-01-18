import { hello } from '../hello';

describe('hello', () => {
  it('says hello to a name', () => {
    expect(hello('world')).toBe('hello world');
  });
});
