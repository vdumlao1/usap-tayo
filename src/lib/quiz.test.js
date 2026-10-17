import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases.js';
import { baseMeaning, buildQuiz, pickOptions, shuffle, totalPoints } from './quiz.js';

// Deterministic pseudo-random generator so failures are reproducible.
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('shuffle', () => {
  it('keeps the same items and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seeded());
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('pickOptions', () => {
  it('always includes the answer and 4 unique, non-conflicting options', () => {
    for (const phrase of PHRASES) {
      const opts = pickOptions(phrase, PHRASES, seeded(phrase.id.length));
      expect(opts).toHaveLength(4);
      expect(opts.map((o) => o.id)).toContain(phrase.id);
      expect(new Set(opts.map(baseMeaning)).size).toBe(4);
      expect(new Set(opts.map((o) => o.tagalog)).size).toBe(4);
    }
  });

  it('never offers two "How are you?" variants together', () => {
    const casual = PHRASES.find((p) => p.id === 'kumusta-ka');
    for (let seed = 1; seed < 50; seed++) {
      const ids = pickOptions(casual, PHRASES, seeded(seed)).map((o) => o.id);
      expect(ids).not.toContain('kumusta-po-kayo');
    }
  });
});

describe('buildQuiz', () => {
  it('mixed quiz has multiple-choice questions plus a matching round', () => {
    const q = buildQuiz(PHRASES, PHRASES, { type: 'mixed', count: 10, rng: seeded() });
    const kinds = q.map((x) => x.kind);
    expect(kinds.filter((k) => k !== 'match')).toHaveLength(8);
    expect(kinds.at(-1)).toBe('match');
    expect(totalPoints(q)).toBe(8 + 4);
  });

  it('does not repeat phrases in multiple-choice questions', () => {
    const q = buildQuiz(PHRASES, PHRASES, { type: 'tl-en', count: 10, rng: seeded() });
    expect(new Set(q.map((x) => x.phrase.id)).size).toBe(10);
  });

  it('works with a tiny pool (e.g. 1 review phrase)', () => {
    const pool = PHRASES.slice(0, 1);
    const q = buildQuiz(pool, PHRASES, { type: 'mixed', rng: seeded() });
    expect(q).toHaveLength(1);
    expect(q[0].options).toHaveLength(4);
  });

  it('matching rounds never contain two pairs with the same meaning', () => {
    for (let seed = 1; seed < 30; seed++) {
      for (const round of buildQuiz(PHRASES, PHRASES, { type: 'match', rng: seeded(seed) })) {
        expect(round.pairs.length).toBeGreaterThanOrEqual(2);
        expect(new Set(round.pairs.map(baseMeaning)).size).toBe(round.pairs.length);
      }
    }
  });
});
