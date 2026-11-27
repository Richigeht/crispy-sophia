import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';

test('all three pages resolve their assets and internal links under a preview prefix', () => {
  assert.ok(existsSync('docs/.nojekyll'));
  assert.equal(readFileSync('docs/CNAME', 'utf8').trim(), 'reisepost.hallo-schoenheit.love');
  for (const name of ['index.html', 'antwort/index.html', 'reisepost/index.html']) {
    const html = readFileSync('docs/' + name, 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|#)/.test(url)) continue;
      assert.ok(!url.startsWith('/'), url);
      assert.ok(existsSync(resolve('docs', dirname(name), url)), name + ' → ' + url);
    }
  }
  const archive = readFileSync('docs/reisepost/index.html', 'utf8');
  for (const asset of ['../wien.webp', '../nuernberg.webp']) assert.ok(archive.includes(asset));
  const answer = readFileSync('docs/antwort/index.html', 'utf8');
  assert.match(answer, /Heute grüßt <em>das Beet\.<\/em>/);
  assert.match(answer, /Liebste Sophia,<br\s*\/?>ja, dann komme ich zum Pflanzen vorbei\./);
  for (const id of ['address', 'garden-weather', 'outlook']) assert.ok(answer.includes('id="' + id + '"'));
  assert.ok(answer.includes('class="photo"'));
  for (const page of [answer, readFileSync('docs/index.html', 'utf8')]) {
    assert.ok(page.includes('ein paar Wimpernschläge Zeit mit dir verbringen und mit dir zusammen sein 💕'));
  }
});
