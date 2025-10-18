"use client";
import { useEffect, useMemo, useState } from "react";
import { parseQuery, matches } from "../utils/search";

export type ModuleRef = { module: "wealth"|"health"|"gallery"|"timeline"|"dashboard"|"apollo"; id: string };

export type ApolloNote = {
  id: string;
  title: string;
  content_md: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  links: string[];   // note ids
  moduleRefs: ModuleRef[];
};

const STORAGE_KEY = "gaia_apollo";
const SCHEMA_VERSION_KEY = "gaia_apollo_version";
const VERSION = 2;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowIso() { return new Date().toISOString(); }

// Attempt to extract [[title]] links from markdown and resolve to note ids
function extractWikiLinks(md: string): string[] {
  const titles: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(md))) titles.push(m[1]);
  return titles;
}

export function useApolloStore() {
  const [notes, setNotes] = useState<ApolloNote[]>([]);
  const [ready, setReady] = useState(false);

  // Load & migrate
  useEffect(() => {
    const ver = Number(localStorage.getItem(SCHEMA_VERSION_KEY) || 1);
    const raw = localStorage.getItem(STORAGE_KEY);
    let data: any[] = [];
    try { data = raw ? JSON.parse(raw) : []; } catch { data = []; }

    if (ver < VERSION) {
      // migrate v1 -> v2
      data = data.map((n: any) => ({
        id: n.id || uid(),
        title: n.title || "Untitled",
        content_md: n.content_md || n.content || "",
        tags: Array.isArray(n.tags) ? n.tags : [],
        createdAt: n.createdAt || nowIso(),
        updatedAt: n.updatedAt || nowIso(),
        links: Array.isArray(n.links) ? n.links : [],
        moduleRefs: Array.isArray(n.moduleRefs) ? n.moduleRefs : [],
      }));
      localStorage.setItem(SCHEMA_VERSION_KEY, String(VERSION));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    setNotes(data);
    setReady(true);
  }, []);

  // Save helper
  const saveAll = (list: ApolloNote[]) => {
    setNotes(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (!localStorage.getItem(SCHEMA_VERSION_KEY)) {
      localStorage.setItem(SCHEMA_VERSION_KEY, String(VERSION));
    }
  };

  // Create / update / delete
  const create = (partial?: Partial<ApolloNote>): ApolloNote => {
    const n: ApolloNote = {
      id: uid(),
      title: partial?.title || "Untitled",
      content_md: partial?.content_md || "",
      tags: partial?.tags || [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      links: partial?.links || [],
      moduleRefs: partial?.moduleRefs || [],
    };
    const next = [n, ...notes];
    saveAll(next);
    return n;
  };

  const update = (id: string, patch: Partial<ApolloNote>) => {
    const next = notes.map(n => n.id === id ? { ...n, ...patch, updatedAt: nowIso() } : n);
    saveAll(next);
  };

  const remove = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    saveAll(next);
  };

  // Resolve links by [[Title]]
  const resolveLinks = (id: string) => {
    const me = notes.find(n => n.id === id);
    if (!me) return;
    const titles = extractWikiLinks(me.content_md);
    const linkedIds = titles
      .map(t => notes.find(n => n.title.toLowerCase() === t.toLowerCase())?.id)
      .filter(Boolean) as string[];
    update(id, { links: Array.from(new Set(linkedIds)) });
  };

  // Backlinks
  const backlinks = (id: string) => notes.filter(n => n.links?.includes(id));

  // Search
  const search = (q: string) => {
    const ops = parseQuery(q);
    return notes.filter(n => matches(ops, n));
  };

  // Daily note
  const daily = () => {
    const title = new Date().toISOString().slice(0,10);
    let n = notes.find(x => x.title === title);
    if (!n) n = create({ title, content_md: `# ${title}\n\n` });
    return n;
  };

  // Exports
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "apollo_notes.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const exportMD = (id: string) => {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    const content = `# ${n.title}\n\n${n.content_md}\n\n`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${n.title.replace(/[^a-z0-9-_]/gi,'_')}.md`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return {
    ready, notes, create, update, remove, resolveLinks, backlinks, search, daily, exportJSON, exportMD
  };
}