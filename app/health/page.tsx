"use client";
import React, { useMemo } from "react";
import "../styles/health.css";
import ThresholdsPanel from "../components/health/ThresholdsPanel";
import NewEntryForm from "../components/health/NewEntryForm";
import ImportExport from "../components/health/ImportExport";
import { useHealthStore } from "../hooks/useHealthStore";
import HealthCharts from "../components/health/HealthCharts";
import HealthTable from "../components/health/HealthTable";

export default function HealthPage() {
  const store = useHealthStore();

  const last30 = useMemo(() => store.forLastDays(30), [store.records]);
  const m = useMemo(() => store.metrics(last30), [last30, store.prefs]);

  return (
    <main className="health-wrap">
      <aside className="health-sidebar">
        <NewEntryForm />
        <ThresholdsPanel />
        <ImportExport />
      </aside>

      <section
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <div className="summary-cards">
          <div className="card">
            <div style={{ opacity: 0.8 }}>Avg Glucose (30d)</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {Math.round(m.avg) || "—"}{" "}
              <span style={{ fontSize: "0.9rem" }}>mg/dL</span>
            </div>
          </div>
          <div className="card">
            <div style={{ opacity: 0.8 }}>Estimated A1C</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {m.a1c ? m.a1c.toFixed(1) : "—"}{" "}
              <span style={{ fontSize: "0.9rem" }}>%</span>
            </div>
          </div>
          <div className="card">
            <div style={{ opacity: 0.8 }}>Time In Range</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {m.tir ? m.tir.toFixed(0) : 0}%
            </div>
          </div>
          <div className="card">
            <div style={{ opacity: 0.8 }}>High / Low (30d)</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {m.highs} high · {m.lows} low
            </div>
          </div>
        </div>

        <HealthCharts />

        <HealthTable />
      </section>
    </main>
  );
}
