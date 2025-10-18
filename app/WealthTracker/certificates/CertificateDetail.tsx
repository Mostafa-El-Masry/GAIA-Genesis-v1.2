"use client";
import React, { useMemo } from "react";
import { useCertificates, buildSchedule } from "../../hooks/useCertificates";

export default function CertificateDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { items } = useCertificates();
  const cert = items.find((c) => c.id === id) || null;
  const schedule = useMemo(() => (cert ? buildSchedule(cert) : []), [cert]);

  if (!id || !cert) return null;

  return (
    <div className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>{cert.title}</h3>
        <button className="btn btn-outline" onClick={onClose}>Close</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <div><small>Currency</small><div><strong>{cert.currency}</strong></div></div>
        <div><small>Principal</small><div><strong>{cert.principal.toLocaleString()}</strong></div></div>
        <div><small>APR%</small><div><strong>{cert.rateAPR}</strong></div></div>
        <div><small>Payout day</small><div><strong>{cert.payoutDay}</strong></div></div>
        <div><small>Start</small><div><strong>{cert.startDate}</strong></div></div>
        <div><small>End</small><div><strong>{cert.endDate}</strong></div></div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Expected</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s, i) => (
              <tr key={s.date + i} className="border-t">
                <td className="p-2 border">{s.date}</td>
                <td className="p-2 border">{s.expectedAmount.toFixed(2)}</td>
                <td className="p-2 border" style={{ opacity: s.status === "upcoming" ? 0.6 : 1 }}>
                  {s.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: ".75rem", fontSize: 12, opacity: 0.8 }}>
        Future payouts are greyed. Actual receipts + variance recording arrive next week.
      </p>
    </div>
  );
}
