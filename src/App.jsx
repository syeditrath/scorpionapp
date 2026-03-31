import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── Global CSS ─── */
const GLOBAL_CSS = " @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } html, body, #root { height: 100%; width: 100%; overflow: hidden; } body { font-family: 'Barlow', sans-serif; background: #05070a; color: #f8fafc; -webkit-font-smoothing: antialiased; } ::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: #05070a; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; } @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; } .fade-in { animation: fadeIn 0.3s ease both; } ";

/* ─── Theme ─── */
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
  blueDim: "rgba(56, 189, 248, 0.08)",
  shadow: "0 10px 40px -10px rgba(0,0,0,0.7)"
};

/* ─── Helpers ─── */
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { return d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null; };
const fmtDate = function(d) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"; };

const MP_CERT_MAP = { "NAME": "name", "EMPLOYEE ID": "idNo", "CERTIFICATE": "certName", "EXPIRY DATE": "expiryDate" };
const EQ_CERT_MAP = { "EQUIPMENT": "name", "SERIAL NO": "serialNo", "EXPIRY DATE": "expiryDate" };

/* ─── Components ─── */

function StatCard(props) {
  return (
    <div className="fade-up" style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "16px", padding: "20px", animationDelay: props.delay || "0s", boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: T.textSub, letterSpacing: "1px", marginBottom: "8px" }}>{props.label.toUpperCase()}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: "800", color: props.color, lineHeight: "1" }}>{props.value}</div>
        </div>
        <div style={{ background: props.color + "15", color: props.color, width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{props.icon}</div>
      </div>
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
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const map = props.type === "manpower" ? MP_CERT_MAP : EQ_CERT_MAP;
      const parsed = rawRows.map(function(row) {
        const rec = { id: uid() };
        Object.entries(map).forEach(function(entry) {
          const excelKey = entry[0];
          const dataKey = entry[1];
          const val = row[excelKey] || row[excelKey.toUpperCase()];
          rec[dataKey] = val instanceof Date ? val.toISOString().slice(0, 10) : val;
        });
        return rec;
      }).filter(function(r) { return Object.keys(r).length > 1; });
      props.onDataParsed(parsed);
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
        borderRadius: "16px", padding: "40px", textAlign: "center", cursor: "pointer", transition: "all 0.2s ease", marginBottom: "20px"
      }}
    >
      <input type="file" ref={fileInputRef} onChange={function(e) { handleFile(e.target.files[0]); }} style={{ display: "none" }} accept=".xlsx, .xls" />
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>📥</div>
      <div style={{ fontWeight: "700", color: T.text }}>Import {props.type} Data</div>
      <div style={{ color: T.textSub, fontSize: "12px" }}>Drag & drop Excel or click to browse</div>
    </div>
  );
}

/* ─── Main Application ─── */

export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_v2");
    return saved ? JSON.parse(saved) : { scorpionDocs: [], manpower: [], equipment: [], projects: ["NEOM", "Metro"] };
  });
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(function() {
    localStorage.setItem("scorpion_v2", JSON.stringify(data));
    if (!document.getElementById("scorp-css")) {
      const s = document.createElement("style");
      s.id = "scorp-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, [data]);

  const showToast = function(msg) {
    setToast(msg);
    setTimeout(function() { setToast(null); }, 3000);
  };

  const alerts = [
    ...data.manpower.map(function(m) { return { label: m.name, src: "Manpower", days: daysUntil(m.expiryDate) }; }),
    ...data.equipment.map(function(e) { return { label: e.name, src: "Equipment", days: daysUntil(e.expiryDate) }; })
  ].filter(function(a) { return a.days !== null && a.days <= 90; }).sort(function(a, b) { return a.days - b.days; });

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg }}>
      <aside style={{
