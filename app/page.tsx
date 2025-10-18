"use client";
import Link from "next/link";

export default function HomePage() {
  const modules = [
    {
      name: "Gallery",
      path: "/Gallery",
      icon: "🖼️",
      desc: "View and organize your local image collection.",
    },
    {
      name: "Health Tracker",
      path: "/health",
      icon: "💉",
      desc: "Record glucose levels, insulin doses, and medical notes.",
    },
    {
      name: "Wealth Tracker",
      path: "/WealthTracker",
      icon: "💰",
      desc: "Manage income, expenses, and calculate balance.",
    },
    {
      name: "Apollo Archive",
      path: "/Apollo",
      icon: "🧠",
      desc: "Store knowledge, reflections, and GAIA’s internal logs.",
    },
    {
      name: "Timeline Viewer",
      path: "/Timeline",
      icon: "🕰️",
      desc: "Explore global and personal milestones across time.",
    },
  ];

  return (
    <div className="page-with-nav">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-4">🌍 GAIA Genesis</h1>
        <p
          style={{
            textAlign: "center",
            marginBottom: "var(--space-xl)",
            color: "var(--text-secondary)",
            fontSize: "var(--font-size-lg)",
          }}
        >
          Welcome back, Creator. From here, you can access every part of GAIA —
          her senses, her memory, and her mind.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.name}
              href={m.path}
              className="glass"
              style={{
                padding: "var(--space-lg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                textDecoration: "none",
                color: "var(--color-fg)",
                transition: "all var(--transition-fast)",
                borderColor: "var(--border-light)",
                background: "var(--color-bg)",
              }}
            >
              <div
                style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}
              >
                {m.icon}
              </div>
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-bold)",
                  marginBottom: "var(--space-xs)",
                  color: "var(--color-fg)",
                }}
              >
                {m.name}
              </h2>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                {m.desc}
              </p>
            </Link>
          ))}
        </div>

        <footer
          style={{
            marginTop: "var(--space-xl)",
            textAlign: "center",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
          }}
        >
          <p>GAIA Genesis v1.10 — Phase 2 </p>
          <p>© 2025 Sasa</p>
        </footer>
      </div>
    </div>
  );
}
