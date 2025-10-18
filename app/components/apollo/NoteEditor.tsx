"use client";
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/apollo.css";
import { ApolloNote, ModuleRef, useApolloStore } from "../../hooks/useApolloStore";
import { mdToHtml } from "../../utils/markdown";

type Props = {
  note: ApolloNote;
  onChange: (n: ApolloNote)=>void;
  onSave: ()=>void;
  onDelete: ()=>void;
};

export default function NoteEditor({ note, onChange, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content_md);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content_md);
  }, [note.id]);

  const tags = note.tags || [];
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const nt = Array.from(new Set([...(tags||[]), t]));
    onChange({ ...note, tags: nt });
    setTagInput("");
  };
  const removeTag = (t: string) => {
    onChange({ ...note, tags: (tags||[]).filter(x => x !== t) });
  };

  const previewHtml = useMemo(() => mdToHtml(content), [content]);

  return (
    <div className="apollo-editor">
      <div className="apollo-pane">
        <input
          value={title}
          onChange={(e)=>{ setTitle(e.target.value); onChange({ ...note, title: e.target.value }); }}
          placeholder="Note title"
          className="input"
          style={{ marginBottom: "0.5rem" }}
        />
        <textarea
          value={content}
          onChange={(e)=>{ setContent(e.target.value); onChange({ ...note, content_md: e.target.value }); }}
          placeholder="Write in Markdown…  # headings, *italic*, **bold**, `code`, - [ ] checklist, [[Links]]"
          className="input"
          style={{ minHeight: 260 }}
        />
        <div className="apollo-tags">
          {tags.map(t => (
            <span key={t} className="tag-chip">
              {t} <button onClick={()=>removeTag(t)} style={{ marginLeft: 6, background:"transparent", border:"none", color:"inherit", cursor:"pointer" }}>×</button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e)=>setTagInput(e.target.value)}
            placeholder="Add tag and press Enter"
            className="input"
            style={{ maxWidth: 200 }}
            onKeyDown={(e)=>{ if (e.key === "Enter") addTag(); }}
          />
          <button className="btn btn-outline" onClick={addTag}>Add Tag</button>
        </div>

        <div className="apollo-actions" style={{ marginTop: "0.75rem" }}>
          <button className="btn btn-primary" onClick={onSave}>Save</button>
          <button className="btn btn-outline" onClick={onDelete}>Delete</button>
        </div>
        <div className="apollo-meta" style={{ marginTop: "0.5rem" }}>
          <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
          {" · "}
          <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="apollo-preview">
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  );
}