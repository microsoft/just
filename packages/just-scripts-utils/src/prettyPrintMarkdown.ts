import marked = require('marked');
import TerminalRenderer = require('marked-terminal');

/**
 * Pretty print markdown content for display in a terminal.
 * @param content Markdown-formatted content
 * @returns The formatted content
 */
export function prettyPrintMarkdown(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }
  marked.setOptions({
    // The typings for marked-terminal have not been updated in a few years, so it results in compiler errors with the newer versions of marked
    renderer: new TerminalRenderer() as any
  });
  return marked(content);
}
