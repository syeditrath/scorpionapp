import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── THEME & STYLES ─── */
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
  blueDim: "rgba(56, 189, 248, 0.1)",
  shadow: "0 10px 40px -10px rgba(0,0,0,0.7)"
};

const GLOBAL_CSS = "@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Barlow+Condensed:wght@700;800&display=swap'); body { background: #05070a; color: #f8fafc; margin: 0; font-family: 'Barlow', sans-serif; -webkit-font-smoothing: antialiased; } .fade-in { animation: fadeIn 0.4s ease both; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }";

/* ─── HELPERS ─── */
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { 
  if (!d) return null;
  var diff = new Date(d) - new Date();
  return Math.ceil(diff / 86400000); 
};
const fmtDate = function(d) { 
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─── COMPONENTS ─── */

function StatCard(props) {
  return (
    <div className="fade-in" style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "16px", padding: "24px", boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: T.textSub, letterSpacing: "1px", marginBottom: "8px" }}>{props.label.toUpperCase()}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "38px", fontWeight: "800", color: props.color, lineHeight: "1" }}>{props.value}</div>
        </div>
        <div style={{ background: props.color + "20", color: props.color, width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{props.icon}</div>
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
      
      const parsed = rawRows.map(function(row) {
        return {
          id: uid(),
          name: row["NAME"] || row["EQUIPMENT"] || row["staff_name"] || "Unnamed",
          idNo: row["ID NO"] || row["SERIAL NO"] || row["id_number"] || "N/A",
          expiryDate: row["EXPIRY DATE"] || row["expiry"] || ""
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
        borderRadius: "20px", padding: "50px", textAlign: "center", cursor: "pointer", transition: "all 0.2s ease", marginBottom: "30px"
      }}
    >
      <input type="file" ref={fileInputRef} onChange={function(e) { handleFile(e.target.files[0]); }} style={{ display: "none" }} />
      <div style={{ fontSize: "40px", marginBottom: "15px" }}>📁</div>
      <div style={{ fontWeight: "700", fontSize: "18px", color: T.text }}>Import {props.type}</div>
      <div style={{ color: T.textSub, fontSize: "13px", marginTop: "5px" }}>Drag & drop Excel file here or click to browse</div>
    </div>
  );
}

/* ─── MAIN APP ─── */

export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_v4");
    return saved ? JSON.parse(saved) : { manpower: [], equipment: [] };
  });
  const [page, setPage] = useState("dashboard");

  useEffect(function() {
    localStorage.setItem("scorpion_v4", JSON.stringify(data));
    if (!document.getElementById("scorp-css")) {
      const s = document.createElement("style");
      s.id = "scorp-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, [data]);

  const alerts = [].concat(
    data.manpower.map(function(m) { return { n: m.name, d: daysUntil(m.expiryDate), type: "Personnel" }; }),
    data.equipment.map(function(e) { return { n: e.name, d: daysUntil(e.expiryDate), type: "Asset" }; })
  ).filter(function(a) { return a.d !== null && a.d <= 60; }).sort(function(a, b) { return a.d - b.d; });

  const renderNavButton = function(id, label, icon) {
    const isActive = page === id;
    return (
      <button 
        onClick={function() { setPage(id); }}
        style={{
          display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none", cursor: "pointer", transition: "0.2s", marginBottom: "8px",
          background: isActive ? T.blueDim : "transparent", color: isActive ? T.blue : T.textSub, fontWeight: "600"
        }}
      >
        <span style={{ fontSize: "18px" }}>{icon}</span> {label}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg }}>
      {/* Sidebar */}
      <aside style={{ width: "280px", background: T.sidebar, borderRight: "1px solid " + T.border, padding: "30px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "50px" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "800", fontSize: "26px", letterSpacing: "1px", color: T.text }}>SCORPION ARABIA</div>
          <div style={{ fontSize: "10px", color: T.textMuted, letterSpacing: "2px", marginTop: "4px" }}>OPERATIONS COMMAND</div>
        </div>
        
        <nav style={{ flex: 1 }}>
          {renderNavButton("dashboard", "DASHBOARD", "▦")}
          {renderNavButton("manpower", "MANPOWER", "👥")}
          {renderNavButton("equipment", "EQUIPMENT", "🚜")}
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "50px", overflowY: "auto" }}>
        {page === "dashboard" && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", marginBottom: "40px" }}>COMMAND CENTER</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px", marginBottom: "50px" }}>
              <StatCard label="Critical Alerts" value={alerts.length} icon="⚡" color={alerts.length > 0 ? T.red : T.green} />
              <StatCard label="Total Personnel" value={data.manpower.length} icon="👤" color={T.blue} />
              <StatCard label="Total Assets" value={data.equipment.length} icon="⚙️" color={T.gold} />
            </div>

            <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "20px", padding: "30px" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
                🚩 URGENT DOCUMENT RENEWALS
              </h3>
              {alerts.length === 0 ? (
                <div style={{ color: T.textMuted, textAlign: "center", padding: "40px" }}>All assets and personnel are compliant.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {alerts.map(function(item, idx) {
                    return (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "20px", background: T.bg, borderRadius: "14px", border: "1px solid " + T.borderLight }}>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "16px" }}>{item.n}</div>
                          <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "2px" }}>{item.type} Renewal Required</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: "800", color: item.d <= 0 ? T.red : T.gold }}>{item.d <= 0 ? "EXPIRED" : item.d + " DAYS REMAINING"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {page === "manpower" && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", marginBottom: "30px" }}>MANPOWER ROSTER</h1>
            <ExcelDropZone type="manpower" onImport={function(list) {
              setData(function(prev) { return { ...prev, manpower: prev.manpower.concat(list) }; });
            }} />
            <div style={{ background: T.card, borderRadius: "20px", border: "1px solid " + T.border, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: T.card2, color: T.textSub, fontSize: "12px" }}>
                    <th style={{ padding: "20px" }}>STAFF NAME</th>
                    <th>ID NUMBER</th>
                    <th>EXPIRY DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.manpower.map(function(m) {
                    var remaining = daysUntil(m.expiryDate);
                    return (
                      <tr key={m.id} style={{ borderBottom: "1px solid " + T.borderLight }}>
                        <td style={{ padding: "20px", fontWeight: "600" }}>{m.name}</td>
                        <td>{m.idNo}</td>
                        <td>{fmtDate(m.expiryDate)}</td>
                        <td>
                          <span style={{ color: remaining < 30 ? T.red : T.green, fontSize: "12px", fontWeight: "700" }}>
                            {remaining < 30 ? "ACTION REQ" : "VALID"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === "equipment" && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", marginBottom: "30px" }}>EQUIPMENT FLEET</h1>
            <ExcelDropZone type="equipment" onImport={function(list) {
              setData(function(prev) { return { ...prev, equipment: prev.equipment.concat(list) }; });
            }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {data.equipment.map(function(e) {
                var remaining = daysUntil(e.expiryDate);
                return (
                  <div key={e.id} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "16px", padding: "25px" }}>
                    <div style={{ color: T.blue, fontWeight: "800", fontSize: "18px", marginBottom: "5px" }}>{e.name}</div>
                    <div style={{ fontSize: "12px", color: T.textMuted, marginBottom: "20px" }}>SERIAL: {e.idNo}</div>
                    <div style={{ borderTop: "1px solid " + T.borderLight, paddingTop: "15px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", color: T.textSub }}>EXPIRY</span>
                      <span style={{ fontWeight: "700", color: remaining < 30 ? T.red : T.text }}>{fmtDate(e.expiryDate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
