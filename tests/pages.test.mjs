import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

test('custom-domain publication preserves the domain and resolves every HTML asset', () => {
  assert.ok(existsSync('docs/.nojekyll'), 'GitHub Pages must serve the _astro directory');
  assert.equal(readFileSync('docs/CNAME', 'utf8').trim(), 'reisepost.hallo-schoenheit.love');
  const html = readFileSync('docs/index.html', 'utf8');
  const assets = [...html.matchAll(/<(?:img|script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  assert.ok(assets.includes('/wien.webp'));
  assert.ok(assets.includes('/nuernberg.webp'));
  for (const asset of assets) {
    assert.ok(asset.startsWith('/') && !asset.startsWith('//'), `Expected a root asset: ${asset}`);
    assert.ok(existsSync(`docs${asset}`), `Missing published asset: ${asset}`);
  }
});
