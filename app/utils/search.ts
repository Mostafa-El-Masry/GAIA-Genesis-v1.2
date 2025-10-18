export type SearchOps = {
  text?: string;
  title?: string;
  content?: string;
  tag?: string[];
  before?: string; // ISO date
  after?: string;  // ISO date
};

export function parseQuery(q: string): SearchOps {
  const ops: SearchOps = { text: "" };
  const parts = q.match(/(\w+:\S+)|("[^"]+")|(\S+)/g) || [];
  const tags: string[] = [];
  for (const p of parts) {
    if (/^title:/.test(p)) ops.title = p.slice(6);
    else if (/^content:/.test(p)) ops.content = p.slice(8);
    else if (/^tag:/.test(p)) tags.push(p.slice(4));
    else if (/^before:/.test(p)) ops.before = p.slice(7);
    else if (/^after:/.test(p)) ops.after = p.slice(6);
    else if (p.startsWith('"') && p.endsWith('"')) {
      ops.text += " " + p.slice(1, -1);
    } else {
      ops.text += " " + p;
    }
  }
  if (tags.length) ops.tag = tags;
  ops.text = (ops.text || "").trim();
  return ops;
}

export function matches(ops: SearchOps, note: any) {
  const inRange = (date: string) => {
    const d = new Date(date).getTime();
    if (ops.after && d < new Date(ops.after).getTime()) return false;
    if (ops.before && d > new Date(ops.before).getTime()) return false;
    return true;
  };

  if (!inRange(note.createdAt)) return false;

  if (ops.title && !note.title.toLowerCase().includes(ops.title.toLowerCase())) return false;
  if (ops.content && !note.content_md.toLowerCase().includes(ops.content.toLowerCase())) return false;

  if (ops.text) {
    const text = (note.title + " " + note.content_md).toLowerCase();
    if (!text.includes(ops.text.toLowerCase())) return false;
  }

  if (ops.tag && ops.tag.length) {
    if (!note.tags || !ops.tag.every(t => note.tags.includes(t))) return false;
  }
  return true;
}