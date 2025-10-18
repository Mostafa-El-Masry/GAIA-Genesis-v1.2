"use client";
import React, { useEffect, useMemo, useState } from "react";
import "../styles/apollo.css";
import { useApolloStore, ApolloNote } from "../hooks/useApolloStore";
import NoteEditor from "../components/apollo/NoteEditor";
import Backlinks from "../components/apollo/Backlinks";
import GraphView from "../components/apollo/GraphView";
// import { parseQuery } from "../utils/search"; // unused

export default function ApolloPage() {
  const store = useApolloStore();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (store.ready && !currentId) {
      if (store.notes.length) setCurrentId(store.notes[0].id);
      else
        setCurrentId(
          store.create({
            title: "Welcome to Apollo",
            content_md: "Start writing…",
          }).id
        );
    }
  }, [store.ready]);

  const current = useMemo(
    () => store.notes.find((n: ApolloNote) => n.id === currentId) || null,
    [store.notes, currentId]
  );

  const list = useMemo(() => {
    if (!query.trim()) return store.notes;
    return store.search(query);
  }, [store.notes, query]);

  const onChange = (n: ApolloNote) => {
    store.update(n.id, n);
  };

  const onSave = () => {
    if (!current) return;
    store.resolveLinks(current.id);
    alert("Saved");
  };

  const onDelete = () => {
    if (!current) return;
    const ok = confirm("Delete this note?");
    if (!ok) return;
    const id = current.id;
    store.remove(id);
    const rest = store.notes.filter((n: any) => n.id !== id);
    setCurrentId(rest[0]?.id || null);
  };

  const openDaily = () => {
    const n = store.daily();
    setCurrentId(n.id);
  };

  const backlinks = current ? store.backlinks(current.id) : [];

  return (
    <main className="apollo-wrap">
      <aside className="apollo-sidebar">
        <div className="apollo-search">
          <input
            className="input"
            placeholder="Search (title:, content:, tag:, before:, after:)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-outline" onClick={() => setQuery("")}>
            Clear
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentId(store.create().id)}
          >
            ＋ New
          </button>
          <button className="btn btn-outline" onClick={openDaily}>
            🗓 Daily
          </button>
          <button className="btn btn-outline" onClick={store.exportJSON}>
            Export JSON
          </button>
        </div>

        <div className="apollo-list">
          {list.map((n: ApolloNote) => (
            <div
              key={n.id}
              className={`apollo-item ${n.id === currentId ? "active" : ""}`}
              onClick={() => setCurrentId(n.id)}
            >
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 220,
                }}
              >
                {n.title}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                {new Date(n.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="apollo-main">
        {current && (
          <NoteEditor
            note={current}
            onChange={onChange}
            onSave={onSave}
            onDelete={onDelete}
          />
        )}

        {current && (
          <Backlinks items={backlinks} onOpen={(id) => setCurrentId(id)} />
        )}
        <GraphView notes={store.notes} onOpen={(id) => setCurrentId(id)} />

        {current && (
          <div className="apollo-actions" style={{ marginTop: "0.5rem" }}>
            <button
              className="btn btn-outline"
              onClick={() => store.exportMD(current.id)}
            >
              Export current as .md
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
