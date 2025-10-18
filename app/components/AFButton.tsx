"use client";
import React from "react";
import "../styles/glacium.css";

interface AFButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

const AFButton: React.FC<AFButtonProps> = ({
  variant = "primary",
  children,
  ...rest
}) => {
  return (
    <button className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  );
};

export default AFButton;
