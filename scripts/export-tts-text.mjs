// Writes every phrase and conversation line to scripts/tts-text.json so the
// Python TTS script (scripts/generate_tts.py) knows what to say.
// Run with: node scripts/export-tts-text.mjs
import { writeFileSync } from 'node:fs';
import { PHRASES } from '../src/data/phrases.js';
import { CONVERSATIONS } from '../src/data/conversations.js';

const items = [
  ...PHRASES.map((p) => ({ key: `phrase:${p.id}`, text: p.spoken ?? p.tagalog })),
  ...CONVERSATIONS.flatMap((c) => c.lines.map((l, i) => ({ key: `line:${c.id}:${i}`, text: l.tagalog }))),
];

writeFileSync(new URL('./tts-text.json', import.meta.url), JSON.stringify(items, null, 2) + '\n');
console.log(`Wrote ${items.length} items to scripts/tts-text.json`);
