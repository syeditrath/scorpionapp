import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── NEXUS CYBER THEME ─── */
const T = {
  bg: "#020408",
  sidebar: "#03060a",
  card: "rgba(13, 20, 33, 0.7)", // Glass effect
  cardInner: "rgba(20, 30, 45, 0.5)",
  border: "rgba(0, 242, 255, 0.15)", // Glowing Cyan Border
  borderActive: "rgba(0, 242, 255, 0.5)",
  cyan: "#00f2ff", // Main Neon
  purple: "#7000ff", // Accent
  magenta: "#ff00e5", // Critical
  green: "#00ff9d", // Healthy
  text: "#e2e8f0",
  textSub: "#64748b",
  glass: "backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
};

const GLOBAL_CSS = "@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700&display=swap'); body { background: #020408; color: #e2e8f0; margin: 0; font-family: 'Rajdhani', sans-serif; overflow: hidden; } .cyber-glow { box-shadow: 0 0 15px rgba(0, 242, 255, 0.1); } .cyber-text { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; } .scanline { width: 100%; height: 100px; z-index: 99; background: linear-gradient(0deg, rgba(0, 242, 255, 0.03) 0%, rgba(0,242,255,0) 100%); position: absolute; pointer-events: none; animation: scan 4s linear infinite; } @keyframes scan { from { top: -100px; } to { top: 100%; } } .fade-in { animation: fadeIn 0.5s ease-out both; } @keyframes fadeIn { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0px); } }";

/* ─── HELPERS ─── */
const uid = function() { return Math.random().toString(36).slice(2, 9); };
const daysUntil = function(d) { if(!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); };

/* ─── UI COMPONENTS ─── */

function NexusHeaderStat(props) {
  return (
    <div className="fade-in cyber-glow" style={{ flex: 1, background: T.card, border: "1px solid " + (props.active ? T.borderActive : T.border), borderRadius: "4px", padding: "15px", position: "relative", backdropFilter: "blur(10px)" }}>
      <div style={{ fontSize: "10px", fontWeight: "700", color: T.cyan, opacity: 0.7, marginBottom: "5px" }}>{props.label.toUpperCase()}</div>
      <div className="cyber-text" style={{ fontSize: "24px", fontWeight: "900", color: props.color || T.text }}>{props.value}</div>
      <div style={{ position: "absolute", bottom: "0", left: "0", width: "30%", height: "2px", background: props.color || T.cyan }}></div>
    </div>
  );
}

