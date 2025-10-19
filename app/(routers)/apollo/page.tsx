"use client";
import React, { useEffect, useRef, useState } from "react";
const RS_KEY = "gaia_apollo";
const TL_KEY = "gaia_timeline";
const GAIA_PREFIXES = ["gaia_", "health", "__settings"];
function uid() {
  return String(Date.now()) + Math.random().toString(16).slice(2);
}
function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function snapshotLocalStorage() {
  const data: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (GAIA_PREFIXES.some((p) => k.startsWith(p)))
      data[k] = localStorage.getItem(k);
  }
  return {
    __meta: {
      createdAt: new Date().toISOString(),
      keys: Object.keys(data).length,
      prefixes: GAIA_PREFIXES,
    },
    data,
  };
}
function applySnapshot(obj: any) {
  if (!obj || typeof obj !== "object" || !obj.data)
    throw new Error("Invalid backup");
  const incoming = obj.data as Record<string, string | null>;
  try {
    localStorage.setItem(
      `gaia_backup_${nowStamp()}`,
      JSON.stringify(snapshotLocalStorage())
    );
  } catch {}
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (GAIA_PREFIXES.some((p) => k.startsWith(p))) toRemove.push(k);
  }
  for (const k of toRemove)
    try {
      localStorage.removeItem(k);
    } catch {}
  for (const k of Object.keys(incoming)) {
    const v = incoming[k];
    if (typeof v === "string") localStorage.setItem(k, v);
  }
  return Object.keys(incoming).length;
}
type Research = {
  id: string;
  topic: string;
  notes: string;
  sources: string[];
  createdAt: string;
};
export default function Apollo() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [sourcesText, setSourcesText] = useState("");
  const [saved, setSaved] = useState<Research[]>([]);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(RS_KEY) || "[]");
      if (Array.isArray(arr)) {
        // normalize saved entries to ensure fields exist
        const norm = arr.map(
          (x: any) =>
            ({
              id: String(x.id ?? uid()),
              topic: String(x.topic ?? "Untitled"),
              notes: String(x.notes ?? ""),
              sources: Array.isArray(x.sources) ? x.sources.map(String) : [],
              createdAt: String(x.createdAt ?? new Date().toISOString()),
            } as Research)
        );
        setSaved(norm);
      }
    } catch {}
    const SR: any =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = "en-US";
      r.onresult = (e: any) => {
        let txt = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          txt += e.results[i][0]?.transcript || "";
        }
        if (txt) setNotes((n) => (n ? n + " " : "") + txt);
      };
      r.onend = () => setListening(false);
      recRef.current = r;
    }
  }, []);
  const toggleMic = () => {
    const r = recRef.current;
    if (!r) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }
    if (listening) {
      r.stop();
      setListening(false);
    } else {
      r.start();
      setListening(true);
    }
  };
  const speak = () => {
    if (!("speechSynthesis" in window))
      return alert("SpeechSynthesis not supported.");
    const u = new SpeechSynthesisUtterance(
      (topic ? `Topic: ${topic}. ` : "") + notes.slice(0, 2400)
    );
    window.speechSynthesis.speak(u);
  };
  const save = () => {
    const srcs = sourcesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!topic && !notes && srcs.length === 0) {
      alert("Nothing to save.");
      return;
    }
    const entry: Research = {
      id: uid(),
      topic: topic || "Untitled",
      notes,
      sources: srcs,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...saved];
    setSaved(next);
    try {
      localStorage.setItem(RS_KEY, JSON.stringify(next));
    } catch {}
    setTopic("");
    setNotes("");
    setSourcesText("");
  };
  const remove = (id: string) => {
    const next = saved.filter((x) => x.id !== id);
    setSaved(next);
    try {
      localStorage.setItem(RS_KEY, JSON.stringify(next));
    } catch {}
  };
  const writeToTimeline = () => {
    const base = notes || topic;
    if (!base.trim()) {
      alert("Nothing to send to Timeline.");
      return;
    }
    const lines = base
      .split(/\n|\. /)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    const today = new Date().toISOString().slice(0, 10);
    let prev: any[] = [];
    try {
      prev = JSON.parse(localStorage.getItem(TL_KEY) || "[]");
    } catch {}
    const uid2 = () => String(Date.now()) + Math.random().toString(16).slice(2);
    const evts = lines.map((l, i) => ({
      id: uid2(),
      title: topic ? `${topic} — Part ${i + 1}` : `Note ${i + 1}`,
      date: today,
      description: l,
      category: "global",
    }));
    try {
      localStorage.setItem(TL_KEY, JSON.stringify([...evts, ...prev]));
    } catch {}
    alert(`${evts.length} event(s) appended to Timeline.`);
  };
  // Backup in-page
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const saveToDownload = () => {
    const snap = snapshotLocalStorage();
    const name = `gaia_localstorage_${nowStamp()}.json`;
    const blob = new Blob([JSON.stringify(snap, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const saveToBackups = async () => {
    try {
      setBusy(true);
    } catch {}
  };
  return (
    <main style={{ display: "grid", gap: 12 }}>
      <h2 className="text-3xl font-bold">🧠 Apollo (Research)</h2>
      <section
        className="glass"
        style={{ padding: "1rem", borderRadius: 12, display: "grid", gap: 8 }}
      >
        <input
          className="input"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <textarea
          className="input"
          rows={8}
          placeholder="Notes… (dictate with mic)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <textarea
          className="input"
          rows={3}
          placeholder="Sources (one per line)"
          value={sourcesText}
          onChange={(e) => setSourcesText(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={toggleMic}>
            {listening ? "🎙️ Stop" : "🎙️ Mic"}
          </button>
          <button className="btn" onClick={speak}>
            🔊 Speak
          </button>
          <button className="btn btn-primary" onClick={save}>
            💾 Save
          </button>
          <button className="btn btn-outline" onClick={writeToTimeline}>
            🗓️ Write to Timeline
          </button>
        </div>
      </section>
      <section className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
        <h3>Saved</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {saved.map((r) => (
            <li
              key={r.id}
              style={{
                borderTop: "1px solid rgba(255,255,255,.12)",
                padding: ".5rem 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "baseline",
                }}
              >
                <strong>{r.topic}</strong>
                <small>{new Date(r.createdAt).toLocaleString()}</small>
              </div>
              {r.sources.length > 0 && (
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                  Sources: {r.sources.join(", ")}
                </div>
              )}
              <div style={{ opacity: 0.9, whiteSpace: "pre-wrap" }}>
                {r.notes.slice(0, 480)}
                {r.notes.length > 480 ? "…" : ""}
              </div>
              <div style={{ marginTop: 6 }}>
                <button className="btn" onClick={() => remove(r.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
          {saved.length === 0 && (
            <li style={{ opacity: 0.6 }}>No research yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
