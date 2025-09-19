// Simple demo server: Node.js + Express + Socket.IO
// Run: npm install && node server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory simulated buses
const routes = [
  {
    id: 'R1',
    name: { en: 'Demo Line 1', zh: '示範路線1' },
    stops: [
      {id:'s1', name:{en:'Stop A', zh:'站A'}, lat:22.280, lon:114.158},
      {id:'s2', name:{en:'Stop B', zh:'站B'}, lat:22.285, lon:114.165},
      {id:'s3', name:{en:'Stop C', zh:'站C'}, lat:22.290, lon:114.160},
      {id:'s4', name:{en:'Stop D', zh:'站D'}, lat:22.295, lon:114.155}
    ]
  }
];

// Create simulated buses moving along route coordinates
const buses = [
  { id:'bus1', routeId:'R1', posIndex:0, progress:0, speed:0.0005, heading:0 },
  { id:'bus2', routeId:'R1', posIndex:1, progress:0.4, speed:0.0006, heading:0 }
];

function lerp(a,b,t){ return a + (b-a)*t; }

function updateBuses(deltaSec){
  buses.forEach(bus => {
    const route = routes.find(r=>r.id===bus.routeId);
    const stops = route.stops;
    let i = Math.floor(bus.posIndex);
    let j = Math.min(i+1, stops.length-1);
    // increment progress by speed * deltaSec
    bus.progress += bus.speed * deltaSec;
    if(bus.progress >= 1){
      bus.posIndex = Math.min(bus.posIndex + 1, stops.length-1);
      bus.progress = 0;
    }
    i = Math.floor(bus.posIndex);
    j = Math.min(i+1, stops.length-1);
    const a = stops[i], b = stops[j];
    bus.lat = lerp(a.lat, b.lat, bus.progress);
    bus.lon = lerp(a.lon, b.lon, bus.progress);
    // simple heading calc
    bus.heading = Math.atan2(b.lon - a.lon, b.lat - a.lat) * 180 / Math.PI;
    // compute ETA to next stop (very rough)
    const remainingFraction = 1 - bus.progress;
    const approxSeconds = Math.max(5, Math.floor(remainingFraction / bus.speed));
    bus.nextStop = b;
    bus.eta = Date.now() + approxSeconds*1000;
  });
}

// Broadcast to clients
setInterval(() => {
  updateBuses(1); // assume 1 second per tick
  const payload = buses.map(b => ({
    id: b.id,
    routeId: b.routeId,
    lat: b.lat,
    lon: b.lon,
    heading: b.heading,
    nextStop: { id: b.nextStop.id, name: b.nextStop.name },
    eta: b.eta
  }));
  io.emit('buses', payload);
}, 1000);

io.on('connection', socket => {
  // send static route/stops info once
  socket.emit('routes', routes);
  console.log('client connected', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log('Server running on port', PORT));