function NexusCategory(props) {
  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: "2px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", backdropFilter: "blur(10px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "4px", height: "20px", background: props.color }}></div>
        <div className="cyber-text" style={{ fontSize: "14px", fontWeight: "700" }}>{props.title}</div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {props.stats.map(function(s, i) {
          return (
            <div key={i} style={{ background: T.cardInner, padding: "10px", borderLeft: "1px solid " + (s.color || T.cyan) }}>
              <div className="cyber-text" style={{ fontSize: "18px", fontWeight: "900", color: s.color || T.text }}>{s.val}</div>
              <div style={{ fontSize: "9px", color: T.textSub, fontWeight: "700", letterSpacing: "1px" }}>{s.lab.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "10px", textAlign: "right", color: props.color, cursor: "pointer", fontWeight: "700" }}>INITIALIZING MODULE _V2.0</div>
    </div>
  );
}

/* ─── MAIN APP ─── */

export default function App() {
  const [data, setData] = useState(function() {
    const saved = localStorage.getItem("scorpion_v6");
    return saved ? JSON.parse(saved) : { manpower: [], equipment: [] };
  });
  const [page, setPage] = useState("dashboard");

  useEffect(function() {
    localStorage.setItem("scorpion_v6", JSON.stringify(data));
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
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, position: "relative" }}>
      <div className="scanline"></div>
      
      {/* SIDEBAR */}
      <aside style={{ width: "240px", background: T.sidebar, borderRight: "1px solid " + T.border, padding: "30px", display: "flex", flexDirection: "column", zIndex: 10 }}>
        <div style={{ marginBottom: "50px" }}>
          <div className="cyber-text" style={{ fontWeight: "900", fontSize: "20px", color: T.cyan, textShadow: "0 0 10px rgba(0,242,255,0.5)" }}>SCORPION</div>
          <div style={{ fontSize: "10px", color: T.purple, letterSpacing: "4px", fontWeight: "700" }}>NEXUS SYSTEM</div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {["dashboard", "docs", "manpower", "equipment"].map(function(id) {
            const active = page === id;
            return (
              <button key={id} onClick={function(){ setPage(id); }} style={{
                textAlign: "left", padding: "15px", border: "1px solid " + (active ? T.cyan : "transparent"),
                background: active ? "rgba(0,242,255,0.05)" : "transparent", color: active ? T.cyan : T.textSub,
                cursor: "pointer", clipPath: "polygon(0% 0%, 90% 0%, 100% 30%, 100% 100%, 0% 100%)", transition: "0.3s"
              }}>
                <div className="cyber-text" style={{ fontWeight: "700", fontSize: "12px" }}>{id.toUpperCase()}</div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "50px", overflowY: "auto", zIndex: 5 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div className="cyber-text" style={{ fontSize: "18px", fontWeight: "900", color: T.textSub }}>SYSTEM_OVERVIEW // 2026</div>
          <div style={{ display: "flex", gap: "20px" }}>
             <div style={{ color: T.cyan, fontSize: "12px", fontWeight: "700" }}>NETWORK_STABLE</div>
             <div style={{ color: T.magenta, fontSize: "12px", fontWeight: "700" }}>{alerts.length} BREACHES_DETECTED</div>
          </div>
        </header>

        {page === "dashboard" && (
          <div className="fade-in">
            {/* Top Stat Row */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
              <NexusHeaderStat label="Alerts" value={alerts.length} color={T.magenta} active={alerts.length > 0} />
              <NexusHeaderStat label="Uptime" value="99.9%" color={T.green} />
              <NexusHeaderStat label="Personnel" value={data.manpower.length} color={T.cyan} />
              <NexusHeaderStat label="Assets" value={data.equipment.length} color={T.purple} />
              <NexusHeaderStat label="Compliance" value="100" color={T.green} />
            </div>

            {/* Futuristic Progress Bar */}
            <div style={{ background: T.card, border: "1px solid " + T.border, padding: "20px", marginBottom: "30px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className="cyber-text" style={{ fontSize: "10px", color: T.cyan }}>OPERATIONAL_COMPLIANCE</span>
                <span style={{ fontSize: "14px", fontWeight: "900", color: T.cyan }}>100%</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, " + T.purple + ", " + T.cyan + ")" }}></div>
              </div>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,242,255,0.05) 20px, rgba(0,242,255,0.05) 21px)" }}></div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <NexusCategory 
                title="SCORPION_CORE" color={T.cyan}
                stats={[{lab: "Docs", val: "5", color: T.cyan}, {lab: "Active", val: "5"}, {lab: "Alerts", val: "0"}, {lab: "Nodes", val: "9"}]} 
              />
              <NexusCategory 
                title="PROJECT_DATA" color={T.purple}
                stats={[{lab: "Invoices", val: "0", color: T.purple}, {lab: "Certs", val: "0"}, {lab: "Orders", val: "0"}, {lab: "Tasks", val: "0"}]} 
              />
              <NexusCategory 
                title="UNIT_STATUS" color={T.green}
                stats={[{lab: "Staff", val: data.manpower.length, color: T.green}, {lab: "Assets", val: data.equipment.length}, {lab: "Drills", val: "0"}, {lab: "Secure", val: "YES"}]} 
              />
            </div>
          </div>
        )}

        {(page === "manpower" || page === "equipment") && (
          <div className="fade-in">
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 className="cyber-text" style={{ fontSize: "24px", color: T.cyan }}>DATA_STREAM :: {page.toUpperCase()}</h2>
                <label style={{ background: T.cyan, color: "#000", padding: "8px 20px", fontWeight: "900", cursor: "pointer", fontSize: "12px" }}>
                   UPLOAD_DAT_FILE
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
             <div style={{ background: T.card, border: "1px solid " + T.border, padding: "20px" }}>
                {data[page].length === 0 ? <div style={{ color: T.textMuted }}>No active data streams.</div> : data[page].map(function(item) {
                  return (
                    <div key={item.id} style={{ padding: "15px", borderBottom: "1px solid rgba(0,242,255,0.1)", display: "flex", justifyContent: "space-between" }}>
                      <span className="cyber-text" style={{ fontSize: "14px" }}>{item.name}</span>
                      <span style={{ color: T.cyan, fontSize: "12px" }}>STATUS::OK</span>
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
