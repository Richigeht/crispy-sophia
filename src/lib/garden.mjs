import SunCalc from 'suncalc';

const rosenheim = { lat: 47.856, lon: 12.128 };
export const zone = 'Europe/Berlin';
const civilDate = new Intl.DateTimeFormat('sv-SE', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
const clock = new Intl.DateTimeFormat('de-DE', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
export const localDate = date => civilDate.format(date);
export const localTime = date => clock.format(date);

export function sunPhase(now = new Date()) {
  // Noon UTC falls on the same civil day in Rosenheim throughout the year.
  const noon = new Date(localDate(now) + 'T12:00:00Z');
  const { sunrise, sunset } = SunCalc.getTimes(noon, rosenheim.lat, rosenheim.lon);
  if (now < sunrise) return { night: true, next: sunrise };
  if (now < sunset) return { night: false, next: sunset };
  const tomorrow = new Date(+noon + 86400000);
  return { night: true, next: SunCalc.getTimes(tomorrow, rosenheim.lat, rosenheim.lon).sunrise };
}
