import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── SCORPION THEME ─── */
const T = {
  bg: "#05080a",
  sidebar: "#080c14",
  card: "#0d131f",
  cardInner: "#131a29",
  border: "#1e293b",
  blue: "#38bdf8",
  green: "#10b981",
  gold: "#f59e0b",
  red: "#f43f5e",
  text: "#f8fafc",
  textSub: "#94a3b8",
  accent: "rgba(56, 189, 248, 0.15)"
};

const GLOBAL_CSS = "@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Barlow+Condensed:wght@700;900&display=swap'); body { background: #05080a; color: #f8fafc; margin: 0; font-family: 'Barlow', sans-serif; } .stat-box { transition: transform 0.2s; } .stat-box:hover { transform: translateY(-2px); }";

/* ─── HELPERS ─── */
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { if(!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); };

/* ─── UI COMPONENTS ─── */

function HeaderStat(props) {
  return (
    <div className="stat-box" style={{ flex: 1, background: T.card, border: "1px solid " + T.border, borderRadius: "12px", padding: "15px 20px", position: "relative" }}>
      <div style={{ fontSize: "11px", fontWeight: "800", color: T.textSub, marginBottom: "8px" }}>{props.label.toUpperCase()}</div>
      <div style={{ fontSize: "32px", fontWeight: "900", fontFamily: "'Barlow Condensed'", color: props.color || T.text }}>{props.value}</div>
      <div style={{ position: "absolute", top: "15px", right: "20px", opacity: 0.2, fontSize: "20px" }}>{props.icon}</div>
    </div>
  );
}

function CategoryCard(props) {
  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: props.color + "20", color: props.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{props.icon}</div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "0.5px" }}>{props.title}</div>
          <div style={{ fontSize: "10px", color: T.textSub }}>{props.subtitle}</div>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {props.stats.map(function(s, i) {
          return (
            <div key={i} style={{ background: T.cardInner, padding: "12px", borderRadius: "8px" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", color: s.color || T.text, fontFamily: "'Barlow Condensed'" }}>{s.val}</div>
              <div style={{ fontSize: "9px", color: T.textSub, fontWeight: "700" }}>{s.lab.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
      <button style={{ background: "transparent", border: "none", color: props.color, fontSize: "12px", fontWeight: "700", textAlign: "right", cursor: "pointer", marginTop: "10px" }}>Open {props.title} →</button>
    </div>
  );
}

/* ─── MAIN APP ─── */

export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_v5");
    return saved ? JSON.parse(saved) : { manpower: [], equipment: [], docs: [] };
  });
  const [page, setPage] = useState("dashboard");

  useEffect(function() {
    localStorage.setItem("scorpion_v5", JSON.stringify(data));
    if (!document.getElementById("scorp-css")) {
      const s = document.createElement("style"); s.id = "scorp-css";
      s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
  }, [data]);

  const alerts = [].concat(
    data.manpower.map(function(m){ return { d: daysUntil(m.expiryDate) }; }),
    data.equipment.map(function(e){ return { d: daysUntil(e.expiryDate) }; })
  ).filter(function(a){ return a.d !== null && a.d <= 30; });

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: "260px", background: T.sidebar, borderRight: "1px solid " + T.border, padding: "25px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: "900", fontSize: "24px", color: T.blue }}>SCORPION ARABIA</div>
          <div style={{ fontSize: "10px", color: T.textSub, letterSpacing: "2px" }}>ASSET MANAGER</div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
          {[
            { id: "dashboard", lab: "Dashboard", sub: "Overview", icon: "▦" },
            { id: "docs", lab: "Scorpion Documents", sub: "Licenses & Permits", icon: "◎" },
            { id: "manpower", lab: "Manpower", sub: "Staff & Certs", icon: "👥" },
            { id: "equipment", lab: "Equipment", sub: "Assets & Records", icon: "⚙️" }
          ].map(function(n) {
            return (
              <button key={n.id} onClick={function(){ setPage(n.id); }} style={{
                textAlign: "left", padding: "12px 15px", borderRadius: "10px", border: "none", cursor: "pointer",
                background: page === n.id ? T.accent : "transparent", color: page === n.id ? T.blue : T.textSub
              }}>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>{n.lab}</div>
                <div style={{ fontSize: "10px", opacity: 0.6 }}>{n.sub}</div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "20px", fontWeight: "900", letterSpacing: "1px" }}>DOCUMENT & ASSET MANAGER</div>
          <div style={{ background: T.red + "20", color: T.red, padding: "5px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "900" }}>▲ {alerts.length} ALERTS</div>
        </header>

        {page === "dashboard" && (
          <div className="fade-in">
            {/* Top Stat Row */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <HeaderStat label="Total Alerts" value={alerts.length} color={T.red} icon="▲" />
              <HeaderStat label="Overdue" value="0" icon="✕" />
              <HeaderStat label="Due in 30 Days" value={alerts.length} icon="🕒" />
              <HeaderStat label="Compliance" value="100%" color={T.green} icon="◎" />
              <HeaderStat label="People" value={data.manpower.length} icon="◆" />
              <HeaderStat label="Equipment Assets" value={data.equipment.length} icon="◎" />
            </div>

            {/* Compliance Bar Row */}
            <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "16px", padding: "25px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: T.textSub }}>OVERALL COMPLIANCE</span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: T.green }}>100%</span>
              </div>
              <div style={{ height: "8px", background: T.cardInner, borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: T.green }}></div>
              </div>
            </div>

            {/* Category Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "25px" }}>
              <CategoryCard 
                title="SCORPION DOCUMENTS" subtitle="CR, Insurance, Licenses" icon="◎" color={T.blue}
                stats={[{lab: "Total Docs", val: "5", color: T.blue}, {lab: "Expiring", val: "0"}, {lab: "Due 30d", val: "0"}, {lab: "Categories", val: "9"}]} 
              />
              <CategoryCard 
                title="PROJECT DOCS" subtitle="Invoices, Work Orders" icon="◆" color={T.teal || T.blue}
                stats={[{lab: "Total", val: "0"}, {lab: "Invoices", val: "0"}, {lab: "Job Certs", val: "0"}, {lab: "Work Orders", val: "0"}]} 
              />
              <CategoryCard 
                title="MANPOWER" subtitle="Staff & Certifications" icon="👥" color={T.green}
                stats={[{lab: "People", val: data.manpower.length, color: T.green}, {lab: "Categories", val: "0"}, {lab: "Doc Alerts", val: "0"}, {lab: "Certs", val: "10"}]} 
              />
            </div>
          </div>
        )}

        {(page === "manpower" || page === "equipment") && (
          <div className="fade-in">
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: "32px" }}>{page.toUpperCase()} DATABASE</h2>
                <input 
                  type="file" 
                  onChange={function(e) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                      const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
                      const list = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                      const parsed = list.map(function(r) { return { id: uid(), name: r.NAME || r.EQUIPMENT, expiryDate: r["EXPIRY DATE"] }; });
                      setData(function(prev) { return { ...prev, [page]: prev[page].concat(parsed) }; });
                    };
                    reader.readAsArrayBuffer(file);
                  }}
                />
             </div>
             <div style={{ background: T.card, borderRadius: "16px", padding: "20px" }}>
                {data[page].length === 0 ? "No data. Upload Excel." : data[page].map(function(item) {
                  return <div key={item.id} style={{ padding: "10px", borderBottom: "1px solid " + T.border }}>{item.name}</div>;
                })}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
