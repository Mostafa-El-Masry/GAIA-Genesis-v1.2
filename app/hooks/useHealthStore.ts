"use client";
import { useEffect, useMemo, useState } from "react";

export type HealthRecord = {
  id: string;
  ts: string;           // ISO datetime
  glucose?: number|null; // mg/dL
  insulin?: number|null; // units
  contexts?: string[];   // tags like "pre-meal","post-meal","exercise","fasting"
};

export type HealthPrefs = {
  low: number;   // target low
  high: number;  // target high
};

const STORAGE_KEY = "healthRecords";
const PREFS_KEY = "healthPrefs";

const DEFAULT_PREFS: HealthPrefs = { low: 70, high: 180 };

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function parseNumber(n: any): number|null {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

export function useHealthStore() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [prefs, setPrefs] = useState<HealthPrefs>(DEFAULT_PREFS);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRecords(raw ? JSON.parse(raw) : []);
    } catch { setRecords([]); }
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      setPrefs(raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS);
    } catch { setPrefs(DEFAULT_PREFS); }
  }, []);

  const save = (list: HealthRecord[]) => {
    setRecords(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };
  const savePrefs = (p: HealthPrefs) => {
    setPrefs(p);
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  };

  // CRUD with validation + duplicate guard
  function validate(r: HealthRecord): string | null {
    if (!r.ts) return "Missing date/time";
    if (r.glucose != null) {
      if (r.glucose < 30 || r.glucose > 800) return "Glucose out of plausible range (30–800)";
    }
    if (r.insulin != null) {
      if (r.insulin < 0 || r.insulin > 200) return "Insulin out of plausible range (0–200)";
    }
    return null;
  }

  function add(input: Omit<HealthRecord, "id">) {
    const r: HealthRecord = { id: uid(), ...input };
    const err = validate(r);
    if (err) throw new Error(err);
    const dup = records.find(x => x.ts === r.ts && x.glucose === r.glucose && x.insulin === r.insulin);
    if (dup) throw new Error("Duplicate entry detected for same timestamp/values");
    const next = [r, ...records].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    save(next);
    return r;
  }

  function update(id: string, patch: Partial<HealthRecord>) {
    const next = records.map(r => r.id === id ? { ...r, ...patch } : r);
    save(next);
  }

  function remove(id: string) {
    const next = records.filter(r => r.id !== id);
    save(next);
  }

  // Ranges
  function forLastDays(days: number) {
    const now = Date.now();
    const from = now - days*86400000;
    return records.filter(r => new Date(r.ts).getTime() >= from);
  }

  // Metrics
  const metrics = (list: HealthRecord[]) => {
    const g = list.map(r => r.glucose).filter((x): x is number => typeof x === "number");
    const avg = g.length ? (g.reduce((a,b)=>a+b,0)/g.length) : 0;
    const a1c = g.length ? (avg + 46.7) / 28.7 : 0; // NGSP formula via eAG
    const inRange = g.length ? list.filter(r => typeof r.glucose === "number" && (r.glucose as number) >= prefs.low && (r.glucose as number) <= prefs.high).length : 0;
    const tir = g.length ? (inRange / g.length) * 100 : 0;
    const lows = list.filter(r => (r.glucose ?? Infinity) < prefs.low).length;
    const highs = list.filter(r => (r.glucose ?? -Infinity) > prefs.high).length;
    return { avg, a1c, tir, lows, highs };
  };

  // CSV import/export
  function toCSV(list: HealthRecord[]) {
    const header = "date,time,glucose,insulin,contexts";
    const rows = list.map(r => {
      const d = new Date(r.ts);
      const date = d.toISOString().slice(0,10);
      const time = d.toISOString().slice(11,16);
      const ctx = (r.contexts||[]).join(";");
      return [date, time, r.glucose ?? "", r.insulin ?? "", `"${ctx}"`].join(",");
    });
    return [header, ...rows].join("\n");
  }

  async function fromCSV(text: string) {
    // expects columns: date, time, glucose, insulin, contexts
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines;
    const headers = header.split(",").map(h=>h.trim().toLowerCase());
    const idx = {
      date: headers.indexOf("date"),
      time: headers.indexOf("time"),
      glucose: headers.indexOf("glucose"),
      insulin: headers.indexOf("insulin"),
      contexts: headers.indexOf("contexts"),
    };
    const added: HealthRecord[] = [];
    for (const row of rows) {
      const cols = row.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
      const date = cols[idx.date]?.replace(/"/g,"") || "";
      const time = cols[idx.time]?.replace(/"/g,"") || "00:00";
      const ts = new Date(`${date}T${time}:00`).toISOString();
      const glucose = cols[idx.glucose] ? Number(cols[idx.glucose].replace(/"/g,"")) : null;
      const insulin = cols[idx.insulin] ? Number(cols[idx.insulin].replace(/"/g,"")) : null;
      const contexts = (cols[idx.contexts]||"").replace(/^"|"$/g,"").split(";").map(s=>s.trim()).filter(Boolean);
      try {
        const r = add({ ts, glucose: Number.isFinite(glucose as any) ? glucose : undefined, insulin: Number.isFinite(insulin as any) ? insulin : undefined, contexts });
        added.push(r);
      } catch(e) {
        // ignore duplicates/invalids
      }
    }
    return added.length;
  }

  function download(filename: string, content: string, type="text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 0);
  }

  const exportJSON = () => download("health_records.json", JSON.stringify(records, null, 2), "application/json");
  const exportCSV  = () => download("health_records.csv", toCSV(records), "text/csv");

  const importCSV = async (file: File) => {
    const text = await file.text();
    return await fromCSV(text);
  };

  return {
    records, prefs,
    add, update, remove,
    savePrefs,
    forLastDays, metrics,
    exportJSON, exportCSV, importCSV
  };
}