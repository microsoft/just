import marked from 'marked';
import TerminalRenderer from 'marked-terminal';

export function prettyPrintMarkdown(content: string) {
  marked.setOptions({
    renderer: new TerminalRenderer()
  });
  return marked(content);
}
