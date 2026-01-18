# Features
- Swipen von Places (Like / Dislike)
- Favoriten (persistiert im Backend)
- Place-Details ansehen
- Neuer Place erstellen
- Login / Registrierung + Gastmodus
- Theme (Light/Dark)
- Navigation über Bottom-Nav

# Setup & Installation
Im Projekt-Root ausführen:
```
npm install
```
# Development starten
Startet die App im Dev-Modus:
```
npm run dev
```
Öffne dann http://localhost:5173 (oder wie Vite ausgibt) im Browser.

# Production Build
Build erstellen und lokal testen:
```
npm run build
npm run preview
```

# Auth & Favoriten-Verhalten
- Login/Register über das Modal.
- Nach Login ruft das Frontend GET /api/favorites/ids bzw. GET /api/favorites um Favoriten zu laden.
- Beim Like: POST /api/favorites/{placeId} (Backend speichert + erhöht Like-Count).
- Beim Unlike: DELETE /api/favorites/{placeId}.
- Logout entfernt den lokalen Auth-State — Favoriten bleiben im Backend erhalten und werden beim nächsten Login geladen.
- Gastmodus funktioniert lokal und nutzt keine persistierten Favoriten.