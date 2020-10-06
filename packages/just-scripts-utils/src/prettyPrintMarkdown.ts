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
    renderer: new TerminalRenderer()
  });
  return marked(content);
}
