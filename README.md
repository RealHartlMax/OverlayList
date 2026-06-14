# OverlayList

OverlayList ist ein plattformübergreifendes, ressourcenschonendes Node.js-Tool für Co-Working-Streams. Es verwaltet lokale Notizen im Browser-Dashboard und zeigt sie per Live-Update als OBS-Overlay an.

## Features

- Lokales Dashboard mit Live-Synchronisierung über Socket.io
- Transparente OBS-Overlay-Ansicht für Browser Sources
- Persistente Speicherung in `data.json`
- Zweisprachiges Dashboard (Deutsch/Englisch)
- Volle UTF-8-Unterstützung für Umlaute, Sonderzeichen und Emojis
- Open-Source-Grundstruktur mit Roadmap und Issue Templates

## Voraussetzungen

- Node.js 20 oder neuer
- npm

## Setup

```bash
npm install
cp .env.example .env 2>/dev/null || true
node server.js
```

Die Anwendung nutzt standardmäßig `PORT=3000` aus `.env`.

### Start-Skripte

- Linux/macOS: `./start.sh`
- Windows: `start.bat`

Beide Skripte prüfen automatisch, ob `node_modules` vorhanden ist. Falls nicht, wird zuerst `npm install` ausgeführt und anschließend `node server.js` gestartet.

## Nutzung

1. Öffne das Dashboard unter `http://localhost:3000/dashboard.html`
2. Füge Notizen hinzu oder markiere sie als erledigt.
3. Binde das Overlay in OBS als Browser Source mit `http://localhost:3000/overlay.html` ein.

## OBS-Einbindung

Für eine transparente Browser Source aktiviere in OBS den Standardhintergrund des Overlays. Optional kannst du folgendes Custom CSS in OBS hinterlegen:

```css
body {
  background: transparent !important;
  overflow: hidden !important;
}
```

## Projektstruktur

```text
.
├── .github/ISSUE_TEMPLATE/
├── public/
│   ├── dashboard.html
│   ├── overlay.html
│   └── locales/
├── data.json
├── server.js
├── start.bat
└── start.sh
```

## Entwicklung

```bash
npm run check
npm start
```

## Lizenz

Dieses Projekt steht unter der AGPL-3.0-only-Lizenz. Details siehe `/LICENSE`.
