"use client";
import React from "react";
import "../styles/glacium.css";

interface AFInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const AFInput: React.FC<AFInputProps> = ({ label, ...props }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {label && (
        <label style={{ fontSize: "0.9rem", opacity: 0.8 }}>{label}</label>
      )}
      <input className="input" {...props} />
    </div>
  );
};

export default AFInput;
