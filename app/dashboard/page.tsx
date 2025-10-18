"use client";
import React, { useEffect, useState } from "react";
import "../styles/glacium.css";
import GlassCard from "../components/GlassCard";

interface Finance {
  type: string;
  amount: number;
  category: string;
}
interface Health {
  glucose: number;
  insulin: number;
  date: string;
}

const DashboardPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [avgGlucose, setAvgGlucose] = useState<number>(0);
  const [apolloNotes, setApolloNotes] = useState<number>(0);
  const [galleryItems, setGalleryItems] = useState<number>(0);

  useEffect(() => {
    // Finance summary
    const finances: Finance[] = JSON.parse(
      localStorage.getItem("gaia_finances") || "[]"
    );
    const income = finances
      .filter((f) => f.type === "income")
      .reduce((a, b) => a + b.amount, 0);
    const expense = finances
      .filter((f) => f.type === "expense")
      .reduce((a, b) => a + b.amount, 0);
    setBalance(income - expense);

    // Health average glucose
    const records: Health[] = JSON.parse(
      localStorage.getItem("healthRecords") || "[]"
    );
    if (records.length > 0) {
      const avg = records.reduce((a, b) => a + b.glucose, 0) / records.length;
      setAvgGlucose(Math.round(avg));
    }

    // Apollo note count
    const notes = JSON.parse(localStorage.getItem("gaia_apollo") || "[]");
    setApolloNotes(notes.length);

    // Gallery count
    const gallery = JSON.parse(localStorage.getItem("gallery_meta") || "[]");
    setGalleryItems(gallery.length);
  }, []);

  return (
    <main className="page-with-nav">
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--space-lg)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-lg)",
            width: "100%",
          }}
        >
          <GlassCard
            title="Finance Balance"
            value={`$${balance.toLocaleString()}`}
            link="/wealth"
            icon="💰"
            trend={balance >= 0 ? "up" : "down"}
          />
          <GlassCard
            title="Avg Glucose"
            value={`${avgGlucose} mg/dL`}
            link="/health"
            icon="❤️"
            trend={
              avgGlucose < 140 ? "good" : avgGlucose < 180 ? "warning" : "alert"
            }
          />
          <GlassCard
            title="Apollo Notes"
            value={`${apolloNotes} entries`}
            link="/apollo"
            icon="📝"
          />
          <GlassCard
            title="Gallery Items"
            value={galleryItems.toString()}
            link="/gallery"
            icon="🖼️"
          />
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
