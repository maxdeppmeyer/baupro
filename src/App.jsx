import { useState, useEffect, useRef } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmtEUR = n => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
const fmtDate = d => d ? new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}) : "–";
const fmtDateShort = d => d ? new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"short"}) : "–";
const today = () => new Date().toISOString().split("T")[0];
const daysBetween = (a,b) => Math.round((new Date(b)-new Date(a))/(1000*60*60*24));
const clamp = (v,mn,mx) => Math.min(mx,Math.max(mn,v));
const pct = (a,b) => b>0 ? Math.round(a/b*100) : 0;

const GEWERKE = ["Erdarbeiten","Rohbau","Beton & Stahlbeton","Dach","Fassade","Fenster & Türen","Elektro","Sanitär","Heizung / HVAC","Lüftung","Dämmung","Innenputz","Trockenbau","Estrich","Fliesen","Bodenbelag","Malerarbeiten","Schreiner","Treppen","Außenanlagen","Einfriedung","Garage / Carport","Photovoltaik","Smart Home","Architektur","Statik","Vermessung","Bauphysik","Sonstiges"];
const STATUS = { planung:{label:"Planung",color:"#6B8CBA",bg:"#EEF3FA"}, genehmigung:{label:"Genehmigung",color:"#C09A3A",bg:"#FAF5E8"}, bau:{label:"Im Bau",color:"#D4622A",bg:"#FAEEE8"}, abnahme:{label:"Abnahme",color:"#7B5EA7",bg:"#F3EEF8"}, fertig:{label:"Fertiggestellt",color:"#3D8B5E",bg:"#EBF5EF"}, pause:{label:"Pausiert",color:"#8A8A8A",bg:"#F2F2F2"} };
const TASK_STATUS = { offen:{label:"Offen",color:"#6B8CBA"}, progress:{label:"In Arbeit",color:"#C09A3A"}, pruefung:{label:"Prüfung",color:"#7B5EA7"}, done:{label:"Erledigt",color:"#3D8B5E"} };
const PRIO = { niedrig:{label:"Niedrig",color:"#8A8A8A"}, mittel:{label:"Mittel",color:"#C09A3A"}, hoch:{label:"Hoch",color:"#D4622A"}, kritisch:{label:"Kritisch",color:"#B91C1C"} };
const DOK_TYPEN = ["Baugenehmigung","Lageplan","Grundriss","Schnittplan","Ansichtsplan","Statik","Energieausweis","Vertrag","Angebot","Rechnung","Abnahmeprotokoll","Mängelliste","Foto","Zertifikat","Versicherung","Sonstiges"];
const WEATHER = ["☀️ Sonnig","⛅ Bewölkt","🌧️ Regen","❄️ Frost","🌫️ Nebel","🌩️ Gewitter","🌬️ Windig"];
const MÄNGEL_STATUS = { offen:{label:"Offen",color:"#B91C1C"}, gemeldet:{label:"Gemeldet",color:"#C09A3A"}, behoben:{label:"Behoben",color:"#3D8B5E"} };

const SEED = [
  {
    id:"proj1", name:"Villa Sonnenhang", status:"bau",
    adresse:"Sonnenhangweg 14, 30559 Hannover", typ:"EFH",
    budget:785000, ausgaben:412000, fortschritt:52,
    start:"2024-02-15", ende:"2025-08-30", baubeginn:"2024-04-01",
    beschreibung:"Freistehende Villa KfW 40+, 240m² Wohnfläche, Keller, Garage, Photovoltaik 15kWp",
    wohnflaeche:240, grundstueck:620, geschosse:2,
    architekturbuero:"Studio Architektur Hannover", bauleiter:"Dipl.-Ing. Frank Weber",
    aufgaben:[
      {id:uid(),titel:"Erdarbeiten & Baugrube",status:"done",prio:"hoch",gewerk:"Erdarbeiten",firma:"Erdbau Meier GmbH",faellig:"2024-04-20",notiz:"Abgeschlossen inkl. Drainageleitungen",kosten:32000},
      {id:uid(),titel:"Bodenplatte gießen",status:"done",prio:"hoch",gewerk:"Beton & Stahlbeton",firma:"Betonbau Hannover",faellig:"2024-05-10",notiz:"KS-Beton C30/37",kosten:48000},
      {id:uid(),titel:"Kellermauerwerk",status:"done",prio:"hoch",gewerk:"Rohbau",firma:"Rohbau Schmidt",faellig:"2024-06-01",notiz:"",kosten:65000},
      {id:uid(),titel:"Rohbau Erdgeschoss",status:"done",prio:"hoch",gewerk:"Rohbau",firma:"Rohbau Schmidt",faellig:"2024-07-15",notiz:"",kosten:85000},
      {id:uid(),titel:"Rohbau Obergeschoss",status:"progress",prio:"hoch",gewerk:"Rohbau",firma:"Rohbau Schmidt",faellig:"2024-09-01",notiz:"Aktuell Richtfest geplant",kosten:72000},
      {id:uid(),titel:"Dachstuhl aufstellen",status:"progress",prio:"hoch",gewerk:"Dach",firma:"Zimmerei Kraft",faellig:"2024-10-01",notiz:"",kosten:38000},
      {id:uid(),titel:"Eindeckung Dach",status:"offen",prio:"hoch",gewerk:"Dach",firma:"Dachbau Hannover",faellig:"2024-11-15",notiz:"Naturschiefer geplant",kosten:55000},
      {id:uid(),titel:"Fenster & Haustür einbauen",status:"offen",prio:"mittel",gewerk:"Fenster & Türen",firma:"Fensterbau Müller",faellig:"2025-01-10",notiz:"3-fach Verglasung",kosten:42000},
      {id:uid(),titel:"Elektro Roh-Installation",status:"offen",prio:"mittel",gewerk:"Elektro",firma:"Elektro Werner",faellig:"2025-02-01",notiz:"",kosten:28000},
      {id:uid(),titel:"Heizung Wärmepumpe",status:"offen",prio:"hoch",gewerk:"Heizung / HVAC",firma:"Klimatechnik Vogel",faellig:"2025-03-01",notiz:"BAFA-Förderung beantragen",kosten:35000},
      {id:uid(),titel:"Photovoltaik 15kWp",status:"offen",prio:"niedrig",gewerk:"Photovoltaik",firma:"SolarTech GmbH",faellig:"2025-05-01",notiz:"",kosten:28000},
    ],
    ausgabenListe:[
      {id:uid(),beschreibung:"Erdarbeiten & Baugrube",betrag:32000,datum:"2024-04-25",gewerk:"Erdarbeiten",firma:"Erdbau Meier GmbH",rechnungNr:"2024-042",bezahlt:true},
      {id:uid(),beschreibung:"Bodenplatte komplett",betrag:48000,datum:"2024-05-18",gewerk:"Beton & Stahlbeton",firma:"Betonbau Hannover",rechnungNr:"BB-2024-08",bezahlt:true},
      {id:uid(),beschreibung:"Kellermauerwerk",betrag:65000,datum:"2024-06-10",gewerk:"Rohbau",firma:"Rohbau Schmidt",rechnungNr:"RS-156",bezahlt:true},
      {id:uid(),beschreibung:"Rohbau EG",betrag:85000,datum:"2024-07-22",gewerk:"Rohbau",firma:"Rohbau Schmidt",rechnungNr:"RS-189",bezahlt:true},
      {id:uid(),beschreibung:"Rohbau OG Abschlag",betrag:42000,datum:"2024-08-30",gewerk:"Rohbau",firma:"Rohbau Schmidt",rechnungNr:"RS-201",bezahlt:true},
      {id:uid(),beschreibung:"Architekt Honorar Q1+Q2",betrag:38000,datum:"2024-06-01",gewerk:"Architektur",firma:"Studio Architektur Hannover",rechnungNr:"SAH-03",bezahlt:true},
      {id:uid(),beschreibung:"Statik Planung",betrag:12000,datum:"2024-03-15",gewerk:"Statik",firma:"Ing. Büro Braun",rechnungNr:"IBB-44",bezahlt:true},
      {id:uid(),beschreibung:"Bauversicherung",betrag:3200,datum:"2024-02-20",gewerk:"Sonstiges",firma:"Allianz",rechnungNr:"",bezahlt:true},
      {id:uid(),beschreibung:"Dachstuhl Abschlag 50%",betrag:19000,datum:"2024-09-05",gewerk:"Dach",firma:"Zimmerei Kraft",rechnungNr:"ZK-22",bezahlt:false},
    ],
    firmen:[
      {id:uid(),name:"Rohbau Schmidt GmbH",gewerk:"Rohbau",kontakt:"0511 445566",email:"info@rohbau-schmidt.de",ansprechpartner:"Klaus Schmidt",bewertung:5,notiz:"Sehr zuverlässig"},
      {id:uid(),name:"Studio Architektur Hannover",gewerk:"Architektur",kontakt:"0511 998877",email:"office@sah.de",ansprechpartner:"Petra Lang",bewertung:5,notiz:"Ausgezeichnet"},
      {id:uid(),name:"Erdbau Meier GmbH",gewerk:"Erdarbeiten",kontakt:"0511 334455",email:"meier@erdbau.de",ansprechpartner:"Tom Meier",bewertung:4,notiz:""},
      {id:uid(),name:"Zimmerei Kraft",gewerk:"Dach",kontakt:"05132 77889",email:"kraft@zimmerei.de",ansprechpartner:"Hans Kraft",bewertung:4,notiz:"Richtfest geplant"},
    ],
    dokumente:[
      {id:uid(),name:"Baugenehmigung_2024.pdf",typ:"Baugenehmigung",datum:"2024-01-28",groesse:"2.4 MB",wichtig:true},
      {id:uid(),name:"Grundriss_EG_v3.pdf",typ:"Grundriss",datum:"2024-02-05",groesse:"8.1 MB",wichtig:true},
      {id:uid(),name:"Statik_Gesamtplanung.pdf",typ:"Statik",datum:"2024-03-10",groesse:"12.3 MB",wichtig:true},
      {id:uid(),name:"Vertrag_Rohbau_Schmidt.pdf",typ:"Vertrag",datum:"2024-04-01",groesse:"0.9 MB",wichtig:true},
    ],
    maengel:[
      {id:uid(),titel:"Riss in Kelleraußenwand Nordseite",status:"gemeldet",prio:"hoch",gewerk:"Rohbau",firma:"Rohbau Schmidt",gemeldetAm:"2024-06-15",beschreibung:"Horizontaler Riss ca. 40cm Länge"},
      {id:uid(),titel:"Bodenplatte Unebenheit Bad EG",status:"behoben",prio:"mittel",gewerk:"Beton & Stahlbeton",firma:"Betonbau Hannover",gemeldetAm:"2024-05-22",beschreibung:"Gefälle nicht spec-konform"},
    ],
    bautagebuch:[
      {id:uid(),datum:"2024-09-05",wetter:"☀️ Sonnig",temp:"22°C",eintrag:"Dachstuhlarbeiten begonnen. Team Zimmerei Kraft (4 Mann) anwesend. Materiallieferung Brettschichtholz angekommen.",fotos:3,verfasser:"Bauleiter Weber"},
      {id:uid(),datum:"2024-08-30",wetter:"⛅ Bewölkt",temp:"18°C",eintrag:"Rohbau OG Abschluss. Decke OG komplett betoniert. Abnahme durch Statiker Braun – ohne Beanstandungen.",fotos:5,verfasser:"Bauleiter Weber"},
    ],
    notizen:"Nachbargespräch wegen Grenzbebauung klären!\nBFA-Förderung Heizung: Antrag VOR Auftragsvergabe!\nRichtfest intern geplant ca. Oktober 2024.",
    risiken:[
      {id:uid(),titel:"Lieferverzug Fenster",beschreibung:"Hersteller meldet 6-8 Wochen Lieferzeit",prio:"hoch",eintrittsPkt:35,status:"aktiv"},
      {id:uid(),titel:"Kostensteigerung Kupfer/Elektro",beschreibung:"Rohstoffpreise gestiegen",prio:"mittel",eintrittsPkt:60,status:"beobachten"},
    ],
    zahlungsplan:[
      {id:uid(),bezeichnung:"Grundstückskauf",faellig:"2024-01-15",betrag:185000,bezahlt:true},
      {id:uid(),bezeichnung:"Baubeginn / Erdarbeiten",faellig:"2024-04-01",betrag:50000,bezahlt:true},
      {id:uid(),bezeichnung:"Bodenplatte",faellig:"2024-05-15",betrag:50000,bezahlt:true},
      {id:uid(),bezeichnung:"Rohbau fertig",faellig:"2024-09-01",betrag:80000,bezahlt:false},
      {id:uid(),bezeichnung:"Dichtheitshülle",faellig:"2024-11-01",betrag:60000,bezahlt:false},
      {id:uid(),bezeichnung:"Rohinstallationen",faellig:"2025-02-01",betrag:50000,bezahlt:false},
      {id:uid(),bezeichnung:"Innenausbau",faellig:"2025-05-01",betrag:60000,bezahlt:false},
      {id:uid(),bezeichnung:"Schlussrate",faellig:"2025-08-30",betrag:70000,bezahlt:false},
    ],
  },
  {
    id:"proj2", name:"Doppelhaus Gartenweg", status:"planung",
    adresse:"Gartenweg 5, 30519 Hannover", typ:"DHH",
    budget:920000, ausgaben:24000, fortschritt:4,
    start:"2025-02-01", ende:"2026-07-31", baubeginn:"2025-04-15",
    beschreibung:"Doppelhaushälfte mit Einliegerwohnung, 2×120m² + 60m² ELW, Flachdach, KfW 55",
    wohnflaeche:300, grundstueck:480, geschosse:2,
    architekturbuero:"Planungsbüro Neue Wege", bauleiter:"",
    aufgaben:[
      {id:uid(),titel:"Architekt final beauftragen",status:"done",prio:"hoch",gewerk:"Architektur",firma:"Planungsbüro Neue Wege",faellig:"2025-02-15",notiz:"",kosten:0},
      {id:uid(),titel:"Baugenehmigung einreichen",status:"progress",prio:"kritisch",gewerk:"Architektur",firma:"Planungsbüro Neue Wege",faellig:"2025-03-15",notiz:"Unterlagen 80% fertig",kosten:0},
      {id:uid(),titel:"Finanzierung finalisieren",status:"progress",prio:"kritisch",gewerk:"Sonstiges",firma:"Sparkasse Hannover",faellig:"2025-03-01",notiz:"Darlehen 650.000€ geplant",kosten:0},
    ],
    ausgabenListe:[
      {id:uid(),beschreibung:"Architekt Vorplanung LPH 1-3",betrag:18000,datum:"2025-01-20",gewerk:"Architektur",firma:"Planungsbüro Neue Wege",rechnungNr:"PNW-001",bezahlt:true},
      {id:uid(),beschreibung:"Bodengutachten",betrag:3800,datum:"2025-01-10",gewerk:"Statik",firma:"Geotechnik GmbH",rechnungNr:"GEO-24",bezahlt:true},
      {id:uid(),beschreibung:"Vermessungsgebühren",betrag:2200,datum:"2025-01-25",gewerk:"Vermessung",firma:"Vermessungsbüro H.",rechnungNr:"",bezahlt:true},
    ],
    firmen:[{id:uid(),name:"Planungsbüro Neue Wege",gewerk:"Architektur",kontakt:"0511 223344",email:"info@neue-wege.de",ansprechpartner:"Sandra Kohl",bewertung:4,notiz:""}],
    dokumente:[
      {id:uid(),name:"Kaufvertrag_Grundstück.pdf",typ:"Vertrag",datum:"2024-12-15",groesse:"1.2 MB",wichtig:true},
      {id:uid(),name:"Bodengutachten.pdf",typ:"Statik",datum:"2025-01-10",groesse:"4.5 MB",wichtig:true},
    ],
    maengel:[], bautagebuch:[],
    notizen:"KfW-Förderantrag: VOR Baubeginn!\nEnergieberater noch nicht beauftragt – dringend!",
    risiken:[{id:uid(),titel:"Baugenehmigung Verzögerung",beschreibung:"Bauamt stark ausgelastet, bis 12 Wochen möglich",prio:"hoch",eintrittsPkt:50,status:"aktiv"}],
    zahlungsplan:[
      {id:uid(),bezeichnung:"Grundstück",faellig:"2024-12-15",betrag:210000,bezahlt:true},
      {id:uid(),bezeichnung:"Planungskosten",faellig:"2025-02-01",betrag:30000,bezahlt:false},
    ],
  }
];
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600;9..144,700&family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
:root {
  --ink:#0F0D0B; --ink2:#3D3530; --ink3:#7A6E68; --ink4:#B0A8A2;
  --bg:#F7F4F0; --bg2:#EEEAE4; --surface:#FFFFFF;
  --border:#E2DCD6; --border2:#CEC7C0;
  --accent:#C14E24; --accent2:#E8724A; --accent-bg:#FDF0EB;
  --gold:#A8832A; --gold-bg:#FAF4E6;
  --green:#2D7A52; --green-bg:#E8F5EE;
  --blue:#2E5FA3; --blue-bg:#EBF1FA;
  --red:#B91C1C; --red-bg:#FEE2E2;
  --purple:#6B3FA0; --purple-bg:#F0EBF8;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
  --shadow:0 4px 12px rgba(0,0,0,0.08),0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:0 20px 48px rgba(0,0,0,0.12),0 8px 16px rgba(0,0,0,0.06);
  --r:12px; --r-sm:8px; --r-lg:16px;
  --sidebar-w:268px; --topbar-h:60px;
  --font-display:'Fraunces',Georgia,serif;
  --font:'Cabinet Grotesk','DM Sans',sans-serif;
  --tr:0.18s cubic-bezier(0.4,0,0.2,1);
}
*{box-sizing:border-box;margin:0;padding:0;}
html{font-size:15px;}
body{font-family:var(--font);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
button{font-family:var(--font);cursor:pointer;}
input,select,textarea{font-family:var(--font);}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px;}

