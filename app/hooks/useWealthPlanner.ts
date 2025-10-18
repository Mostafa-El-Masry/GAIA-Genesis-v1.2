"use client";
import { useEffect, useMemo, useState } from "react";

export type Levels = {
  id: number;
  name: string;
  saveRate: number; // 0..1 per month
  expenseCapRate: number; // 1 - saveRate (cap as % of income)
};

export type PlannerInputs = {
  currency: string;
  monthlyIncome: number;
  startingPrincipal: number;
  age: number;
  birthDateISO?: string;
  fixed: {
    rent: number;
    mobile: number;
    utilities: number;
    foodMin: number;
    transport: number;
    remittance: number;
  };
  firstYearRate: number; // e.g., 16 (%)
  horizonMonths: number; // e.g., 36
  reinvestInterest: boolean; // true = compound, false = cash-out (adds to income)
};

export type StageRow = {
  level: number;
  label: string;
  savePerMonth: number;
  expenseCap: number;
  feasible: boolean;
};

export type ProjectionPoint = {
  month: number;
  balance: number;
  totalContrib: number;
  age: number;
};

function defaultLevels(): Levels[] {
  const names = [
    "Poor",
    "Strained",
    "Basic",
    "Stable",
    "Secure",
    "Growing",
    "Comfortable",
    "Strong",
    "Prosperous",
    "Wealthy",
  ];
  // 10 rungs from 0% up to 45% savings rate
  const rates = [0.0, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
  return names.map((name, i) => ({
    id: i + 1,
    name,
    saveRate: rates[i],
    expenseCapRate: 1 - rates[i],
  }));
}

function monthlyRateForMonth(monthIndex: number, firstYearRate: number) {
  // Each 12 months, annual rate drops by 1% until it reaches 10%
  const year = Math.floor(monthIndex / 12); // 0-based year
  const annual = Math.max(10, firstYearRate - year);
  return annual / 100 / 12;
}

export function useWealthPlanner(initial?: Partial<PlannerInputs>) {
  const [levels] = useState(defaultLevels());
  const [inputs, setInputs] = useState<PlannerInputs>({
    currency: "KD",
    monthlyIncome: 400,
    startingPrincipal: 0,
    age: 34,
    birthDateISO: "1991-08-10",
    fixed: {
      rent: 40,
      mobile: 22,
      utilities: 27,
      foodMin: 30,
      transport: 15,
      remittance: 80,
    },
    firstYearRate: 16,
    horizonMonths: 36,
    reinvestInterest: true,
    ...initial,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wealthInputs");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure currency is always KD, but keep other stored values
        const sanitized = { ...parsed, currency: "KD" };
        setInputs((prev) => ({ ...prev, ...sanitized }));
        // Update storage with sanitized values
        localStorage.setItem("wealthInputs", JSON.stringify(sanitized));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("wealthInputs", JSON.stringify(inputs));
  }, [inputs]);

  const fixedTotal = useMemo(() => {
    const f = inputs.fixed;
    return (
      f.rent + f.mobile + f.utilities + f.foodMin + f.transport + f.remittance
    );
  }, [inputs.fixed]);

  const feasibleMaxSave = useMemo(() => {
    return Math.max(0, inputs.monthlyIncome - fixedTotal);
  }, [inputs.monthlyIncome, fixedTotal]);

  const stages: StageRow[] = useMemo(() => {
    return levels.map((l) => {
      const savePerMonth = Math.round(inputs.monthlyIncome * l.saveRate);
      const expenseCap = Math.round(inputs.monthlyIncome - savePerMonth);
      const feasible = expenseCap >= fixedTotal;
      return {
        level: l.id,
        label: l.name,
        savePerMonth,
        expenseCap,
        feasible,
      };
    });
  }, [levels, inputs.monthlyIncome, fixedTotal]);

  const recommended = useMemo(() => {
    // Pick the highest feasible level
    const feas = stages.filter((s) => s.feasible);
    return feas.length ? feas[feas.length - 1] : stages[0];
  }, [stages]);

  function simulateProjection(savePerMonth: number): ProjectionPoint[] {
    const out: ProjectionPoint[] = [];
    let bal = inputs.startingPrincipal;
    let totalContrib = 0;
    for (let m = 0; m < inputs.horizonMonths; m++) {
      const r = monthlyRateForMonth(m, inputs.firstYearRate);
      // contribution at start of month
      bal += savePerMonth;
      totalContrib += savePerMonth;
      // interest accrues
      const interest = bal * r;
      if (inputs.reinvestInterest) {
        bal += interest;
      } else {
        // cash out interest -> treated as income (not tracked here, but could be)
      }
      const age = inputs.age + m / 12;
      out.push({ month: m + 1, balance: bal, totalContrib, age });
    }
    return out;
  }

  const projection = useMemo(
    () => simulateProjection(recommended.savePerMonth),
    [inputs, recommended]
  );

  // Income/Expense envelope for recommended stage
  const maxExpenses = recommended.expenseCap;
  const shouldSave = recommended.savePerMonth;

  return {
    inputs,
    setInputs,
    fixedTotal,
    feasibleMaxSave,
    stages,
    recommended,
    projection,
    monthlyRateForMonth,
    maxExpenses,
    shouldSave,
  };
}
