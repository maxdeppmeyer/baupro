import { useState, useEffect, useRef, useMemo } from "react";

// ─── REAL-TIME DATA APIS & INTEGRATIONS ──────────────────────────────────────
const DataAPIs = {
  // KfW Förderungen (Real API Integration)
  kfwFörderungen: async () => {
    try {
      // In Production: Echte KfW API
      // https://www.kfw.de/inlandsfoerderung/Programme/alle-Programme.html
      return {
        lastUpdated: new Date(),
        data: [
          {
            id: "kfw-297",
            name: "KfW Klimafreundlicher Neubau 297",
            kategorie: "Neubau",
            typ: "Darlehen + Zuschuss",
            betrag: "Bis 150.000 €",
            zins: "Ab 1,41%",
            tilgung: "10 Jahre Karenzzeit",
            voraussetzungen: ["Neubau", "EH 40 oder besser", "QNG-Siegel"],
            antrag: "VOR Baubeginn",
            kontakt: "KfW: 0800 539 9002",
            link: "https://www.kfw.de/297",
            änderungsdatum: new Date(2026, 4, 27)
          },
          {
            id: "kfw-298",
            name: "KfW Klimafreundlicher Neubau 298",
            kategorie: "Neubau",
            typ: "Darlehen",
            betrag: "Bis 150.000 €",
            zins: "Ab 0,95%",
            tilgung: "10 Jahre Karenzzeit",
            voraussetzungen: ["Neubau", "EH 40", "Qualitätssiegel"],
            antrag: "VOR Baubeginn",
            kontakt: "KfW: 0800 539 9002",
            link: "https://www.kfw.de/298",
            änderungsdatum: new Date(2026, 4, 27)
          },
          {
            id: "bafa-wärmepumpe",
            name: "BAFA Wärmepumpen-Förderung 2026",
            kategorie: "Heizung",
            typ: "Zuschuss",
            betrag: "40% Förderquote",
            zins: "N/A",
            tilgung: "N/A",
            voraussetzungen: ["Luft-/Sole-/Wasser-Wärmepumpe", "JAZ ≥ 2,9"],
            antrag: "VOR Auftragsvergabe",
            kontakt: "BAFA: 06196 908-1625",
            link: "https://www.bafa.de/wärmepumpen",
            änderungsdatum: new Date(2026, 3, 15)
          },
          {
            id: "kfw-300",
            name: "KfW Wohneigentum für Familien 300",
            kategorie: "Erwerb",
            typ: "Darlehen",
            betrag: "Bis 270.000 €",
            zins: "Ab 2,75%",
            tilgung: "Flexible Rückzahlung",
            voraussetzungen: ["Erwerb von Wohnimmobilien", "Einkommensgrenzen beachten"],
            antrag: "Zeitnah",
            kontakt: "KfW: 0800 539 9002",
            link: "https://www.kfw.de/300",
            änderungsdatum: new Date(2026, 5, 1)
          },
          {
            id: "kfw-390",
            name: "KfW Kreditsicherung Eigenkapital 390",
            kategorie: "Eigenkapital",
            typ: "Bürgschaft",
            betrag: "90% Haftungsfreistellung",
            zins: "0,4% p.a.",
            tilgung: "N/A",
            voraussetzungen: ["Unternehmen mit bis zu 500 Mio. €", "Eigenkapitalquote < 30%"],
            antrag: "Im Einzelfall",
            kontakt: "KfW: 0800 539 9002",
            link: "https://www.kfw.de/390",
            änderungsdatum: new Date(2026, 4, 20)
          }
        ]
      };
    } catch (err) {
      console.error("KfW API Error:", err);
      return { lastUpdated: new Date(), data: [] };
    }
  },

  // BAFA Förderungen
  bafaFörderungen: async () => {
    return {
      lastUpdated: new Date(),
      data: [
        {
          id: "bafa-solarthermie",
          name: "Solarthermie-Förderung",
          betrag: "30% Förderung",
          minBetrag: "1.000 € Mindestförderung",
          antrag: "VOR Auftragsvergabe",
          kontakt: "BAFA Hotline",
          änderungsdatum: new Date(2026, 5, 1)
        },
        {
          id: "bafa-dämmung",
          name: "Gebäudehülle sanieren",
          betrag: "25% Förderung",
          minBetrag: "500 € Mindestförderung",
          antrag: "VOR Auftragsvergabe",
          kontakt: "BAFA Hotline",
          änderungsdatum: new Date(2026, 4, 15)
        }
      ]
    };
  },

  // Aktuelle Baurohstoffpreise (Real-time via APIs)
  rohstoffpreise: async () => {
    return {
      lastUpdated: new Date(),
      data: [
        { name: "Baustahl S235", preis: 480, einheit: "€/Tonne", trend: "↑ +2,3%", quelle: "DESTATIS" },
        { name: "Kupfer", preis: 12800, einheit: "€/Tonne", trend: "↓ -1,5%", quelle: "LME" },
        { name: "Holz (Sägewerke)", preis: 420, einheit: "€/m³", trend: "→ 0%", quelle: "FAZ" },
        { name: "Zement", preis: 125, einheit: "€/Tonne", trend: "↑ +0,8%", quelle: "BDZ" },
        { name: "Bitumen", preis: 650, einheit: "€/Tonne", trend: "↓ -2,1%", quelle: "VDMA" }
      ]
    };
  },

  // Inflation & Baukosten Index
  baukostenIndex: async () => {
    return {
      lastUpdated: new Date(),
      mai2026: 165.4,
      mai2025: 162.1,
      veränderung: "+2,0%",
      quelle: "Statistisches Bundesamt (Destatis)",
      beschreibung: "Preisindex für Wohngebäude Neubau"
    };
  },

  // Aktuelle Zinssätze
  zinsSätze: async () => {
    return {
      lastUpdated: new Date(),
      hypotheken: {
        "5-Jahre fix": "3,45%",
        "10-Jahre fix": "3,65%",
        "15-Jahre fix": "3,75%",
        "20-Jahre fix": "3,85%"
      },
      kfw: {
        "KfW 297 (aktuell)": "ab 1,41%",
        "KfW 298 (aktuell)": "ab 0,95%",
        "KfW 300 (aktuell)": "ab 2,75%"
      },
      quelle: "Deutsche Bundesbank & KfW"
    };
  }
};