.app{display:flex;height:100dvh;overflow:hidden;}

/* Sidebar */
.sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--ink);color:#F7F4F0;display:flex;flex-direction:column;overflow:hidden;transition:transform var(--tr);z-index:50;}
.sidebar-logo{padding:20px 18px 16px;display:flex;align-items:center;gap:11px;border-bottom:1px solid rgba(255,255,255,0.08);}
.logo-icon{width:34px;height:34px;background:var(--accent);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.logo-name{font-family:var(--font-display);font-size:17px;font-weight:700;line-height:1.1;color:#F7F4F0;}
.logo-ver{font-size:9.5px;color:rgba(255,255,255,0.3);letter-spacing:1.5px;text-transform:uppercase;}
.sidebar-scroll{flex:1;overflow-y:auto;padding:12px 8px;}
.sidebar-sec{margin-bottom:20px;}
.sidebar-sec-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.28);padding:0 10px 6px;}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:9px;cursor:pointer;font-size:13px;color:rgba(255,255,255,0.5);transition:all var(--tr);margin-bottom:1px;}
.nav-item:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.9);}
.nav-item.active{background:var(--accent);color:#fff;}
.nav-item .ni{font-size:15px;width:18px;text-align:center;flex-shrink:0;}
.nav-item .nb{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;background:rgba(255,255,255,0.2);border-radius:99px;font-size:10px;font-weight:700;color:#fff;margin-left:auto;}
.nav-item.active .nb{background:rgba(255,255,255,0.25);}
.proj-nav-item{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:12px;color:rgba(255,255,255,0.4);transition:all var(--tr);margin-bottom:1px;}
.proj-nav-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.75);}
.proj-nav-item.active{color:#F7F4F0;background:rgba(255,255,255,0.1);}
.proj-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.proj-nav-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
.proj-nav-pct{font-size:10.5px;color:rgba(255,255,255,0.3);flex-shrink:0;}
.sidebar-bottom{padding:12px;border-top:1px solid rgba(255,255,255,0.08);}
.add-btn{width:100%;padding:10px;background:var(--accent);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:background var(--tr);}
.add-btn:hover{background:#D4622A;}

/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:var(--topbar-h);background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:14px;flex-shrink:0;box-shadow:var(--shadow-sm);}
.topbar-hamburger{display:none;background:none;border:none;font-size:20px;color:var(--ink);padding:4px;}
.topbar-title{font-family:var(--font-display);font-size:19px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.topbar-chip{display:flex;align-items:center;gap:5px;padding:5px 11px;background:var(--bg);border:1px solid var(--border);border-radius:99px;font-size:11.5px;color:var(--ink3);white-space:nowrap;}
.content{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;}

/* Cards */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow-sm);}
.card-hd{padding:15px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;}
.card-title{font-family:var(--font-display);font-size:15px;font-weight:600;}
.card-bd{padding:18px 20px;}

/* KPIs */
.kpi-grid{display:grid;gap:12px;}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;position:relative;overflow:hidden;box-shadow:var(--shadow-sm);transition:transform var(--tr);}
.kpi:hover{transform:translateY(-1px);box-shadow:var(--shadow);}
.kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:99px 99px 0 0;}
.kpi.acc::before{background:var(--accent);} .kpi.gld::before{background:var(--gold);} .kpi.grn::before{background:var(--green);} .kpi.blu::before{background:var(--blue);} .kpi.red::before{background:var(--red);} .kpi.pur::before{background:var(--purple);}
.kpi-label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink3);margin-bottom:7px;font-weight:500;}
.kpi-val{font-family:var(--font-display);font-size:26px;font-weight:700;line-height:1;}
.kpi-sub{font-size:11px;color:var(--ink3);margin-top:5px;}

/* Progress */
.prog-wrap{background:var(--bg2);border-radius:99px;overflow:hidden;}
.prog-bar{height:100%;border-radius:99px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;}
.prog-bar::after{content:'';position:absolute;top:0;left:-100%;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:shimmer 2.5s infinite;}
@keyframes shimmer{to{left:200%;}}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:5px;padding:8px 14px;border-radius:var(--r-sm);font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all var(--tr);white-space:nowrap;}
.btn-primary{background:var(--accent);color:#fff;} .btn-primary:hover{background:#D4622A;box-shadow:0 4px 12px rgba(193,78,36,0.3);}
.btn-secondary{background:var(--bg);color:var(--ink);border:1px solid var(--border);} .btn-secondary:hover{background:var(--border);}
.btn-ghost{background:transparent;color:var(--ink3);} .btn-ghost:hover{background:var(--bg);color:var(--ink);}
.btn-danger{background:var(--red);color:#fff;} .btn-danger:hover{background:#991B1B;}
.btn-success{background:var(--green);color:#fff;}
.btn-sm{padding:5px 10px;font-size:12px;border-radius:6px;}
.btn-icon{width:30px;height:30px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:7px;}

/* Badge */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:600;letter-spacing:0.3px;white-space:nowrap;}
.badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* Table */
.tbl-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{text-align:left;padding:9px 13px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--ink3);border-bottom:1.5px solid var(--border);font-weight:600;white-space:nowrap;}
td{padding:11px 13px;border-bottom:1px solid var(--border);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tbody tr{transition:background var(--tr);}
tbody tr:hover td{background:var(--bg);}

/* Tabs */
.tabs{display:flex;gap:2px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:3px;flex-wrap:wrap;}
.tab{padding:7px 13px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;color:var(--ink3);transition:all var(--tr);border:none;background:transparent;}
.tab:hover:not(.active){color:var(--ink);background:rgba(0,0,0,0.04);}
.tab.active{background:var(--surface);color:var(--ink);box-shadow:var(--shadow-sm);font-weight:600;}

/* Forms */
.form-group{margin-bottom:13px;}
.form-label{font-size:11px;font-weight:600;color:var(--ink3);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;}
.form-input,.form-select,.form-textarea{width:100%;padding:9px 11px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13.5px;background:var(--surface);color:var(--ink);outline:none;transition:all var(--tr);}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg);}
.form-textarea{resize:vertical;min-height:80px;line-height:1.6;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.form-check{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;}
.form-check input{width:16px;height:16px;accent-color:var(--accent);cursor:pointer;}

/* Modal */
.modal-backdrop{position:fixed;inset:0;background:rgba(10,8,6,0.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(2px);animation:fadeIn 0.15s;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.modal{background:var(--surface);border-radius:16px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:slideUp 0.2s cubic-bezier(0.4,0,0.2,1);}
@keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
.modal-lg{max-width:740px;}
.modal-hd{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--surface);z-index:1;}
.modal-title{font-family:var(--font-display);font-size:17px;font-weight:600;}
.modal-bd{padding:20px 22px;}
.modal-ft{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:0;background:var(--surface);}
.modal-close{width:28px;height:28px;border-radius:6px;background:var(--bg);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink3);font-size:16px;transition:all var(--tr);}
.modal-close:hover{background:var(--border);color:var(--ink);}

/* Layouts */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.gap{display:flex;flex-direction:column;gap:16px;}

/* Project card */
.pcard{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;cursor:pointer;transition:all var(--tr);box-shadow:var(--shadow-sm);}
.pcard:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:var(--shadow);}
.pcard-hero{height:6px;}
.pcard-body{padding:16px 18px 13px;}
.pcard-ft{padding:11px 18px;background:var(--bg);border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}

