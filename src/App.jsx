import { useState, useEffect, useRef, useMemo } from "react";

// ─── COMPREHENSIVE DATA & STATE MANAGEMENT ─────────────────────────────────
const DataAPIs = {
  förderungen: async () => ({
    lastUpdated: new Date(),
    data: [
      { id: "kfw-297", name: "KfW Klimafreundlicher Neubau 297", kategorie: "Neubau", typ: "Darlehen + Zuschuss", betrag: "Bis 150.000 €", zins: "Ab 1,41%", voraussetzungen: ["Neubau", "EH 40 oder besser", "QNG-Siegel"], antrag: "VOR Baubeginn", kontakt: "KfW: 0800 539 9002", link: "https://www.kfw.de/297", änderung: new Date(2026, 4, 27) },
      { id: "kfw-298", name: "KfW Klimafreundlicher Neubau 298", kategorie: "Neubau", typ: "Darlehen", betrag: "Bis 150.000 €", zins: "Ab 0,95%", voraussetzungen: ["Neubau", "EH 40", "Qualitätssiegel"], antrag: "VOR Baubeginn", kontakt: "KfW: 0800 539 9002", link: "https://www.kfw.de/298", änderung: new Date(2026, 4, 27) },
      { id: "bafa-wp", name: "BAFA Wärmepumpen-Förderung", kategorie: "Heizung", typ: "Zuschuss", betrag: "40% Förderquote", zins: "N/A", voraussetzungen: ["Luft-/Sole-/Wasser-Wärmepumpe", "JAZ ≥ 2,9"], antrag: "VOR Auftragsvergabe", kontakt: "BAFA: 06196 908-1625", link: "https://www.bafa.de/wärmepumpen", änderung: new Date(2026, 3, 15) },
      { id: "kfw-300", name: "KfW Wohneigentum für Familien 300", kategorie: "Erwerb", typ: "Darlehen", betrag: "Bis 270.000 €", zins: "Ab 2,75%", voraussetzungen: ["Erwerb", "Einkommensgrenzen"], antrag: "Zeitnah", kontakt: "KfW: 0800 539 9002", link: "https://www.kfw.de/300", änderung: new Date(2026, 5, 1) }
    ]
  }),
  rohstoffe: async () => ({
    lastUpdated: new Date(),
    data: [
      { name: "Baustahl S235", preis: 480, einheit: "€/Tonne", trend: "↑ +2,3%" },
      { name: "Kupfer", preis: 12800, einheit: "€/Tonne", trend: "↓ -1,5%" },
      { name: "Holz", preis: 420, einheit: "€/m³", trend: "→ 0%" },
      { name: "Zement", preis: 125, einheit: "€/Tonne", trend: "↑ +0,8%" },
      { name: "Bitumen", preis: 650, einheit: "€/Tonne", trend: "↓ -2,1%" }
    ]
  })
};

// ─── UTILITIES ────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtEUR = n => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = d => d ? new Date(d).toLocaleDateString("de-DE") : "–";
const today = () => new Date().toISOString().split("T")[0];
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

// ─── PREMIUM CSS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

:root {
  --primary: #1F2937;
  --primary-light: #374151;
  --primary-dark: #111827;
  --accent: #3B82F6;
  --accent-light: #60A5FA;
  --accent-dark: #1E40AF;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #0EA5E9;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 6px;
  --radius-lg: 10px;
  --tr: 150ms cubic-bezier(0.4,0,0.2,1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
  font-family: var(--font-sans);
  background: linear-gradient(to bottom, var(--gray-50), var(--gray-100));
  color: var(--gray-900);
  -webkit-font-smoothing: antialiased;
}

button, input, select, textarea { font-family: var(--font-sans); }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 4px; }

.app { display: flex; height: 100dvh; overflow: hidden; }

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--primary-dark), var(--primary));
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.1);
  z-index: 50;
  box-shadow: var(--shadow);
}

.sidebar-logo { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 14px; }
.logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--accent), var(--accent-light)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
.logo-text { font-size: 18px; font-weight: 700; line-height: 1.2; }

.sidebar-scroll { flex: 1; overflow-y: auto; padding: 16px 8px; }
.nav-section { margin-bottom: 24px; }
.nav-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); padding: 0 12px 10px; }
.nav-item { display: flex; align-items: center; gap: 11px; padding: 11px 12px; border-radius: var(--radius-lg); cursor: pointer; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); transition: all var(--tr); margin-bottom: 3px; }
.nav-item:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.95); }
.nav-item.active { background: var(--accent); color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.nav-icon { width: 18px; text-align: center; }
.nav-badge { margin-left: auto; min-width: 24px; height: 24px; background: var(--error); color: white; border-radius: 99px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 64px; background: white; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; padding: 0 28px; gap: 16px; box-shadow: var(--shadow-sm); }
.topbar-title { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; flex: 1; }
.topbar-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 99px; font-size: 12px; font-weight: 500; color: var(--gray-600); }

.content { flex: 1; overflow-y: auto; padding: 28px; display: flex; flex-direction: column; gap: 24px; }