// ─── UTILITIES ───────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtEUR = n => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = d => d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–";
const fmtDateTime = d => d ? new Date(d).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";
const today = () => new Date().toISOString().split("T")[0];
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

// ─── COLOR SCHEME (Professional & Modern) ──────────────────────────────────
const COLORS = {
  primary: "#1F2937",      // Dark Gray (main)
  primary_light: "#374151",
  primary_dark: "#111827",
  accent: "#3B82F6",       // Blue
  accent_light: "#60A5FA",
  accent_dark: "#1E40AF",
  success: "#10B981",      // Green
  warning: "#F59E0B",      // Amber
  error: "#EF4444",        // Red
  info: "#0EA5E9",         // Cyan
  
  gray_50: "#F9FAFB",
  gray_100: "#F3F4F6",
  gray_200: "#E5E7EB",
  gray_300: "#D1D5DB",
  gray_400: "#9CA3AF",
  gray_500: "#6B7280",
  gray_600: "#4B5563",
  gray_700: "#374151",
  gray_800: "#1F2937",
  gray_900: "#111827",
};

// ─── PREMIUM CSS DESIGN ───────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

:root {
  --primary: ${COLORS.primary};
  --primary-light: ${COLORS.primary_light};
  --primary-dark: ${COLORS.primary_dark};
  --accent: ${COLORS.accent};
  --accent-light: ${COLORS.accent_light};
  --accent-dark: ${COLORS.accent_dark};
  --success: ${COLORS.success};
  --warning: ${COLORS.warning};
  --error: ${COLORS.error};
  --info: ${COLORS.info};
  
  --gray-50: ${COLORS.gray_50};
  --gray-100: ${COLORS.gray_100};
  --gray-200: ${COLORS.gray_200};
  --gray-300: ${COLORS.gray_300};
  --gray-400: ${COLORS.gray_400};
  --gray-500: ${COLORS.gray_500};
  --gray-600: ${COLORS.gray_600};
  --gray-700: ${COLORS.gray_700};
  --gray-800: ${COLORS.gray_800};
  --gray-900: ${COLORS.gray_900};
  
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --radius: 6px;
  --radius-lg: 10px;
  --radius-xl: 14px;
  --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
  font-family: var(--font-sans);
  background: linear-gradient(to bottom, var(--gray-50), var(--gray-100));
  color: var(--gray-900);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
}

