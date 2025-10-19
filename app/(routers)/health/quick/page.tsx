"use client";
import React, { useEffect, useMemo, useState } from "react";
type Reading = { date: string; glucose: number; insulin?: number };
export default function HealthQuick() {
  const [unit, setUnit] = useState<"mgdl" | "mmol">("mgdl");
  const [rows, setRows] = useState<Reading[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("healthRecords") || "[]");
      if (!Array.isArray(raw)) return [];
      // normalize values from storage (strings -> numbers)
      return raw.map((r: any) => ({
        date: String(r.date || ""),
        glucose: Number(r.glucose) || 0,
        insulin:
          r.insulin != null
            ? isFinite(Number(r.insulin))
              ? Number(r.insulin)
              : undefined
            : undefined,
      }));
    } catch {
      return [];
    }
  });
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("__settings") || "{}");
    if (s.glucoseUnit) setUnit(s.glucoseUnit);
  }, []);
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("__settings") || "{}");
    s.glucoseUnit = unit;
    localStorage.setItem("__settings", JSON.stringify(s));
  }, [unit]);
  const add = () => {
    const today = new Date().toISOString().slice(0, 10);
    const gStr = prompt("Glucose value");
    if (!gStr) return;
    const g = Number(gStr);
    if (!isFinite(g)) return;
    const insulinStr = prompt("Insulin (optional)");
    const insulin = insulinStr ? Number(insulinStr) : undefined;
    const mg = unit === "mmol" ? Math.round(g * 18) : g;
    const r: Reading = {
      date: today,
      glucose: Number(mg),
      insulin: isFinite(Number(insulin as any))
        ? Number(insulin as any)
        : undefined,
    };
    const next = [r, ...rows];
    setRows(next);
    localStorage.setItem("healthRecords", JSON.stringify(next));
  };
  const show = (mg: number | any) => {
    const n = Number(mg);
    if (!isFinite(n)) return "—";
    return unit === "mmol" ? (n / 18).toFixed(1) : Math.round(n).toFixed(0);
  };
  const avg = useMemo(
    () =>
      rows.length
        ? rows.reduce((a, r) => a + (r.glucose || 0), 0) / rows.length
        : 0,
    [rows]
  );
  const avg = useMemo(() => {
    if (!rows.length) return 0;
    const sum = rows.reduce(
      (a, r) => a + (isFinite(Number(r.glucose)) ? Number(r.glucose) : 0),
      0
    );
    return sum / rows.length;
  }, [rows]);
  return (
    <main style={{ display: "grid", gap: 12 }}>
      <h2 className="text-3xl font-bold">💉 Health (Quick)</h2>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}
      >
        <label>Units:</label>
        <select
          className="input"
          value={unit}
          onChange={(e) => setUnit(e.target.value as any)}
          style={{ maxWidth: 160 }}
        >
          <option value="mgdl">mg/dL</option>
          <option value="mmol">mmol/L</option>
        </select>
        <button className="btn btn-primary" onClick={add}>
          Add reading
        </button>
        <div style={{ opacity: 0.8 }}>
          Avg: <strong>{show(avg as any)}</strong>{" "}
          {unit === "mmol" ? "mmol/L" : "mg/dL"}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Glucose</th>
              <th className="p-2 border">Insulin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.date + i} className="border-t">
                <td className="p-2 border">{r.date}</td>
                <td className="p-2 border">
                  {show(r.glucose)} {unit === "mmol" ? "mmol/L" : "mg/dL"}
                </td>
                <td className="p-2 border">{r.insulin ?? "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 p-3">
                  No data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
