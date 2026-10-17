/*
  Phrase search + filtering for the Library page.
*/

/** Lowercase, strip accents and punctuation so "Ano’ng" matches "anong". */
export function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** All the words in a phrase's searchable text. */
function words(phrase) {
  return normalize(
    [phrase.tagalog, phrase.english, phrase.literal ?? '', phrase.usage, phrase.example.tagalog, phrase.example.english].join(' '),
  ).split(' ');
}

/**
 * Every word you type must match the START of some word in the phrase,
 * so "eat" finds "eat"/"eaten"/"eating" but not "great" or "repeat".
 */
function matches(phrase, queryWords) {
  const ws = words(phrase);
  return queryWords.every((q) => ws.some((w) => w.startsWith(q)));
}

/**
 * @param phrases   all phrases
 * @param filters   { query, category ('all' or id), status ('all' | 'known' | 'review' | 'new') }
 * @param getStatus (id) => 'known' | 'review' | null
 */
export function filterPhrases(phrases, { query = '', category = 'all', status = 'all' } = {}, getStatus = () => null) {
  const queryWords = normalize(query).split(' ').filter(Boolean);
  return phrases.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (status !== 'all') {
      const s = getStatus(p.id);
      if (status === 'new' ? s !== null : s !== status) return false;
    }
    if (queryWords.length && !matches(p, queryWords)) return false;
    return true;
  });
}
