"use client";
import React, { useMemo, useState } from "react";
import "../styles/glacium.css";

export default function TagPicker({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add tag and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = (t: string) => {
    const tag = t.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
    setInput("");
  };

  const remove = (tag: string) => onChange(value.filter((x) => x !== tag));

  const filtered = useMemo(
    () =>
      suggestions
        .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
        .slice(0, 8),
    [input, suggestions, value]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
        {value.map((t) => (
          <span key={t} className="glass" style={{ padding: ".25rem .5rem", borderRadius: 999 }}>
            {t}{" "}
            <button
              onClick={() => remove(t)}
              style={{ marginLeft: 6, background: "transparent", border: 0, cursor: "pointer" }}
              aria-label={`Remove ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="input"
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(input);
          }
        }}
      />
      {filtered.length > 0 && (
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {filtered.map((s) => (
            <button key={s} className="btn btn-outline" onClick={() => add(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
