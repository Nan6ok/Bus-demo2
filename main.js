// Frontend: connect to Socket.IO and show buses on Leaflet map with per-second countdown and i18n.
const socket = io();

const i18n = {
  en: {
    nextStopIn: 'Next stop in',
    arriving: 'Arriving'
  },
  zh: {
    nextStopIn: '距離下一站',
    arriving: '即將抵達'
  }
};

let lang = 'en';

document.getElementById('lang-en').addEventListener('click', ()=>{ lang='en'; updateAllPopups(); });
document.getElementById('lang-zh').addEventListener('click', ()=>{ lang='zh'; updateAllPopups(); });

const map = L.map('map').setView([22.285,114.160], 14);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const routeLayers = {};
const stopMarkers = {};
const busMarkers = {};
let busesData = {};

socket.on('routes', (routes) => {
  routes.forEach(route=>{
    const latlngs = route.stops.map(s=>[s.lat,s.lon]);
    const poly = L.polyline(latlngs,{color:'#3388ff'}).addTo(map);
    routeLayers[route.id] = poly;
    route.stops.forEach(s=>{
      const m = L.circleMarker([s.lat,s.lon],{radius:6}).addTo(map);
      m.bindPopup(() => {
        return s.name[lang] || s.name.en;
      });
      stopMarkers[s.id] = m;
    });
  });
});

function createBusIcon(){
  return L.icon({
    iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect rx="6" ry="6" width="32" height="22" y="5" fill="#ff5722"/><text x="16" y="19" font-size="11" font-family="Arial" fill="#fff" text-anchor="middle">BUS</text></svg>'
    ),
    iconSize: [32,32],
    iconAnchor: [16,16]
  });
}

const busIcon = createBusIcon();

socket.on('buses', (buses) => {
  buses.forEach(b=>{
    busesData[b.id] = b;
    if(!busMarkers[b.id]){
      const m = L.marker([b.lat,b.lon],{icon:busIcon, rotationAngle: b.heading||0}).addTo(map);
      m.bindPopup('');
      busMarkers[b.id] = m;
    } else {
      busMarkers[b.id].setLatLng([b.lat,b.lon]);
    }
  });
  updateAllPopups();
});

function updateAllPopups(){
  const now = Date.now();
  Object.keys(busesData).forEach(id=>{
    const b = busesData[id];
    const secondsLeft = Math.max(0, Math.floor((b.eta - now)/1000));
    const text = (lang==='en')
      ? `${b.id} — ${b.nextStop.name.en} — ${i18n.en.nextStopIn}: ${secondsLeft}s`
      : `${b.id} — ${b.nextStop.name.zh} — ${i18n.zh.nextStopIn}: ${secondsLeft}秒`;
    if(busMarkers[id]){
      busMarkers[id].getPopup().setContent(text);
    }
  });
}

// per-second UI update for countdown timers (without waiting for server)
setInterval(()=> {
  updateAllPopups();
}, 1000);