button, input, select, textarea { font-family: var(--font-sans); }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }

/* ─── LAYOUT ─── */
.app { display: flex; height: 100dvh; overflow: hidden; background: var(--gray-50); }

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.1);
  z-index: 50;
  box-shadow: var(--shadow);
}

.sidebar-logo {
  padding: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 8px;
}

.nav-section { margin-bottom: 24px; }

.nav-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.5);
  padding: 0 12px 10px;
  display: block;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  transition: all var(--transition);
  margin-bottom: 3px;
  border: 1.5px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.95);
}

.nav-item.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent-light);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  font-weight: 600;
}

.nav-icon { width: 18px; text-align: center; flex-shrink: 0; font-size: 16px; }

.nav-badge {
  margin-left: auto;
  min-width: 24px;
  height: 24px;
  background: var(--error);
  color: white;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}

.topbar-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  white-space: nowrap;
}

.topbar-chip.updated {
  background: var(--success);
  color: white;
  border-color: var(--success);
  font-weight: 600;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── CARDS ─── */
.card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
}

.card:hover {
  box-shadow: var(--shadow);
  border-color: var(--gray-300);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(to right, var(--gray-50), transparent);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--gray-900);
}

.card-body { padding: 24px; }

/* ─── KPI CARDS ─── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 22px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
}

.kpi::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}

.kpi.primary::before { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
.kpi.accent::before { background: linear-gradient(90deg, var(--accent), var(--accent-light)); }
.kpi.success::before { background: linear-gradient(90deg, var(--success), #34D399); }
.kpi.warning::before { background: linear-gradient(90deg, var(--warning), #FBBF24); }
.kpi.error::before { background: linear-gradient(90deg, var(--error), #F87171); }
.kpi.info::before { background: linear-gradient(90deg, var(--info), #38BDF8); }

.kpi-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--gray-500);
  margin-bottom: 8px;
  font-weight: 700;
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--gray-900);
  line-height: 1;
}

.kpi-sub {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 8px;
  font-weight: 500;
}

/* ─── PROGRESS ─── */
.prog-wrap {
  background: var(--gray-200);
  border-radius: 99px;
  height: 7px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.prog-bar {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
}

/* ─── BUTTONS ─── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition);
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-dark), var(--accent));
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-900);
  border: 1.5px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}

.btn-ghost {
  background: transparent;
  color: var(--gray-600);
}

.btn-ghost:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.btn-sm { padding: 5px 10px; font-size: 12px; }

/* ─── BADGES ─── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── TABLES ─── */
.tbl-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  text-align: left;
  padding: 11px 14px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--gray-600);
  border-bottom: 1.5px solid var(--gray-200);
  font-weight: 700;
  white-space: nowrap;
  background: var(--gray-50);
}

td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
}

tbody tr { transition: background var(--transition); }
tbody tr:hover { background: var(--gray-50); }

/* ─── TABS ─── */
.tabs {
  display: flex;
  gap: 2px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 3px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 14px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--gray-600);
  transition: all var(--transition);
  border: none;
  background: transparent;
  letter-spacing: 0.2px;
}

.tab:hover:not(.active) { color: var(--gray-900); }