/* Alert */
.alert{border-radius:var(--r-sm);padding:11px 14px;font-size:13px;display:flex;gap:9px;align-items:flex-start;}
.alert-warn{background:var(--gold-bg);color:#6B4A10;border:1px solid #DDC070;}
.alert-info{background:var(--blue-bg);color:#1E3A6E;border:1px solid #92AED4;}
.alert-danger{background:var(--red-bg);color:#7F1D1D;border:1px solid #F1A3A3;}
.alert-success{background:var(--green-bg);color:#174D32;border:1px solid #86C4A4;}

/* Timeline */
.tl{padding-left:20px;position:relative;}
.tl::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:1.5px;background:var(--border);}
.tl-item{position:relative;margin-bottom:20px;}
.tl-dot{position:absolute;left:-17px;top:5px;width:11px;height:11px;border-radius:50%;background:var(--surface);border:2px solid var(--accent);}

/* Stat row */
.stat-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;}
.stat-row:last-child{border-bottom:none;}

/* Stars */
.stars{display:flex;gap:2px;}
.star{font-size:13px;color:var(--border);}
.star.on{color:var(--gold);}

/* Risk bar */
.risk-bar-bg{height:7px;border-radius:99px;background:var(--bg2);overflow:hidden;margin-top:5px;}
.risk-bar{height:100%;border-radius:99px;}

/* Gantt */
.gantt-row{display:flex;align-items:center;border-bottom:1px solid var(--border);min-height:36px;}
.gantt-label{width:200px;flex-shrink:0;padding:5px 12px;font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gantt-track{flex:1;position:relative;height:36px;overflow:hidden;}
.gantt-bar{position:absolute;top:8px;height:20px;border-radius:99px;display:flex;align-items:center;padding:0 8px;font-size:10px;font-weight:600;color:#fff;overflow:hidden;white-space:nowrap;}
.gantt-today-line{position:absolute;top:0;bottom:0;width:1.5px;background:var(--red);z-index:2;}

/* Responsive */
@media(max-width:900px){
  .sidebar{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);box-shadow:var(--shadow-lg);transition:transform 0.25s cubic-bezier(0.4,0,0.2,1);}
  .sidebar.open{transform:translateX(0);}
  .sidebar-overlay{display:block !important;}
  .topbar-hamburger{display:flex;}
  .g4{grid-template-columns:repeat(2,1fr);}
  .g3{grid-template-columns:1fr 1fr;}
  .kpi-val{font-size:22px;}
  .gantt-label{width:140px;}
}
@media(max-width:600px){
  .content{padding:12px;gap:12px;}
  .g4,.g3{grid-template-columns:1fr 1fr;}
  .g2{grid-template-columns:1fr;}
  .form-row{grid-template-columns:1fr;}
  .tabs{flex-wrap:wrap;}
  .tab{padding:6px 10px;font-size:11.5px;}
  .gantt-label{width:110px;font-size:11px;}
  .topbar-chip{display:none;}
}
@media(max-width:400px){
  .g4,.g3,.g2{grid-template-columns:1fr;}
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.pulse{animation:pulse 2s infinite;}
.empty{text-align:center;padding:44px 20px;}
.empty-icon{font-size:34px;margin-bottom:10px;opacity:0.6;}
.empty h3{font-family:var(--font-display);font-size:16px;color:var(--ink);margin-bottom:5px;}
.empty p{color:var(--ink3);font-size:13px;}
.sec-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.sec-title{font-family:var(--font-display);font-size:16px;font-weight:600;}
`;

// ── Shared UI Components ──────────────────────────────────────────────────────
function Badge({children,color="#6B8CBA",bg}){
  return <span className="badge" style={{background:bg||color+"22",color}}><span className="badge-dot" style={{background:color}}/>{children}</span>;
}
function StatusBadge({status}){ const s=STATUS[status]||STATUS.planung; return <Badge color={s.color} bg={s.bg}>{s.label}</Badge>; }
function TaskBadge({status}){ const s=TASK_STATUS[status]||TASK_STATUS.offen; return <Badge color={s.color}>{s.label}</Badge>; }
function PrioBadge({prio}){ const p=PRIO[prio]||PRIO.mittel; return <Badge color={p.color}>{p.label}</Badge>; }
function MängelBadge({status}){ const s=MÄNGEL_STATUS[status]||MÄNGEL_STATUS.offen; return <Badge color={s.color}>{s.label}</Badge>; }
function Stars({n=0}){
  return <div className="stars">{[1,2,3,4,5].map(i=><span key={i} className={`star${i<=n?" on":""}`}>★</span>)}</div>;
}
function ProgBar({value,color="var(--accent)",h=6}){
  return <div className="prog-wrap" style={{height:h}}><div className="prog-bar" style={{width:`${clamp(value,0,100)}%`,background:color,height:h}}/></div>;
}
function Modal({title,onClose,onSave,children,saveLabel="Speichern",large}){
  return(
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal${large?" modal-lg":""}`}>
        <div className="modal-hd"><span className="modal-title">{title}</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-bd">{children}</div>
        <div className="modal-ft">
          <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}
function Confirm({msg,onYes,onNo}){
  return(
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onNo()}>
      <div className="modal" style={{maxWidth:360}}>
        <div className="modal-bd" style={{paddingTop:28,paddingBottom:28,textAlign:"center"}}>
          <div style={{fontSize:34,marginBottom:12}}>⚠️</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:16,fontWeight:600,marginBottom:8}}>Bist du sicher?</div>
          <div style={{color:"var(--ink3)",fontSize:13}}>{msg}</div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-secondary" onClick={onNo}>Abbrechen</button>
          <button className="btn btn-danger" onClick={onYes}>Löschen</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({projects,setView,setCurrentProject}){
  const totalBudget=projects.reduce((s,p)=>s+p.budget,0);
  const totalAusgaben=projects.reduce((s,p)=>s+p.ausgaben,0);
  const allTasks=projects.flatMap(p=>p.aufgaben);
  const offene=allTasks.filter(t=>t.status!=="done").length;
  const kritisch=allTasks.filter(t=>t.prio==="kritisch"&&t.status!=="done").length;
  const offeneMaengel=projects.flatMap(p=>p.maengel).filter(m=>m.status!=="behoben").length;
  const unbezahlt=projects.flatMap(p=>p.ausgabenListe).filter(e=>!e.bezahlt).reduce((s,e)=>s+e.betrag,0);
  const open=(p)=>{setCurrentProject(p.id);setView("project");};

  return(
    <div className="gap">
      {kritisch>0&&<div className="alert alert-danger">🚨 <div><strong>{kritisch} kritische Aufgabe{kritisch>1?"n":""}</strong> erfordern sofortige Aufmerksamkeit!</div></div>}
      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))"}}>
        <div className="kpi acc"><div className="kpi-label">Projekte</div><div className="kpi-val">{projects.length}</div><div className="kpi-sub">{projects.filter(p=>p.status==="bau").length} im Bau</div></div>
        <div className="kpi gld"><div className="kpi-label">Gesamtbudget</div><div className="kpi-val" style={{fontSize:19}}>{fmtEUR(totalBudget)}</div></div>
        <div className="kpi acc"><div className="kpi-label">Ausgaben</div><div className="kpi-val" style={{fontSize:19,color:pct(totalAusgaben,totalBudget)>90?"var(--red)":"var(--ink)"}}>{fmtEUR(totalAusgaben)}</div><div className="kpi-sub">{pct(totalAusgaben,totalBudget)}%</div></div>
        <div className="kpi grn"><div className="kpi-label">Restbudget</div><div className="kpi-val" style={{fontSize:19,color:"var(--green)"}}>{fmtEUR(totalBudget-totalAusgaben)}</div></div>
        <div className="kpi blu"><div className="kpi-label">Offene Tasks</div><div className="kpi-val">{offene}</div><div className="kpi-sub">{kritisch} kritisch</div></div>
        <div className="kpi red"><div className="kpi-label">Offene Mängel</div><div className="kpi-val">{offeneMaengel}</div></div>
        <div className="kpi pur"><div className="kpi-label">Offene Rechnungen</div><div className="kpi-val" style={{fontSize:17}}>{fmtEUR(unbezahlt)}</div></div>
      </div>
      <div>
        <div className="sec-hd" style={{marginBottom:12}}>
          <span className="sec-title">Meine Projekte</span>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("projekte")}>Alle →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
          {projects.map(p=>{
            const s=STATUS[p.status]||STATUS.planung;
            const done=p.aufgaben.filter(t=>t.status==="done").length;
            return(
              <div className="pcard" key={p.id} onClick={()=>open(p)}>
                <div className="pcard-hero" style={{background:s.color}}/>
                <div className="pcard-body">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:7}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:600,flex:1}}>{p.name}</div>
                    <StatusBadge status={p.status}/>
                  </div>
                  <div style={{fontSize:11.5,color:"var(--ink3)",marginBottom:11}}>📍 {p.adresse}</div>
                  <ProgBar value={p.fortschritt}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--ink3)",marginTop:4}}>
                    <span>{p.fortschritt}% fertig</span><span>{done}/{p.aufgaben.length} Tasks ✓</span>
                  </div>
                </div>
                <div className="pcard-ft">
                  <span style={{fontWeight:700,fontSize:13}}>{fmtEUR(p.budget)}</span>
                  <span style={{fontSize:12,color:pct(p.ausgaben,p.budget)>90?"var(--red)":"var(--ink3)"}}>{fmtEUR(p.ausgaben)} ausgegeben</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hd"><span className="card-title">🎯 Nächste Aufgaben</span></div>
          <div className="tbl-wrap">
            <table><thead><tr><th>Aufgabe</th><th>Prio</th><th>Fällig</th></tr></thead>
            <tbody>
              {allTasks.filter(t=>t.status!=="done").sort((a,b)=>{const o={kritisch:0,hoch:1,mittel:2,niedrig:3};return (o[a.prio]||2)-(o[b.prio]||2);}).slice(0,7).map(t=>{
                const proj=projects.find(p=>p.aufgaben.find(x=>x.id===t.id));
                return(<tr key={t.id} style={{cursor:"pointer"}} onClick={()=>open(proj)}>
                  <td><div style={{fontWeight:500}}>{t.titel}</div><div style={{fontSize:11,color:"var(--ink3)"}}>{proj?.name}</div></td>
                  <td><PrioBadge prio={t.prio}/></td>
                  <td style={{color:"var(--ink3)",fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(t.faellig)}</td>
                </tr>);
              })}
              {allTasks.filter(t=>t.status!=="done").length===0&&<tr><td colSpan={3}><div className="empty"><div className="empty-icon">✅</div><p>Alle erledigt!</p></div></td></tr>}
            </tbody></table>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">💰 Budget-Ampel</span></div>
          <div className="card-bd gap">
            {projects.map(p=>{
              const r=pct(p.ausgaben,p.budget);
              const col=r>100?"var(--red)":r>85?"var(--gold)":"var(--accent)";
              return(<div key={p.id}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:4}}>
                  <span style={{fontWeight:500,maxWidth:"65%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                  <span style={{color:col,fontWeight:700}}>{r}%</span>
                </div>
                <ProgBar value={Math.min(r,100)} color={col}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--ink3)",marginTop:3}}>
                  <span>{fmtEUR(p.ausgaben)}</span><span>{fmtEUR(p.budget)}</span>
                </div>
              </div>);
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ProjektListe ──────────────────────────────────────────────────────────────
function ProjektListe({projects,setProjects,setView,setCurrentProject}){
  const [showNew,setShowNew]=useState(false);
  const [deleteId,setDeleteId]=useState(null);
  const [form,setForm]=useState({name:"",adresse:"",typ:"EFH",status:"planung",budget:"",start:today(),ende:"",baubeginn:"",beschreibung:"",wohnflaeche:"",grundstueck:"",architekturbuero:"",bauleiter:""});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.name)return;
    setProjects(ps=>[...ps,{id:uid(),...form,budget:parseFloat(form.budget)||0,wohnflaeche:parseFloat(form.wohnflaeche)||0,grundstueck:parseFloat(form.grundstueck)||0,ausgaben:0,fortschritt:0,aufgaben:[],ausgabenListe:[],firmen:[],dokumente:[],maengel:[],bautagebuch:[],notizen:"",risiken:[],zahlungsplan:[]}]);
    setShowNew(false);
  };
  const open=(p)=>{setCurrentProject(p.id);setView("project");};
  return(
    <div className="gap">
      <div className="sec-hd">
        <span className="sec-title">Projekte ({projects.length})</span>
        <button className="btn btn-primary" onClick={()=>setShowNew(true)}>＋ Neues Projekt</button>
      </div>
      {projects.length===0&&<div className="card"><div className="empty"><div className="empty-icon">🏗️</div><h3>Noch keine Projekte</h3><p>Erstelle dein erstes Bauprojekt.</p></div></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:13}}>
        {projects.map(p=>{
          const s=STATUS[p.status]||STATUS.planung;
          return(<div className="pcard" key={p.id} onClick={()=>open(p)}>
            <div className="pcard-hero" style={{background:s.color}}/>
            <div className="pcard-body">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:600,flex:1}}>{p.name}</div>
                <StatusBadge status={p.status}/>
              </div>
              <div style={{fontSize:11,color:"var(--ink3)",marginBottom:4}}>🏠 {p.typ}{p.wohnflaeche?" · "+p.wohnflaeche+"m²":""}</div>
              <div style={{fontSize:12,color:"var(--ink3)",marginBottom:11}}>📍 {p.adresse}</div>
              <ProgBar value={p.fortschritt}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--ink3)",marginTop:3}}>
                <span>{p.fortschritt}% fertig</span><span>{fmtDate(p.start)} – {fmtDate(p.ende)}</span>
              </div>
            </div>
            <div className="pcard-ft" onClick={e=>e.stopPropagation()}>
              <span style={{fontWeight:700,fontSize:13}}>{fmtEUR(p.budget)}</span>
              <div style={{display:"flex",gap:5}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>open(p)}>Öffnen →</button>
                <button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>setDeleteId(p.id)}>🗑</button>
              </div>
            </div>
          </div>);
        })}
      </div>
      {showNew&&(
        <Modal title="Neues Bauprojekt" onClose={()=>setShowNew(false)} onSave={save} large>
          <div className="form-group"><label className="form-label">Projektname *</label><input className="form-input" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="z.B. Villa Sonnenhang"/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Typ</label><select className="form-select" value={form.typ} onChange={e=>f("typ",e.target.value)}>{["EFH","DHH","RH","MFH","Gewerbe","Umbau","Anbau","Sonstiges"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>f("status",e.target.value)}>{Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Adresse</label><input className="form-input" value={form.adresse} onChange={e=>f("adresse",e.target.value)} placeholder="Straße Nr, PLZ Ort"/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Budget (€)</label><input className="form-input" type="number" value={form.budget} onChange={e=>f("budget",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Wohnfläche (m²)</label><input className="form-input" type="number" value={form.wohnflaeche} onChange={e=>f("wohnflaeche",e.target.value)}/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Grundstück (m²)</label><input className="form-input" type="number" value={form.grundstueck} onChange={e=>f("grundstueck",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Baubeginn</label><input className="form-input" type="date" value={form.baubeginn} onChange={e=>f("baubeginn",e.target.value)}/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Start</label><input className="form-input" type="date" value={form.start} onChange={e=>f("start",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Ende</label><input className="form-input" type="date" value={form.ende} onChange={e=>f("ende",e.target.value)}/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Architekturbüro</label><input className="form-input" value={form.architekturbuero} onChange={e=>f("architekturbuero",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Bauleiter</label><input className="form-input" value={form.bauleiter} onChange={e=>f("bauleiter",e.target.value)}/></div>
          </div>
          <div className="form-group"><label className="form-label">Beschreibung</label><textarea className="form-textarea" value={form.beschreibung} onChange={e=>f("beschreibung",e.target.value)}/></div>
        </Modal>
      )}
      {deleteId&&<Confirm msg="Projekt und alle Daten unwiderruflich löschen?" onYes={()=>{setProjects(ps=>ps.filter(p=>p.id!==deleteId));setDeleteId(null);}} onNo={()=>setDeleteId(null)}/>}
    </div>
  );
}

// ── ProjektDetail Shell ───────────────────────────────────────────────────────
function ProjektDetail({project,updateProject,setView}){
  const [tab,setTab]=useState("überblick");
  if(!project)return<div className="empty"><div className="empty-icon">📂</div><h3>Kein Projekt</h3></div>;
  const tabs=[["überblick","🏠 Überblick"],["aufgaben","✅ Aufgaben"],["gantt","📅 Zeitplan"],["kosten","💰 Kosten"],["zahlungen","🏦 Zahlungen"],["firmen","🏢 Firmen"],["dokumente","📁 Dokumente"],["maengel","⚠️ Mängel"],["bautagebuch","📔 Tagebuch"],["risiken","🎲 Risiken"],["notizen","📝 Notizen"]];
  const s=STATUS[project.status]||STATUS.planung;
  const done=project.aufgaben.filter(t=>t.status==="done").length;
  const remaining=project.budget-project.ausgaben;
  return(
    <div className="gap">
      <div className="card">
        <div style={{height:5,background:s.color}}/>
        <div style={{padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:13}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setView("projekte")}>← Zurück</button>
                <StatusBadge status={project.status}/>
                {project.typ&&<span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>🏠 {project.typ}</span>}
                {project.wohnflaeche>0&&<span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>📐 {project.wohnflaeche}m²</span>}
              </div>
              <div style={{fontFamily:"var(--font-display)",fontSize:21,fontWeight:700,marginBottom:3}}>{project.name}</div>
              <div style={{fontSize:12.5,color:"var(--ink3)"}}>📍 {project.adresse} · 📅 {fmtDate(project.start)} – {fmtDate(project.ende)}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[["Budget",fmtEUR(project.budget)],["Ausgaben",fmtEUR(project.ausgaben)],["Tasks",`${done}/${project.aufgaben.length}`]].map(([k,v])=>(
                <div key={k} style={{textAlign:"center",padding:"9px 13px",background:"var(--bg)",borderRadius:9}}>
                  <div style={{fontSize:9.5,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:"1px"}}>{k}</div>
                  <div style={{fontWeight:700,fontSize:13.5}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{color:"var(--ink3)"}}>Baufortschritt</span><span style={{fontWeight:700}}>{project.fortschritt}%</span>
            </div>
            <ProgBar value={project.fortschritt} h={7}/>
          </div>
        </div>
      </div>
      <div className="tabs" style={{overflowX:"auto",flexWrap:"nowrap"}}>
        {tabs.map(([v,l])=><button key={v} className={`tab${tab===v?" active":""}`} onClick={()=>setTab(v)}>{l}</button>)}
      </div>
      {tab==="überblick"&&<ÜberblickTab p={project} up={updateProject}/>}
      {tab==="aufgaben"&&<AufgabenTab p={project} up={updateProject}/>}
      {tab==="gantt"&&<GanttTab p={project}/>}
      {tab==="kosten"&&<KostenTab p={project} up={updateProject}/>}
      {tab==="zahlungen"&&<ZahlungsTab p={project} up={updateProject}/>}
      {tab==="firmen"&&<FirmenTab p={project} up={updateProject}/>}
      {tab==="dokumente"&&<DokumenteTab p={project} up={updateProject}/>}
      {tab==="maengel"&&<MängelTab p={project} up={updateProject}/>}
      {tab==="bautagebuch"&&<BautagebuchTab p={project} up={updateProject}/>}
      {tab==="risiken"&&<RisikenTab p={project} up={updateProject}/>}
      {tab==="notizen"&&<NotizenTab p={project} up={updateProject}/>}
    </div>
  );
}

// ── Überblick Tab ─────────────────────────────────────────────────────────────
function ÜberblickTab({p,up}){
  const remaining=p.budget-p.ausgaben;
  const r=pct(p.ausgaben,p.budget);
  const done=p.aufgaben.filter(t=>t.status==="done").length;
  const offeneMaengel=p.maengel.filter(m=>m.status!=="behoben").length;
  const kritTasks=p.aufgaben.filter(t=>t.prio==="kritisch"&&t.status!=="done").length;
  const daysLeft=p.ende?daysBetween(today(),p.ende):null;
  return(
    <div className="gap">
      {kritTasks>0&&<div className="alert alert-danger">🚨 <strong>{kritTasks} kritische Aufgabe{kritTasks>1?"n":""}</strong> noch offen!</div>}
      <div className="g4">
        <div className="kpi acc"><div className="kpi-label">Fortschritt</div><div className="kpi-val">{p.fortschritt}%</div><div style={{marginTop:8}}><ProgBar value={p.fortschritt}/></div><div className="kpi-sub">{done}/{p.aufgaben.length} Tasks</div></div>
        <div className="kpi gld"><div className="kpi-label">Restbudget</div><div className="kpi-val" style={{fontSize:19,color:remaining<0?"var(--red)":remaining<p.budget*0.1?"var(--gold)":"var(--green)"}}>{fmtEUR(remaining)}</div><div className="kpi-sub">{100-r}% frei</div></div>
        <div className="kpi blu"><div className="kpi-label">Restlaufzeit</div><div className="kpi-val" style={{color:daysLeft!==null&&daysLeft<30?"var(--red)":"var(--ink)"}}>{daysLeft!==null?daysLeft:"–"}</div><div className="kpi-sub">Tage</div></div>
        <div className="kpi red"><div className="kpi-label">Offene Mängel</div><div className="kpi-val" style={{color:offeneMaengel>0?"var(--red)":"var(--green)"}}>{offeneMaengel}</div><div className="kpi-sub">{p.maengel.length} gesamt</div></div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hd"><span className="card-title">Projektdetails</span></div>
          <div className="card-bd">
            {[["Typ",p.typ],["Architektur",p.architekturbuero],["Bauleiter",p.bauleiter],["Wohnfläche",p.wohnflaeche?p.wohnflaeche+" m²":null],["Grundstück",p.grundstueck?p.grundstueck+" m²":null],["Baubeginn",fmtDate(p.baubeginn)],["Fertigstellung",fmtDate(p.ende)]].filter(([,v])=>v).map(([k,v])=>(
              <div className="stat-row" key={k}><span style={{color:"var(--ink3)",fontSize:13}}>{k}</span><span style={{fontWeight:500,fontSize:13}}>{v}</span></div>
            ))}
            {p.beschreibung&&<div style={{marginTop:11,padding:"10px 12px",background:"var(--bg)",borderRadius:8,fontSize:13,lineHeight:1.65}}>{p.beschreibung}</div>}
          </div>
        </div>
        <div className="gap">
          <div className="card">
            <div className="card-hd"><span className="card-title">Aufgaben-Status</span></div>
            <div className="card-bd gap">
              {Object.entries(TASK_STATUS).map(([s,{label,color}])=>{
                const cnt=p.aufgaben.filter(t=>t.status===s).length;
                return(<div key={s}><div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:4}}><span style={{fontWeight:500}}>{label}</span><span style={{fontWeight:700,color}}>{cnt}</span></div><ProgBar value={pct(cnt,p.aufgaben.length||1)} color={color}/></div>);
              })}
            </div>
          </div>
          <div className="card">
            <div className="card-hd"><span className="card-title">Fortschritt</span></div>
            <div className="card-bd">
              <input type="range" min="0" max="100" value={p.fortschritt} style={{width:"100%",accentColor:"var(--accent)"}} onChange={e=>up({...p,fortschritt:parseInt(e.target.value)})}/>
              <div style={{textAlign:"center",fontFamily:"var(--font-display)",fontSize:26,fontWeight:700,color:"var(--accent)",margin:"4px 0 10px"}}>{p.fortschritt}%</div>
              <label className="form-label">Status</label>
              <select className="form-select" value={p.status} onChange={e=>up({...p,status:e.target.value})}>
                {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Aufgaben Tab ──────────────────────────────────────────────────────────────
function AufgabenTab({p,up}){
  const [show,setShow]=useState(false);
  const [filter,setFilter]=useState("alle");
  const [pFilter,setPFilter]=useState("alle");
  const [del,setDel]=useState(null);
  const [form,setForm]=useState({titel:"",gewerk:"Rohbau",status:"offen",prio:"mittel",faellig:"",firma:"",notiz:"",kosten:""});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.titel)return;
    up({...p,aufgaben:[...p.aufgaben,{id:uid(),...form,kosten:parseFloat(form.kosten)||0}]});
    setShow(false);setForm({titel:"",gewerk:"Rohbau",status:"offen",prio:"mittel",faellig:"",firma:"",notiz:"",kosten:""});
  };
  const upTask=(id,ch)=>up({...p,aufgaben:p.aufgaben.map(t=>t.id===id?{...t,...ch}:t)});
  const delTask=()=>{up({...p,aufgaben:p.aufgaben.filter(t=>t.id!==del)});setDel(null);};
  const filtered=p.aufgaben.filter(t=>{
    if(filter!=="alle"&&t.status!==filter)return false;
    if(pFilter!=="alle"&&t.prio!==pFilter)return false;
    return true;
  });
  const counts={alle:p.aufgaben.length,...Object.fromEntries(Object.keys(TASK_STATUS).map(s=>[s,p.aufgaben.filter(t=>t.status===s).length]))};
  return(
    <div className="gap">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[["alle","Alle"],["offen","Offen"],["progress","In Arbeit"],["pruefung","Prüfung"],["done","Erledigt"]].map(([v,l])=>(
            <button key={v} className={`btn btn-sm ${filter===v?"btn-primary":"btn-secondary"}`} onClick={()=>setFilter(v)}>{l} ({counts[v]||0})</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <select className="form-select" style={{width:"auto",padding:"5px 9px",fontSize:12}} value={pFilter} onChange={e=>setPFilter(e.target.value)}>
            <option value="alle">Alle Prios</option>
            {Object.entries(PRIO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Aufgabe</button>
        </div>
      </div>
      <div className="card">
        {filtered.length===0?<div className="empty"><div className="empty-icon">✅</div><h3>Keine Aufgaben</h3></div>:(
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Status</th><th>Aufgabe</th><th>Gewerk</th><th>Priorität</th><th>Firma</th><th>Fällig</th><th>Kosten</th><th></th></tr></thead>
              <tbody>
                {filtered.map(t=>(
                  <tr key={t.id}>
                    <td><select value={t.status} onChange={e=>upTask(t.id,{status:e.target.value})} style={{border:"none",background:"transparent",fontSize:12.5,cursor:"pointer",fontFamily:"var(--font)"}}>
                      {Object.entries(TASK_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select></td>
                    <td><div style={{fontWeight:500}}>{t.titel}</div>{t.notiz&&<div style={{fontSize:11,color:"var(--ink3)",marginTop:1}}>{t.notiz}</div>}</td>
                    <td><span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>{t.gewerk}</span></td>
                    <td><PrioBadge prio={t.prio}/></td>
                    <td style={{color:"var(--ink3)",fontSize:12}}>{t.firma||"–"}</td>
                    <td style={{color:"var(--ink3)",fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(t.faellig)}</td>
                    <td style={{fontWeight:t.kosten?600:400,fontSize:12}}>{t.kosten?fmtEUR(t.kosten):"–"}</td>
                    <td><button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>setDel(t.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {show&&(<Modal title="Neue Aufgabe" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Bezeichnung *</label><input className="form-input" value={form.titel} onChange={e=>f("titel",e.target.value)} placeholder="z.B. Dachstuhl aufstellen"/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Gewerk</label><select className="form-select" value={form.gewerk} onChange={e=>f("gewerk",e.target.value)}>{GEWERKE.map(g=><option key={g}>{g}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>f("status",e.target.value)}>{Object.entries(TASK_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Priorität</label><select className="form-select" value={form.prio} onChange={e=>f("prio",e.target.value)}>{Object.entries(PRIO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Fällig am</label><input className="form-input" type="date" value={form.faellig} onChange={e=>f("faellig",e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Firma</label><input className="form-input" value={form.firma} onChange={e=>f("firma",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Kosten (€)</label><input className="form-input" type="number" value={form.kosten} onChange={e=>f("kosten",e.target.value)}/></div>
        </div>
        <div className="form-group"><label className="form-label">Notiz</label><textarea className="form-textarea" style={{minHeight:55}} value={form.notiz} onChange={e=>f("notiz",e.target.value)}/></div>
      </Modal>)}
      {del&&<Confirm msg="Aufgabe löschen?" onYes={delTask} onNo={()=>setDel(null)}/>}
    </div>
  );
}

// ── Gantt Tab ─────────────────────────────────────────────────────────────────
function GanttTab({p}){
  const tasks=p.aufgaben.filter(t=>t.faellig);
  if(!p.start||tasks.length===0)return(<div className="card"><div className="empty"><div className="empty-icon">📅</div><h3>Zu wenig Daten</h3><p>Füge Aufgaben mit Fälligkeitsdaten hinzu.</p></div></div>);
  const gs=new Date(p.start);
  const ge=p.ende?new Date(p.ende):new Date(new Date(p.start).setMonth(new Date(p.start).getMonth()+12));
  const totalDays=daysBetween(gs,ge)||1;
  const months=[];
  let cur=new Date(gs); cur.setDate(1);
  while(cur<=ge){months.push(new Date(cur));cur.setMonth(cur.getMonth()+1);}
  const dp=(d)=>clamp(daysBetween(gs,new Date(d))/totalDays*100,0,100);
  const todayP=dp(today());
  const sc={"done":"var(--green)","progress":"var(--gold)","pruefung":"var(--purple)","offen":"var(--ink4)"};
  return(
    <div className="card" style={{overflow:"hidden"}}>
      <div className="card-hd"><span className="card-title">📅 Bauzeitenplan</span><span style={{fontSize:12,color:"var(--ink3)"}}>{fmtDate(p.start)} – {fmtDate(p.ende)}</span></div>
      <div style={{overflowX:"auto"}}><div style={{minWidth:640}}>
        <div style={{display:"flex",paddingLeft:200,borderBottom:"1.5px solid var(--border)"}}>
          {months.map((m,i)=>{
            const md=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
            return(<div key={i} style={{width:`${md/totalDays*100}%`,minWidth:0,flexShrink:0,borderRight:"1px solid var(--border)",padding:"5px 7px",fontSize:10,color:"var(--ink3)",background:"var(--bg)",overflow:"hidden",whiteSpace:"nowrap"}}>
              {m.toLocaleDateString("de-DE",{month:"short",year:"2-digit"})}
            </div>);
          })}
        </div>
        <div className="gantt-row" style={{background:"var(--bg)"}}>
          <div className="gantt-label" style={{fontWeight:600,color:"var(--accent)",fontSize:12}}>Gesamtprojekt</div>
          <div className="gantt-track">
            <div className="gantt-today-line" style={{left:`${todayP}%`}}/>
            <div className="gantt-bar" style={{left:"0.5%",width:"99%",background:"linear-gradient(90deg,var(--accent),var(--accent2))",opacity:0.3}}/>
          </div>
        </div>
        {tasks.map(t=>{
          const ep=dp(t.faellig);
          const sp=Math.max(0,ep-5);
          return(<div className="gantt-row" key={t.id}>
            <div className="gantt-label" title={t.titel}>{t.titel}</div>
            <div className="gantt-track">
              <div className="gantt-today-line" style={{left:`${todayP}%`}}/>
              <div className="gantt-bar" style={{left:`${sp}%`,width:`${Math.max(ep-sp,3)}%`,background:sc[t.status]||"var(--ink4)"}}>{t.gewerk}</div>
            </div>
          </div>);
        })}
        <div style={{padding:"7px 12px",fontSize:11,color:"var(--ink3)",display:"flex",gap:14,flexWrap:"wrap",borderTop:"1px solid var(--border)"}}>
          {[["done","Erledigt"],["progress","In Arbeit"],["pruefung","Prüfung"],["offen","Offen"]].map(([s,l])=>(
            <span key={s} style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:11,height:11,borderRadius:3,background:sc[s],display:"inline-block"}}/>{l}</span>
          ))}
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:2,height:11,background:"var(--red)",display:"inline-block"}}/> Heute</span>
        </div>
      </div></div>
    </div>
  );
}

// ── Kosten Tab ────────────────────────────────────────────────────────────────
function KostenTab({p,up}){
  const [show,setShow]=useState(false);
  const [del,setDel]=useState(null);
  const [form,setForm]=useState({beschreibung:"",betrag:"",datum:today(),gewerk:"Rohbau",firma:"",rechnungNr:"",bezahlt:false});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.beschreibung||!form.betrag)return;
    const e={id:uid(),...form,betrag:parseFloat(form.betrag)};
    up({...p,ausgabenListe:[...p.ausgabenListe,e],ausgaben:p.ausgaben+e.betrag});
    setShow(false);setForm({beschreibung:"",betrag:"",datum:today(),gewerk:"Rohbau",firma:"",rechnungNr:"",bezahlt:false});
  };
  const delEntry=()=>{
    const e=p.ausgabenListe.find(x=>x.id===del);
    up({...p,ausgabenListe:p.ausgabenListe.filter(x=>x.id!==del),ausgaben:p.ausgaben-(e?.betrag||0)});
    setDel(null);
  };
  const togglePaid=(id)=>up({...p,ausgabenListe:p.ausgabenListe.map(e=>e.id===id?{...e,bezahlt:!e.bezahlt}:e)});
  const remaining=p.budget-p.ausgaben;
  const r=pct(p.ausgaben,p.budget);
  const unbezahlt=p.ausgabenListe.filter(e=>!e.bezahlt).reduce((s,e)=>s+e.betrag,0);
  const byGewerk=GEWERKE.map(g=>({g,total:p.ausgabenListe.filter(e=>e.gewerk===g).reduce((s,e)=>s+e.betrag,0)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);
  return(
    <div className="gap">
      <div className="g4">
        <div className="kpi gld"><div className="kpi-label">Budget</div><div className="kpi-val" style={{fontSize:19}}>{fmtEUR(p.budget)}</div></div>
        <div className="kpi acc"><div className="kpi-label">Ausgaben</div><div className="kpi-val" style={{fontSize:19,color:r>90?"var(--red)":"var(--ink)"}}>{fmtEUR(p.ausgaben)}</div><div className="kpi-sub">{r}%</div></div>
        <div className="kpi grn"><div className="kpi-label">Rest</div><div className="kpi-val" style={{fontSize:19,color:remaining<0?"var(--red)":"var(--green)"}}>{fmtEUR(remaining)}</div></div>
        <div className="kpi pur"><div className="kpi-label">Unbezahlt</div><div className="kpi-val" style={{fontSize:17}}>{fmtEUR(unbezahlt)}</div><div className="kpi-sub">{p.ausgabenListe.filter(e=>!e.bezahlt).length} offen</div></div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hd"><span className="card-title">Ausgaben ({p.ausgabenListe.length})</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Eintrag</button></div>
          {p.ausgabenListe.length===0?<div className="empty"><div className="empty-icon">💰</div><h3>Keine Ausgaben</h3></div>:(
            <div className="tbl-wrap"><table>
              <thead><tr><th>Datum</th><th>Beschreibung</th><th>Gewerk</th><th>Rechnung</th><th style={{textAlign:"right"}}>Betrag</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {[...p.ausgabenListe].sort((a,b)=>b.datum.localeCompare(a.datum)).map(e=>(
                  <tr key={e.id}>
                    <td style={{color:"var(--ink3)",fontSize:11.5,whiteSpace:"nowrap"}}>{fmtDateShort(e.datum)}</td>
                    <td><div style={{fontWeight:500}}>{e.beschreibung}</div>{e.firma&&<div style={{fontSize:11,color:"var(--ink3)"}}>{e.firma}</div>}</td>
                    <td><span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>{e.gewerk}</span></td>
                    <td style={{fontSize:11,color:"var(--ink3)"}}>{e.rechnungNr||"–"}</td>
                    <td style={{textAlign:"right",fontWeight:700,fontSize:13}}>{fmtEUR(e.betrag)}</td>
                    <td><button className={`btn btn-sm ${e.bezahlt?"btn-success":"btn-secondary"}`} onClick={()=>togglePaid(e.id)}>{e.bezahlt?"✓ Bezahlt":"Offen"}</button></td>
                    <td><button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>setDel(e.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">Nach Gewerk</span></div>
          <div className="card-bd gap">
            {byGewerk.length===0?<p style={{color:"var(--ink3)",fontSize:13}}>Noch keine Ausgaben.</p>:byGewerk.map(({g,total})=>(
              <div key={g}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:4}}><span style={{fontWeight:500}}>{g}</span><span style={{fontWeight:700}}>{fmtEUR(total)}</span></div>
                <ProgBar value={pct(total,p.budget)} h={5}/>
                <div style={{fontSize:10.5,color:"var(--ink3)",marginTop:2}}>{pct(total,p.budget)}% des Budgets</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {show&&(<Modal title="Ausgabe erfassen" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Beschreibung *</label><input className="form-input" value={form.beschreibung} onChange={e=>f("beschreibung",e.target.value)} placeholder="z.B. Rohbau EG"/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Betrag (€) *</label><input className="form-input" type="number" value={form.betrag} onChange={e=>f("betrag",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Datum</label><input className="form-input" type="date" value={form.datum} onChange={e=>f("datum",e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Gewerk</label><select className="form-select" value={form.gewerk} onChange={e=>f("gewerk",e.target.value)}>{GEWERKE.map(g=><option key={g}>{g}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Firma</label><input className="form-input" value={form.firma} onChange={e=>f("firma",e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Rechnungsnr.</label><input className="form-input" value={form.rechnungNr} onChange={e=>f("rechnungNr",e.target.value)}/></div>
          <div className="form-group" style={{display:"flex",alignItems:"flex-end"}}><label className="form-check"><input type="checkbox" checked={form.bezahlt} onChange={e=>f("bezahlt",e.target.checked)}/> Bereits bezahlt</label></div>
        </div>
      </Modal>)}
      {del&&<Confirm msg="Ausgabe löschen?" onYes={delEntry} onNo={()=>setDel(null)}/>}
    </div>
  );
}

// ── Zahlungsplan Tab ──────────────────────────────────────────────────────────
function ZahlungsTab({p,up}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({bezeichnung:"",faellig:"",betrag:"",bezahlt:false});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.bezeichnung||!form.betrag)return;
    up({...p,zahlungsplan:[...p.zahlungsplan,{id:uid(),...form,betrag:parseFloat(form.betrag)}]});
    setShow(false);setForm({bezeichnung:"",faellig:"",betrag:"",bezahlt:false});
  };
  const toggle=(id)=>up({...p,zahlungsplan:p.zahlungsplan.map(z=>z.id===id?{...z,bezahlt:!z.bezahlt}:z)});
  const del=(id)=>up({...p,zahlungsplan:p.zahlungsplan.filter(z=>z.id!==id)});
  const total=p.zahlungsplan.reduce((s,z)=>s+z.betrag,0);
  const bezahlt=p.zahlungsplan.filter(z=>z.bezahlt).reduce((s,z)=>s+z.betrag,0);
  return(
    <div className="gap">
      <div className="g3">
        <div className="kpi gld"><div className="kpi-label">Gesamtplan</div><div className="kpi-val" style={{fontSize:19}}>{fmtEUR(total)}</div></div>
        <div className="kpi grn"><div className="kpi-label">Bezahlt</div><div className="kpi-val" style={{fontSize:19,color:"var(--green)"}}>{fmtEUR(bezahlt)}</div><div className="kpi-sub">{pct(bezahlt,total)}%</div></div>
        <div className="kpi acc"><div className="kpi-label">Offen</div><div className="kpi-val" style={{fontSize:19}}>{fmtEUR(total-bezahlt)}</div></div>
      </div>
      <ProgBar value={pct(bezahlt,total)} h={9}/>
      <div className="card">
        <div className="card-hd"><span className="card-title">Zahlungsmeilensteine</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Meilenstein</button></div>
        {p.zahlungsplan.length===0?<div className="empty"><div className="empty-icon">🏦</div><h3>Kein Zahlungsplan</h3></div>:(
          <div className="tbl-wrap"><table>
            <thead><tr><th>#</th><th>Bezeichnung</th><th>Fällig</th><th style={{textAlign:"right"}}>Betrag</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {[...p.zahlungsplan].sort((a,b)=>a.faellig.localeCompare(b.faellig)).map((z,i)=>(
                <tr key={z.id}>
                  <td style={{color:"var(--ink4)",fontSize:12}}>{i+1}</td>
                  <td style={{fontWeight:500}}>{z.bezeichnung}</td>
                  <td style={{color:"var(--ink3)",fontSize:12}}>{fmtDate(z.faellig)}</td>
                  <td style={{textAlign:"right",fontWeight:700}}>{fmtEUR(z.betrag)}</td>
                  <td><button className={`btn btn-sm ${z.bezahlt?"btn-success":"btn-secondary"}`} onClick={()=>toggle(z.id)}>{z.bezahlt?"✓ Bezahlt":"Ausstehend"}</button></td>
                  <td><button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>del(z.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
      {show&&(<Modal title="Zahlungsmeilenstein" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Bezeichnung *</label><input className="form-input" value={form.bezeichnung} onChange={e=>f("bezeichnung",e.target.value)} placeholder="z.B. Rohbau fertig"/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Betrag (€)</label><input className="form-input" type="number" value={form.betrag} onChange={e=>f("betrag",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Fällig am</label><input className="form-input" type="date" value={form.faellig} onChange={e=>f("faellig",e.target.value)}/></div>
        </div>
        <label className="form-check"><input type="checkbox" checked={form.bezahlt} onChange={e=>f("bezahlt",e.target.checked)}/> Bereits bezahlt</label>
      </Modal>)}
    </div>
  );
}

// ── Firmen Tab ────────────────────────────────────────────────────────────────
function FirmenTab({p,up}){
  const [show,setShow]=useState(false);
  const [del,setDel]=useState(null);
  const [form,setForm]=useState({name:"",gewerk:"",kontakt:"",email:"",ansprechpartner:"",bewertung:0,notiz:""});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.name)return;
    up({...p,firmen:[...p.firmen,{id:uid(),...form}]});
    setShow(false);setForm({name:"",gewerk:"",kontakt:"",email:"",ansprechpartner:"",bewertung:0,notiz:""});
  };
  return(
    <div className="gap">
      <div className="sec-hd"><span className="sec-title">Beteiligte Firmen ({p.firmen.length})</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Firma</button></div>
      {p.firmen.length===0?<div className="card"><div className="empty"><div className="empty-icon">🏢</div><h3>Keine Firmen</h3></div></div>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12}}>
          {p.firmen.map(f=>(
            <div className="card" key={f.id}>
              <div style={{padding:"15px 17px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{f.name}</div>
                    {f.gewerk&&<span className="badge" style={{background:"var(--accent-bg)",color:"var(--accent)",marginTop:4}}>{f.gewerk}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>setDel(f.id)}>🗑</button>
                </div>
                <Stars n={f.bewertung||0}/>
                <div style={{marginTop:9,display:"flex",flexDirection:"column",gap:4,fontSize:12.5,color:"var(--ink3)"}}>
                  {f.ansprechpartner&&<span>👤 {f.ansprechpartner}</span>}
                  {f.kontakt&&<span>📞 {f.kontakt}</span>}
                  {f.email&&<span>✉️ {f.email}</span>}
                  {f.notiz&&<div style={{marginTop:7,padding:"7px 9px",background:"var(--bg)",borderRadius:6,fontSize:12,lineHeight:1.5}}>{f.notiz}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {show&&(<Modal title="Firma hinzufügen" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Firmenname *</label><input className="form-input" value={form.name} onChange={e=>f("name",e.target.value)}/></div>
        <div className="form-group"><label className="form-label">Gewerk</label><select className="form-select" value={form.gewerk} onChange={e=>f("gewerk",e.target.value)}><option value="">Bitte wählen</option>{GEWERKE.map(g=><option key={g}>{g}</option>)}<option>Architektur</option><option>Statik</option><option>Vermessung</option></select></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Ansprechpartner</label><input className="form-input" value={form.ansprechpartner} onChange={e=>f("ansprechpartner",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.kontakt} onChange={e=>f("kontakt",e.target.value)}/></div>
        </div>
        <div className="form-group"><label className="form-label">E-Mail</label><input className="form-input" type="email" value={form.email} onChange={e=>f("email",e.target.value)}/></div>
        <div className="form-group">
          <label className="form-label">Bewertung</label>
          <div style={{display:"flex",gap:5}}>{[1,2,3,4,5].map(n=><button key={n} type="button" style={{fontSize:22,background:"none",border:"none",cursor:"pointer",color:n<=form.bewertung?"var(--gold)":"var(--border)"}} onClick={()=>f("bewertung",n)}>★</button>)}</div>
        </div>
        <div className="form-group"><label className="form-label">Notiz</label><textarea className="form-textarea" style={{minHeight:55}} value={form.notiz} onChange={e=>f("notiz",e.target.value)}/></div>
      </Modal>)}
      {del&&<Confirm msg="Firma löschen?" onYes={()=>{up({...p,firmen:p.firmen.filter(f=>f.id!==del)});setDel(null);}} onNo={()=>setDel(null)}/>}
    </div>
  );
}

// ── Dokumente Tab ─────────────────────────────────────────────────────────────
function DokumenteTab({p,up}){
  const [show,setShow]=useState(false);
  const [del,setDel]=useState(null);
  const [form,setForm]=useState({name:"",typ:"Grundriss",datum:today(),groesse:"",wichtig:false});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.name)return;
    up({...p,dokumente:[...p.dokumente,{id:uid(),...form}]});
    setShow(false);setForm({name:"",typ:"Grundriss",datum:today(),groesse:"",wichtig:false});
  };
  const icons={Baugenehmigung:"🏛️",Lageplan:"🗺️",Grundriss:"📐",Schnittplan:"✂️",Ansichtsplan:"🖼️",Statik:"⚙️",Energieausweis:"⚡",Vertrag:"📝",Angebot:"💼",Rechnung:"💵",Abnahmeprotokoll:"✅",Mängelliste:"⚠️",Foto:"📷",Zertifikat:"🏅",Versicherung:"🛡️",Sonstiges:"📄"};
  const important=p.dokumente.filter(d=>d.wichtig);
  return(
    <div className="gap">
      <div className="sec-hd"><span className="sec-title">Dokumente ({p.dokumente.length})</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Dokument</button></div>
      {important.length>0&&(
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:"var(--ink3)",marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>⭐ Wichtige Dokumente</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {important.map(d=>(
              <div className="card" key={d.id} style={{padding:"13px 15px",border:"1.5px solid var(--gold)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:20}}>{icons[d.typ]||"📄"}</span>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>setDel(d.id)}>🗑</button>
                </div>
                <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{d.name}</div>
                <div style={{fontSize:11,color:"var(--ink3)"}}>{d.typ} · {fmtDate(d.datum)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card">
        {p.dokumente.length===0?<div className="empty"><div className="empty-icon">📁</div><h3>Keine Dokumente</h3></div>:(
          <div className="tbl-wrap"><table>
            <thead><tr><th>Typ</th><th>Dateiname</th><th>Datum</th><th>Größe</th><th>★</th><th></th></tr></thead>
            <tbody>
              {p.dokumente.map(d=>(
                <tr key={d.id}>
                  <td><span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>{icons[d.typ]||"📄"} {d.typ}</span></td>
                  <td style={{fontWeight:500}}>{d.name}</td>
                  <td style={{color:"var(--ink3)",fontSize:12}}>{fmtDate(d.datum)}</td>
                  <td style={{color:"var(--ink3)",fontSize:12}}>{d.groesse||"–"}</td>
                  <td>{d.wichtig?"⭐":""}</td>
                  <td><button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>setDel(d.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
      {show&&(<Modal title="Dokument hinzufügen" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Dateiname *</label><input className="form-input" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="Baugenehmigung_2025.pdf"/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Typ</label><select className="form-select" value={form.typ} onChange={e=>f("typ",e.target.value)}>{DOK_TYPEN.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Datum</label><input className="form-input" type="date" value={form.datum} onChange={e=>f("datum",e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Dateigröße</label><input className="form-input" value={form.groesse} onChange={e=>f("groesse",e.target.value)} placeholder="z.B. 2.4 MB"/></div>
          <div className="form-group" style={{display:"flex",alignItems:"flex-end"}}><label className="form-check"><input type="checkbox" checked={form.wichtig} onChange={e=>f("wichtig",e.target.checked)}/> ⭐ Wichtig</label></div>
        </div>
      </Modal>)}
      {del&&<Confirm msg="Dokument löschen?" onYes={()=>{up({...p,dokumente:p.dokumente.filter(d=>d.id!==del)});setDel(null);}} onNo={()=>setDel(null)}/>}
    </div>
  );
}

// ── Mängel Tab ────────────────────────────────────────────────────────────────
function MängelTab({p,up}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({titel:"",beschreibung:"",status:"offen",prio:"mittel",gewerk:"Rohbau",firma:"",gemeldetAm:today()});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.titel)return;
    up({...p,maengel:[...p.maengel,{id:uid(),...form}]});
    setShow(false);setForm({titel:"",beschreibung:"",status:"offen",prio:"mittel",gewerk:"Rohbau",firma:"",gemeldetAm:today()});
  };
  const upM=(id,ch)=>up({...p,maengel:p.maengel.map(m=>m.id===id?{...m,...ch}:m)});
  const delM=(id)=>up({...p,maengel:p.maengel.filter(m=>m.id!==id)});
  const offen=p.maengel.filter(m=>m.status==="offen").length;
  return(
    <div className="gap">
      {offen>0&&<div className="alert alert-danger">⚠️ <strong>{offen} offene Mängel</strong> müssen behoben werden!</div>}
      <div className="sec-hd"><span className="sec-title">Mängelliste ({p.maengel.length})</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Mangel melden</button></div>
      {p.maengel.length===0?<div className="card"><div className="empty"><div className="empty-icon">✅</div><h3>Keine Mängel</h3><p>Super – alles in Ordnung!</p></div></div>:(
        <div className="card"><div className="tbl-wrap"><table>
          <thead><tr><th>Status</th><th>Mangel</th><th>Gewerk</th><th>Prio</th><th>Firma</th><th>Gemeldet</th><th></th></tr></thead>
          <tbody>
            {p.maengel.map(m=>(
              <tr key={m.id}>
                <td><select value={m.status} onChange={e=>upM(m.id,{status:e.target.value})} style={{border:"none",background:"transparent",fontSize:12.5,cursor:"pointer",fontFamily:"var(--font)"}}>
                  {Object.entries(MÄNGEL_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select></td>
                <td><div style={{fontWeight:500}}>{m.titel}</div>{m.beschreibung&&<div style={{fontSize:11,color:"var(--ink3)",marginTop:1}}>{m.beschreibung}</div>}</td>
                <td><span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>{m.gewerk}</span></td>
                <td><PrioBadge prio={m.prio}/></td>
                <td style={{color:"var(--ink3)",fontSize:12}}>{m.firma||"–"}</td>
                <td style={{color:"var(--ink3)",fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(m.gemeldetAm)}</td>
                <td><button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>delM(m.id)}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}
      {show&&(<Modal title="Mangel melden" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Bezeichnung *</label><input className="form-input" value={form.titel} onChange={e=>f("titel",e.target.value)} placeholder="z.B. Riss in Außenwand"/></div>
        <div className="form-group"><label className="form-label">Beschreibung</label><textarea className="form-textarea" style={{minHeight:55}} value={form.beschreibung} onChange={e=>f("beschreibung",e.target.value)}/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Gewerk</label><select className="form-select" value={form.gewerk} onChange={e=>f("gewerk",e.target.value)}>{GEWERKE.map(g=><option key={g}>{g}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Priorität</label><select className="form-select" value={form.prio} onChange={e=>f("prio",e.target.value)}>{Object.entries(PRIO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Firma</label><input className="form-input" value={form.firma} onChange={e=>f("firma",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Gemeldet am</label><input className="form-input" type="date" value={form.gemeldetAm} onChange={e=>f("gemeldetAm",e.target.value)}/></div>
        </div>
      </Modal>)}
    </div>
  );
}

// ── Bautagebuch Tab ───────────────────────────────────────────────────────────
function BautagebuchTab({p,up}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({datum:today(),wetter:WEATHER[0],temp:"",eintrag:"",fotos:0,verfasser:""});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.eintrag)return;
    up({...p,bautagebuch:[{id:uid(),...form,fotos:parseInt(form.fotos)||0},...p.bautagebuch]});
    setShow(false);setForm({datum:today(),wetter:WEATHER[0],temp:"",eintrag:"",fotos:0,verfasser:""});
  };
  const del=(id)=>up({...p,bautagebuch:p.bautagebuch.filter(e=>e.id!==id)});
  return(
    <div className="gap">
      <div className="sec-hd"><span className="sec-title">Bautagebuch ({p.bautagebuch.length} Einträge)</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Eintrag</button></div>
      {p.bautagebuch.length===0?<div className="card"><div className="empty"><div className="empty-icon">📔</div><h3>Kein Bautagebuch</h3><p>Dokumentiere täglich den Baufortschritt.</p></div></div>:(
        <div className="card"><div className="card-bd">
          <div className="tl">
            {p.bautagebuch.map(e=>(
              <div className="tl-item" key={e.id}>
                <div className="tl-dot"/>
                <div style={{padding:"13px 16px",background:"var(--bg)",borderRadius:9,border:"1px solid var(--border)",marginLeft:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:7}}>
                    <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:14}}>{fmtDate(e.datum)}</span>
                      <span style={{fontSize:13}}>{e.wetter}</span>
                      {e.temp&&<span className="badge" style={{background:"var(--blue-bg)",color:"var(--blue)"}}>🌡️ {e.temp}</span>}
                      {e.fotos>0&&<span className="badge" style={{background:"var(--bg2)",color:"var(--ink3)"}}>📷 {e.fotos}</span>}
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {e.verfasser&&<span style={{fontSize:11.5,color:"var(--ink3)"}}>✍️ {e.verfasser}</span>}
                      <button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>del(e.id)}>🗑</button>
                    </div>
                  </div>
                  <div style={{fontSize:13.5,lineHeight:1.7,color:"var(--ink2)",whiteSpace:"pre-wrap"}}>{e.eintrag}</div>
                </div>
              </div>
            ))}
          </div>
        </div></div>
      )}
      {show&&(<Modal title="Bautagebuch Eintrag" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Datum</label><input className="form-input" type="date" value={form.datum} onChange={e=>f("datum",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Wetter</label><select className="form-select" value={form.wetter} onChange={e=>f("wetter",e.target.value)}>{WEATHER.map(w=><option key={w}>{w}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Temperatur</label><input className="form-input" value={form.temp} onChange={e=>f("temp",e.target.value)} placeholder="z.B. 18°C"/></div>
          <div className="form-group"><label className="form-label">Fotos (Anzahl)</label><input className="form-input" type="number" value={form.fotos} onChange={e=>f("fotos",e.target.value)}/></div>
        </div>
        <div className="form-group"><label className="form-label">Verfasser</label><input className="form-input" value={form.verfasser} onChange={e=>f("verfasser",e.target.value)} placeholder="Name / Rolle"/></div>
        <div className="form-group"><label className="form-label">Tagesbericht *</label><textarea className="form-textarea" style={{minHeight:130}} value={form.eintrag} onChange={e=>f("eintrag",e.target.value)} placeholder="Welche Arbeiten? Anwesende Firmen? Besondere Vorkommnisse?"/></div>
      </Modal>)}
    </div>
  );
}

// ── Risiken Tab ───────────────────────────────────────────────────────────────
function RisikenTab({p,up}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({titel:"",beschreibung:"",prio:"mittel",eintrittsPkt:30,status:"aktiv"});
  const f=(k,v)=>setForm(x=>({...x,[k]:v}));
  const save=()=>{
    if(!form.titel)return;
    up({...p,risiken:[...p.risiken,{id:uid(),...form,eintrittsPkt:parseInt(form.eintrittsPkt)}]});
    setShow(false);setForm({titel:"",beschreibung:"",prio:"mittel",eintrittsPkt:30,status:"aktiv"});
  };
  const del=(id)=>up({...p,risiken:p.risiken.filter(r=>r.id!==id)});
  const upR=(id,ch)=>up({...p,risiken:p.risiken.map(r=>r.id===id?{...r,...ch}:r)});
  const rc=(pkt)=>pkt>=70?"var(--red)":pkt>=40?"var(--gold)":"var(--green)";
  return(
    <div className="gap">
      <div className="sec-hd"><span className="sec-title">Risikoregister ({p.risiken.length})</span><button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>＋ Risiko</button></div>
      {p.risiken.length===0?<div className="card"><div className="empty"><div className="empty-icon">🎲</div><h3>Keine Risiken</h3></div></div>:(
        <div className="gap">
          {p.risiken.map(r=>(
            <div className="card" key={r.id} style={{borderLeft:`4px solid ${rc(r.eintrittsPkt)}`}}>
              <div style={{padding:"15px 17px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{r.titel}</div>
                    {r.beschreibung&&<div style={{fontSize:13,color:"var(--ink3)",marginBottom:9}}>{r.beschreibung}</div>}
                    <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
                      <PrioBadge prio={r.prio}/>
                      <span className="badge" style={{background:r.status==="aktiv"?"var(--red-bg)":r.status==="beobachten"?"var(--gold-bg)":"var(--green-bg)",color:r.status==="aktiv"?"var(--red)":r.status==="beobachten"?"var(--gold)":"var(--green)"}}>
                        {r.status==="aktiv"?"🔴 Aktiv":r.status==="beobachten"?"🟡 Beobachten":"🟢 Entschärft"}
                      </span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span style={{color:"var(--ink3)"}}>Eintrittswahrscheinlichkeit</span>
                      <span style={{fontWeight:700,color:rc(r.eintrittsPkt)}}>{r.eintrittsPkt}%</span>
                    </div>
                    <div className="risk-bar-bg"><div className="risk-bar" style={{width:`${r.eintrittsPkt}%`,background:rc(r.eintrittsPkt)}}/></div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <select value={r.status} onChange={e=>upR(r.id,{status:e.target.value})} style={{fontSize:12,border:"1px solid var(--border)",borderRadius:6,padding:"4px 6px",background:"var(--bg)",fontFamily:"var(--font)"}}>
                      <option value="aktiv">Aktiv</option><option value="beobachten">Beobachten</option><option value="entschaerft">Entschärft</option>
                    </select>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{color:"var(--red)"}} onClick={()=>del(r.id)}>🗑</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {show&&(<Modal title="Risiko erfassen" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-group"><label className="form-label">Bezeichnung *</label><input className="form-input" value={form.titel} onChange={e=>f("titel",e.target.value)} placeholder="z.B. Lieferverzug Fenster"/></div>
        <div className="form-group"><label className="form-label">Beschreibung</label><textarea className="form-textarea" style={{minHeight:55}} value={form.beschreibung} onChange={e=>f("beschreibung",e.target.value)}/></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Priorität</label><select className="form-select" value={form.prio} onChange={e=>f("prio",e.target.value)}>{Object.entries(PRIO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>f("status",e.target.value)}><option value="aktiv">Aktiv</option><option value="beobachten">Beobachten</option><option value="entschaerft">Entschärft</option></select></div>
        </div>
        <div className="form-group">
          <label className="form-label">Eintrittswahrscheinlichkeit: <strong>{form.eintrittsPkt}%</strong></label>
          <input type="range" min="0" max="100" value={form.eintrittsPkt} onChange={e=>f("eintrittsPkt",e.target.value)} style={{width:"100%",accentColor:"var(--accent)"}}/>
        </div>
      </Modal>)}
    </div>
  );
}

// ── Notizen Tab ───────────────────────────────────────────────────────────────
function NotizenTab({p,up}){
  const [text,setText]=useState(p.notizen||"");
  const [saved,setSaved]=useState(true);
  const [ts,setTs]=useState(null);
  useEffect(()=>{setText(p.notizen||"");},[p.id]);
  const save=()=>{up({...p,notizen:text});setSaved(true);setTs(new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}));};
  return(
    <div className="gap">
      <div className="alert alert-info">💡 Für Besprechungsprotokolle, offene Fragen, To-dos und Erinnerungen.</div>
      <div className="card">
        <div className="card-hd">
          <span className="card-title">📝 Projektnotizen</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saved&&ts&&<span style={{fontSize:11.5,color:"var(--green)"}}>✓ {ts}</span>}
            {!saved&&<span style={{fontSize:11.5,color:"var(--gold)"}} className="pulse">● Ungespeichert</span>}
            <button className="btn btn-primary btn-sm" onClick={save}>Speichern</button>
          </div>
        </div>
        <div className="card-bd">
          <textarea className="form-textarea" style={{minHeight:360,fontSize:14,lineHeight:1.8}} value={text}
            onChange={e=>{setText(e.target.value);setSaved(false);}}
            placeholder="Freie Notizen, To-dos, Gesprächsprotokolle..."/>
        </div>
      </div>
    </div>
  );
}

// ── Checklisten ───────────────────────────────────────────────────────────────
const CHECKLISTS=[
  {id:"vorbau",title:"Vor Baubeginn",icon:"📋",items:["Baugenehmigung liegt vor","Finanzierung vollständig gesichert","Versicherungen (Bauherrenhaftpflicht, Bauleistung)","Architektenvertrag unterzeichnet","Bodengutachten vorhanden","Vermessung abgeschlossen","Bauleiter bestellt","Erschließung geklärt (Strom, Wasser, Abwasser)","Nachbarn informiert","Baulärm-Zeiten bekannt","Anschluss Baustrom beantragt","Baucontainer / WC geplant"]},
  {id:"rohbau",title:"Rohbau-Abnahme",icon:"🏗️",items:["Maße und Abmessungen geprüft","Fenster-/Türöffnungen korrekt","Schornstein / Lüftungsschächte","Dachneigung und -überstand","Entwässerung Flachdach","Abdichtung Kelleraußenwand","Perimeterdämmung","Frostschutz Fundament","Durchbrüche für Installationen","Rohdecken-Unebenheiten < 5mm","Protokoll mit Statiker"]},
  {id:"dicht",title:"Dichtheitshülle",icon:"🛡️",items:["Luftdichtheit Dach (Blower-Door-Test)","Dampfsperre vollflächig verklebt","Fenster-Anschlüsse dicht","Rollladenkasten gedämmt","Haustür-Abdichtung","Kellerdecke Dämmung","Wärmebrücken minimiert","U-Wert-Nachweis vorhanden","KfW-Gutachter Zwischentestat"]},
  {id:"abnahme",title:"Gesamtabnahme",icon:"✅",items:["Alle Gewerke fertiggestellt","Mängelprotokoll erstellt","5-Jahre-Gewährleistung notiert","Ateste und Zertifikate gesammelt","Bedienungsanleitungen vorhanden","Heizungshydraulik abgeglichen","Einweisung alle Anlagen","Energieausweis ausgestellt","Schlüsselübergabe dokumentiert","Hausanschlüsse final abgenommen","Außenanlagen fertig","Restarbeiten-Liste definiert"]},
];

function Checklisten(){
  const [checked,setChecked]=useState({});
  const [active,setActive]=useState("vorbau");
  const cl=CHECKLISTS.find(c=>c.id===active);
  const toggle=(id,i)=>setChecked(ch=>({...ch,[`${id}-${i}`]:!ch[`${id}-${i}`]}));
  const done=cl?.items.filter((_,i)=>checked[`${cl.id}-${i}`]).length||0;
  return(
    <div className="gap">
      <div className="tabs">
        {CHECKLISTS.map(c=><button key={c.id} className={`tab${active===c.id?" active":""}`} onClick={()=>setActive(c.id)}>{c.icon} {c.title}</button>)}
      </div>
      {cl&&(
        <div className="card">
          <div className="card-hd">
            <span className="card-title">{cl.icon} {cl.title}</span>
            <span style={{fontSize:13,fontWeight:600,color:"var(--green)"}}>{done}/{cl.items.length} erledigt</span>
          </div>
          <div style={{padding:"4px 0"}}>
            <ProgBar value={pct(done,cl.items.length)} h={4}/>
          </div>
          <div className="card-bd" style={{display:"flex",flexDirection:"column",gap:0}}>
            {cl.items.map((item,i)=>{
              const key=`${cl.id}-${i}`;
              const on=!!checked[key];
              return(
                <label key={i} className="form-check" style={{padding:"10px 0",borderBottom:"1px solid var(--border)",cursor:"pointer",gap:11,opacity:on?0.5:1,transition:"opacity 0.2s"}}>
                  <input type="checkbox" checked={on} onChange={()=>toggle(cl.id,i)} style={{width:17,height:17,flexShrink:0}}/>
                  <span style={{fontSize:13.5,textDecoration:on?"line-through":"none"}}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Förderungen ───────────────────────────────────────────────────────────────
function Foerderungen(){
  const items=[
    {name:"KfW Klimafreundlicher Neubau (297/298)",foerd:"Zinsgünstiges Darlehen bis 150.000 €",voraus:"Neubau, QNG-Siegel oder EH40",wichtig:"Antrag VOR Baubeginn bei KfW über Hausbank",color:"var(--green)",icon:"🏦"},
    {name:"BAFA Bundesförderung Effiziente Gebäude (BEG)",foerd:"Zuschuss 15–70% der Kosten",voraus:"Wärmepumpe, Solarthermie, Dämmung etc.",wichtig:"Antrag VOR Auftragsvergabe!",color:"var(--blue)",icon:"⚡"},
    {name:"KfW Wohneigentum für Familien (300)",foerd:"Bis 270.000 € zu 1% Zinsen",voraus:"Erstmaliger Immobilienkauf, Kinder, Einkommensgrenzen",wichtig:"Nur für Neubau/Ersterwerb",color:"var(--accent)",icon:"👨‍👩‍👧"},
    {name:"Steuerliche Förderung §35c EStG",foerd:"20% der Kosten (max. 40.000 €) über 3 Jahre absetzbar",voraus:"Sanierung Bestandsgebäude",wichtig:"Nur für Sanierung, nicht Neubau",color:"var(--gold)",icon:"📊"},
    {name:"Niedersachsen: NBank Wohnraumförderung",foerd:"Darlehen + Tilgungszuschuss",voraus:"Niedersachsen, Einkommensgrenzen",wichtig:"Über NBank direkt beantragen",color:"var(--purple)",icon:"🏠"},
    {name:"Handwerkerkosten §35a EStG",foerd:"20% der Lohnkosten (max. 1.200 €/Jahr)",voraus:"Alle Handwerkerleistungen am Gebäude",wichtig:"Rechnung per Überweisung bezahlen, nicht bar",color:"var(--green)",icon:"🔨"},
  ];
  return(
    <div className="gap">
      <div className="alert alert-warn">⚠️ <strong>Wichtig:</strong> Viele Förderungen müssen VOR Baubeginn oder VOR Auftragsvergabe beantragt werden! Beratung beim Energieberater empfohlen.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:13}}>
        {items.map((f,i)=>(
          <div className="card" key={i} style={{borderLeft:`4px solid ${f.color}`}}>
            <div style={{padding:"15px 17px"}}>
              <div style={{fontSize:20,marginBottom:7}}>{f.icon}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{f.name}</div>
              <div style={{fontSize:13,color:"var(--ink2)",marginBottom:7,lineHeight:1.5}}>💶 {f.foerd}</div>
              <div style={{fontSize:12.5,color:"var(--ink3)",marginBottom:6}}>📌 {f.voraus}</div>
              <div style={{fontSize:12.5,padding:"7px 10px",background:"var(--gold-bg)",color:"#6B4A10",borderRadius:6,border:"1px solid #DDC070"}}>⚡ {f.wichtig}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KI Assistent (mit Claude API) ─────────────────────────────────────────────
function KIAssistent({projects}){
  const [messages,setMessages]=useState([{role:"assistant",content:"Hallo! Ich bin dein KI-Bauassistent. Ich helfe bei Fragen zu Bauprojekten, Kostenplanung, Förderungen, Baurecht und mehr. Was möchtest du wissen?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg=input.trim();
    setInput("");
    setMessages(m=>[...m,{role:"user",content:userMsg}]);
    setLoading(true);
    const context=`Du bist ein erfahrener Bauexperte und persönlicher Assistent für Bauherren in Deutschland. Du hilfst bei: Bauprojektmanagement, Kostenplanung, KfW/BAFA-Förderungen, Baurecht, Gewerken, Vertragsrecht, Mängelrecht, Abnahme, VOB, HOAI. Antworte präzise, praxisnah auf Deutsch.

Aktuelle Projekte:
${projects.map(p=>`- ${p.name} (${STATUS[p.status]?.label}): Budget ${fmtEUR(p.budget)}, Ausgaben ${fmtEUR(p.ausgaben)}, ${p.fortschritt}% fertig`).join("\n")}`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:context,
          messages:[...messages,{role:"user",content:userMsg}].map(m=>({role:m.role,content:m.content}))
        })
      });
      const data=await res.json();
      const reply=data.content?.map(b=>b.text||"").join("")||"Entschuldigung, ich konnte keine Antwort generieren.";
      setMessages(m=>[...m,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(m=>[...m,{role:"assistant",content:"Verbindungsfehler. Bitte versuche es erneut."}]);
    }
    setLoading(false);
  };

  return(
    <div className="gap">
      <div className="alert alert-info">🤖 KI-Bauassistent – Powered by Claude. Stelle Fragen zu Projekten, Förderungen, Baurecht, Kosten.</div>
      <div className="card" style={{display:"flex",flexDirection:"column",height:"62vh"}}>
        <div className="card-hd"><span className="card-title">💬 Bauassistent</span><span className="badge" style={{background:"var(--blue-bg)",color:"var(--blue)"}}>🤖 KI</span></div>
        <div style={{flex:1,overflowY:"auto",padding:"15px 18px",display:"flex",flexDirection:"column",gap:11}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"80%",padding:"10px 13px",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.role==="user"?"var(--accent)":"var(--bg)",color:m.role==="user"?"#fff":"var(--ink)",fontSize:13.5,lineHeight:1.65,boxShadow:"var(--shadow-sm)",whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",justifyContent:"flex-start"}}>
              <div style={{padding:"11px 15px",background:"var(--bg)",borderRadius:"12px 12px 12px 4px",boxShadow:"var(--shadow-sm)"}}>
                <div style={{display:"flex",gap:4}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--ink4)"}} className="pulse"/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:"11px 15px",borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
          <input className="form-input" style={{flex:1}} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Frage stellen... (Enter)" disabled={loading}/>
          <button className="btn btn-primary" onClick={send} disabled={loading||!input.trim()}>{loading?"…":"Senden"}</button>
        </div>
        <div style={{padding:"5px 15px 9px",display:"flex",gap:5,flexWrap:"wrap"}}>
          {["KfW-Förderung 2025","BAFA Wärmepumpe","Abnahme VOB","Mängelrüge","Baukostenindex"].map(q=>(
            <button key={q} className="btn btn-secondary btn-sm" onClick={()=>setInput(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main App Component ────────────────────────────────────────────────────────
export default function App(){
  const [projects,setProjects]=useState(SEED);
  const [view,setView]=useState("dashboard");
  const [currentProjId,setCurrentProjId]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const currentProject=projects.find(p=>p.id===currentProjId);
  const updateProject=(updated)=>setProjects(ps=>ps.map(p=>p.id===updated.id?updated:p));

  const navTo=(v,pid=null)=>{setView(v);if(pid)setCurrentProjId(pid);setSidebarOpen(false);};

  const mainNav=[
    {id:"dashboard",icon:"🏠",label:"Dashboard"},
    {id:"projekte",icon:"📋",label:"Alle Projekte"},
    {id:"checklisten",icon:"✅",label:"Checklisten"},
    {id:"foerderungen",icon:"💶",label:"Förderungen"},
    {id:"ki",icon:"🤖",label:"KI-Assistent"},
  ];

  const offeneTasks=projects.flatMap(p=>p.aufgaben).filter(t=>t.status!=="done").length;
  const offeneMaengel=projects.flatMap(p=>p.maengel).filter(m=>m.status!=="behoben").length;

  const titles={
    dashboard:"Dashboard",
    projekte:"Projekte",
    checklisten:"Checklisten",
    foerderungen:"Förderungen",
    ki:"KI-Assistent",
    project:currentProject?.name||"Projekt"
  };

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen&&<div style={{display:"block",position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:49}} onClick={()=>setSidebarOpen(false)}/>}

        {/* Sidebar */}
        <div className={`sidebar${sidebarOpen?" open":""}`}>
          <div className="sidebar-logo">
            <div className="logo-icon">🏗️</div>
            <div>
              <div className="logo-name">BauPro</div>
              <div className="logo-ver">v2.0 Professional</div>
            </div>
          </div>

          <div className="sidebar-scroll">
            <div className="sidebar-sec">
              <div className="sidebar-sec-title">Navigation</div>
              {mainNav.map(item=>(
                <div key={item.id} className={`nav-item${view===item.id&&view!=="project"?" active":""}`} onClick={()=>navTo(item.id)}>
                  <span className="ni">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id==="dashboard"&&offeneTasks>0&&<span className="nb">{offeneTasks}</span>}
                </div>
              ))}
            </div>

            {projects.length>0&&(
              <div className="sidebar-sec">
                <div className="sidebar-sec-title">Meine Projekte</div>
                <div style={{padding:"4px 0"}}>
                  {projects.map(p=>(
                    <div key={p.id} className={`proj-nav-item${view==="project"&&currentProjId===p.id?" active":""}`} onClick={()=>navTo("project",p.id)}>
                      <div className="proj-dot" style={{background:STATUS[p.status]?.color||"#999"}}/>
                      <span className="proj-nav-name">{p.name}</span>
                      <span className="proj-nav-pct">{p.fortschritt}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-bottom">
            <button className="add-btn" onClick={()=>navTo("projekte")}>＋ Neues Projekt</button>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <button className="topbar-hamburger" onClick={()=>setSidebarOpen(s=>!s)}>☰</button>
            <div className="topbar-title">{titles[view]||"BauPro"}</div>
            <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
              <div className="topbar-chip">📅 {new Date().toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
              {offeneTasks>0&&<div className="topbar-chip" style={{borderColor:"var(--accent)",color:"var(--accent)"}}>⚡ {offeneTasks} Tasks</div>}
              {offeneMaengel>0&&<div className="topbar-chip" style={{borderColor:"var(--red)",color:"var(--red)"}}>⚠️ {offeneMaengel} Mängel</div>}
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {view==="dashboard"&&<Dashboard projects={projects} setView={setView} setCurrentProject={setCurrentProjId}/>}
            {view==="projekte"&&<ProjektListe projects={projects} setProjects={setProjects} setView={setView} setCurrentProject={setCurrentProjId}/>}
            {view==="project"&&<ProjektDetail project={currentProject} updateProject={updateProject} setView={setView}/>}
            {view==="checklisten"&&<Checklisten/>}
            {view==="foerderungen"&&<Foerderungen/>}
            {view==="ki"&&<KIAssistent projects={projects}/>}
          </div>
        </div>
      </div>
    </>
  );
}
