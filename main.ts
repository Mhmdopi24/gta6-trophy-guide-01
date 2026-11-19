// Leonida Legend — GTA VI trophy guide entry (Node 22, standard library only).
//
// What this program does: it takes the app/ folder and the screenshots/ folder
// sitting next to this file, copies both into the output directory, and writes
// output/dossier.json by asking the vendored make.fun library to build it.
// The library is the authority on the dossier format, so this file only moves
// files around and passes the scorer's caps through.
//
// The output directory comes from MAKEFUN_OUTPUT_DIR, or /output when that is
// not set. Run locally with, for example:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

if (!existsSync(appDir)) throw new Error('app/ is missing next to main.ts');
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing next to main.ts');

// Start clean so a stale file from an earlier run can never leak into the entry.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The scorer's caps: text is capped at 163840 bytes, at most 4 screenshots of
// at most 262144 bytes each, and app/ holds at most 993 entries / 50331648 bytes.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier written to ${join(outDir, 'dossier.json')}`);
