"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../providers/ThemeProvider";
import "../styles/glacium.css";

const scenes = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Gallery", path: "/Gallery" },
  { name: "Apollo", path: "/Apollo" },
  { name: "Health", path: "/health" },
  { name: "Wealth", path: "/wealth" },
];

const TopNav: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass top-nav">
      <div className="nav-left">
        <Link href="/" className="nav-logo">
          GAIA Genesis
        </Link>
      </div>
      <div className="nav-center">
        {scenes.map((scene) => (
          <Link
            key={scene.name}
            href={scene.path}
            className={`nav-link ${pathname === scene.path ? "active" : ""}`}
          >
            {scene.name}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <button onClick={toggleTheme} className="nav-btn">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <Link href="/dashboard?add=new" className="nav-btn">
          ＋
        </Link>
      </div>
    </nav>
  );
};

export default TopNav;
