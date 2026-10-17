import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PHRASES } from './phrases.js';
import { CONVERSATIONS } from './conversations.js';

/*
  Checks the pre-generated Tagalog audio (public/audio/tts) matches the content.
  If this fails after you edit a phrase, regenerate the audio:
    node scripts/export-tts-text.mjs
    .venv-tts/bin/python scripts/generate_tts.py
*/

const dir = new URL('../../public/audio/tts/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', dir), 'utf8'));

const expected = [
  ...PHRASES.map((p) => [`phrase:${p.id}`, p.spoken ?? p.tagalog]),
  ...CONVERSATIONS.flatMap((c) => c.lines.map((l, i) => [`line:${c.id}:${i}`, l.tagalog])),
];

describe('generated audio', () => {
  it('has audio for every phrase and conversation line', () => {
    const missing = expected.map(([key]) => key).filter((key) => !manifest[key]);
    expect(missing).toEqual([]);
  });

  it('is up to date with the current text', () => {
    const stale = expected.filter(([key, text]) => manifest[key] && manifest[key].text !== text).map(([key]) => key);
    expect(stale).toEqual([]);
  });

  it('every listed file exists', () => {
    const absent = Object.values(manifest)
      .map((entry) => entry.file)
      .filter((file) => !existsSync(new URL(file, dir)));
    expect(absent).toEqual([]);
  });
});
