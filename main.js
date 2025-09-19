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
// 初始化地圖
const map = L.map('map').setView([22.302711, 114.177216], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// 時鐘
function updateClock() {
  const now = new Date();
  document.getElementById('clock').innerText =
    now.toLocaleTimeString('zh-HK', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// UI - 填充下拉選單
const routeSelect = document.getElementById("routeSelect");
for (let key in busRoutes) {
  let option = document.createElement("option");
  option.value = key;
  option.text = busRoutes[key].name_zh + " / " + busRoutes[key].name_en;
  routeSelect.add(option);
}

// 畫巴士
let busMarker, polyline;
function startRoute(routeId) {
  if (busMarker) map.removeLayer(busMarker);
  if (polyline) map.removeLayer(polyline);

  const route = busRoutes[routeId].stops.map(s => s.coord);
  polyline = L.polyline(route, { color: 'blue' }).addTo(map);
  map.fitBounds(polyline.getBounds());

  let index = 0;
  busMarker = L.marker(route[0], {
    icon: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61205.png',
      iconSize: [40, 40]
    })
  }).addTo(map);

  function moveBus() {
    if (index < route.length - 1) {
      let [lat1, lon1] = route[index];
      let [lat2, lon2] = route[index + 1];
      let steps = 50;
      let step = 0;

      let interval = setInterval(() => {
        let lat = lat1 + (lat2 - lat1) * (step / steps);
        let lon = lon1 + (lon2 - lon1) * (step / steps);
        busMarker.setLatLng([lat, lon]);
        step++;
        if (step > steps) {
          clearInterval(interval);
          index++;
          setTimeout(moveBus, 1000); // 停站 1 秒
        }
      }, 200);
    }
  }
  moveBus();
}

// 換路線
routeSelect.addEventListener("change", e => startRoute(e.target.value));

// 預設載入第一條
startRoute("1");

