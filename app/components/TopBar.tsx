import React from "react";
import "../styles/glacium.css";

export default function TopBar() {
  return (
    <header className="top-bar">
      <input type="text" placeholder="Search..." className="search-input" />
      <button className="glass-button">＋</button>
      <div className="profile"></div>
    </header>
  );
}
