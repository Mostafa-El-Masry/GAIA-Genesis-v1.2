"use client";
import React from "react";
import { useTheme } from "../providers/ThemeProvider";
import AFButton from "../components/AFButton";
import AFInput from "../components/AFInput";

const AF1Showcase: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>AF1 Glacium Theme Showcase</h1>
        <button onClick={toggleTheme} className="btn btn-outline">
          Toggle Theme ({theme})
        </button>
      </header>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <AFButton variant="primary">Primary</AFButton>
          <AFButton variant="secondary">Secondary</AFButton>
          <AFButton variant="outline">Outline</AFButton>
        </div>
      </section>

      <section>
        <h2>Inputs</h2>
        <AFInput label="Name" placeholder="Enter your name" />
        <AFInput label="Email" type="email" placeholder="Enter your email" />
      </section>

      <section>
        <h2>Color & Spacing Tokens</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            "--primary",
            "--secondary",
            "--accent",
            "--danger",
            "--success",
          ].map((v) => (
            <div
              key={v}
              className="glass"
              style={{
                padding: "1rem",
                background: `var(${v})`,
                color: "#000",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AF1Showcase;
