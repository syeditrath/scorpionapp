import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── PROFESSIONAL ENTERPRISE THEME ─── */
const T = {
  bg: "#f8fafc",          // Light gray background
  sidebar: "#ffffff",     // Clean white sidebar
  card: "#ffffff",        // White cards
  border: "#e2e8f0",      // Soft borders
  primary: "#0f172a",     // Navy blue for text/headers
  accent: "#2563eb",      // Standard professional blue
  success: "#10b981",     // Green for status
  error: "#ef4444",       // Red for alerts
  text: "#334155",        // Slate text
  textLight: "#64748b"    // Muted slate
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body { background: #f8fafc; color: #334155; margin: 0; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  button { transition: all 0.2s; }
  tr:hover { background-color: #f1f5f9; }
`;

/* ─── HELPERS ─── */
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { 
  if(!d) return null; 
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)); 
};

/* ─── UI COMPONENTS ─── */

function StatBox(props) {
  return (
    <div style={{ flex: 1, background: T.card, border: "1px solid " + T.border, borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "13px", fontWeight: "600", color: T.textLight, marginBottom: "8px" }}>{props.label}</div>
      <div style={{ fontSize: "28px", fontWeight: "700", color: props.color || T.primary }}>{props.value}</div>
    </div>
  );
}

/* ─── MAIN APP ─── */

export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_pro_v1");
    return saved ? JSON.parse(saved) : { manpower: [], equipment: [] };
  });
  const [page, setPage] = useState("dashboard");

  useEffect(function() {
    localStorage.setItem("scorpion_pro_v1", JSON.stringify(data));
    if (!document.getElementById("scorp-css")) {
      const s = document.createElement("style"); s.id = "scorp-css";
      s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
  }, [data]);

  const alerts = [].concat(
    data.manpower.map(function(m){ return { name: m.name, d: daysUntil(m.expiryDate), type: "Personnel" }; }),
    data.equipment.map(function(e){ return { name: e.name, d: daysUntil(e.expiryDate), type: "Equipment" }; })
  ).filter(function(a){ return a.d !== null && a.d <= 30; });

  const navItem = function(id, label) {
    const active = page === id;
    return (
      <button onClick={function(){ setPage(id); }} style={{
        width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
        background: active ? "#eff6ff" : "transparent", color: active ? T.accent : T.text, fontWeight: active ? "600" : "500", marginBottom: "4px"
      }}>
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: "260px", background: T.sidebar, borderRight: "1px solid " + T.border, padding: "32px 24px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontWeight: "800", fontSize: "20px", color: T.primary, letterSpacing: "-0.5px" }}>SCORPION ARABIA</div>
          <div style={{ fontSize: "12px", color: T.textLight }}>Asset Management System</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItem("dashboard", "Dashboard")}
          {navItem("manpower", "Personnel")}
          {navItem("equipment", "Equipment Fleet")}
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        
        <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: T.primary, margin: 0 }}>
            {page === "dashboard" ? "Overview" : page.charAt(0).toUpperCase() + page.slice(1)}
          </h1>
          <div style={{ fontSize: "14px", color: T.textLight }}>March 2026</div>
        </header>

        {page === "dashboard" && (
          <div>
            <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
              <StatBox label="Pending Expiries" value={alerts.length} color={alerts.length > 0 ? T.error : T.success} />
              <StatBox label="Total Personnel" value={data.manpower.length} />
              <StatBox label="Total Equipment" value={data.equipment.length} />
            </div>

            <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "12px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Urgent Renewals (Next 30 Days)</h3>
              {alerts.length === 0 ? (
                <div style={{ color: T.textLight, padding: "20px 0" }}>No urgent renewals found.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid " + T.border, textAlign: "left", color: T.textLight, fontSize: "12px" }}>
                      <th style={{ padding: "12px 0" }}>ASSET NAME</th>
                      <th>CATEGORY</th>
                      <th style={{ textAlign: "right" }}>DAYS REMAINING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(function(item, i) {
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                          <td style={{ padding: "16px 0", fontWeight: "500" }}>{item.name}</td>
                          <td>{item.type}</td>
                          <td style={{ textAlign: "right", color: T.error, fontWeight: "600" }}>{item.d} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {(page === "manpower" || page === "equipment") && (
          <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "12px", overflow: "hidden" }}>
             <div style={{ padding: "24px", borderBottom: "1px solid " + T.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                   <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0" }}>{page === "manpower" ? "Personnel List" : "Equipment Inventory"}</h2>
                   <p style={{ fontSize: "13px", color: T.textLight, margin: 0 }}>Manage and track your operational assets.</p>
                </div>
                <label style={{ background: T.accent, color: "#fff", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                   Import Excel
                   <input type="file" style={{ display: "none" }} onChange={function(e) {
                      const file = e.target.files[0];
                      if(!file) return;
                      const reader = new FileReader();
                      reader.onload = function(evt) {
                        const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
                        const list = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                        const parsed = list.map(function(r) { 
                          return { id: uid(), name: r.NAME || r.EQUIPMENT || "Unknown", expiryDate: r["EXPIRY DATE"] || "" }; 
                        });
                        setData(function(prev) { return { ...prev, [page]: prev[page].concat(parsed) }; });
                      };
                      reader.readAsArrayBuffer(file);
                   }} />
                </label>
             </div>
             
             <div style={{ padding: "0" }}>
                {data[page].length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: T.textLight }}>No data available. Please upload an Excel file.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc", fontSize: "12px", color: T.textLight, textAlign: "left" }}>
                      <tr>
                        <th style={{ padding: "12px 24px" }}>NAME</th>
                        <th>EXPIRY DATE</th>
                        <th style={{ textAlign: "right", paddingRight: "24px" }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data[page].map(function(item) {
                        const days = daysUntil(item.expiryDate);
                        return (
                          <tr key={item.id} style={{ borderBottom: "1px solid " + T.border, fontSize: "14px" }}>
                            <td style={{ padding: "16px 24px", fontWeight: "500" }}>{item.name}</td>
                            <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</td>
                            <td style={{ textAlign: "right", paddingRight: "24px" }}>
                               <span style={{ 
                                 padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                                 background: days <= 30 ? "#fef2f2" : "#f0fdf4",
                                 color: days <= 30 ? T.error : T.success
                               }}>
                                 {days <= 30 ? "Renewal Needed" : "Active"}
                               </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
