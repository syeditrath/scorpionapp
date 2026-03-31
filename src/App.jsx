import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── HEAVY UTILITY THEME ─── */
const T = {
  bg: "#1a1c1e",          // Deep Asphalt
  sidebar: "#121416",     // Dark Iron
  card: "#24282b",        // Reinforced Concrete
  cardInner: "#1e2124",   // Darker Pit
  border: "#3f444a",      // Steel Girder
  warn: "#ff9800",        // Safety Orange
  danger: "#f44336",      // Hazard Red
  success: "#4caf50",     // Operational Green
  text: "#e0e0e0",        // Brushed Metal
  textSub: "#90a4ae",     // Dust/Slate
  caution: "#ffd600"      // Caution Yellow
};

const GLOBAL_CSS = "@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Oswald:wght@500;700&display=swap'); body { background: #1a1c1e; color: #e0e0e0; margin: 0; font-family: 'Roboto Mono', monospace; } .hazard-stripe { background: repeating-linear-gradient(45deg, #ffd600, #ffd600 10px, #000 10px, #000 20px); height: 4px; width: 100%; } .heavy-btn { transition: 0.1s; border-bottom: 3px solid rgba(0,0,0,0.5); } .heavy-btn:active { transform: translateY(2px); border-bottom: 0px; }";

/* ─── HELPERS ─── */
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { if(!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); };

/* ─── UI COMPONENTS ─── */

function DrillStat(props) {
  return (
    <div style={{ flex: 1, background: T.card, border: "2px solid " + T.border, padding: "15px", position: "relative" }}>
      <div style={{ fontSize: "10px", fontWeight: "700", color: T.textSub, marginBottom: "5px" }}>UNIT::{props.label}</div>
      <div style={{ fontSize: "28px", fontWeight: "700", fontFamily: "Oswald", color: props.color || T.text }}>{props.value}</div>
      <div style={{ position: "absolute", top: "0", right: "0", width: "10px", height: "10px", borderRight: "2px solid " + (props.color || T.border), borderTop: "2px solid " + (props.color || T.border) }}></div>
    </div>
  );
}

