"use client";
import React from "react";
import Link from "next/link";
import "../styles/glacium.css";

interface GlassCardProps {
  title: string;
  value: string;
  link?: string;
  icon?: string;
  trend?: "up" | "down" | "good" | "warning" | "alert";
}

const GlassCard: React.FC<GlassCardProps> = ({
  title,
  value,
  link,
  icon,
  trend,
}) => {
  const content = (
    <div
      className="glass-card"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div className="card-header">
        {icon && <span className="card-icon">{icon}</span>}
        <h3 className="card-title">{title}</h3>
      </div>

      <div className="card-value">
        {value}
        {trend && (
          <span className={`trend-indicator ${trend}`}>
            {trend === "up" && "↗"}
            {trend === "down" && "↘"}
            {trend === "good" && "✓"}
            {trend === "warning" && "⚠"}
            {trend === "alert" && "!"}
          </span>
        )}
      </div>
    </div>
  );
  return link ? (
    <Link
      href={link}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        height: "100%",
      }}
    >
      {content}
    </Link>
  ) : (
    content
  );
};

export default GlassCard;
