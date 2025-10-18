"use client";
import React, { useEffect, useState } from "react";
import "../styles/glacium.css";
import GlassCard from "../components/GlassCard";

type Finance = { type: string; amount: number; category: string };
type Health = { glucose: number; insulin: number; date: string };
type Certificate = {
  id: string; title: string; currency: string; principal: number;
  rateAPR: number; startDate: string; endDate: string; payoutDay: number;
};

function monthRate(apr:number){ return apr/100/12; }
function nextPayout(cert: Certificate){
  const payoutDay = Math.min(28, Math.max(1, Number(cert.payoutDay||15)));
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const today = new Date(y, m, now.getDate());
  // Generate next two months to find next date >= today
  for (let k=0; k<24; k++){
    const ym = new Date(y, m + k, 1);
    const d = new Date(ym.getFullYear(), ym.getMonth(), Math.min(payoutDay, new Date(ym.getFullYear(), ym.getMonth()+1, 0).getDate()));
    if (d >= today && d >= new Date(cert.startDate) && d <= new Date(cert.endDate)){
      return { date: d.toISOString().slice(0,10), amount: cert.principal*monthRate(cert.rateAPR), currency: cert.currency };
    }
  }
  return null;
}

const DashboardPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [avgGlucose, setAvgGlucose] = useState<number>(0);
  const [apolloNotes, setApolloNotes] = useState<number>(0);
  const [galleryItems, setGalleryItems] = useState<number>(0);
  const [certCount, setCertCount] = useState<number>(0);
  const [nextCert, setNextCert] = useState<string>("");

  useEffect(() => {
    // Finance summary
    const finances: Finance[] = JSON.parse(localStorage.getItem("gaia_finances") || "[]");
    const income = finances.filter((f) => f.type === "income").reduce((a, b) => a + Number(b.amount||0), 0);
    const expense = finances.filter((f) => f.type === "expense").reduce((a, b) => a + Number(b.amount||0), 0);
    setBalance(income - expense);

    // Health average glucose
    const records: Health[] = JSON.parse(localStorage.getItem("healthRecords") || "[]");
    if (records.length > 0) {
      const avg = records.reduce((a, b) => a + Number(b.glucose||0), 0) / records.length;
      setAvgGlucose(Math.round(avg));
    } else {
      setAvgGlucose(0);
    }

    // Apollo note count
    const notes = JSON.parse(localStorage.getItem("gaia_apollo") || "[]");
    setApolloNotes(Array.isArray(notes) ? notes.length : (Array.isArray(notes?.items) ? notes.items.length : 0));

    // Gallery count
    const gallery = JSON.parse(localStorage.getItem("gallery_meta") || "[]");
    setGalleryItems(Array.isArray(gallery) ? gallery.length : (Array.isArray(gallery?.items) ? gallery.items.length : 0));

    // Certificates
    const certs: Certificate[] = JSON.parse(localStorage.getItem("gaia_certificates") || "[]");
    const list = Array.isArray(certs) ? certs : (Array.isArray((certs as any)?.items) ? (certs as any).items : []);
    setCertCount(list.length);
    // Compute nearest next payout across all
    let nearest: {date:string, amount:number, currency:string} | null = null;
    for (const c of list){
      const n = nextPayout(c);
      if (n){
        if (!nearest || new Date(n.date) < new Date(nearest.date)) nearest = n;
      }
    }
    setNextCert(nearest ? `${nearest.date} • ${nearest.amount.toFixed(2)} ${nearest.currency}` : "—");
  }, []);

  return (
    <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
      <GlassCard title="Wealth Balance" value={`${balance.toLocaleString()} (net)`} link="/WealthTracker" />
      <GlassCard title="Certificates" value={`${certCount} active • Next ${nextCert}`} link="/WealthTracker/certificates" />
      <GlassCard title="Avg Glucose" value={`${avgGlucose} mg/dL`} link="/Healthtracker" />
      <GlassCard title="Apollo Notes" value={`${apolloNotes} entries`} link="/Apollo" />
      <GlassCard title="Gallery Items" value={`${galleryItems}`} link="/Gallery" />
    </main>
  );
};

export default DashboardPage;
