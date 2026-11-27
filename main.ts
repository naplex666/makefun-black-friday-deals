// TrueDeal's packager for black-friday-deal-finder-01 (Node 22, standard library only). The site is this
// directory's app/ folder — plain static files a browser opens at app/index.html (ES modules, CSS, no build
// step), its deals in app/data.js. Nothing the site runs, styles or shows loads over the network; each deal
// only links out to its store. This program hands the entry in: it checks the deals first, then copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge
// reads (your screenshots, the first load's files and bytes, and your source), with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte
// what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Package-time deal check: a deal with a missing field, a sale price that is not below its usual price, an
// unknown signal, an unreadable check time or a duplicated id would go out as a broken or dishonest entry,
// so refuse to package it and say which deal is wrong. This runs before anything is copied.
const { deals } = await import(pathToFileURL(join(here, 'app', 'data.js')).href);
const REQUIRED = ['id', 'title', 'store', 'category', 'price', 'was', 'url', 'checked', 'source', 'sourceUrl', 'signal', 'signalNote'];
const SIGNALS = new Set(['new-low', 'strong', 'routine', 'unknown']);
const seenIds = new Set();
for (const d of deals) {
  for (const f of REQUIRED) {
    if (!(f in d)) throw new Error(`deal ${d.id ?? '(no id)'} is missing ${f}`);
  }
  if (typeof d.price !== 'number' || typeof d.was !== 'number' || !(d.price < d.was)) {
    throw new Error(`deal ${d.id} has a sale price (${d.price}) that is not below its usual price (${d.was})`);
  }
  if (!SIGNALS.has(d.signal)) throw new Error(`deal ${d.id} has an unknown signal ${d.signal}`);
  if (Number.isNaN(Date.parse(d.checked))) throw new Error(`deal ${d.id} has an unreadable check time ${d.checked}`);
  if (seenIds.has(d.id)) throw new Error(`deal id ${d.id} appears twice`);
  seenIds.add(d.id);
}
const checkedDay = deals.map((d) => d.checked.slice(0, 10)).sort().pop();
const newLows = deals.filter((d) => d.signal === 'new-low').length;
console.log(`TrueDeal packaged: ${deals.length} deals, ${newLows} new-low, all prices checked ${checkedDay}.`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