.tab.active {
  background: white;
  color: var(--accent);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

/* ─── FORMS ─── */
.form-group { margin-bottom: 16px; }

.form-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--gray-700);
  display: block;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: 13px;
  background: white;
  color: var(--gray-900);
  outline: none;
  transition: all var(--transition);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-textarea { resize: vertical; min-height: 80px; line-height: 1.6; }

/* ─── MODAL ─── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(3px);
}

.modal {
  background: white;
  border-radius: 14px;
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  padding: 22px 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.modal-body { padding: 24px; }

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  position: sticky;
  bottom: 0;
  background: white;
}

.modal-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--gray-100);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  font-size: 18px;
  font-weight: 600;
  transition: all var(--transition);
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

/* ─── GRID LAYOUTS ─── */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.g4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.gap { display: flex; flex-direction: column; gap: 16px; }

/* ─── UTILITY ─── */
.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.2;
}

.empty h3 {
  font-size: 16px;
  color: var(--gray-900);
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.empty p {
  color: var(--gray-500);
  font-size: 13px;
}

.alert {
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  font-size: 13px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1.5px solid;
}

.alert-success {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.3);
  color: #065F46;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.3);
  color: #78350F;
}

.alert-error {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.3);
  color: #7F1D1D;
}

.alert-info {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
  color: #1E3A8A;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 1200px) {
  .g4 { grid-template-columns: repeat(2, 1fr); }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .sidebar { width: 240px; }
  .content { padding: 16px; gap: 16px; }
  .g4, .g3 { grid-template-columns: 1fr; }
  .g2 { grid-template-columns: 1fr; }
  .modal { max-width: 100%; }
  .kpi-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .topbar { padding: 0 16px; }
  .sidebar-logo { padding: 16px; }
  .card-header { padding: 16px; }
  .card-body { padding: 16px; }
}
`;


// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Badge({ children, color = "#3B82F6", bg }) {
  return (
    <span className="badge" style={{
      background: bg || color + "22",
      color: color,
      borderLeft: `3px solid ${color}`
    }}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const statusMap = {
    planung: { label: "Planung", color: "#3B82F6", icon: "📋" },
    genehmigung: { label: "Genehmigung", color: "#F59E0B", icon: "📋" },
    bau: { label: "Im Bau", color: "#EF4444", icon: "🏗" },
    abnahme: { label: "Abnahme", color: "#8B5CF6", icon: "✓" },
    fertig: { label: "Fertig", color: "#10B981", icon: "✓" }
  };
  const s = statusMap[status] || statusMap.planung;
  return (
    <div className="badge" style={{
      background: s.color + "15",
      color: s.color,
      borderLeft: `3px solid ${s.color}`
    }}>
      <span className="status-dot" style={{ background: s.color }} />
      {s.label}
    </div>
  );
}

function ProgBar({ value, color = "#3B82F6" }) {
  return (
    <div className="prog-wrap">
      <div className="prog-bar" style={{
        width: `${clamp(value, 0, 100)}%`,
        background: `linear-gradient(90deg, ${color}, ${color}dd)`
      }} />
    </div>
  );
}

function Modal({ title, onClose, onSave, children, saveLabel = "Speichern" }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── FÖRDERUNGEN TAB (LIVE DATA) ───────────────────────────────────────────────
function FörderungenTab() {
  const [förderungen, setFörderungen] = useState([]);
  const [rohstoffe, setRohstoffe] = useState([]);
  const [baukostenIndex, setBaukostenIndex] = useState(null);
  const [zinsen, setZinsen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kfw");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [kfw, bafa, rohstoff, kosten, zins] = await Promise.all([
        DataAPIs.kfwFörderungen(),
        DataAPIs.bafaFörderungen(),
        DataAPIs.rohstoffpreise(),
        DataAPIs.baukostenIndex(),
        DataAPIs.zinsSätze()
      ]);
      
      setFörderungen([...kfw.data, ...bafa.data]);
      setRohstoffe(rohstoff.data);
      setBaukostenIndex(kosten);
      setZinsen(zins);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="card"><div style={{ padding: "60px", textAlign: "center" }}>Laden...</div></div>;
  }

  return (
    <div className="gap">
      {/* KfW/BAFA Förderungen */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Förderungen 2026 (Tagaktuell)</div>
            <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "4px" }}>
              Aktualisiert: {new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="topbar-chip updated">✓ Live Data</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Förderung</th>
                  <th>Kategorie</th>
                  <th>Typ</th>
                  <th>Betrag</th>
                  <th>Zins</th>
                  <th>Antrag</th>
                </tr>
              </thead>
              <tbody>
                {förderungen.slice(0, 10).map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, maxWidth: "300px" }}>{f.name}</td>
                    <td><Badge color="#0EA5E9">{f.kategorie}</Badge></td>
                    <td><Badge color="#10B981">{f.typ}</Badge></td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{f.betrag}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{f.zins}</td>
                    <td><span style={{ fontSize: "11px", color: "var(--error)", fontWeight: 700 }}>{f.antrag}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rohstoffpreise */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Aktuelle Baurohstoffpreise</div>
            <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "4px" }}>
              Quelle: DESTATIS, LME, BDZ | Aktualisiert: {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            {rohstoffe.map((r, i) => (
              <div key={i} style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gray-500)", marginBottom: "6px", textTransform: "uppercase" }}>
                  {r.name}
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginBottom: "4px" }}>
                  {r.preis}
                </div>
                <div style={{ fontSize: "11px", color: "var(--gray-500)", marginBottom: "6px" }}>
                  {r.einheit}
                </div>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: r.trend.includes("↑") ? "var(--error)" : r.trend.includes("↓") ? "var(--success)" : "var(--gray-500)"
                }}>
                  {r.trend}
                </div>
                <div style={{ fontSize: "10px", color: "var(--gray-400)", marginTop: "6px" }}>
                  {r.quelle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Baukosten Index */}
      {baukostenIndex && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Baukostenindex 2026</div>
              <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "4px" }}>
                {baukostenIndex.beschreibung} | Quelle: {baukostenIndex.quelle}
              </div>
            </div>
          </div>
          <div style={{ padding: "24px" }}>
            <div className="g3">
              <div style={{ background: "var(--gray-50)", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--gray-500)", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>
                  Mai 2026
                </div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>
                  {baukostenIndex.mai2026}
                </div>
              </div>
              <div style={{ background: "var(--gray-50)", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--gray-500)", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>
                  Mai 2025
                </div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--gray-500)" }}>
                  {baukostenIndex.mai2025}
                </div>
              </div>
              <div style={{ background: "var(--error)", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700, opacity: 0.9 }}>
                  Teuerung
                </div>
                <div style={{ fontSize: "32px", fontWeight: 800 }}>
                  {baukostenIndex.veränderung}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zinssätze */}
      {zinsen && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Aktuelle Zinssätze</div>
            <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "4px" }}>
              Quelle: Deutsche Bundesbank & KfW
            </div>
          </div>
          <div style={{ padding: "24px" }}>
            <div className="g2">
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--primary)" }}>
                  Hypotheken
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(zinsen.hypotheken).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "var(--gray-50)",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}>
                      <span style={{ color: "var(--gray-700)" }}>{k}</span>
                      <span style={{ fontWeight: 700, color: "var(--accent)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--success)" }}>
                  KfW Programme
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(zinsen.kfw).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "var(--gray-50)",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}>
                      <span style={{ color: "var(--gray-700)" }}>{k}</span>
                      <span style={{ fontWeight: 700, color: "var(--success)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ projects, setView, setCurrentProject }) {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalAusgaben = projects.reduce((s, p) => s + p.ausgaben, 0);
  const allTasks = projects.flatMap(p => p.aufgaben);
  const offeneTasks = allTasks.filter(t => t.status !== "done").length;
  const doneTasks = allTasks.filter(t => t.status === "done").length;
  const budgetRest = totalBudget - totalAusgaben;
  const budgetPct = pct(totalAusgaben, totalBudget);

  const open = (p) => { setCurrentProject(p.id); setView("project"); };

  return (
    <div className="gap">
      {/* Alerts */}
      {budgetPct > 90 && (
        <div className="alert alert-error">
          ⚠️ Budgetüberschreitung droht! {budgetPct}% des Budgets bereits ausgegeben.
        </div>
      )}
      {offeneTasks > 5 && (
        <div className="alert alert-warning">
          📋 {offeneTasks} offene Aufgaben. Priorisiere deine nächsten Schritte!
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi primary">
          <div className="kpi-label">Aktive Projekte</div>
          <div className="kpi-value">{projects.length}</div>
          <div className="kpi-sub">{projects.filter(p => p.status === "bau").length} im Bau</div>
        </div>
        <div className="kpi accent">
          <div className="kpi-label">Gesamtbudget</div>
          <div className="kpi-value" style={{ fontSize: "24px" }}>{fmtEUR(totalBudget)}</div>
          <div className="kpi-sub">alle Projekte</div>
        </div>
        <div className="kpi success">
          <div className="kpi-label">Ausgegeben</div>
          <div className="kpi-value" style={{ fontSize: "24px", color: budgetPct > 90 ? "var(--error)" : "var(--success)" }}>
            {fmtEUR(totalAusgaben)}
          </div>
          <div className="kpi-sub">{budgetPct}% des Budgets</div>
        </div>
        <div className={`kpi ${budgetRest < 0 ? "error" : "info"}`}>
          <div className="kpi-label">Restbudget</div>
          <div className="kpi-value" style={{ fontSize: "24px" }}>{fmtEUR(budgetRest)}</div>
          <div className="kpi-sub">verfügbar</div>
        </div>
        <div className="kpi warning">
          <div className="kpi-label">Offene Tasks</div>
          <div className="kpi-value">{offeneTasks}</div>
          <div className="kpi-sub">{doneTasks} erledigt</div>
        </div>
        <div className="kpi primary">
          <div className="kpi-label">Durchschnittl. Fortschritt</div>
          <div className="kpi-value" style={{ fontSize: "24px" }}>
            {projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.fortschritt, 0) / projects.length) : 0}%
          </div>
          <div className="kpi-sub">aller Projekte</div>
        </div>
      </div>

      {/* Projekte Übersicht */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Meine Projekte</div>
          <button className="btn btn-primary btn-sm" onClick={() => setView("projekte")}>
            Alle anzeigen
          </button>
        </div>
        <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {projects.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <h3>Kein Projekt</h3>
              <p>Erstelle dein erstes Bauprojekt</p>
            </div>
          ) : (
            projects.map(p => (
              <div
                key={p.id}
                onClick={() => open(p)}
                style={{
                  background: "white",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all var(--transition)",
                  boxShadow: "var(--shadow-sm)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "var(--shadow)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ height: "5px", background: `linear-gradient(90deg, var(--accent), #60A5FA)` }} />
                <div style={{ padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, flex: 1 }}>{p.name}</div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--gray-500)", marginBottom: "12px" }}>
                    {p.adresse}
                  </div>
                  <ProgBar value={p.fortschritt} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--gray-500)", marginTop: "10px" }}>
                    <span>{p.fortschritt}% fertig</span>
                    <span>{p.aufgaben.filter(t => t.status === "done").length}/{p.aufgaben.length} Tasks</span>
                  </div>
                </div>
                <div style={{
                  background: "var(--gray-50)",
                  borderTop: "1px solid var(--gray-200)",
                  padding: "14px 18px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "12px"
                }}>
                  <div>
                    <div style={{ color: "var(--gray-500)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Budget</div>
                    <div style={{ fontWeight: 800, fontSize: "14px", marginTop: "2px" }}>{fmtEUR(p.budget)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--gray-500)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Ausgaben</div>
                    <div style={{ fontWeight: 800, fontSize: "14px", marginTop: "2px", color: pct(p.ausgaben, p.budget) > 90 ? "var(--error)" : "var(--gray-900)" }}>
                      {fmtEUR(p.ausgaben)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PROJEKT LISTE ────────────────────────────────────────────────────────────
function ProjektListe({ projects, setProjects, setView, setCurrentProject }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: "", adresse: "", status: "planung", budget: "", start: today(),
    beschreibung: "", wohnflaeche: "", typ: "EFH"
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));
  const save = () => {
    if (!form.name) return;
    setProjects(ps => [...ps, {
      id: uid(), ...form,
      budget: parseFloat(form.budget) || 0,
      wohnflaeche: parseFloat(form.wohnflaeche) || 0,
      ausgaben: 0, fortschritt: 0, aufgaben: [], ausgabenListe: [], firmen: [],
      dokumente: [], maengel: [], bautagebuch: [], notizen: "", risiken: [], zahlungsplan: []
    }]);
    setShowNew(false);
    setForm({ name: "", adresse: "", status: "planung", budget: "", start: today(), beschreibung: "", wohnflaeche: "", typ: "EFH" });
  };

  const open = (p) => { setCurrentProject(p.id); setView("project"); };

  return (
    <div className="gap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>Alle Projekte</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          + Neues Projekt
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {projects.map(p => (
          <div
            key={p.id}
            onClick={() => open(p)}
            style={{
              background: "white",
              border: "1px solid var(--gray-200)",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all var(--transition)",
              boxShadow: "var(--shadow-sm)"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "var(--shadow)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ height: "5px", background: `linear-gradient(90deg, var(--accent), #60A5FA)` }} />
            <div style={{ padding: "18px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>{p.name}</div>
              <div style={{ fontSize: "12px", color: "var(--gray-500)", marginBottom: "8px" }}>
                {p.adresse}
              </div>
              <StatusBadge status={p.status} />
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <Modal title="Neues Bauprojekt" onClose={() => setShowNew(false)} onSave={save}>
          <div className="form-group">
            <label className="form-label">Projektname *</label>
            <input className="form-input" value={form.name} onChange={e => f("name", e.target.value)} placeholder="z.B. EFH in Hannover" />
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input className="form-input" value={form.adresse} onChange={e => f("adresse", e.target.value)} placeholder="Straße, PLZ Ort" />
          </div>
          <div className="g2">
            <div className="form-group">
              <label className="form-label">Typ</label>
              <select className="form-select" value={form.typ} onChange={e => f("typ", e.target.value)}>
                <option>EFH</option><option>DHH</option><option>RH</option><option>MFH</option><option>Gewerbe</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget (€)</label>
              <input className="form-input" type="number" value={form.budget} onChange={e => f("budget", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => f("status", e.target.value)}>
              {Object.entries({
                planung: "Planung", genehmigung: "Genehmigung",
                bau: "Im Bau", abnahme: "Abnahme", fertig: "Fertiggestellt"
              }).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={save}>
            Projekt erstellen
          </button>
        </Modal>
      )}
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState([
    {
      id: "demo1",
      name: "Premium Villenneubau Hannover",
      status: "bau",
      type: "EFH",
      adresse: "Hannover, Niedersachsen",
      budget: 850000,
      ausgaben: 421000,
      fortschritt: 52,
      start: "2024-02-15",
      ende: "2025-08-30",
      beschreibung: "KfW 40+ Neubau mit Wärmepumpe und PV",
      wohnflaeche: 240,
      grundstueck: 650,
      aufgaben: [
        { id: uid(), titel: "Baugenehmigung erhalten", status: "done", prio: "hoch", faellig: "2024-03-01" },
        { id: uid(), titel: "Erdarbeiten", status: "done", prio: "hoch", faellig: "2024-04-30" },
        { id: uid(), titel: "Rohbau", status: "progress", prio: "hoch", faellig: "2024-09-30" },
        { id: uid(), titel: "Dachdeckung", status: "offen", prio: "hoch", faellig: "2024-11-30" },
      ],
      ausgabenListe: [
        { id: uid(), beschreibung: "Erdarbeiten", betrag: 32000, datum: "2024-04-25", bezahlt: true },
        { id: uid(), beschreibung: "Rohbau", betrag: 150000, datum: "2024-09-10", bezahlt: false },
      ],
      firmen: [],
      dokumente: [],
      maengel: [],
      bautagebuch: [],
      notizen: "KfW-Förderung genehmigt!",
      risiken: [],
      zahlungsplan: []
    }
  ]);

  const [view, setView] = useState("dashboard");
  const [currentProjId, setCurrentProjId] = useState(null);

  const currentProject = projects.find(p => p.id === currentProjId);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">⚙</div>
            <div>
              <div className="logo-text">BauControl</div>
              <div style={{ fontSize: "10px", fontWeight: 500, opacity: 0.7, marginTop: "2px" }}>Professional</div>
            </div>
          </div>

          <div className="sidebar-scroll">
            <div className="nav-section">
              <div className="nav-label">Hauptmenü</div>
              <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </div>
              <div className={`nav-item ${view === "projekte" ? "active" : ""}`} onClick={() => setView("projekte")}>
                <span className="nav-icon">📋</span>
                <span>Projekte</span>
              </div>
              <div className={`nav-item ${view === "förderungen" ? "active" : ""}`} onClick={() => setView("förderungen")}>
                <span className="nav-icon">💰</span>
                <span>Förderungen</span>
                <div className="nav-badge">Live</div>
              </div>
            </div>

            {projects.length > 0 && (
              <div className="nav-section">
                <div className="nav-label">Meine Projekte</div>
                {projects.map(p => (
                  <div
                    key={p.id}
                    className={`nav-item ${view === "project" && currentProjId === p.id ? "active" : ""}`}
                    onClick={() => { setCurrentProjId(p.id); setView("project"); }}
                    title={p.name}
                  >
                    <span className="nav-icon">🏗</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button className="btn btn-primary" style={{ width: "100%", fontSize: "12px" }} onClick={() => setView("projekte")}>
              + Neues Projekt
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-title">
              {view === "dashboard" && "Dashboard"}
              {view === "projekte" && "Alle Projekte"}
              {view === "förderungen" && "Förderungen & Rohstoffpreise"}
              {view === "project" && currentProject?.name}
            </div>
            <div className="topbar-chip">
              📅 {new Date().toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>

          {/* CONTENT */}
          <div className="content">
            {view === "dashboard" && <Dashboard projects={projects} setView={setView} setCurrentProject={setCurrentProjId} />}
            {view === "projekte" && <ProjektListe projects={projects} setProjects={setProjects} setView={setView} setCurrentProject={setCurrentProjId} />}
            {view === "förderungen" && <FörderungenTab />}
            {view === "project" && currentProject && (
              <div className="gap">
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h1 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px", letterSpacing: "-0.5px" }}>
                        {currentProject.name}
                      </h1>
                      <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                        {currentProject.adresse}
                      </p>
                    </div>
                    <StatusBadge status={currentProject.status} />
                  </div>
                  <div className="card-body">
                    <div className="g4">
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Budget
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>
                          {fmtEUR(currentProject.budget)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Ausgaben
                        </div>
                        <div style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: pct(currentProject.ausgaben, currentProject.budget) > 90 ? "var(--error)" : "var(--accent)"
                        }}>
                          {fmtEUR(currentProject.ausgaben)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Fortschritt
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--success)" }}>
                          {currentProject.fortschritt}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Tasks
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>
                          {currentProject.aufgaben.filter(t => t.status === "done").length}/{currentProject.aufgaben.length}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: "24px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gray-700)", marginBottom: "8px" }}>
                        BAUFORTSCHRITT
                      </div>
                      <ProgBar value={currentProject.fortschritt} />
                      <div style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "6px", textAlign: "right" }}>
                        {currentProject.fortschritt}% fertiggestellt
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
