import { describe, expect, it } from 'vitest';
import * as P from './progress.js';

// A fake localStorage so tests don't need a browser.
function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    data,
  };
}

describe('load/save', () => {
  it('returns defaults when nothing is saved', () => {
    expect(P.loadProgress(memoryStorage())).toEqual(P.defaultProgress());
  });

  it('round-trips progress through storage', () => {
    const storage = memoryStorage();
    const p = P.setStatus(P.recordPractice(P.defaultProgress(), 'salamat'), 'salamat', 'known');
    expect(P.saveProgress(p, storage)).toBe(true);
    expect(P.loadProgress(storage)).toEqual(p);
  });

  it('survives corrupted data', () => {
    const storage = memoryStorage({ [P.STORAGE_KEY]: '{not json' });
    expect(P.loadProgress(storage)).toEqual(P.defaultProgress());
  });

  it('fills in fields missing from older saves', () => {
    const storage = memoryStorage({ [P.STORAGE_KEY]: JSON.stringify({ phrases: { a: { status: 'known', practiced: 1 } } }) });
    const p = P.loadProgress(storage);
    expect(p.dailyGoal).toBe(10);
    expect(p.phrases.a.status).toBe('known');
  });

  it('reports failure when storage throws (e.g. quota exceeded)', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    expect(P.saveProgress(P.defaultProgress(), storage)).toBe(false);
  });

  it('handles storage being unavailable', () => {
    expect(P.loadProgress(null)).toEqual(P.defaultProgress());
    expect(P.saveProgress(P.defaultProgress(), null)).toBe(false);
  });
});

describe('updates', () => {
  const now = new Date(2026, 9, 15, 10, 0);

  it('recordPractice counts practice and daily activity without mutating input', () => {
    const before = P.defaultProgress();
    const after = P.recordPractice(P.recordPractice(before, 'x', now), 'x', now);
    expect(after.phrases.x.practiced).toBe(2);
    expect(after.activity['2026-10-15']).toBe(2);
    expect(before.phrases).toEqual({});
  });

  it('stand-in voice is off by default and can be toggled', () => {
    expect(P.defaultProgress().standInVoice).toBe(false);
    expect(P.setStandInVoice(P.defaultProgress(), true).standInVoice).toBe(true);
  });

  it('updateProfile trims and limits text, keeping other fields', () => {
    let p = P.updateProfile(P.defaultProgress(), { name: '  Ana  ' });
    expect(p.profile).toEqual({ name: 'Ana', learningFor: '', welcomed: false });
    p = P.updateProfile(p, { learningFor: 'x'.repeat(100), welcomed: true });
    expect(p.profile.name).toBe('Ana');
    expect(p.profile.learningFor).toHaveLength(P.MAX_NAME_LENGTH);
    expect(p.profile.welcomed).toBe(true);
  });

  it('older saves without a profile get one', () => {
    const storage = memoryStorage({ [P.STORAGE_KEY]: JSON.stringify({ phrases: {} }) });
    expect(P.loadProgress(storage).profile).toEqual({ name: '', learningFor: '', welcomed: false });
  });

  it('setStatus sets and clears status', () => {
    let p = P.setStatus(P.defaultProgress(), 'x', 'review');
    expect(P.getStatus(p, 'x')).toBe('review');
    p = P.setStatus(p, 'x', null);
    expect(P.getStatus(p, 'x')).toBe(null);
  });

  it('recordQuiz saves history (newest first) and puts misses in review', () => {
    let p = P.recordQuiz(P.defaultProgress(), { score: 3, total: 5, type: 'mixed', missed: ['a', 'b'] }, now);
    p = P.recordQuiz(p, { score: 5, total: 5, type: 'match', missed: [] }, now);
    expect(p.quizzes).toHaveLength(2);
    expect(p.quizzes[0].type).toBe('match');
    expect(P.idsWithStatus(p, 'review').sort()).toEqual(['a', 'b']);
  });

  it('caps quiz history', () => {
    let p = P.defaultProgress();
    for (let i = 0; i < P.MAX_QUIZ_HISTORY + 5; i++) p = P.recordQuiz(p, { score: 1, total: 1, type: 'mixed' }, now);
    expect(p.quizzes).toHaveLength(P.MAX_QUIZ_HISTORY);
  });
});

describe('stats', () => {
  it('computes a streak ending today', () => {
    const activity = { '2026-10-13': 1, '2026-10-14': 3, '2026-10-15': 2 };
    expect(P.computeStreak(activity, new Date(2026, 9, 15, 20))).toBe(3);
  });

  it('keeps yesterday’s streak alive before you practice today', () => {
    const activity = { '2026-10-13': 1, '2026-10-14': 3 };
    expect(P.computeStreak(activity, new Date(2026, 9, 15, 8))).toBe(2);
  });

  it('breaks the streak after a missed day', () => {
    const activity = { '2026-10-12': 1, '2026-10-15': 1 };
    expect(P.computeStreak(activity, new Date(2026, 9, 15))).toBe(1);
    expect(P.computeStreak({}, new Date(2026, 9, 15))).toBe(0);
  });

  it('handles streaks across month boundaries', () => {
    const activity = { '2026-09-30': 1, '2026-10-01': 1 };
    expect(P.computeStreak(activity, new Date(2026, 9, 1))).toBe(2);
  });

  it('summarises quiz results', () => {
    expect(P.quizStats(P.defaultProgress())).toEqual({ taken: 0, best: null, average: null });
    let p = P.recordQuiz(P.defaultProgress(), { score: 5, total: 10, type: 'mixed' });
    p = P.recordQuiz(p, { score: 10, total: 10, type: 'mixed' });
    expect(P.quizStats(p)).toEqual({ taken: 2, best: 100, average: 75 });
  });
});
