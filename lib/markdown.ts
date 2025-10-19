
// Lightweight Markdown renderer (headings, lists, links, code fences, inline code, bold/italic, blockquotes, tables).
// Client-safe: returns HTML string. Use with <div dangerouslySetInnerHTML={{__html: renderMarkdown(md)}} />
export function renderMarkdown(md: string): string {
  if (!md) return "";
  // Normalize newlines
  md = md.replace(/\r\n?/g, "\n");

  // Escape HTML
  const esc = (s: string) => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Extract fenced code blocks first to avoid inner parsing
  type CodeBlock = { id: string; html: string };
  const codeBlocks: CodeBlock[] = [];
  md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang = "", body: string) => {
    const id = "§CODEBLOCK§" + codeBlocks.length + "§";
    codeBlocks.push({ id, html: `<pre><code class="lang-${esc(lang)}">${esc(body)}</code></pre>` });
    return id;
  });

  // Block-level parsing
  const lines = md.split("\n");
  const out: string[] = [];
  let inUL = false, inOL = false, inBQ = false, inTable = false;

  const closeAll = () => {
    if (inTable) { out.push("</tbody></table>"); inTable = false; }
    if (inUL) { out.push("</ul>"); inUL = false; }
    if (inOL) { out.push("</ol>"); inOL = false; }
    if (inBQ) { out.push("</blockquote>"); inBQ = false; }
  };

  const openUL = () => { if (!inUL) { closeAll(); out.push("<ul>"); inUL = true; } };
  const openOL = () => { if (!inOL) { closeAll(); out.push("<ol>"); inOL = true; } };
  const openBQ = () => { if (!inBQ) { closeAll(); out.push("<blockquote>"); inBQ = true; } };
  const openTable = () => { if (!inTable) { closeAll(); out.push('<table class="md-table"><tbody>'); inTable = true; } };

  const paraBuf: string[] = [];
  const flushPara = () => {
    if (paraBuf.length) {
      out.push("<p>" + inline(paraBuf.join(" ")) + "</p>");
      paraBuf.length = 0;
    }
  };

  // Inline transforms (order matters)
  function inline(txt: string): string {
    // Code spans
    txt = txt.replace(/`([^`]+)`/g, (_m, code) => "<code>" + esc(code) + "</code>");
    // Images ![alt](src)
    txt = txt.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => `<img src="${esc(src)}" alt="${esc(alt)}" />`);
    // Links [text](href)
    txt = txt.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, txt2, href) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(txt2)}</a>`);
    // Bold **text**
    txt = txt.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Italic *text*
    txt = txt.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    // Strikethrough ~~text~~
    txt = txt.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    return txt;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Empty line: split paragraphs / close blocks
    if (!line) {
      flushPara(); closeAll(); continue;
    }

    // Headings
    const mH = line.match(/^(#{1,6})\s+(.*)$/);
    if (mH) {
      flushPara(); closeAll();
      const level = mH[1].length;
      out.push(`<h${level}>${inline(esc(mH[2]))}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      openBQ();
      out.push("<p>" + inline(esc(line.replace(/^>\s?/, ""))) + "</p>");
      continue;
    }

    // Lists
    if (/^[-*]\s+/.test(line)) {
      openUL();
      out.push("<li>" + inline(esc(line.replace(/^[-*]\s+/, ""))) + "</li>");
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      openOL();
      out.push("<li>" + inline(esc(line.replace(/^\d+\.\s+/, ""))) + "</li>");
      continue;
    }

    // Simple pipe tables `a | b | c`
    if (/\|/.test(line) && line.split("|").length >= 2) {
      const cells = line.split("|").map(c => c.trim());
      openTable();
      out.push("<tr>" + cells.map(c => `<td>${inline(esc(c))}</td>`).join("") + "</tr>");
      continue;
    }

    // Paragraph
    paraBuf.push(esc(raw));
  }

  flushPara(); closeAll();

  let html = out.join("\n");
  // Re-insert code blocks
  for (const cb of codeBlocks) {
    html = html.replace(cb.id, cb.html);
  }
  return html;
}
