"use client";
import React from "react";
import "../../styles/apollo-log.css";

type WeekRow = { week: string; module: string; dates: string; delivered: string[]; notes?: string };

const WEEKS: WeekRow[] = [
  { week: "Week 1", module: "AF1 Glacium Theme", dates: "Nov 17 – Nov 23, 2025",
    delivered: [
      "Fixed glass TopNav (global) with active-route highlight",
      "ThemeProvider (light/dark) + tokenized glacium.css",
      "GlassCard, buttons, inputs, grid utilities"
    ],
    notes: "Foundation for consistent UX across all modules."
  },
  { week: "Week 2", module: "Dashboard", dates: "Nov 24 – Nov 30, 2025",
    delivered: [
      "Hero + quick nav tiles to Gallery / Apollo / Health / Wealth",
      "Stats cards scaffold",
      "Ensured TopNav is fixed in all views"
    ],
    notes: "Kept to one-week scope; leaves room for data wiring later."
  },
  { week: "Week 3", module: "Gallery (Images + Video)", dates: "Dec 1 – Dec 7, 2025",
    delivered: [
      "Two views for images: slideshow and responsive 5-column grid (desktop)",
      "Separate ImageGallery and VideoGallery components",
      "Video top player + hover thumbnails; supports asset screenshots *_001…006"
    ],
    notes: "Structure favors future performance tweaks and asset pipelines."
  },
  { week: "Week 4", module: "Apollo", dates: "Dec 8 – Dec 14, 2025",
    delivered: [
      "Markdown editor + live preview; [[Wiki Links]]",
      "Backlinks and lightweight Graph view",
      "Search operators: title:, content:, tag:, before:, after:",
      "Daily note & exports (JSON/Markdown)"
    ],
    notes: "Local-first knowledge with automatic backlinks."
  },
  { week: "Week 5", module: "Health Tracker", dates: "Dec 15 – Dec 21, 2025",
    delivered: [
      "Local store; validation + duplicate guard",
      "Metrics: Avg, A1C (eAG), Time-In-Range, High/Low counts",
      "Charts: glucose line, daily avg bar (target band), insulin/day",
      "CSV import/export & thresholds panel"
    ],
    notes: "All client-side, fast iteration."
  },
  { week: "Week 6", module: "Wealth Tracker (KD)", dates: "Dec 22 – Dec 28, 2025",
    delivered: [
      "10-level ladder (Poor → Wealthy) driven by both savings rate and current wealth",
      "Effective income = salary + monthly interest (if chosen)",
      "Declining APR (16% → 10% floor) monthly; projection chart",
      "Income & Expense envelope: should-save, max-spend, fixed, discretionary"
    ],
    notes: "Interest-mode toggle: Add to income vs Reinvest (compound)."
  },
];

export default function ReleaseLog() {
  return (
    <div className="log-wrap">
      <section className="log-hero">
        <span className="blue-badge">LOG · Phase 2 · v1.1</span>
        <h1 style={{ margin: 0 }}>GAIA: Genesis — Apollo Release Log</h1>
        <p className="small">
          One-week rhythm per component. This log summarizes what we shipped together — your ideas + my implementation — and sets the direction for the next phase.
        </p>
        <div className="kv">
          <div>Phase</div><div>Phase 2</div>
          <div>Version</div><div>v1.1</div>
          <div>Window</div><div>Nov 17 – Dec 28, 2025 (6 weeks)</div>
          <div>Cadence</div><div>1 module per week</div>
        </div>
      </section>

      <section className="block">
        <div className="section-title"><span className="dot" />What we built (by week)</div>
        <table className="log-table" style={{ marginTop: ".6rem" }}>
          <thead>
            <tr>
              <th style={{ width: 110 }}>Week</th>
              <th style={{ width: 220 }}>Module</th>
              <th style={{ width: 220 }}>Dates</th>
              <th>Highlights</th>
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((w) => (
              <tr key={w.week}>
                <td>{w.week}</td>
                <td>{w.module}</td>
                <td>{w.dates}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {w.delivered.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                  {w.notes && <div className="muted" style={{ marginTop: ".35rem" }}>{w.notes}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="block">
        <div className="section-title"><span className="dot" />Short weekly notes</div>
        <ul style={{ margin: ".5rem 0 0 1.1rem" }}>
          <li><strong>Theme & Nav:</strong> We locked a fixed glass TopNav and tokens so all scenes feel cohesive.</li>
          <li><strong>Performance:</strong> Client-first, zero backends; canvas charts for snappy visuals.</li>
          <li><strong>Separation of concerns:</strong> Gallery split (images vs video), Apollo structure anticipates cross-links.</li>
          <li><strong>Financial realism:</strong> KD currency, interest-mode toggle, feasibility checks vs essentials.</li>
        </ul>
      </section>

      <section className="block">
        <div className="section-title"><span className="dot" />Vision & next steps</div>
        <p className="small">
          We’ve established a consistent design system (Glacium), a clear navigation spine, and functional modules (Gallery, Apollo, Health, Wealth). The vision is a practical, modular GAIA workspace.
        </p>
        <ul style={{ margin: ".4rem 0 0 1.1rem" }}>
          <li><strong>What we achieved:</strong> End‑to‑end skeleton + real features in each module; local-first data; extensible patterns.</li>
          <li><strong>What’s next:</strong> In the next phase, we will focus on <em>more functionality</em> — even if manual — rather than automating what exists. Examples: richer Apollo graph tools, Health time-of-day analytics, Wealth goal tracking, Gallery tagging.</li>
          <li><strong>Continuous process:</strong> This log will keep growing at the end of each phase; we’ll add decisions, tradeoffs, and links to relevant notes.</li>
        </ul>
      </section>
    </div>
  );
}