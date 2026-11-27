// The same Pages output is served at the custom domain and under a commit preview prefix.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
const root = 'docs';
for (const name of await readdir(root, { recursive: true })) {
  if (!/\.(html|css)$/.test(name)) continue;
  const path = join(root, name);
  const prefix = relative(dirname(path), root) || '.';
  const source = await readFile(path, 'utf8');
  const portable = source.replace(/((?:href|src)="|url\()\/(?!\/)/g, '$1' + prefix + '/');
  if (source !== portable) await writeFile(path, portable);
}
