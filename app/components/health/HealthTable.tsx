"use client";
import React, { useMemo, useState } from "react";
import "../../styles/health.css";
import { useHealthStore } from "../../hooks/useHealthStore";

const ALL_CTX = ["pre-meal","post-meal","exercise","fasting","other"];

export default function HealthTable() {
  const store = useHealthStore();
  const [ctxFilter, setCtxFilter] = useState<string[]>([]);

  const rows = useMemo(() => {
    let list = store.records;
    if (ctxFilter.length) {
      list = list.filter(r => (r.contexts||[]).some(c => ctxFilter.includes(c)));
    }
    return list;
  }, [store.records, ctxFilter]);

  const toggle = (c: string) => {
    setCtxFilter(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]);
  };

  const del = (id: string) => {
    if (confirm("Delete entry?")) store.remove(id);
  };

  return (
    <div className="table-box">
      <h3 style={{ marginTop: 0 }}>Records</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        {ALL_CTX.map(c => (
          <button key={c} className={`btn btn-outline ${ctxFilter.includes(c)?"active":""}`} onClick={()=>toggle(c)}>{c}</button>
        ))}
        {!!ctxFilter.length && <button className="btn btn-outline" onClick={()=>setCtxFilter([])}>Clear</button>}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Glucose</th>
            <th>Insulin</th>
            <th>Contexts</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const d = new Date(r.ts);
            const cls = (typeof r.glucose === "number")
              ? (r.glucose > store.prefs.high ? "row-high" : (r.glucose < store.prefs.low ? "row-low" : ""))
              : "";
            return (
              <tr key={r.id} className={cls}>
                <td>{d.toLocaleString()}</td>
                <td>{r.glucose ?? "-"}</td>
                <td>{r.insulin ?? "-"}</td>
                <td>{(r.contexts||[]).map(c => <span key={c} className="badge">{c}</span>)}</td>
                <td><button className="btn btn-outline" onClick={()=>del(r.id)}>Delete</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}