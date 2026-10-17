import { describe, expect, it } from 'vitest';
import { PHRASES } from './phrases.js';
import { CONVERSATIONS } from './conversations.js';
import { CATEGORIES, REGISTERS } from './categories.js';

// Guards against typos when editing the content files.

describe('phrases', () => {
  it('has roughly 30–60 phrases', () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(30);
    expect(PHRASES.length).toBeLessThanOrEqual(60);
  });

  it('has unique ids', () => {
    expect(new Set(PHRASES.map((p) => p.id)).size).toBe(PHRASES.length);
  });

  it.each(PHRASES.map((p) => [p.id, p]))('%s has all required fields', (_, p) => {
    for (const field of ['id', 'category', 'tagalog', 'english', 'pronunciation', 'usage', 'register']) {
      expect(typeof p[field], field).toBe('string');
      expect(p[field].trim().length, field).toBeGreaterThan(0);
    }
    expect(p.example.tagalog.length).toBeGreaterThan(0);
    expect(p.example.english.length).toBeGreaterThan(0);
    expect(CATEGORIES.map((c) => c.id)).toContain(p.category);
    expect(Object.keys(REGISTERS)).toContain(p.register);
  });

  it('every category has at least 4 phrases', () => {
    for (const c of CATEGORIES) {
      expect(PHRASES.filter((p) => p.category === c.id).length, c.id).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('conversations', () => {
  it('has unique ids and at least 8 scenarios', () => {
    expect(CONVERSATIONS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(CONVERSATIONS.map((c) => c.id)).size).toBe(CONVERSATIONS.length);
  });

  it.each(CONVERSATIONS.map((c) => [c.id, c]))('%s is complete', (_, c) => {
    expect(c.lines.length).toBeGreaterThanOrEqual(4);
    for (const line of c.lines) {
      expect(line.speaker && line.tagalog && line.english && line.pronunciation).toBeTruthy();
    }
    expect(c.lines.some((l) => l.speaker === 'You')).toBe(true);
    const ids = PHRASES.map((p) => p.id);
    for (const k of c.keyPhrases ?? []) expect(ids, `${c.id} keyPhrase ${k}`).toContain(k);
  });
});