.card { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); transition: all var(--tr); }
.card:hover { box-shadow: var(--shadow); border-color: var(--gray-300); }
.card-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-100); display: flex; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(to right, var(--gray-50), transparent); }
.card-title { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
.card-body { padding: 24px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-lg); font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all var(--tr); white-space: nowrap; }
.btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-light)); color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
.btn-primary:hover { background: linear-gradient(135deg, var(--accent-dark), var(--accent)); box-shadow: 0 6px 16px rgba(59,130,246,0.4); transform: translateY(-1px); }
.btn-secondary { background: var(--gray-100); color: var(--gray-900); border: 1.5px solid var(--gray-300); }
.btn-secondary:hover { background: var(--gray-200); }
.btn-ghost { background: transparent; color: var(--gray-600); }
.btn-ghost:hover { background: var(--gray-100); }
.btn-danger { background: var(--error); color: white; }
.btn-danger:hover { background: #DC2626; }
.btn-sm { padding: 5px 10px; font-size: 12px; }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

.form-group { margin-bottom: 16px; }
.form-label { font-size: 12px; font-weight: 700; color: var(--gray-700); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: 13px;
  background: white;
  color: var(--gray-900);
  outline: none;
  transition: all var(--tr);
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.form-textarea { resize: vertical; min-height: 80px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(3px); }
.modal { background: white; border-radius: 14px; width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { padding: 22px 24px; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; z-index: 1; }
.modal-title { font-size: 17px; font-weight: 700; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 8px; position: sticky; bottom: 0; background: white; }
.modal-close { width: 28px; height: 28px; border-radius: 8px; background: var(--gray-100); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray-500); font-size: 18px; font-weight: 600; transition: all var(--tr); }
.modal-close:hover { background: var(--gray-200); color: var(--gray-900); }

.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.gap { display: flex; flex-direction: column; gap: 16px; }

.empty { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.2; }
.empty h3 { font-size: 16px; color: var(--gray-900); margin-bottom: 4px; font-weight: 700; }
.empty p { color: var(--gray-500); font-size: 13px; }

.tabs { display: flex; gap: 2px; background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 10px; padding: 3px; flex-wrap: wrap; }
.tab { padding: 8px 14px; border-radius: var(--radius); font-size: 13px; font-weight: 600; cursor: pointer; color: var(--gray-600); transition: all var(--tr); border: none; background: transparent; }
.tab:hover:not(.active) { color: var(--gray-900); }
.tab.active { background: white; color: var(--accent); box-shadow: var(--shadow-sm); }

table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 11px 14px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--gray-600); border-bottom: 1.5px solid var(--gray-200); font-weight: 700; white-space: nowrap; background: var(--gray-50); }
td { padding: 12px 14px; border-bottom: 1px solid var(--gray-100); vertical-align: middle; }
tbody tr:hover { background: var(--gray-50); }

.alert { border-radius: var(--radius-lg); padding: 12px 16px; font-size: 13px; display: flex; gap: 10px; align-items: flex-start; border: 1.5px solid; }
.alert-success { background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.3); color: #065F46; }
.alert-warning { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.3); color: #78350F; }
.alert-error { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.3); color: #7F1D1D; }

.kpi { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 22px; position: relative; overflow: hidden; }
.kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--accent), var(--accent-light)); }
.kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--gray-500); margin-bottom: 8px; font-weight: 700; }
.kpi-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; color: var(--gray-900); line-height: 1; }
.kpi-sub { font-size: 12px; color: var(--gray-500); margin-top: 8px; }

.prog-wrap { background: var(--gray-200); border-radius: 99px; height: 7px; overflow: hidden; }
.prog-bar { height: 100%; border-radius: 99px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); background: linear-gradient(90deg, var(--accent), var(--accent-light)); }

@media (max-width: 1200px) { .g4 { grid-template-columns: repeat(2,1fr); } .kpi-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 768px) {
  .sidebar { width: 240px; }
  .content { padding: 16px; gap: 16px; }
  .g4, .g3, .g2 { grid-template-columns: 1fr; }
  .modal { max-width: 100%; }
}
`;


// ─── SHARED COMPONENTS ────────────────────────────────────────────────────
function Badge({ children, color = "#3B82F6", bg }) {
  return <span className="badge" style={{ background: bg || color + "22", color }}>{children}</span>;
}

function StatusBadge({ status }) {
  const statusMap = { planung: { label: "Planung", color: "#3B82F6" }, genehmigung: { label: "Genehmigung", color: "#F59E0B" }, bau: { label: "Im Bau", color: "#EF4444" }, abnahme: { label: "Abnahme", color: "#8B5CF6" }, fertig: { label: "Fertig", color: "#10B981" } };
  const s = statusMap[status] || statusMap.planung;
  return <div className="badge" style={{ background: s.color + "15", color: s.color }}><span className="status-dot" style={{ background: s.color }} />{s.label}</div>;
}

function Modal({ title, onClose, onSave, children, saveLabel = "Speichern" }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><span className="modal-title">{title}</span><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ProgBar({ value, color = "#3B82F6" }) {
  return <div className="prog-wrap"><div className="prog-bar" style={{ width: `${clamp(value, 0, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }} /></div>;
}

