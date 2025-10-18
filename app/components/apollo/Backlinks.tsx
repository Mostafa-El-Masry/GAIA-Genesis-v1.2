"use client";
import React from "react";
import "../../styles/apollo.css";
import { ApolloNote } from "../../hooks/useApolloStore";
import Link from "next/link";

export default function Backlinks({ items, onOpen }:{ items: ApolloNote[]; onOpen: (id:string)=>void }) {
  if (!items.length) return null;
  return (
    <section className="backlinks">
      <h3 style={{ marginTop: 0 }}>Backlinks</h3>
      <ul style={{ margin: 0, padding: "0 0 0 1rem" }}>
        {items.map(n => (
          <li key={n.id}>
            <button onClick={() => onOpen(n.id)} style={{ background: "transparent", border: "none", color: "var(--primary)", textDecoration: "underline", cursor: "pointer" }}>
              {n.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}