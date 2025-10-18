"use client";
import React, { useEffect, useMemo, useRef } from "react";
import "../../styles/wealth.css";
import { useWealthPlanner } from "../../hooks/useWealthPlanner";

function number(n:number, unit:string) {
  return `${n.toLocaleString()} ${unit}`;
}

function drawProjection(canvas: HTMLCanvasElement, series: {x:number,y:number}[]) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = 260;
  ctx.clearRect(0,0,W,H);

  if (!series.length) return;
  const xs = series.map(p=>p.x), ys = series.map(p=>p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const xToPx = (x:number) => 40 + ((x - minX)/(maxX - minX || 1)) * (W - 60);
  const yToPx = (y:number) => H - ((y - minY)/(maxY - minY || 1)) * (H - 40) - 20;

  // Axis
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, H-20); ctx.lineTo(W-10, H-20); ctx.stroke();

  // Line
  ctx.strokeStyle = "rgba(112, 232, 139, 1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  series.forEach((p,i) => {
    const x = xToPx(p.x), y = yToPx(p.y);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

export default function WealthPlanner() {
  const planner = useWealthPlanner();

  const projRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!projRef.current) return;
    const series = planner.projection.map(p => ({ x: p.month, y: p.balance }));
    drawProjection(projRef.current, series);
  }, [planner.projection]);

  const unit = planner.inputs.currency;
  const fixed = planner.inputs.fixed;

  return (
    <div className="wealth-wrap">
      {/* Sidebar: Inputs */}
      <aside className="panel" style={{ position: "sticky", top: 80, height: "fit-content" }}>
        <h3 style={{ marginTop: 0 }}>Planner Inputs</h3>
        <div className="inputs-grid">
          <label>Currency
            <input className="input" value={planner.inputs.currency} onChange={(e)=>planner.setInputs({...planner.inputs, currency: e.target.value})} />
          </label>
          <label>Monthly Income
            <input className="input" type="number" value={planner.inputs.monthlyIncome} onChange={(e)=>planner.setInputs({...planner.inputs, monthlyIncome: Number(e.target.value)})} />
          </label>
          <label>Starting Principal
            <input className="input" type="number" value={planner.inputs.startingPrincipal} onChange={(e)=>planner.setInputs({...planner.inputs, startingPrincipal: Number(e.target.value)})} />
          </label>
          <label>Current Age
            <input className="input" type="number" value={planner.inputs.age} onChange={(e)=>planner.setInputs({...planner.inputs, age: Number(e.target.value)})} />
          </label>
          <label>First-Year Rate (%)
            <input className="input" type="number" value={planner.inputs.firstYearRate} onChange={(e)=>planner.setInputs({...planner.inputs, firstYearRate: Number(e.target.value)})} />
          </label>
          <label>Horizon (months)
            <input className="input" type="number" value={planner.inputs.horizonMonths} onChange={(e)=>planner.setInputs({...planner.inputs, horizonMonths: Number(e.target.value)})} />
          </label>
          <label className="panel" style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Fixed Expenses</div>
            <div className="inputs-grid">
              <label>Rent <input className="input" type="number" value={fixed.rent} onChange={(e)=>planner.setInputs({...planner.inputs, fixed:{...fixed, rent: Number(e.target.value)}})} /></label>
              <label>Mobile <input className="input" type="number" value={fixed.mobile} onChange={(e)=>planner.setInputs({...planner.inputs, fixed:{...fixed, mobile: Number(e.target.value)}})} /></label>
              <label>Utilities & Misc <input className="input" type="number" value={fixed.utilities} onChange={(e)=>planner.setInputs({...planner.inputs, fixed:{...fixed, utilities: Number(e.target.value)}})} /></label>
              <label>Food (min) <input className="input" type="number" value={fixed.foodMin} onChange={(e)=>planner.setInputs({...planner.inputs, fixed:{...fixed, foodMin: Number(e.target.value)}})} /></label>
              <label>Transport <input className="input" type="number" value={fixed.transport} onChange={(e)=>planner.setInputs({...planner.inputs, fixed:{...fixed, transport: Number(e.target.value)}})} /></label>
              <label>Remittance <input className="input" type="number" value={fixed.remittance} onChange={(e)=>planner.setInputs({...planner.inputs, fixed:{...fixed, remittance: Number(e.target.value)}})} /></label>
            </div>
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={planner.inputs.reinvestInterest} onChange={(e)=>planner.setInputs({...planner.inputs, reinvestInterest: e.target.checked})} />
              <span>Reinvest interest (compound monthly)</span>
            </div>
          </label>
        </div>
        <div style={{ marginTop: "0.75rem", fontSize: "0.95rem" }}>
          <div>Total fixed expenses: <strong>{number(planner.fixedTotal, unit)}</strong></div>
          <div>Max feasible savings (if no discretionary): <strong>{number(planner.feasibleMaxSave, unit)}</strong></div>
        </div>
      </aside>

      {/* Main content */}
      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="summary-cards">
          <div className="card">
            <div style={{ opacity: 0.8 }}>Recommended Level</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>#{planner.recommended.level} {planner.recommended.label}</div>
          </div>
          <div className="card">
            <div style={{ opacity: 0.8 }}>Should Save / mo</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{number(planner.recommended.savePerMonth, unit)}</div>
          </div>
          <div className="card">
            <div style={{ opacity: 0.8 }}>Max Expenses / mo</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{number(planner.recommended.expenseCap, unit)}</div>
          </div>
          <div className="card">
            <div style={{ opacity: 0.8 }}>Horizon</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{planner.inputs.horizonMonths} months</div>
          </div>
        </div>

        {/* Stage Ladder */}
        <div className="table-box">
          <h3 style={{ marginTop: 0 }}>10 Levels (Poor → Wealthy)</h3>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Stage</th>
                <th>Save / mo</th>
                <th>Expense Cap / mo</th>
                <th>Feasible?</th>
              </tr>
            </thead>
            <tbody>
              {planner.stages.map((s) => (
                <tr key={s.level}>
                  <td>{s.level}</td>
                  <td>{s.label}</td>
                  <td>{number(s.savePerMonth, unit)}</td>
                  <td>{number(s.expenseCap, unit)}</td>
                  <td>{s.feasible ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Projection */}
        <div className="chart-box">
          <h3 style={{ marginTop: 0 }}>Projected Balance (with monthly compounding & declining rate)</h3>
          <canvas ref={projRef} style={{ width: "100%", height: 260 }} />
          <div style={{ opacity: 0.8, fontSize: "0.9rem", marginTop: 6 }}>
            Rate path: first year {planner.inputs.firstYearRate}% APR, drops by 1% each year to a 10% floor; interest applied monthly.
          </div>
        </div>

        {/* Budget Envelope */}
        <div className="table-box">
          <h3 style={{ marginTop: 0 }}>Income & Expense Envelope (Recommended Level)</h3>
          <table className="table">
            <tbody>
              <tr><th>Monthly Income</th><td>{number(planner.inputs.monthlyIncome, unit)}</td></tr>
              <tr><th>Should Save (target)</th><td>{number(planner.recommended.savePerMonth, unit)}</td></tr>
              <tr><th>Max Expenses (cap)</th><td>{number(planner.recommended.expenseCap, unit)}</td></tr>
              <tr><th>Fixed Essentials (sum)</th><td>{number(planner.fixedTotal, unit)}</td></tr>
              <tr><th>Discretionary (cap - fixed)</th><td>{number(Math.max(planner.recommended.expenseCap - planner.fixedTotal, 0), unit)}</td></tr>
            </tbody>
          </table>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            Fixed Essentials default to your notes: Rent 40, Mobile 22, Utilities 27, Food ≥ 30 (cannot go lower), Transport 15, Remittance 80.
            Adjust any amounts above to see new targets immediately.
          </p>
        </div>

      </section>
    </div>
  );
}