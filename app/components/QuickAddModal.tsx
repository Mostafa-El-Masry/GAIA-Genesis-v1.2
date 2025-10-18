"use client";
import React, { useState } from "react";
import AFInput from "./AFInput";
import AFButton from "./AFButton";
import "../styles/glacium.css";

const QuickAddModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const save = () => {
    // placeholder: this will connect to modules later
    if (!value.trim()) return;
    alert(`Quick add saved: ${value}`);
    setValue("");
    setOpen(false);
  };

  return (
    <>
      <button className="btn btn-outline" onClick={() => setOpen(true)}>
        ＋ Quick Add
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div className="glass" style={{ padding: "2rem", width: "300px" }}>
            <h3>Add Entry</h3>
            <AFInput
              placeholder="Type something..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <AFButton onClick={save}>Save</AFButton>
              <AFButton variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </AFButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickAddModal;
