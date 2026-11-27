import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sunPhase } from '../src/lib/garden.mjs';
import { assess } from '../src/lib/forecast.mjs';

test('phase switches at the computed instant across seasons and clock changes', () => {
  for (const day of ['2026-03-29', '2026-06-21', '2026-10-25', '2026-12-05']) {
    const dawn = sunPhase(new Date(day + 'T01:00:00Z')).next;
    assert.equal(sunPhase(new Date(+dawn - 1)).night, true);
    assert.equal(sunPhase(dawn).night, false);
    const dusk = sunPhase(dawn).next;
    assert.equal(sunPhase(new Date(+dusk - 1)).night, false);
    assert.equal(sunPhase(dusk).night, true);
    assert.ok(+sunPhase(dusk).next > +dusk);
  }
});
test('missing observations, frost and precipitation never yield a favourable slot', () => {
  const hourly = {time: [], soil_temperature_6cm: [], temperature_2m: [], precipitation: []};
  for (let i = 0; i < 48; i++) {
    hourly.time.push(new Date(Date.UTC(2026, 11, 5, i)).toISOString().slice(0, 16));
    hourly.soil_temperature_6cm.push(4); hourly.temperature_2m.push(5); hourly.precipitation.push(0);
  }
  assert.equal(assess(hourly, 12).rank, 1);
  for (const [key, index, value] of [['soil_temperature_6cm',12,0],['precipitation',12,2],['temperature_2m',30,-1],['temperature_2m',30,null],['soil_temperature_6cm',12,null]]) {
    const data = structuredClone(hourly); data[key][index] = value;
    assert.equal(assess(data, 12).rank, 0);
  }
  assert.equal(assess(hourly, 36).rank, 0);
});
