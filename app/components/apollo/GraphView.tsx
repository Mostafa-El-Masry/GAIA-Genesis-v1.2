"use client";
import React, { useEffect, useRef } from "react";
import "../../styles/apollo.css";
import { ApolloNote } from "../../hooks/useApolloStore";

type Props = {
  notes: ApolloNote[];
  onOpen: (id: string)=>void;
};

// Simple radial graph layout: center is the most-linked note
export default function GraphView({ notes, onOpen }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width = c.clientWidth;
    const H = c.height = 360;

    ctx.clearRect(0,0,W,H);

    if (!notes.length) return;
    const incoming = new Map<string, number>();
    notes.forEach(n => incoming.set(n.id, 0));
    notes.forEach(n => n.links?.forEach(l => incoming.set(l, (incoming.get(l)||0)+1)));

    const sorted = [...notes].sort((a,b) => (incoming.get(b.id)||0) - (incoming.get(a.id)||0));
    const center = sorted[0];
    const centerPos = { x: W/2, y: H/2 };

    const positions = new Map<string, {x:number,y:number}>();
    positions.set(center.id, centerPos);

    const R = Math.min(W,H)/2 - 40;
    const others = sorted.slice(1);
    others.forEach((n, i) => {
      const angle = (i / others.length) * Math.PI * 2;
      positions.set(n.id, {
        x: centerPos.x + R * Math.cos(angle),
        y: centerPos.y + R * Math.sin(angle),
      });
    });

    // draw edges
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    notes.forEach(n => {
      const a = positions.get(n.id)!;
      n.links?.forEach(l => {
        const b = positions.get(l);
        if (!a || !b) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
    });

    // draw nodes
    notes.forEach(n => {
      const p = positions.get(n.id)!;
      const radius = 8 + (incoming.get(n.id)||0)*2;
      ctx.beginPath();
      ctx.fillStyle = "rgba(108,202,255,0.9)";
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.title.slice(0,16), p.x, p.y - radius - 6);
    });

    // click mapping
    const hit = (x:number,y:number) => {
      for (const n of notes) {
        const p = positions.get(n.id)!;
        const r = 10 + (incoming.get(n.id)||0)*2;
        const dx = x-p.x, dy=y-p.y;
        if (dx*dx+dy*dy <= r*r) return n.id;
      }
      return null;
    };
    const onClick = (ev: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      const id = hit(ev.clientX - rect.left, ev.clientY - rect.top);
      if (id) onOpen(id);
    };
    c.addEventListener("click", onClick);
    return () => c.removeEventListener("click", onClick);
  }, [notes, onOpen]);

  return (
    <div className="graph-box">
      <h3 style={{ marginTop: 0 }}>Graph</h3>
      <canvas ref={ref} style={{ width: "100%", height: 360, display: "block" }} />
    </div>
  );
}