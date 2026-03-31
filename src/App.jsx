import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── Global CSS & Animations ────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; overflow: hidden; }
  body { font-family: 'Barlow', sans-serif; background: #05070a; color: #f8fafc; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #05070a; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
`;

/* ─── Theme Configuration ────────────────────────────────────────────────── */
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
  shadow: "0 10px 40px -10px rgba(0,0,0,0.7)",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 9);
const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

const MP_CERT_MAP = { "NAME": "name", "EMPLOYEE ID": "idNo", "CERTIFICATE": "certName", "EXPIRY DATE": "expiryDate" };
const EQ_CERT_MAP = { "EQUIPMENT": "name", "SERIAL NO": "serialNo", "EXPIRY DATE": "expiryDate" };

/* ─── Components ─────────────────────────────────────────────────────────── */

function StatCard({ label, value, icon, color, delay = "0s" }) {
  return (
    <div className="fade-up" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "20px", animationDelay: delay, boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: T.textSub, letterSpacing: "1px", marginBottom: "8px" }}>{label.toUpperCase()}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: "800", color: color, lineHeight: "1" }}>{value}</div>
        </div>
        <div style={{ background: `${color}15`, color, width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{icon}</div>
      </div>
    </div>
  );
}

function ExcelDropZone({ onDataParsed, type = "manpower" }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const map = type === "manpower" ? MP_CERT_MAP : EQ_CERT_MAP;
      const parsed = rawRows.map(row => {
        const rec = { id: uid() };
        Object.entries(map).forEach(([excelKey, dataKey]) => {
          const val = row[excelKey] || row[excelKey.toUpperCase()];
          rec[dataKey] = val instanceof Date ? val.toISOString().slice(0, 10) : val;
        });
        return rec;
      }).filter(r => Object.keys(r).length > 1);
      onDataParsed(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => fileInputRef.current.click()}
      style={{
        border: "2px dashed " + (isDragging ? T.blue : T.border),
        background: isDragging ? T.blueDim : T.card2,
        borderRadius: "16px", padding: "40px", textAlign: "center", cursor: "pointer", transition: "all 0.2s ease", marginBottom: "20px"
      }}
    >
      <input type="file" ref={fileInputRef} onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} accept=".xlsx, .xls" />
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>📥</div>
      <div style={{ fontWeight: "700", color: T.text }}>Import {type} Data</div>
      <div style={{ color: T.textSub, fontSize: "12px" }}>Drag & drop Excel or click to browse</div>
    </div>
  );
}

/* ─── Main Application ───────────────────────────────────────────────────── */

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("scorpion_v2");
    return saved ? JSON.parse(saved) : { scorpionDocs: [], manpower: [], equipment: [], projects: ["NEOM", "Metro"] };
  });
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("scorpion_v2", JSON.stringify(data));
    if (!document.getElementById("scorp-css")) {
      const s = document.createElement("style"); s.id = "scorp-css";
      s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
  }, [data]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const alerts = [
    ...data.manpower.map(m => ({ label: m.name, src: "Manpower", days: daysUntil(m.expiryDate) })),
    ...data.equipment.map(e => ({ label: e.name, src: "Equipment", days: daysUntil(e.expiryDate) }))
  ].filter(a => a.days !== null && a.days <= 90).sort((a,b) => a.days - b.days);

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg }}>
      <aside style={{ width: 260, background: T.sidebar, borderRight: "1px solid " + T.border, padding: "24px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "800", fontSize: "24px", letterSpacing: "1px" }}>SCORPION ARABIA</div>
          <div style={{ fontSize: "10px", color: T.textMuted, letterSpacing: "2px" }}>ASSET MANAGEMENT</div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {["dashboard", "manpower", "equipment"].map(id => (
            <button key={id} onClick={() => setPage(id)} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: "none",
              background: page === id ? T.blueDim : "transparent", color: page === id ? T.blue : T.textSub, fontWeight: "600", cursor: "pointer"
            }}>
              {id === "dashboard" ? "▦" : id === "manpower" ? "👥" : "🚜"} {id.toUpperCase()}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
        {page === "dashboard" && (
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", marginBottom: "30px" }}>COMMAND CENTER</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
              <StatCard label="Critical Alerts" value={alerts.length} icon="⚡" color={alerts.length > 0 ? T.red : T.green} />
              <StatCard label="Personnel" value={data.manpower.length} icon="👤" color={T.
