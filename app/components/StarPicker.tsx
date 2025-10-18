"use client";
import React, { useMemo, useState } from "react";
import "../styles/glacium.css";

export default function StarPicker({
  value,
  onChange,
  suggestions = [],
  placeholder = "Type a star/actor and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = (t: string) => {
    const star = t.trim();
    if (!star) return;
    if (value.includes(star)) return;
    onChange([...value, star]);
    setInput("");
  };

  const remove = (star: string) => onChange(value.filter((x) => x !== star));

  const filtered = useMemo(
    () => suggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0, 8),
    [input, suggestions, value]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
        {value.map((s) => (
          <span key={s} className="glass" style={{ padding: ".25rem .5rem", borderRadius: 999 }}>
            {s}{" "}
            <button
              onClick={() => remove(s)}
              style={{ marginLeft: 6, background: "transparent", border: 0, cursor: "pointer" }}
              aria-label={`Remove ${s}`}
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
