"use client";
import React, { useState } from "react";
import "../../styles/health.css";
import { useHealthStore } from "../../hooks/useHealthStore";

export default function ThresholdsPanel() {
  const store = useHealthStore();
  const [low, setLow] = useState<number>(store.prefs.low);
  const [high, setHigh] = useState<number>(store.prefs.high);

  const save = () => {
    const l = Math.max(30, Math.min(150, Number(low)));
    const h = Math.max(120, Math.min(300, Number(high)));
    store.savePrefs({ low: l, high: h });
    alert("Thresholds saved");
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Thresholds</h3>
      <div className="controls">
        <label>Low (mg/dL) <input className="input" type="number" value={low} onChange={(e)=>setLow(Number(e.target.value))} /></label>
        <label>High (mg/dL) <input className="input" type="number" value={high} onChange={(e)=>setHigh(Number(e.target.value))} /></label>
        <button className="btn btn-outline" onClick={save}>Save</button>
      </div>
      <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>Rows below low appear bluish; rows above high appear reddish; charts shade the target band.</p>
    </div>
  );
}