import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { garden, localDate } from './lib/garden.mjs';
import { weekend, metrics, assess, display } from './lib/forecast.mjs';

const places = [garden, { name: 'Bad Aibling', lat: 47.864, lon: 12.011 }, { name: 'Stephanskirchen', lat: 47.855, lon: 12.183 }, { name: 'Raubling', lat: 47.789, lon: 12.11 }];
const map = L.map('map', { scrollWheelZoom: false }).fitBounds(places.map(p => [p.lat, p.lon]), { padding: [32, 32], maxZoom: 11 });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const pins = L.layerGroup().addTo(map);
const slot = document.querySelector('#slot');
const layer = document.querySelector('#layer');
const outlook = document.querySelector('#outlook');
const values = document.querySelector('#values');
const retry = document.querySelector('#retry');
let forecasts = [];
let best = -1;
function markers() {
  pins.clearLayers();
  places.forEach((place, index) => {
    const hourly = forecasts[index]?.hourly;
    const i = hourly?.time.indexOf(slot.value) ?? -1;
    const value = hourly?.[layer.value]?.[i];
    const marker = L.circleMarker([place.lat, place.lon], { radius: index ? 6 : 9, weight: 2, color: '#fff8dc', fillColor: '#673c26', fillOpacity: 1 });
    const label = document.createElement('span');
    label.textContent = place.name + (forecasts.length ? ' · ' + display(value, layer.value) : '');
    marker.bindTooltip(label, { permanent: true, direction: index === 2 ? 'bottom' : 'top' }).addTo(pins);
  });
}
function render() {
  const hourly = forecasts[0].hourly;
  const i = hourly.time.indexOf(slot.value);
  const { message, low } = assess(hourly, i);
  outlook.textContent = message;
  if (best >= 0) outlook.textContent += ' Günstigster Vergleichstermin: ' + labelFor(hourly.time[best]) + '.';
  values.replaceChildren();
  const entries = Object.entries(metrics).map(([key, title]) => [title, display(hourly[key]?.[i], key)]);
  entries.push(['Tiefstwert der Folgenacht', display(low, 'temperature_2m')]);
  for (const [title, value] of entries) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = title; dd.textContent = value; values.append(dt, dd);
  }
  markers();
}
function labelFor(time) {
  return (time.startsWith(weekend[0]) ? 'Sa., 5.12.' : 'So., 6.12.') + ' · ' + time.slice(11, 16) + ' Uhr';
}
async function load() {
  retry.hidden = true;
  outlook.textContent = 'Wetterdaten werden geladen …';
  const today = localDate(new Date());
  if (today > weekend[1]) { outlook.textContent = 'Das Gartenwochenende ist vorbei.'; return; }
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: places.map(p => p.lat).join(','), longitude: places.map(p => p.lon).join(','),
    hourly: Object.keys(metrics).join(','), timezone: 'Europe/Berlin', forecast_days: '16'
  });
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('forecast unavailable');
    const results = await response.json();
    const hourly = results[0].hourly;
    const now = Date.now();
    const slots = hourly.time.map((time, i) => ({ time, i })).filter(({ time }) =>
      weekend.includes(time.slice(0, 10)) && ['09:00', '12:00', '15:00'].includes(time.slice(11)) &&
      Date.parse(time + '+01:00') >= now);
    if (!slots.length) { outlook.textContent = 'Für das Gartenwochenende sind noch keine weiteren Vorhersagezeiten verfügbar.'; return; }
    forecasts = results;
    slot.replaceChildren(...slots.map(({ time }) => new Option(labelFor(time), time)));
    const candidates = slots.map(({ i }) => ({ i, ...assess(hourly, i) })).filter(s => s.rank);
    best = candidates.sort((a, b) => b.soil - a.soil)[0]?.i ?? -1;
    if (best >= 0) slot.value = hourly.time[best];
    document.querySelector('#forecast').hidden = false;
    render();
  } catch {
    outlook.textContent = 'Die Wetterdaten sind gerade nicht erreichbar. Unser Brief ist trotzdem für dich da.';
    retry.hidden = false;
  }
}
slot.addEventListener('change', render);
layer.addEventListener('change', markers);
retry.addEventListener('click', load);
markers();
load();
