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
  });

  it('handles questionable markdown', () => {
    // missing closing * for bold
    expect(prettyPrintMarkdown('**hello*')).toContain('hello');
  });
});
