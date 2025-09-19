# Bus Demo (Node + Leaflet)

Demo project showing simulated buses on a map, bilingual UI (English / 简体中文), and per-second countdown to next stop.

## Quick start (local)

1. Install Node.js (v18+ recommended)
2. Unzip or clone repository
3. Install dependencies:
   ```
   npm install
   ```
4. Run server:
   ```
   npm start
   ```
5. Open browser to `http://localhost:3000`

## Files
- `server.js` - Express server + Socket.IO and simple bus simulator
- `public/index.html` - Frontend UI (Leaflet map, language toggle)
- `public/main.js` - Frontend JS (socket handling, map, countdown)
- `public/style.css` - Basic styles

## Publish to GitHub
```
git init
git add .
git commit -m "Initial demo"
# create repo on GitHub then:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## Notes
- This demo uses simulated buses. You can replace the simulation with a real GTFS-RT feed by decoding GTFS-RT protobuf and emitting `buses` events similarly.
- Map tiles are from OpenStreetMap.