// ─── AUFGABEN TAB (TASKS) ─────────────────────────────────────────────────
function AufgabenTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("alle");
  const [form, setForm] = useState({
    titel: "", status: "offen", prio: "mittel", gewerk: "Rohbau", firma: "", faellig: today(), kosten: "", notiz: ""
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.titel) return;
    if (editId) {
      onUpdate({ ...project, aufgaben: project.aufgaben.map(t => t.id === editId ? { ...t, ...form } : t) });
      setEditId(null);
    } else {
      onUpdate({ ...project, aufgaben: [...project.aufgaben, { id: uid(), ...form, kosten: parseFloat(form.kosten) || 0 }] });
    }
    setShowNew(false);
    setForm({ titel: "", status: "offen", prio: "mittel", gewerk: "Rohbau", firma: "", faellig: today(), kosten: "", notiz: "" });
  };

  const del = (id) => onUpdate({ ...project, aufgaben: project.aufgaben.filter(t => t.id !== id) });

  const filtered = project.aufgaben.filter(t => filterStatus === "alle" || t.status === filterStatus);

  const GEWERKE = ["Erdarbeiten", "Rohbau", "Beton", "Dach", "Fassade", "Fenster", "Elektro", "Sanitär", "Heizung", "Lüftung", "Dämmung", "Innenputz", "Trockenbau", "Estrich", "Fliesen", "Bodenbelag", "Malerarbeiten", "Schreiner", "Treppen", "Außenanlagen"];
  const PRIO = { niedrig: "Niedrig", mittel: "Mittel", hoch: "Hoch", kritisch: "Kritisch" };
  const STATUS = { offen: "Offen", progress: "In Arbeit", done: "Erledigt" };

  return (
    <div className="gap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["alle", "offen", "progress", "done"].map(s => (
            <button key={s} className={`btn ${filterStatus === s ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setFilterStatus(s)}>
              {s === "alle" ? "Alle" : STATUS[s]} ({project.aufgaben.filter(t => s === "alle" || t.status === s).length})
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setShowNew(true); }}>+ Aufgabe</button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">✓</div><h3>Keine Aufgaben</h3></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr><th>Status</th><th>Aufgabe</th><th>Gewerk</th><th>Prio</th><th>Firma</th><th>Fällig</th><th>Kosten</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ cursor: "pointer" }} onDoubleClick={() => { setForm(t); setEditId(t.id); setShowNew(true); }}>
                    <td><select value={t.status} onChange={e => onUpdate({ ...project, aufgaben: project.aufgaben.map(x => x.id === t.id ? { ...x, status: e.target.value } : x) })} style={{ border: "none", background: "transparent", fontSize: "12px", cursor: "pointer" }}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select></td>
                    <td style={{ fontWeight: 500 }}>{t.titel}{t.notiz && <div style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "2px" }}>{t.notiz}</div>}</td>
                    <td><Badge color="#0EA5E9">{t.gewerk}</Badge></td>
                    <td><Badge color={t.prio === "kritisch" ? "var(--error)" : t.prio === "hoch" ? "var(--warning)" : "var(--gray-500)"}>{PRIO[t.prio]}</Badge></td>
                    <td style={{ fontSize: "12px", color: "var(--gray-500)" }}>{t.firma || "–"}</td>
                    <td style={{ fontSize: "12px", color: "var(--gray-500)", whiteSpace: "nowrap" }}>{fmtDate(t.faellig)}</td>
                    <td style={{ fontWeight: 600, fontSize: "12px" }}>{t.kosten ? fmtEUR(t.kosten) : "–"}</td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(t.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title={editId ? "Aufgabe bearbeiten" : "Neue Aufgabe"} onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Titel *</label>
            <input className="form-input" value={form.titel} onChange={e => f("titel", e.target.value)} placeholder="Aufgabenbeschreibung" />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => f("status", e.target.value)}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priorität</label>
              <select className="form-select" value={form.prio} onChange={e => f("prio", e.target.value)}>
                {Object.entries(PRIO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Gewerk</label>
              <select className="form-select" value={form.gewerk} onChange={e => f("gewerk", e.target.value)}>
                {GEWERKE.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fällig</label>
              <input className="form-input" type="date" value={form.faellig} onChange={e => f("faellig", e.target.value)} />
            </div>
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Firma</label>
              <input className="form-input" value={form.firma} onChange={e => f("firma", e.target.value)} placeholder="Firmenname" />
            </div>
            <div className="form-group">
              <label className="form-label">Kosten (€)</label>
              <input className="form-input" type="number" value={form.kosten} onChange={e => f("kosten", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notiz</label>
            <textarea className="form-textarea" style={{ minHeight: "60px" }} value={form.notiz} onChange={e => f("notiz", e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}


// ─── KOSTEN TAB ───────────────────────────────────────────────────────────
function KostenTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    beschreibung: "", betrag: "", datum: today(), gewerk: "Rohbau", firma: "", rechnungNr: "", bezahlt: false
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.beschreibung || !form.betrag) return;
    const newAusgabe = { id: uid(), ...form, betrag: parseFloat(form.betrag) };
    onUpdate({ ...project, ausgabenListe: [...project.ausgabenListe, newAusgabe], ausgaben: project.ausgaben + newAusgabe.betrag });
    setShowNew(false);
    setForm({ beschreibung: "", betrag: "", datum: today(), gewerk: "Rohbau", firma: "", rechnungNr: "", bezahlt: false });
  };

  const del = (id) => {
    const e = project.ausgabenListe.find(x => x.id === id);
    onUpdate({ ...project, ausgabenListe: project.ausgabenListe.filter(x => x.id !== id), ausgaben: project.ausgaben - (e?.betrag || 0) });
  };

  const toggle = (id) => onUpdate({ ...project, ausgabenListe: project.ausgabenListe.map(e => e.id === id ? { ...e, bezahlt: !e.bezahlt } : e) });

  const remaining = project.budget - project.ausgaben;
  const byGewerk = {};
  project.ausgabenListe.forEach(e => { byGewerk[e.gewerk] = (byGewerk[e.gewerk] || 0) + e.betrag; });

  return (
    <div className="gap">
      <div className="g4">
        <div className="kpi"><div className="kpi-label">Budget</div><div className="kpi-value" style={{ fontSize: "20px" }}>{fmtEUR(project.budget)}</div></div>
        <div className="kpi"><div className="kpi-label">Ausgegeben</div><div className="kpi-value" style={{ fontSize: "20px", color: pct(project.ausgaben, project.budget) > 90 ? "var(--error)" : "var(--accent)" }}>{fmtEUR(project.ausgaben)}</div><div className="kpi-sub">{pct(project.ausgaben, project.budget)}%</div></div>
        <div className="kpi"><div className="kpi-label">Restbudget</div><div className="kpi-value" style={{ fontSize: "20px", color: remaining < 0 ? "var(--error)" : "var(--success)" }}>{fmtEUR(remaining)}</div></div>
        <div className="kpi"><div className="kpi-label">Ausgaben</div><div className="kpi-value">{project.ausgabenListe.length}</div><div className="kpi-sub">Posten</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Ausgabenübersicht</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ Ausgabe</button>
        </div>
        {project.ausgabenListe.length === 0 ? (
          <div className="empty"><div className="empty-icon">💰</div><h3>Keine Ausgaben</h3></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Datum</th><th>Beschreibung</th><th>Gewerk</th><th>Firma</th><th style={{ textAlign: "right" }}>Betrag</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {project.ausgabenListe.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: "12px", color: "var(--gray-500)" }}>{fmtDate(e.datum)}</td>
                    <td style={{ fontWeight: 500 }}>{e.beschreibung}</td>
                    <td><Badge color="#0EA5E9">{e.gewerk}</Badge></td>
                    <td style={{ fontSize: "12px", color: "var(--gray-500)" }}>{e.firma || "–"}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtEUR(e.betrag)}</td>
                    <td><button className={`btn btn-sm ${e.bezahlt ? "btn-primary" : "btn-secondary"}`} onClick={() => toggle(e.id)}>{e.bezahlt ? "✓ Bezahlt" : "Offen"}</button></td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(e.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Ausgaben nach Gewerk</span></div>
        <div className="card-body gap">
          {Object.entries(byGewerk).length === 0 ? <p style={{ color: "var(--gray-500)" }}>Noch keine Ausgaben</p> : Object.entries(byGewerk).map(([g, total]) => (
            <div key={g}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 500 }}>{g}</span>
                <span style={{ fontWeight: 700, color: "var(--accent)" }}>{fmtEUR(total)}</span>
              </div>
              <ProgBar value={pct(total, project.budget)} />
            </div>
          ))}
        </div>
      </div>

      {showNew && (
        <Modal title="Ausgabe erfassen" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Beschreibung *</label>
            <input className="form-input" value={form.beschreibung} onChange={e => f("beschreibung", e.target.value)} />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Betrag (€) *</label>
              <input className="form-input" type="number" value={form.betrag} onChange={e => f("betrag", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Datum</label>
              <input className="form-input" type="date" value={form.datum} onChange={e => f("datum", e.target.value)} />
            </div>
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Gewerk</label>
              <select className="form-select" value={form.gewerk} onChange={e => f("gewerk", e.target.value)}>
                {["Erdarbeiten", "Rohbau", "Beton", "Dach", "Fassade", "Fenster", "Elektro", "Sanitär", "Heizung", "Sonstiges"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Firma</label>
              <input className="form-input" value={form.firma} onChange={e => f("firma", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Rechnungsnummer</label>
            <input className="form-input" value={form.rechnungNr} onChange={e => f("rechnungNr", e.target.value)} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
            <input type="checkbox" checked={form.bezahlt} onChange={e => f("bezahlt", e.target.checked)} />
            Bereits bezahlt
          </label>
        </Modal>
      )}
    </div>
  );
}

// ─── FIRMEN TAB ───────────────────────────────────────────────────────────
function FirmenTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: "", gewerk: "", kontakt: "", email: "", ansprechpartner: "", bewertung: 0, notiz: ""
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.name) return;
    onUpdate({ ...project, firmen: [...project.firmen, { id: uid(), ...form }] });
    setShowNew(false);
    setForm({ name: "", gewerk: "", kontakt: "", email: "", ansprechpartner: "", bewertung: 0, notiz: "" });
  };

  const del = (id) => onUpdate({ ...project, firmen: project.firmen.filter(f => f.id !== id) });

  return (
    <div className="gap">
      <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Firma</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
        {project.firmen.map(f => (
          <div key={f.id} className="card">
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{f.name}</div>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(f.id)}>🗑</button>
              </div>
              {f.gewerk && <div className="badge" style={{ marginBottom: "8px", color: "var(--accent)", background: "var(--accent)22" }}>{f.gewerk}</div>}
              <div style={{ fontSize: "11px", color: "var(--gray-500)", display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                {f.ansprechpartner && <span>👤 {f.ansprechpartner}</span>}
                {f.kontakt && <span>☎️ {f.kontakt}</span>}
                {f.email && <span>✉️ {f.email}</span>}
              </div>
              {f.bewertung > 0 && <div style={{ marginTop: "8px", fontSize: "14px" }}>{'⭐'.repeat(f.bewertung)}</div>}
              {f.notiz && <div style={{ marginTop: "8px", padding: "8px", background: "var(--gray-50)", borderRadius: "6px", fontSize: "12px" }}>{f.notiz}</div>}
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <Modal title="Firma hinzufügen" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Firmenname *</label>
            <input className="form-input" value={form.name} onChange={e => f("name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Gewerk</label>
            <select className="form-select" value={form.gewerk} onChange={e => f("gewerk", e.target.value)}>
              <option>Rohbau</option><option>Elektro</option><option>Sanitär</option><option>Heizung</option><option>Sonstiges</option>
            </select>
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Ansprechpartner</label>
              <input className="form-input" value={form.ansprechpartner} onChange={e => f("ansprechpartner", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon</label>
              <input className="form-input" value={form.kontakt} onChange={e => f("kontakt", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input className="form-input" type="email" value={form.email} onChange={e => f("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Bewertung</label>
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" style={{ fontSize: "20px", background: "none", border: "none", cursor: "pointer", color: n <= form.bewertung ? "var(--warning)" : "var(--gray-300)" }} onClick={() => f("bewertung", n)}>★</button>)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notiz</label>
            <textarea className="form-textarea" style={{ minHeight: "60px" }} value={form.notiz} onChange={e => f("notiz", e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DOKUMENTE TAB ────────────────────────────────────────────────────────
function DokumenteTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: "", typ: "Grundriss", datum: today(), groesse: "", wichtig: false
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.name) return;
    onUpdate({ ...project, dokumente: [...project.dokumente, { id: uid(), ...form }] });
    setShowNew(false);
    setForm({ name: "", typ: "Grundriss", datum: today(), groesse: "", wichtig: false });
  };

  const del = (id) => onUpdate({ ...project, dokumente: project.dokumente.filter(d => d.id !== id) });

  const DOK_TYPES = ["Baugenehmigung", "Lageplan", "Grundriss", "Statik", "Vertrag", "Rechnung", "Abnahmeprotokoll", "Foto", "Zertifikat"];

  return (
    <div className="gap">
      <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Dokument</button>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Typ</th><th>Dateiname</th><th>Datum</th><th>Wichtig</th><th></th></tr></thead>
            <tbody>
              {project.dokumente.map(d => (
                <tr key={d.id}>
                  <td><Badge color="#0EA5E9">{d.typ}</Badge></td>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td style={{ fontSize: "12px", color: "var(--gray-500)" }}>{fmtDate(d.datum)}</td>
                  <td>{d.wichtig ? "⭐" : ""}</td>
                  <td><button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(d.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <Modal title="Dokument hinzufügen" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Dateiname *</label>
            <input className="form-input" value={form.name} onChange={e => f("name", e.target.value)} />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Typ</label>
              <select className="form-select" value={form.typ} onChange={e => f("typ", e.target.value)}>
                {DOK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Datum</label>
              <input className="form-input" type="date" value={form.datum} onChange={e => f("datum", e.target.value)} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
            <input type="checkbox" checked={form.wichtig} onChange={e => f("wichtig", e.target.checked)} />
            Wichtig (⭐)
          </label>
        </Modal>
      )}
    </div>
  );
}


// ─── MÄNGEL TAB ───────────────────────────────────────────────────────────
function MängelTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    titel: "", beschreibung: "", status: "offen", prio: "mittel", gewerk: "Rohbau", firma: "", gemeldetAm: today()
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.titel) return;
    onUpdate({ ...project, maengel: [...project.maengel, { id: uid(), ...form }] });
    setShowNew(false);
    setForm({ titel: "", beschreibung: "", status: "offen", prio: "mittel", gewerk: "Rohbau", firma: "", gemeldetAm: today() });
  };

  const del = (id) => onUpdate({ ...project, maengel: project.maengel.filter(m => m.id !== id) });

  const offen = project.maengel.filter(m => m.status === "offen").length;

  return (
    <div className="gap">
      {offen > 0 && <div className="alert alert-error">⚠️ {offen} offene Mängel müssen behoben werden!</div>}

      <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Mangel melden</button>

      <div className="card">
        {project.maengel.length === 0 ? (
          <div className="empty"><div className="empty-icon">✓</div><h3>Keine Mängel</h3></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Status</th><th>Mangel</th><th>Gewerk</th><th>Prio</th><th>Firma</th><th></th></tr></thead>
              <tbody>
                {project.maengel.map(m => (
                  <tr key={m.id}>
                    <td><select value={m.status} onChange={e => onUpdate({ ...project, maengel: project.maengel.map(x => x.id === m.id ? { ...x, status: e.target.value } : x) })} style={{ border: "none", background: "transparent", fontSize: "12px", cursor: "pointer" }}>
                      <option value="offen">Offen</option><option value="gemeldet">Gemeldet</option><option value="behoben">Behoben</option>
                    </select></td>
                    <td style={{ fontWeight: 500 }}>{m.titel}{m.beschreibung && <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>{m.beschreibung}</div>}</td>
                    <td><Badge color="#0EA5E9">{m.gewerk}</Badge></td>
                    <td><Badge color={m.prio === "hoch" ? "var(--error)" : "var(--warning)"}>{m.prio}</Badge></td>
                    <td style={{ fontSize: "12px", color: "var(--gray-500)" }}>{m.firma || "–"}</td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(m.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Mangel melden" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Titel *</label>
            <input className="form-input" value={form.titel} onChange={e => f("titel", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Beschreibung</label>
            <textarea className="form-textarea" style={{ minHeight: "60px" }} value={form.beschreibung} onChange={e => f("beschreibung", e.target.value)} />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Gewerk</label>
              <select className="form-select" value={form.gewerk} onChange={e => f("gewerk", e.target.value)}>
                {["Rohbau", "Elektro", "Sanitär", "Sonstiges"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priorität</label>
              <select className="form-select" value={form.prio} onChange={e => f("prio", e.target.value)}>
                <option value="niedrig">Niedrig</option><option value="mittel">Mittel</option><option value="hoch">Hoch</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Firma</label>
            <input className="form-input" value={form.firma} onChange={e => f("firma", e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── BAUTAGEBUCH TAB ──────────────────────────────────────────────────────
function BautagebuchTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    datum: today(), wetter: "Sonnig", temp: "", eintrag: "", fotos: 0, verfasser: ""
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.eintrag) return;
    onUpdate({ ...project, bautagebuch: [{ id: uid(), ...form, fotos: parseInt(form.fotos) || 0 }, ...project.bautagebuch] });
    setShowNew(false);
    setForm({ datum: today(), wetter: "Sonnig", temp: "", eintrag: "", fotos: 0, verfasser: "" });
  };

  const del = (id) => onUpdate({ ...project, bautagebuch: project.bautagebuch.filter(e => e.id !== id) });

  return (
    <div className="gap">
      <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Eintrag</button>

      <div className="card">
        {project.bautagebuch.length === 0 ? (
          <div className="empty"><div className="empty-icon">📔</div><h3>Kein Bautagebuch</h3></div>
        ) : (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {project.bautagebuch.map(e => (
              <div key={e.id} style={{ padding: "16px", background: "var(--gray-50)", borderRadius: "10px", borderLeft: "4px solid var(--accent)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>{fmtDate(e.datum)}</div>
                    <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "2px" }}>{e.wetter} • {e.temp}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(e.id)}>🗑</button>
                </div>
                <div style={{ fontSize: "13px", lineHeight: 1.6, marginTop: "8px", whiteSpace: "pre-wrap" }}>{e.eintrag}</div>
                {(e.fotos > 0 || e.verfasser) && <div style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "8px", display: "flex", gap: "12px" }}>
                  {e.fotos > 0 && <span>📷 {e.fotos} Fotos</span>}
                  {e.verfasser && <span>✍️ {e.verfasser}</span>}
                </div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Bautagebuch Eintrag" onClose={() => setShowNew(false)} onSave={save}>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Datum</label>
              <input className="form-input" type="date" value={form.datum} onChange={e => f("datum", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Wetter</label>
              <select className="form-select" value={form.wetter} onChange={e => f("wetter", e.target.value)}>
                {["Sonnig", "Bewölkt", "Regen", "Schnee", "Nebel", "Gewitter"].map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Temperatur</label>
              <input className="form-input" value={form.temp} onChange={e => f("temp", e.target.value)} placeholder="z.B. 18°C" />
            </div>
            <div className="form-group">
              <label className="form-label">Fotos (Anzahl)</label>
              <input className="form-input" type="number" value={form.fotos} onChange={e => f("fotos", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Verfasser</label>
            <input className="form-input" value={form.verfasser} onChange={e => f("verfasser", e.target.value)} placeholder="Name/Rolle" />
          </div>
          <div className="form-group">
            <label className="form-label">Bericht *</label>
            <textarea className="form-textarea" style={{ minHeight: "120px" }} value={form.eintrag} onChange={e => f("eintrag", e.target.value)} placeholder="Welche Arbeiten heute? Firmen? Besonderheiten?" />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ZAHLUNGSPLAN TAB ─────────────────────────────────────────────────────
function ZahlungsplanTab({ project, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    bezeichnung: "", faellig: today(), betrag: "", bezahlt: false
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.bezeichnung || !form.betrag) return;
    onUpdate({ ...project, zahlungsplan: [...project.zahlungsplan, { id: uid(), ...form, betrag: parseFloat(form.betrag) }] });
    setShowNew(false);
    setForm({ bezeichnung: "", faellig: today(), betrag: "", bezahlt: false });
  };

  const del = (id) => onUpdate({ ...project, zahlungsplan: project.zahlungsplan.filter(z => z.id !== id) });

  const toggle = (id) => onUpdate({ ...project, zahlungsplan: project.zahlungsplan.map(z => z.id === id ? { ...z, bezahlt: !z.bezahlt } : z) });

  const total = project.zahlungsplan.reduce((s, z) => s + z.betrag, 0);
  const bezahlt = project.zahlungsplan.filter(z => z.bezahlt).reduce((s, z) => s + z.betrag, 0);

  return (
    <div className="gap">
      <div className="g3">
        <div className="kpi"><div className="kpi-label">Gesamtplan</div><div className="kpi-value" style={{ fontSize: "20px" }}>{fmtEUR(total)}</div></div>
        <div className="kpi"><div className="kpi-label">Bezahlt</div><div className="kpi-value" style={{ fontSize: "20px", color: "var(--success)" }}>{fmtEUR(bezahlt)}</div><div className="kpi-sub">{pct(bezahlt, total || 1)}%</div></div>
        <div className="kpi"><div className="kpi-label">Offen</div><div className="kpi-value" style={{ fontSize: "20px" }}>{fmtEUR(total - bezahlt)}</div></div>
      </div>

      <ProgBar value={pct(bezahlt, total || 1)} />

      <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Meilenstein</button>

      <div className="card">
        {project.zahlungsplan.length === 0 ? (
          <div className="empty"><div className="empty-icon">💳</div><h3>Kein Zahlungsplan</h3></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>#</th><th>Bezeichnung</th><th>Fällig</th><th style={{ textAlign: "right" }}>Betrag</th><th></th><th></th></tr></thead>
              <tbody>
                {project.zahlungsplan.map((z, i) => (
                  <tr key={z.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{z.bezeichnung}</td>
                    <td style={{ fontSize: "12px", color: "var(--gray-500)" }}>{fmtDate(z.faellig)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtEUR(z.betrag)}</td>
                    <td><button className={`btn btn-sm ${z.bezahlt ? "btn-primary" : "btn-secondary"}`} onClick={() => toggle(z.id)}>{z.bezahlt ? "✓" : "Ausstehend"}</button></td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(z.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Zahlungsmeilenstein" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Bezeichnung *</label>
            <input className="form-input" value={form.bezeichnung} onChange={e => f("bezeichnung", e.target.value)} placeholder="z.B. Rohbau fertig" />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Betrag (€) *</label>
              <input className="form-input" type="number" value={form.betrag} onChange={e => f("betrag", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Fällig am</label>
              <input className="form-input" type="date" value={form.faellig} onChange={e => f("faellig", e.target.value)} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
            <input type="checkbox" checked={form.bezahlt} onChange={e => f("bezahlt", e.target.checked)} />
            Bereits bezahlt
          </label>
        </Modal>
      )}
    </div>
  );
}


// ─── DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard({ projects, setView, setCurrentProject }) {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalAusgaben = projects.reduce((s, p) => s + p.ausgaben, 0);
  const allTasks = projects.flatMap(p => p.aufgaben);
  const offene = allTasks.filter(t => t.status !== "done").length;
  const doneTasks = allTasks.filter(t => t.status === "done").length;
  const offeneMaengel = projects.flatMap(p => p.maengel).filter(m => m.status !== "behoben").length;

  const open = (p) => { setCurrentProject(p.id); setView("project"); };

  return (
    <div className="gap">
      {pct(totalAusgaben, totalBudget) > 90 && <div className="alert alert-error">⚠️ Budget zu {pct(totalAusgaben, totalBudget)}% ausgeschöpft!</div>}
      {offene > 10 && <div className="alert alert-warning">📋 {offene} offene Aufgaben - bitte Priorisierung überprüfen!</div>}
      {offeneMaengel > 0 && <div className="alert alert-error">⚠️ {offeneMaengel} offene Mängel</div>}

      <div className="g4">
        <div className="kpi"><div className="kpi-label">Aktive Projekte</div><div className="kpi-value">{projects.length}</div></div>
        <div className="kpi"><div className="kpi-label">Gesamtbudget</div><div className="kpi-value" style={{ fontSize: "20px" }}>{fmtEUR(totalBudget)}</div></div>
        <div className="kpi"><div className="kpi-label">Ausgegeben</div><div className="kpi-value" style={{ fontSize: "20px", color: pct(totalAusgaben, totalBudget) > 90 ? "var(--error)" : "var(--accent)" }}>{fmtEUR(totalAusgaben)}</div><div className="kpi-sub">{pct(totalAusgaben, totalBudget)}%</div></div>
        <div className="kpi"><div className="kpi-label">Restbudget</div><div className="kpi-value" style={{ fontSize: "20px", color: "var(--success)" }}>{fmtEUR(totalBudget - totalAusgaben)}</div></div>
        <div className="kpi"><div className="kpi-label">Offene Tasks</div><div className="kpi-value">{offene}</div><div className="kpi-sub">{doneTasks} erledigt</div></div>
        <div className="kpi"><div className="kpi-label">Offene Mängel</div><div className="kpi-value" style={{ color: offeneMaengel > 0 ? "var(--error)" : "var(--success)" }}>{offeneMaengel}</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Meine Projekte</span>
          <button className="btn btn-primary btn-sm" onClick={() => setView("projekte")}>Alle</button>
        </div>
        <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {projects.map(p => {
            const done = p.aufgaben.filter(t => t.status === "done").length;
            return (
              <div key={p.id} onClick={() => open(p)} style={{
                background: "white", border: "1px solid var(--gray-200)", borderRadius: "12px", overflow: "hidden",
                cursor: "pointer", transition: "all var(--tr)", boxShadow: "var(--shadow-sm)", position: "relative"
              }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ height: "5px", background: "linear-gradient(90deg, var(--accent), #60A5FA)" }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--gray-500)", marginBottom: "10px" }}>{p.adresse}</div>
                  <ProgBar value={p.fortschritt} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--gray-500)", marginTop: "8px" }}>
                    <span>{p.fortschritt}%</span><span>{done}/{p.aufgaben.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PROJEKT LISTE ────────────────────────────────────────────────────────
function ProjektListe({ projects, setProjects, setView, setCurrentProject }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: "", adresse: "", status: "planung", budget: "", start: today(),
    beschreibung: "", wohnflaeche: "", grundstueck: ""
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const save = () => {
    if (!form.name) return;
    setProjects(ps => [...ps, {
      id: uid(), ...form, budget: parseFloat(form.budget) || 0, wohnflaeche: parseFloat(form.wohnflaeche) || 0,
      grundstueck: parseFloat(form.grundstueck) || 0, ausgaben: 0, fortschritt: 0, aufgaben: [], ausgabenListe: [],
      firmen: [], dokumente: [], maengel: [], bautagebuch: [], notizen: "", risiken: [], zahlungsplan: []
    }]);
    setShowNew(false);
  };

  const open = (p) => { setCurrentProject(p.id); setView("project"); };

  const del = (id) => setProjects(ps => ps.filter(p => p.id !== id));

  return (
    <div className="gap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Alle Projekte</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Neues Projekt</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {projects.map(p => (
          <div key={p.id} style={{
            background: "white", border: "1px solid var(--gray-200)", borderRadius: "12px", overflow: "hidden",
            cursor: "pointer", transition: "all var(--tr)"
          }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ height: "5px", background: "linear-gradient(90deg, var(--accent), #60A5FA)" }} />
            <div style={{ padding: "16px", cursor: "pointer" }} onClick={() => open(p)}>
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{p.name}</div>
              <div style={{ fontSize: "12px", color: "var(--gray-500)" }}>{p.adresse}</div>
            </div>
            <div style={{ padding: "8px 16px", background: "var(--gray-50)", borderTop: "1px solid var(--gray-100)", display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => open(p)}>Öffnen</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }} onClick={() => del(p.id)}>Löschen</button>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <Modal title="Neues Projekt" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Projektname *</label>
            <input className="form-input" value={form.name} onChange={e => f("name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input className="form-input" value={form.adresse} onChange={e => f("adresse", e.target.value)} />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Budget (€)</label>
              <input className="form-input" type="number" value={form.budget} onChange={e => f("budget", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => f("status", e.target.value)}>
                <option value="planung">Planung</option><option value="genehmigung">Genehmigung</option>
                <option value="bau">Im Bau</option><option value="abnahme">Abnahme</option><option value="fertig">Fertig</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={save}>Erstellen</button>
        </Modal>
      )}
    </div>
  );
}


// ─── PROJEKT DETAIL VIEW ──────────────────────────────────────────────────
function ProjektDetail({ project, updateProject, setView }) {
  const [tab, setTab] = useState("überblick");

  if (!project) return <div className="empty"><div className="empty-icon">📋</div></div>;

  const tabs = [
    ["überblick", "Überblick"],
    ["aufgaben", "Aufgaben"],
    ["kosten", "Kosten"],
    ["firmen", "Firmen"],
    ["dokumente", "Dokumente"],
    ["maengel", "Mängel"],
    ["bautagebuch", "Tagebuch"],
    ["zahlungsplan", "Zahlungsplan"]
  ];

  return (
    <div className="gap">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>{project.name}</h1>
            <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>{project.adresse}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="card-body">
          <div className="g4">
            <div><div style={{ fontSize: "10px", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Budget</div><div style={{ fontSize: "18px", fontWeight: 800 }}>{fmtEUR(project.budget)}</div></div>
            <div><div style={{ fontSize: "10px", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Ausgaben</div><div style={{ fontSize: "18px", fontWeight: 800, color: pct(project.ausgaben, project.budget) > 90 ? "var(--error)" : "var(--accent)" }}>{fmtEUR(project.ausgaben)}</div></div>
            <div><div style={{ fontSize: "10px", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Fortschritt</div><div style={{ fontSize: "18px", fontWeight: 800 }}>{project.fortschritt}%</div></div>
            <div><div style={{ fontSize: "10px", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Tasks</div><div style={{ fontSize: "18px", fontWeight: 800 }}>{project.aufgaben.filter(t => t.status === "done").length}/{project.aufgaben.length}</div></div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <ProgBar value={project.fortschritt} />
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(([v, l]) => (
          <button key={v} className={`tab ${tab === v ? "active" : ""}`} onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "überblick" && (
        <div className="gap">
          <div className="card">
            <div className="card-body">
              <label className="form-label">Fortschritt anpassen</label>
              <input type="range" min="0" max="100" value={project.fortschritt} onChange={e => updateProject({ ...project, fortschritt: parseInt(e.target.value) })} style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ textAlign: "center", fontWeight: 800, fontSize: "24px", color: "var(--accent)", marginTop: "8px" }}>
                {project.fortschritt}%
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "aufgaben" && <AufgabenTab project={project} onUpdate={updateProject} />}
      {tab === "kosten" && <KostenTab project={project} onUpdate={updateProject} />}
      {tab === "firmen" && <FirmenTab project={project} onUpdate={updateProject} />}
      {tab === "dokumente" && <DokumenteTab project={project} onUpdate={updateProject} />}
      {tab === "maengel" && <MängelTab project={project} onUpdate={updateProject} />}
      {tab === "bautagebuch" && <BautagebuchTab project={project} onUpdate={updateProject} />}
      {tab === "zahlungsplan" && <ZahlungsplanTab project={project} onUpdate={updateProject} />}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState([
    {
      id: "demo1", name: "Premium Villa Neubau", status: "bau", adresse: "Hannover",
      budget: 850000, ausgaben: 421000, fortschritt: 52, beschreibung: "KfW 40+ Neubau",
      wohnflaeche: 240, grundstueck: 650, start: "2024-02-15", ende: "2025-08-30",
      aufgaben: [
        { id: uid(), titel: "Baugenehmigung", status: "done", prio: "hoch", gewerk: "Planung", firma: "", faellig: "2024-03-01", kosten: 0, notiz: "" },
        { id: uid(), titel: "Erdarbeiten", status: "done", prio: "hoch", gewerk: "Erdarbeiten", firma: "Meier GmbH", faellig: "2024-04-30", kosten: 32000, notiz: "" },
        { id: uid(), titel: "Rohbau", status: "progress", prio: "hoch", gewerk: "Rohbau", firma: "Schmidt GmbH", faellig: "2024-09-30", kosten: 150000, notiz: "Richtfest geplant" },
      ],
      ausgabenListe: [
        { id: uid(), beschreibung: "Erdarbeiten", betrag: 32000, datum: "2024-04-25", gewerk: "Erdarbeiten", firma: "Meier", rechnungNr: "001", bezahlt: true },
        { id: uid(), beschreibung: "Rohbau Abschlag", betrag: 75000, datum: "2024-09-10", gewerk: "Rohbau", firma: "Schmidt", rechnungNr: "R-001", bezahlt: false },
      ],
      firmen: [
        { id: uid(), name: "Schmidt Rohbau GmbH", gewerk: "Rohbau", kontakt: "0511 12345", email: "info@schmidt.de", ansprechpartner: "Klaus Schmidt", bewertung: 5, notiz: "Sehr zuverlässig" },
      ],
      dokumente: [
        { id: uid(), name: "Baugenehmigung.pdf", typ: "Baugenehmigung", datum: "2024-01-28", groesse: "2.4 MB", wichtig: true },
      ],
      maengel: [
        { id: uid(), titel: "Riss in Kellerwand", beschreibung: "Horizontaler Riss ca. 40cm", status: "gemeldet", prio: "hoch", gewerk: "Rohbau", firma: "Schmidt", gemeldetAm: "2024-06-15" },
      ],
      bautagebuch: [
        { id: uid(), datum: "2024-09-05", wetter: "Sonnig", temp: "22°C", eintrag: "Dachstuhlarbeiten begonnen", fotos: 3, verfasser: "Bauleiter Weber" },
      ],
      zahlungsplan: [
        { id: uid(), bezeichnung: "Grundstück", faellig: "2024-01-15", betrag: 250000, bezahlt: true },
        { id: uid(), bezeichnung: "Rohbau", faellig: "2024-09-30", betrag: 300000, bezahlt: false },
      ],
      notizen: "KfW-Förderung genehmigt! Bauleiter: Frank Weber",
      risiken: []
    }
  ]);

  const [view, setView] = useState("dashboard");
  const [currentProjId, setCurrentProjId] = useState(null);

  const currentProject = projects.find(p => p.id === currentProjId);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">⚙</div>
            <div>
              <div className="logo-text">BauControl</div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>Pro</div>
            </div>
          </div>

          <div className="sidebar-scroll">
            <div className="nav-section">
              <div className="nav-label">Menü</div>
              <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
                <span className="nav-icon">📊</span><span>Dashboard</span>
              </div>
              <div className={`nav-item ${view === "projekte" ? "active" : ""}`} onClick={() => setView("projekte")}>
                <span className="nav-icon">📋</span><span>Projekte</span>
              </div>
            </div>

            {projects.length > 0 && (
              <div className="nav-section">
                <div className="nav-label">Projekte</div>
                {projects.map(p => (
                  <div key={p.id} className={`nav-item ${view === "project" && currentProjId === p.id ? "active" : ""}`}
                    onClick={() => { setCurrentProjId(p.id); setView("project"); }}>
                    <span className="nav-icon">🏗</span><span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button className="btn btn-primary" style={{ width: "100%", fontSize: "12px" }} onClick={() => setView("projekte")}>
              + Projekt
            </button>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              {view === "dashboard" && "Dashboard"}
              {view === "projekte" && "Alle Projekte"}
              {view === "project" && currentProject?.name}
            </div>
            <div className="topbar-chip">
              {new Date().toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>

          <div className="content">
            {view === "dashboard" && <Dashboard projects={projects} setView={setView} setCurrentProject={setCurrentProjId} />}
            {view === "projekte" && <ProjektListe projects={projects} setProjects={setProjects} setView={setView} setCurrentProject={setCurrentProjId} />}
            {view === "project" && currentProject && <ProjektDetail project={currentProject} updateProject={(p) => setProjects(ps => ps.map(x => x.id === p.id ? p : x))} setView={setView} />}
          </div>
        </div>
      </div>
    </>
  );
}
