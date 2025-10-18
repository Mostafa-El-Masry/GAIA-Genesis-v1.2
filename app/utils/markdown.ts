// Minimal markdown renderer: headings, lists, code, bold/italic, links, inline code, checklists
// Also supports wiki links [[Title]] -> anchor with data-note-title.
export function mdToHtml(src: string): string {
  // Escape HTML
  let s = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Code fences ``` ```
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`);

  // Headings
  s = s.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
       .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
       .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
       .replace(/^### (.*)$/gm, "<h3>$1</h3>")
       .replace(/^## (.*)$/gm, "<h2>$1</h2>")
       .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Checklists - [x] and [ ]
  s = s.replace(/^\s*-\s+\[(x|X)\]\s+(.*)$/gm, `<div>✅ $2</div>`)
       .replace(/^\s*-\s+\[( )\]\s+(.*)$/gm, `<div>☐ $2</div>`);

  // Unordered lists
  s = s.replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>");
  s = s.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");

  // Bold / italic
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
       .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  s = s.replace(/`([^`]+?)`/g, "<code>$1</code>");

  // Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`);

  // Wiki links [[Title]]
  s = s.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `<a href="#" data-note-title="${t}">[[${t}]]</a>`);

  // Paragraphs - wrap loose lines
  s = s.replace(/^(?!<h\d|<ul>|<pre>|<div>|<p>|<\/ul>|<\/pre>|<\/div>)(.+)$/gm, "<p>$1</p>");
  return s;
}