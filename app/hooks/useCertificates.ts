"use client";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "./useStorage";

export type Currency = "KWD" | "EGP" | "USD" | "EUR" | "SAR" | "AED" | "QAR";
export type Compounding = "simple" | "monthly";

export type Certificate = {
  id: string;
  title: string;
  currency: Currency;
  principal: number;
  rateAPR: number; // e.g. 10 for 10% annual
  compounding?: Compounding; // default simple (monthly interest payout, principal constant)
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;   // ISO date YYYY-MM-DD
  payoutDay: number; // 1..28 typically (we'll clamp to month length)
  createdAt: string;
  updatedAt: string;
};

export type ScheduleItem = {
  date: string;           // YYYY-MM-DD (payout day)
  expectedAmount: number; // monthly interest expected
  status: "past" | "due" | "upcoming";
};

const KEY = "gaia_certificates";

function migrate(x: any): Certificate[] {
  const arr = Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];
  return arr.map((c: any) => ({
    id: String(c.id ?? crypto.randomUUID()),
    title: String(c.title ?? "Certificate"),
    currency: (c.currency ?? "KWD") as Currency,
    principal: Number(c.principal ?? 0),
    rateAPR: Number(c.rateAPR ?? 0),
    compounding: (c.compounding ?? "simple") as Compounding,
    startDate: String(c.startDate ?? new Date().toISOString().slice(0,10)),
    endDate: String(c.endDate ?? new Date().toISOString().slice(0,10)),
    payoutDay: Number(c.payoutDay ?? 15),
    createdAt: String(c.createdAt ?? new Date().toISOString()),
    updatedAt: String(c.updatedAt ?? new Date().toISOString()),
  }));
}

function clampDay(year: number, monthIndex0: number, day: number) {
  const last = new Date(year, monthIndex0 + 1, 0).getDate();
  return Math.max(1, Math.min(day, last));
}

function monthDiff(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function iso(y:number,m:number,d:number){
  const mm = String(m+1).padStart(2,'0');
  const dd = String(d).padStart(2,'0');
  return `${y}-${mm}-${dd}`;
}

// Build monthly schedule from start..end on payoutDay
export function buildSchedule(cert: Certificate, now = new Date()): ScheduleItem[] {
  const s = new Date(cert.startDate + "T00:00:00");
  const e = new Date(cert.endDate + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return [];

  const months = monthDiff(new Date(s.getFullYear(), s.getMonth(), 1), new Date(e.getFullYear(), e.getMonth(), 1)) + 1;

  const monthlyRate = cert.rateAPR / 100 / 12;
  const expected = cert.compounding === "monthly"
    ? undefined // we could compound principal, but Week 3 keeps principal constant payout (simple); monthly handled later
    : cert.principal * monthlyRate;

  const items: ScheduleItem[] = [];
  for (let i=0; i<months; i++){
    const y = s.getFullYear() + Math.floor((s.getMonth()+i)/12);
    const m = (s.getMonth()+i)%12;
    const d = clampDay(y, m, cert.payoutDay);
    const dateStr = iso(y,m,d);
    const dateObj = new Date(dateStr + "T00:00:00");
    let status: ScheduleItem["status"] = "upcoming";
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateObj < today) status = "past";
    else if (dateObj.getTime() === today.getTime()) status = "due";
    items.push({
      date: dateStr,
      expectedAmount: expected ?? cert.principal * monthlyRate, // fallback if later we flip to compounding
      status,
    });
  }
  return items;
}

export function useCertificates() {
  const [items, setItems] = useState<Certificate[]>([]);

  useEffect(() => {
    const initial = load<Certificate[] | {items: Certificate[]}>(KEY, [], migrate);
    setItems(migrate(initial));
  }, []);

  useEffect(() => {
    save(KEY, items); // store as array for compatibility
  }, [items]);

  function upsert(c: Partial<Certificate> & { id?: string }){
    const nowIso = new Date().toISOString();
    setItems(prev => {
      const id = c.id ?? crypto.randomUUID();
      const idx = prev.findIndex(x => x.id === id);
      const next: Certificate = {
        id,
        title: c.title ?? "Certificate",
        currency: (c.currency ?? "KWD") as Currency,
        principal: Number(c.principal ?? 0),
        rateAPR: Number(c.rateAPR ?? 0),
        compounding: (c.compounding ?? "simple") as Compounding,
        startDate: c.startDate ?? nowIso.slice(0,10),
        endDate: c.endDate ?? nowIso.slice(0,10),
        payoutDay: Number(c.payoutDay ?? 15),
        createdAt: idx >= 0 ? prev[idx].createdAt : nowIso,
        updatedAt: nowIso,
      };
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
      }
      return [next, ...prev];
    });
  }

  function remove(id: string){
    setItems(prev => prev.filter(x => x.id !== id));
  }

  const totals = useMemo(() => {
    let principal = 0;
    for (const c of items) principal += c.principal;
    return { principal };
  }, [items]);

  function nextPayoutSummary(now = new Date()){
    let soonest: { date: string, amount: number, title: string, currency: Currency } | null = null;
    for (const c of items){
      const sch = buildSchedule(c, now).filter(s => s.status !== "past");
      if (!sch.length) continue;
      const n = sch[0];
      if (!soonest || new Date(n.date) < new Date(soonest.date)){
        soonest = { date: n.date, amount: n.expectedAmount, title: c.title, currency: c.currency };
      }
    }
    return soonest;
  }

  return { items, upsert, remove, totals, nextPayoutSummary };
}
