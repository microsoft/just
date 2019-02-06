import { prettyPrintMarkdown } from '../prettyPrintMarkdown';

describe('prettyPrintMarkdown', () => {
  it('handles non markdown', () => {
    expect(prettyPrintMarkdown(undefined as any)).toBe('');
    expect(prettyPrintMarkdown(null as any)).toBe('');
    expect(prettyPrintMarkdown(3 as any)).toBe('');
    expect(prettyPrintMarkdown({} as any)).toBe('');
  });

  it('handles markdown', () => {
    expect(prettyPrintMarkdown('hello')).toContain('hello');
    expect(prettyPrintMarkdown('# hello')).toContain('hello');
    const result = prettyPrintMarkdown('# hello\nworld');
    expect(result).toContain('hello');
    expect(result).toContain('world');

    // even handles questionable markdown!
    expect(prettyPrintMarkdown('**hello*')).toContain('hello');
  });
});
