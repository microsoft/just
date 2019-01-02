import { encodeArgs } from '../exec';

describe('encodeArgs', () => {
  it('encodes things with spaces with double quotes', () => {
    const args = encodeArgs(['blah blah']);
    expect(args[0]).toBe('"blah blah"');
  });

  it('encodes Windows-like paths', () => {
    const args = encodeArgs(['C:\\Program Files\\node\\bin\\node.exe']);
    expect(args[0]).toBe('"C:\\Program Files\\node\\bin\\node.exe"');
  });

  it('leaves normal args alone', () => {
    const args = encodeArgs(['this-is-normal']);
    expect(args[0]).toBe('this-is-normal');
  });
});
