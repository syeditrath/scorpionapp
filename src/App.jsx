import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

// ─── Theme & Styles ───
const T = {
  bg: "#05070a",
  sidebar: "#0b0e14",
  card: "#0e121b",
  card2: "#121722",
  border: "#1e293b",
  borderLight: "#2d3a4f",
  blue: "#38bdf8",
  green: "#10b981",
  gold: "#f59e0b",
  red: "#ef4444",
  teal: "#14b8a6",
  text: "#f8fafc",
  textSub: "#94a3b8",
  textMuted: "#475569",
  blueDim: "rgba(56, 189, 248, 0.08)"
};

const GLOBAL_CSS = "body { background: #05070a; color: #f8fafc; margin: 0; font-family: sans-serif; } .fade-in { animation: fadeIn 0.3s ease both; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }";

// ─── Utility Functions ───
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { 
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000); 
};
const fmtDate = function(d) { 
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
};

// ─── Sub-Components ───
function StatCard(props) {
  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontSize: "11px", color: T.textSub, marginBottom: "5px" }}>{props.label}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color: props.color }}>{props.value}</div>
    </div>
  );
}

function ExcelDropZone(props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = function(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const wb = XLSX.read(e.target.result, { type: "array", cellDates: true });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const parsed = data.map(function(row) {
        return {
          id: uid(),
          name: row["NAME"] || row["EQUIPMENT"] || "Unknown",
          idNo: row["EMPLOYEE ID"] || row["SERIAL NO"] || "N/A",
          expiryDate: row["EXPIRY DATE"] || ""
        };
      });
      props.onImport(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div 
      onDragOver={function(e) { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={function() { setIsDragging(false); }}
      onDrop={function(e) { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={function() { fileInputRef.current.click(); }}
      style={{
        border: "2px dashed " + (isDragging ? T.blue : T.border),
        background: isDragging ? T.blueDim : T.card2,
        padding: "40px", textAlign: "center", cursor: "pointer", borderRadius: "12px", marginBottom: "20px"
      }}
    >
      <input type="file" ref={fileInputRef} onChange={function(e) { handleFile(e.target.files[0]); }} style={{ display: "none" }} />
      <div style={{ color: T.text }}>Drop Excel file here to import {props.type}</div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_v3");
    return saved ? JSON.parse(saved) : { manpower: [], equipment: [] };
  });
  const [page, setPage] = useState("dashboard");

  useEffect(function() {
    localStorage.setItem("scorpion_v3", JSON.stringify(data));
    const styleTag = document.createElement("style");
    styleTag.textContent = GLOBAL_CSS;
    document.head.appendChild(styleTag);
  }, [data]);

  const alerts = [].concat(
    data.manpower.map(function(m) { return { n: m.name, d: daysUntil(m.expiryDate) }; }),
    data.equipment.map(function(e) { return { n: e.name, d: daysUntil(e.expiryDate) }; })
  ).filter(function(a) { return a.d !== null && a.d <= 90; });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: "240px", background: T.sidebar, padding: "20px", borderRight: "1px solid " + T.border }}>
        <h2 style={{ fontSize: "18px", color: T.blue, marginBottom: "30px" }}>SCORPION ARABIA</h2>
        <button onClick={function() { setPage("dashboard"); }} style={{ width: "100%", padding: "10px", marginBottom: "10px", background: "none", border: "none", color: "white", textAlign: "left", cursor: "pointer" }}>DASHBOARD</button>
        <button onClick={function() { setPage("manpower"); }} style={{ width: "100%", padding: "10px", marginBottom: "10px", background: "none", border: "none", color: "white", textAlign: "left", cursor: "pointer" }}>MANPOWER</button>
        <button onClick={function() { setPage("equipment"); }} style={{ width: "100%", padding: "10px", marginBottom: "10px", background: "none", border: "none", color: "white", textAlign: "left", cursor: "pointer" }}>EQUIPMENT</button>
      </aside>

      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {page === "dashboard" && (
          <div className="fade-in">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "40px" }}>
              <StatCard label="ALERTS" value={alerts.length} color={T.red} />
              <StatCard label="STAFF" value={data.manpower.length} color={T.blue} />
              <StatCard label="UNITS" value={data.equipment.length} color={T.gold} />
            </div>
            <div style={{ background: T.card, padding: "20px", borderRadius: "12px" }}>
              <h3>EXPIRING SOON</h3>
              {alerts.map(function(a, i) {
                return <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid " + T.borderLight }}>{a.n} — {a.d} days left</div>;
              })}
            </div>
          </div>
        )}

        {page === "manpower" && (
          <div className="fade-in">
            <h2>MANPOWER</h2>
            <ExcelDropZone type="manpower" onImport={function(list) {
              setData(function(prev) { return { ...prev, manpower: prev.manpower.concat(list) }; });
            }} />
            <div style={{ background: T.card, padding: "20px", borderRadius: "12px" }}>
              {data.manpower.map(function(m) {
                return <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid " + T.borderLight }}>{m.name} ({m.idNo}) - {fmtDate(m.expiryDate)}</div>;
              })}
            </div>
          </div>
        )}

        {page === "equipment" && (
          <div className="fade-in">
            <h2>EQUIPMENT</h2>
            <ExcelDropZone type="equipment" onImport={function(list) {
              setData(function(prev) { return { ...prev, equipment: prev.equipment.concat(list) }; });
            }} />
            <div style={{ background: T.card, padding: "20px", borderRadius: "12px" }}>
              {data.equipment.map(function(e) {
                return <div key={e.id} style={{ padding: "10px 0", borderBottom: "1px solid " + T.borderLight }}>{e.name} ({e.idNo}) - {fmtDate(e.expiryDate)}</div>;
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
