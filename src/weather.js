import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { localDate } from './lib/garden.mjs';
import { weekend, metrics, assess, display } from './lib/forecast.mjs';

let places = [];
let map;
let pins;
let generation = 0;
const form = document.querySelector('#garden-search');
const address = document.querySelector('#address');
const matches = document.querySelector('#matches');
const searchStatus = document.querySelector('#search-status');
const weather = document.querySelector('#garden-weather');
function selectGarden(point) {
  generation++;
  places = [point, { name: 'Nördlich', lat: point.lat + .05, lon: point.lon },
    { name: 'Westlich', lat: point.lat, lon: point.lon - .075 },
    { name: 'Südlich', lat: point.lat - .05, lon: point.lon }];
  matches.replaceChildren();
  searchStatus.textContent = 'Gewählter Garten: ' + point.name;
  weather.hidden = false;
  if (!map) {
    map = L.map('map', { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    pins = L.layerGroup().addTo(map);
  }
  map.invalidateSize().fitBounds(places.map(p => [p.lat, p.lon]), { padding: [38, 36], maxZoom: 12 });
  markers();
  load();
}
function clearSelection() {
  generation++;
  forecasts = [];
  best = -1;
  places = [];
  matches.replaceChildren();
  values.replaceChildren();
  slot.replaceChildren();
  searchStatus.textContent = '';
  weather.hidden = true;
  document.querySelector('#forecast').hidden = true;
}
address.addEventListener('input', clearSelection);
form.addEventListener('submit', async event => {
  event.preventDefault();
  clearSelection();
  const query = address.value.trim();
  if (!query) { searchStatus.textContent = 'Bitte gib eine Adresse ein.'; return; }
  const request = generation;
  searchStatus.textContent = 'Adresse wird gesucht …';
  const url = new URL('https://photon.komoot.io/api/');
  url.search = new URLSearchParams({ q: query, limit: '5', lang: 'de' });
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('search unavailable');
    const { features } = await response.json();
    if (request !== generation) return;
    for (const feature of features) {
      const [lon, lat] = feature.geometry?.coordinates ?? [];
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      const p = feature.properties;
      const street = [p.street, p.housenumber].filter(Boolean).join(' ');
      const town = [p.postcode, p.city || p.district].filter(Boolean).join(' ');
      const name = [...new Set([street || p.name, town, p.country].filter(Boolean))].join(', ');
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.textContent = name;
      choice.addEventListener('click', () => selectGarden({ name, lat, lon }));
      const item = document.createElement('li');
      item.append(choice); matches.append(item);
    }
    searchStatus.textContent = matches.children.length ? 'Welcher Ort passt?' : 'Kein Treffer. Versuch es mit Straße, Postleitzahl und Ort.';
  } catch {
    if (request === generation) searchStatus.textContent = 'Die Adresssuche ist gerade nicht erreichbar. Bitte versuch es erneut.';
  }
});
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
    label.textContent = (index ? place.name : 'Garten') + (forecasts.length ? ' · ' + display(value, layer.value) : '');
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
  const request = generation;
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
    if (request !== generation) return;
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
    if (request !== generation) return;
    outlook.textContent = 'Die Wetterdaten sind gerade nicht erreichbar. Unser Brief ist trotzdem für dich da.';
    retry.hidden = false;
  }
}
slot.addEventListener('change', render);
layer.addEventListener('change', markers);
retry.addEventListener('click', load);
