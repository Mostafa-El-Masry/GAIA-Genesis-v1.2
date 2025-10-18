"use client";
import React, { useRef, useState } from "react";
import "../../styles/health.css";
import { useHealthStore } from "../../hooks/useHealthStore";

export default function ImportExport() {
  const store = useHealthStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<string>("");

  const importCsv = async (f: File) => {
    const n = await store.importCSV(f);
    setResult(`Imported ${n} rows (duplicates/invalid ignored).`);
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Import / Export</h3>
      <div className="controls">
        <button className="btn btn-outline" onClick={store.exportJSON}>Export JSON</button>
        <button className="btn btn-outline" onClick={store.exportCSV}>Export CSV</button>
        <input
          type="file"
          accept=".csv,text/csv"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importCsv(f); }}
        />
        <button className="btn btn-primary" onClick={()=>fileRef.current?.click()}>Import CSV</button>
      </div>
      {result && <p style={{ marginTop: "0.5rem" }}>{result}</p>}
      <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>CSV columns: <code>date,time,glucose,insulin,contexts</code>. Contexts separated by <code>;</code>.</p>
    </div>
  );
}