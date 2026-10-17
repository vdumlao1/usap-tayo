import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases.js';
import { filterPhrases, normalize } from './search.js';

describe('normalize', () => {
  it('ignores case, accents, and punctuation', () => {
    expect(normalize('Ano’ng ULAM?')).toBe('anong ulam');
    expect(normalize('Salamát')).toBe('salamat');
  });
});

describe('filterPhrases', () => {
  it('returns everything with no filters', () => {
    expect(filterPhrases(PHRASES)).toHaveLength(PHRASES.length);
  });

  it('searches English and Tagalog', () => {
    expect(filterPhrases(PHRASES, { query: 'salamat' }).map((p) => p.id)).toContain('salamat');
    expect(filterPhrases(PHRASES, { query: 'hungry' }).map((p) => p.id)).toContain('gutom-na-ako');
  });

  it('matches word starts, not the middle of words', () => {
    const ids = filterPhrases(PHRASES, { query: 'eat' }).map((p) => p.id);
    expect(ids).toContain('kumain-ka-na'); // "Have you eaten?"
    expect(ids).toContain('kain-tayo'); // "Let’s eat!"
    expect(ids).not.toContain('pakiulit-po'); // "repeat" shouldn't match
  });

  it('supports multi-word queries in any order', () => {
    expect(filterPhrases(PHRASES, { query: 'kain tayo' }).map((p) => p.id)).toContain('kain-tayo');
    expect(filterPhrases(PHRASES, { query: 'tayo kain' }).map((p) => p.id)).toContain('kain-tayo');
  });

  it('filters by category', () => {
    const food = filterPhrases(PHRASES, { category: 'food' });
    expect(food.length).toBeGreaterThan(0);
    expect(food.every((p) => p.category === 'food')).toBe(true);
  });

  it('filters by status', () => {
    const statusOf = (id) => (id === 'salamat' ? 'known' : null);
    expect(filterPhrases(PHRASES, { status: 'known' }, statusOf).map((p) => p.id)).toEqual(['salamat']);
    expect(filterPhrases(PHRASES, { status: 'new' }, statusOf)).toHaveLength(PHRASES.length - 1);
  });

  it('returns an empty list for nonsense', () => {
    expect(filterPhrases(PHRASES, { query: 'zzzxqv' })).toEqual([]);
  });
});
