/*
  Progress model + localStorage persistence.

  Everything here is a "pure function": it takes the current progress object
  and returns a NEW object instead of changing the old one. React relies on
  getting a new object to know that something changed, and pure functions
  are also easy to unit test (see progress.test.js).
*/

export const STORAGE_KEY = 'usapTayo.progress.v1';
export const MAX_QUIZ_HISTORY = 50;

export function defaultProgress() {
  return {
    version: 1,
    // { [phraseId]: { status: 'known' | 'review' | null, practiced: number, lastPracticed: ISO string } }
    phrases: {},
    // [{ date, score, total, type, missed: [phraseId] }] — newest first
    quizzes: [],
    // { [conversationId]: ISO string of when you last finished it }
    conversations: {},
    // { 'YYYY-MM-DD': number of practice actions that day }
    activity: {},
    dailyGoal: 10,
    // Use a non-Filipino "stand-in" voice when no Filipino voice exists? Off by default
    // because it sounds wrong; family recordings are the better option.
    standInVoice: false,
    // Your profile. Stored only in this browser, like everything else.
    // welcomed: true once you've saved or skipped the welcome prompt on the Home page.
    profile: { name: '', learningFor: '', welcomed: false },
  };
}

export const MAX_NAME_LENGTH = 40;

/** Update profile fields. Text is trimmed and length-limited. */
export function updateProfile(progress, changes) {
  const clean = { ...changes };
  for (const field of ['name', 'learningFor']) {
    if (typeof clean[field] === 'string') clean[field] = clean[field].trim().slice(0, MAX_NAME_LENGTH);
  }
  return { ...progress, profile: { ...defaultProgress().profile, ...progress.profile, ...clean } };
}

/** Local date as YYYY-MM-DD (not UTC, so "today" matches your clock). */
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Read progress from storage. Falls back to defaults if storage is
 * unavailable (private browsing, disabled cookies) or the data is corrupted.
 */
export function loadProgress(storage = safeStorage()) {
  if (!storage) return defaultProgress();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultProgress();
    // Merge with defaults so older saves gain any newly added fields.
    const defaults = defaultProgress();
    return { ...defaults, ...parsed, profile: { ...defaults.profile, ...parsed.profile } };
  } catch {
    return defaultProgress();
  }
}

/** Returns true if saved successfully. */
export function saveProgress(progress, storage = safeStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

function safeStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function bumpActivity(activity, now) {
  const key = dateKey(now);
  return { ...activity, [key]: (activity[key] ?? 0) + 1 };
}

/** Record one practice of a phrase (flashcard rating, quiz answer). */
export function recordPractice(progress, phraseId, now = new Date()) {
  const entry = progress.phrases[phraseId] ?? { status: null, practiced: 0 };
  return {
    ...progress,
    phrases: {
      ...progress.phrases,
      [phraseId]: { ...entry, practiced: entry.practiced + 1, lastPracticed: now.toISOString() },
    },
    activity: bumpActivity(progress.activity, now),
  };
}

/** Set a phrase's status: 'known', 'review', or null to clear it. */
export function setStatus(progress, phraseId, status) {
  const entry = progress.phrases[phraseId] ?? { status: null, practiced: 0 };
  return {
    ...progress,
    phrases: { ...progress.phrases, [phraseId]: { ...entry, status } },
  };
}

/** Save a finished quiz. Missed phrases are automatically added to review. */
export function recordQuiz(progress, { score, total, type, missed = [] }, now = new Date()) {
  let next = {
    ...progress,
    quizzes: [{ date: now.toISOString(), score, total, type, missed }, ...progress.quizzes].slice(
      0,
      MAX_QUIZ_HISTORY,
    ),
  };
  for (const id of missed) next = setStatus(next, id, 'review');
  return next;
}

export function recordConversation(progress, conversationId, now = new Date()) {
  return {
    ...progress,
    conversations: { ...progress.conversations, [conversationId]: now.toISOString() },
    activity: bumpActivity(progress.activity, now),
  };
}

export function setDailyGoal(progress, goal) {
  return { ...progress, dailyGoal: goal };
}

export function setStandInVoice(progress, enabled) {
  return { ...progress, standInVoice: enabled };
}

// ───────────── Derived stats (read-only helpers) ─────────────

export function getStatus(progress, phraseId) {
  return progress.phrases[phraseId]?.status ?? null;
}

export function idsWithStatus(progress, status) {
  return Object.entries(progress.phrases)
    .filter(([, entry]) => entry.status === status)
    .map(([id]) => id);
}

export function practicedCount(progress) {
  return Object.values(progress.phrases).filter((e) => e.practiced > 0).length;
}

export function todayCount(progress, now = new Date()) {
  return progress.activity[dateKey(now)] ?? 0;
}

/**
 * Number of consecutive days with practice, ending today.
 * If you haven't practiced yet today, yesterday still counts, so the
 * streak isn't shown as "broken" first thing in the morning.
 */
export function computeStreak(activity, now = new Date()) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!activity[dateKey(day)]) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (activity[dateKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function quizStats(progress) {
  const quizzes = progress.quizzes;
  if (quizzes.length === 0) return { taken: 0, best: null, average: null };
  const pcts = quizzes.map((q) => (q.total ? q.score / q.total : 0));
  return {
    taken: quizzes.length,
    best: Math.round(Math.max(...pcts) * 100),
    average: Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100),
  };
}
