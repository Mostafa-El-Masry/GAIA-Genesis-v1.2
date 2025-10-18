"use client";
import React, { useState } from "react";
import { Currency } from "./CertificateTypes";
import { useCertificates } from "../../hooks/useCertificates";

export default function CertificateForm() {
  const { upsert } = useCertificates();
  const [title, setTitle] = useState("Savings Certificate");
  const [currency, setCurrency] = useState<Currency>("KWD");
  const [principal, setPrincipal] = useState<number>(0);
  const [rateAPR, setRateAPR] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [payoutDay, setPayoutDay] = useState<number>(15);

  const submit = () => {
    if (!startDate || !endDate) return;
    upsert({ title, currency, principal, rateAPR, startDate, endDate, payoutDay });
    // reset a bit (keep currency)
    setTitle("Savings Certificate");
    setPrincipal(0);
    setRateAPR(0);
    setStartDate("");
    setEndDate("");
    setPayoutDay(15);
  };

  return (
    <div className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
      <h3 style={{ marginBottom: ".5rem" }}>Create Certificate</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem" }}>
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
          {["KWD","EGP","USD","EUR","SAR","AED","QAR"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input className="input" type="number" placeholder="Principal" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
        <input className="input" type="number" placeholder="Rate APR %" value={rateAPR} onChange={(e) => setRateAPR(Number(e.target.value))} />
        <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <input className="input" type="number" min={1} max={28} value={payoutDay} onChange={(e) => setPayoutDay(Math.max(1, Math.min(28, Number(e.target.value))))} placeholder="Payout day (1-28)" />
      </div>
      <div style={{ marginTop: ".75rem", display: "flex", gap: ".5rem" }}>
        <button className="btn btn-primary" onClick={submit}>Add</button>
        <button className="btn btn-outline" onClick={() => {
          setTitle("Savings Certificate");
          setPrincipal(0);
          setRateAPR(0);
          setStartDate("");
          setEndDate("");
          setPayoutDay(15);
        }}>Reset</button>
      </div>
    </div>
  );
}
