"use client";
import React, { useState } from "react";
import "../../styles/health.css";
import { useHealthStore } from "../../hooks/useHealthStore";

const CONTEXTS = ["pre-meal", "post-meal", "exercise", "fasting", "other"] as const;

export default function NewEntryForm() {
  const store = useHealthStore();
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [time, setTime] = useState<string>(() => new Date().toISOString().slice(11,16));
  const [glucose, setGlucose] = useState<string>("");
  const [insulin, setInsulin] = useState<string>("");
  const [contexts, setContexts] = useState<string[]>([]);
  const [err, setErr] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  const toggleCtx = (c: string) => {
    setContexts((prev) => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]);
  };

  const submit = () => {
    setErr(""); setOk("");
    const ts = new Date(`${date}T${time}:00`).toISOString();
    const g = glucose.trim() ? Number(glucose) : null;
    const i = insulin.trim() ? Number(insulin) : null;
    try {
      store.add({ ts, glucose: g ?? undefined, insulin: i ?? undefined, contexts });
      setOk("Saved");
      setGlucose(""); setInsulin(""); setContexts([]);
    } catch (e:any) {
      setErr(e.message || "Failed to save");
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>New Entry</h3>
      <div className="controls">
        <input className="input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <input className="input" type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
        <input className="input" type="number" placeholder="Glucose (mg/dL)" value={glucose} onChange={(e)=>setGlucose(e.target.value)} />
        <input className="input" type="number" placeholder="Insulin (units)" value={insulin} onChange={(e)=>setInsulin(e.target.value)} />
      </div>
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {CONTEXTS.map(c => (
          <button key={c} className={`btn btn-outline ${contexts.includes(c)?"active":""}`} onClick={()=>toggleCtx(c)}>{c}</button>
        ))}
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button className="btn btn-primary" onClick={submit}>Add</button>
        {err && <span className="row-high">{err}</span>}
        {ok && <span style={{ color: "var(--success)" }}>{ok}</span>}
      </div>
    </div>
  );
}