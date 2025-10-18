"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/health.css";
import { useHealthStore } from "../../hooks/useHealthStore";

type Range = 30 | 90;

function drawLineChart(canvas: HTMLCanvasElement, data: {x:number,y:number}[], opts: {low:number; high:number; min:number; max:number;}) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = 260;

  ctx.clearRect(0,0,W,H);

  // Target band
  const yToPx = (v:number) => H - ((v-opts.min)/(opts.max-opts.min))*H;
  ctx.fillStyle = "rgba(112, 232, 139, 0.18)";
  const yLow = yToPx(opts.low);
  const yHigh = yToPx(opts.high);
  ctx.fillRect(0, yHigh, W, yLow - yHigh);

  // Axis
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, H-20); ctx.lineTo(W-10, H-20); ctx.stroke();

  // Line
  if (!data.length) return;
  const xs = data.map(d => d.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const xToPx = (x:number) => 40 + ((x - minX)/(maxX - minX || 1)) * (W - 60);

  ctx.strokeStyle = "rgba(108, 202, 255, 1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d,i) => {
    const x = xToPx(d.x);
    const y = yToPx(d.y);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

function drawBarChart(canvas: HTMLCanvasElement, data: {label:string,value:number}[], opts: {band?:[number,number]}={}) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = 260;

  ctx.clearRect(0,0,W,H);

  const max = Math.max(1, ...data.map(d => d.value));
  const barW = Math.max(8, (W - 40) / data.length - 8);

  // Target band shading for daily avg
  if (opts.band) {
    ctx.fillStyle = "rgba(112, 232, 139, 0.18)";
    const yToPx = (v:number) => H - ((v/max)* (H-40)) - 20;
    const yHigh = yToPx(opts.band[1]);
    const yLow = yToPx(opts.band[0]);
    ctx.fillRect(40, yHigh, W-60, yLow - yHigh);
  }

  // Axis
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, H-20); ctx.lineTo(W-10, H-20); ctx.stroke();

  // Bars
  data.forEach((d, i) => {
    const x = 40 + i * (barW + 8);
    const h = ((d.value)/max) * (H - 40);
    ctx.fillStyle = "rgba(168, 176, 255, 0.9)";
    ctx.fillRect(x, H - 20 - h, barW, h);
  });
}

export default function HealthCharts() {
  const store = useHealthStore();
  const [range, setRange] = useState<Range>(30);

  const list = useMemo(() => store.forLastDays(range), [store.records, range]);
  const glucoseSeries = useMemo(() => {
    return list
      .filter(r => typeof r.glucose === "number")
      .map(r => ({ x: new Date(r.ts).getTime(), y: r.glucose as number }))
      .sort((a,b)=>a.x-b.x);
  }, [list]);

  const dailyAvg = useMemo(() => {
    const byDay = new Map<string, number[]>();
    list.forEach(r => {
      if (typeof r.glucose !== "number") return;
      const day = r.ts.slice(0,10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(r.glucose as number);
    });
    return Array.from(byDay.entries())
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([day, arr]) => ({ label: day.slice(5), value: arr.reduce((x,y)=>x+y,0)/arr.length }));
  }, [list]);

  const insulinPerDay = useMemo(() => {
    const byDay = new Map<string, number>();
    list.forEach(r => {
      if (typeof r.insulin !== "number") return;
      const day = r.ts.slice(0,10);
      byDay.set(day, (byDay.get(day)||0) + (r.insulin as number));
    });
    return Array.from(byDay.entries())
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([day, val]) => ({ label: day.slice(5), value: val }));
  }, [list]);

  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const bar1Ref = useRef<HTMLCanvasElement | null>(null);
  const bar2Ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (lineRef.current) {
      const min = Math.min(store.prefs.low - 40, ...glucoseSeries.map(d=>d.y));
      const max = Math.max(store.prefs.high + 40, ...glucoseSeries.map(d=>d.y));
      drawLineChart(lineRef.current, glucoseSeries, { low: store.prefs.low, high: store.prefs.high, min: Math.max(30, min), max: Math.min(400, max) });
    }
    if (bar1Ref.current) drawBarChart(bar1Ref.current, dailyAvg, { band: [store.prefs.low, store.prefs.high] });
    if (bar2Ref.current) drawBarChart(bar2Ref.current, insulinPerDay);
  }, [glucoseSeries, dailyAvg, insulinPerDay, store.prefs.low, store.prefs.high, range]);

  return (
    <div className="health-charts">
      <div className="controls" style={{ justifyContent: "flex-end" }}>
        <span>Range:</span>
        <button className={`btn btn-outline ${range===30?"active":""}`} onClick={()=>setRange(30)}>30d</button>
        <button className={`btn btn-outline ${range===90?"active":""}`} onClick={()=>setRange(90)}>90d</button>
      </div>

      <div className="chart-box">
        <h3 style={{ marginTop: 0 }}>Glucose Over Time</h3>
        <canvas ref={lineRef} style={{ width: "100%", height: 260 }} />
      </div>

      <div className="chart-box">
        <h3 style={{ marginTop: 0 }}>Daily Average Glucose</h3>
        <canvas ref={bar1Ref} style={{ width: "100%", height: 260 }} />
      </div>

      <div className="chart-box">
        <h3 style={{ marginTop: 0 }}>Insulin Units Per Day</h3>
        <canvas ref={bar2Ref} style={{ width: "100%", height: 260 }} />
      </div>
    </div>
  );
}