function SectionModule(props) {
  return (
    <div style={{ background: T.card, border: "2px solid " + T.border, display: "flex", flexDirection: "column" }}>
      <div className="hazard-stripe"></div>
      <div style={{ padding: "20px" }}>
        <div style={{ fontFamily: "Oswald", fontSize: "18px", fontWeight: "700", marginBottom: "15px", color: props.color }}>{props.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {props.stats.map(function(s, i) {
            return (
              <div key={i} style={{ background: T.cardInner, padding: "10px", border: "1px solid " + T.border }}>
                <div style={{ fontSize: "9px", color: T.textSub }}>{s.lab}</div>
                <div style={{ fontSize: "18px", fontWeight: "700", fontFamily: "Oswald", color: s.color || T.text }}>{s.val}</div>
              </div>
            );
          })}
        </div>
        <button style={{ width: "100%", marginTop: "15px", padding: "8px", background: T.border, border: "none", color: "white", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}>VIEW_RECORDS</button>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */

export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_drill_v1");
    return saved ? JSON.parse(saved) : { manpower: [], equipment: [] };
  });
  const [page, setPage] = useState("dashboard");

  useEffect(function() {
    localStorage.setItem("scorpion_drill_v1", JSON.stringify(data));
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
      <aside style={{ width: "250px", background: T.sidebar, borderRight: "4px solid " + T.border, padding: "25px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "40px", borderBottom: "2px solid " + T.warn, paddingBottom: "10px" }}>
          <div style={{ fontFamily: "Oswald", fontWeight: "700", fontSize: "24px", color: T.text }}>SCORPION_DRILL</div>
          <div style={{ fontSize: "9px", color: T.warn, letterSpacing: "2px" }}>OPERATIONAL_TECH</div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {["dashboard", "docs", "manpower", "equipment"].map(function(id) {
            const active = page === id;
            return (
              <button key={id} onClick={function(){ setPage(id); }} className="heavy-btn" style={{
                textAlign: "left", padding: "12px", border: "1px solid " + (active ? T.warn : T.border),
                background: active ? T.warn : T.cardInner, color: active ? "#000" : T.textSub,
                cursor: "pointer", fontWeight: "700", fontSize: "12px"
              }}>
                [{id.toUpperCase()}]
              </button>
            );
          })}
        </nav>
        <div style={{ fontSize: "10px", color: T.textSub }}>SYSTEM_STATUS: OK</div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", background: T.card, padding: "15px", border: "1px solid " + T.border }}>
          <div style={{ fontSize: "14px", fontWeight: "700" }}>SITE_MAP // RIG_01 // SECTOR_G</div>
          <div style={{ background: alerts.length > 0 ? T.danger : T.success, color: "#fff", padding: "4px 12px", fontWeight: "700", fontSize: "11px" }}>
            {alerts.length > 0 ? "HAZARD: " + alerts.length + " EXPIRIES" : "ALL SYSTEMS NOMINAL"}
          </div>
        </header>

        {page === "dashboard" && (
          <div>
            {/* Top Stat Row */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
              <DrillStat label="Critical" value={alerts.length} color={alerts.length > 0 ? T.danger : T.success} />
              <DrillStat label="Personnel" value={data.manpower.length} />
              <DrillStat label="Fleet" value={data.equipment.length} />
              <DrillStat label="Depth" value="420m" color={T.caution} />
            </div>

            {/* Heavy Progress Bar */}
            <div style={{ background: T.card, border: "2px solid " + T.border, padding: "20px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "11px", fontWeight: "700" }}>
                <span>DRILL_COMPLIANCE_LEVEL</span>
                <span style={{ color: T.success }}>100%</span>
              </div>
              <div style={{ height: "14px", background: T.bg, border: "1px solid " + T.border, padding: "2px" }}>
                <div style={{ width: "100%", height: "100%", background: T.success }}></div>
              </div>
            </div>

            {/* Module Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <SectionModule 
                title="OPERATIONAL_DOCS" color={T.warn}
                stats={[{lab: "CR_EXP", val: "VALID"}, {lab: "INSURANCE", val: "ACTIVE"}, {lab: "LICENSES", val: "9"}, {lab: "PERMITS", val: "OK"}]} 
              />
              <SectionModule 
                title="MANPOWER_UNIT" color={T.warn}
                stats={[{lab: "STAFF", val: data.manpower.length}, {lab: "CERT_ALERTS", val: "0", color: T.success}, {lab: "SHIFT", val: "DAY"}, {lab: "STRENGTH", val: "100%"}]} 
              />
              <SectionModule 
                title="EQUIPMENT_LOG" color={T.warn}
                stats={[{lab: "ASSETS", val: data.equipment.length}, {lab: "MAINTENANCE", val: "OK"}, {lab: "IDLE", val: "2"}, {lab: "FUEL", val: "88%"}]} 
              />
            </div>
          </div>
        )}

        {(page === "manpower" || page === "equipment") && (
          <div style={{ background: T.card, border: "2px solid " + T.border, padding: "25px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid " + T.border, paddingBottom: "15px" }}>
                <h2 style={{ fontFamily: "Oswald", fontSize: "24px" }}>SITE_{page.toUpperCase()}_LOG</h2>
                <label style={{ background: T.warn, color: "#000", padding: "8px 20px", fontWeight: "700", cursor: "pointer", fontSize: "11px" }}>
                   IMPORT_XLSX
                   <input type="file" style={{ display: "none" }} onChange={function(e) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = function(evt) {
                        const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
                        const list = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                        const parsed = list.map(function(r) { return { id: uid(), name: r.NAME || r.EQUIPMENT, expiryDate: r["EXPIRY DATE"] }; });
                        setData(function(prev) { return { ...prev, [page]: prev[page].concat(parsed) }; });
                      };
                      reader.readAsArrayBuffer(file);
                   }} />
                </label>
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data[page].length === 0 ? <div style={{ color: T.textSub }}>Log empty. Awaiting data import.</div> : data[page].map(function(item) {
                  return (
                    <div key={item.id} style={{ padding: "15px", background: T.cardInner, border: "1px solid " + T.border, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "700" }}>{item.name}</span>
                      <span style={{ color: T.warn }}>LOGGED::OK</span>
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
