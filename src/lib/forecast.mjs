// The invitation replaces the Nürnberg trip on the first weekend of December.
export const weekend = ['2026-12-05', '2026-12-06'];
export const metrics = { soil_temperature_6cm: 'Boden (6 cm)', temperature_2m: 'Luft (2 m)', precipitation: 'Niederschlag' };
const fmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
export function display(value, key) {
  return Number.isFinite(value) ? fmt.format(value) + (key === 'precipitation' ? ' mm' : ' °C') : 'Keine Daten';
}

export function assess(hourly, i) {
  const soil = hourly.soil_temperature_6cm?.[i];
  const air = hourly.temperature_2m?.[i];
  const rain = hourly.precipitation?.[i];
  // API uses local ISO timestamps. Both invitation dates are winter time in Berlin.
  const date = hourly.time[i].slice(0, 10);
  const start = hourly.time.indexOf(date + 'T18:00');
  const night = start < 0 ? [] : hourly.temperature_2m?.slice(start, start + 15) ?? [];
  const low = night.length === 15 && night.every(Number.isFinite) ? Math.min(...night) : null;
  let rank = 0;
  let message;
  if (![soil, air, rain].every(Number.isFinite) || low === null) message = 'Für diese Zeit fehlen Wetterwerte.';
  else if (soil <= 0 || air <= 0) message = 'Frost ist möglich. Prüft das Beet und verschiebt das Pflanzen bei gefrorenem Boden.';
  else if (low <= 0) message = 'Nachts ist Frost möglich. Prüft die Winterhärte eurer Jungpflanzen.';
  else if (rain > 0) message = 'Es ist Niederschlag angekündigt. Ein trockenerer Zeitpunkt wäre angenehmer.';
  else { rank = 1; message = 'Ein mögliches Pflanzfenster: trocken, Boden über null und kein Luftfrost in der folgenden Nacht angekündigt.'; }
  return { rank, message, low, soil };
}
