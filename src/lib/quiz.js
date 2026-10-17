/*
  Quiz generation. Pure functions — no React, no storage — so they're easy to test.

  Question shapes:
    { kind: 'tl-en', phrase, options: [phrase, ...] }  → pick the English meaning
    { kind: 'en-tl', phrase, options: [phrase, ...] }  → pick the Tagalog phrase
    { kind: 'match', pairs: [phrase, ...] }            → match each Tagalog to its English

  Points: a multiple-choice question is worth 1; a match round is worth 1 per pair.
*/

export const QUIZ_TYPES = [
  { id: 'mixed', label: 'Mixed', description: 'A bit of everything, ending with a matching round.' },
  { id: 'tl-en', label: 'Tagalog → English', description: 'See a Tagalog phrase, choose what it means.' },
  { id: 'en-tl', label: 'English → Tagalog', description: 'See an English meaning, choose the right Tagalog.' },
  { id: 'match', label: 'Matching', description: 'Match Tagalog phrases with their meanings.' },
];

export const OPTIONS_PER_QUESTION = 4;
export const PAIRS_PER_MATCH = 4;
export const MIN_MATCH_POOL = 2;

/** Fisher–Yates shuffle. `rng` is injectable so tests can be deterministic. */
export function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * The English meaning without notes in parentheses, lowercased.
 * "How are you? (casual)" and "How are you? (respectful)" share the same
 * base meaning, so they must never appear as competing options.
 */
export function baseMeaning(phrase) {
  return phrase.english.replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase();
}

function conflicts(a, b) {
  return a.id === b.id || a.tagalog === b.tagalog || baseMeaning(a) === baseMeaning(b);
}

/** Pick `n - 1` distractors for `phrase`, preferring the same category. */
export function pickOptions(phrase, allPhrases, rng = Math.random, n = OPTIONS_PER_QUESTION) {
  const chosen = [phrase];
  const candidates = [
    ...shuffle(allPhrases.filter((p) => p.category === phrase.category), rng),
    ...shuffle(allPhrases.filter((p) => p.category !== phrase.category), rng),
  ];
  for (const c of candidates) {
    if (chosen.length >= n) break;
    if (!chosen.some((x) => conflicts(x, c))) chosen.push(c);
  }
  return shuffle(chosen, rng);
}

/** Split phrases into match rounds where no two pairs share a meaning. */
function buildMatchRounds(phrases, maxRounds) {
  const rounds = [];
  let current = [];
  for (const p of phrases) {
    if (rounds.length >= maxRounds) break;
    if (current.some((x) => conflicts(x, p))) continue;
    current.push(p);
    if (current.length === PAIRS_PER_MATCH) {
      rounds.push({ kind: 'match', pairs: current });
      current = [];
    }
  }
  if (current.length >= MIN_MATCH_POOL && rounds.length < maxRounds) {
    rounds.push({ kind: 'match', pairs: current });
  }
  return rounds;
}

/**
 * Build a quiz.
 * @param pool        phrases to be quizzed on (e.g. a category or your review list)
 * @param allPhrases  every phrase — used for wrong-answer options
 * @param options     { type, count, rng }
 */
export function buildQuiz(pool, allPhrases, { type = 'mixed', count = 10, rng = Math.random } = {}) {
  const shuffled = shuffle(pool, rng);

  if (type === 'match') return buildMatchRounds(shuffled, 3);

  const mc = (phrase, i) => {
    const kind = type === 'mixed' ? (i % 2 === 0 ? 'tl-en' : 'en-tl') : type;
    return { kind, phrase, options: pickOptions(phrase, allPhrases, rng) };
  };

  if (type === 'mixed') {
    const mcCount = Math.min(count - 2, shuffled.length);
    const questions = shuffled.slice(0, mcCount).map(mc);
    // Matching round at the end, using different phrases if the pool allows.
    const rest = shuffled.slice(mcCount);
    const matchSource = rest.length >= MIN_MATCH_POOL ? rest : shuffled;
    return [...questions, ...buildMatchRounds(matchSource, 1)];
  }

  return shuffled.slice(0, count).map(mc);
}

export function totalPoints(questions) {
  return questions.reduce((sum, q) => sum + (q.kind === 'match' ? q.pairs.length : 1), 0);
}
