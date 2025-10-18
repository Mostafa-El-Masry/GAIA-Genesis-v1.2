"use client";
import React from "react";
import { useCertificates, buildSchedule } from "../../hooks/useCertificates";

export default function CertificateTable({ onOpen }: { onOpen: (id: string) => void }) {
  const { items, remove } = useCertificates();

  return (
    <div className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
      <h3 style={{ marginBottom: ".5rem" }}>Certificates</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Currency</th>
              <th className="p-2 border">Principal</th>
              <th className="p-2 border">APR%</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
              <th className="p-2 border">Next Payout</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const sch = buildSchedule(c);
              const next = sch.find((s) => s.status !== "past");
              return (
                <tr key={c.id} className="border-t">
                  <td className="p-2 border">
                    <button className="text-blue-600 hover:underline" onClick={() => onOpen(c.id)}>{c.title}</button>
                  </td>
                  <td className="p-2 border">{c.currency}</td>
                  <td className="p-2 border">{c.principal.toLocaleString()}</td>
                  <td className="p-2 border">{c.rateAPR}</td>
                  <td className="p-2 border">{c.startDate}</td>
                  <td className="p-2 border">{c.endDate}</td>
                  <td className="p-2 border">
                    {next ? `${next.date} • ${next.expectedAmount.toFixed(2)}` : "-"}
                  </td>
                  <td className="p-2 border text-center">
                    <button className="text-red-600 hover:text-red-800" onClick={() => remove(c.id)}>✕</button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 p-3">No certificates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
