/*
  Turning a model's draft into a phrase the app can trust.

  Used by scripts/add-phrase.mjs. The split of responsibilities:
    MODEL (Claude, via `claude -p`): drafts the Tagalog, meaning, pronunciation guide,
      example, usage note, register, category, and says what it's unsure about.
    THIS CODE: everything that can be checked mechanically. Right shape, allowed
      categories/labels, sensible lengths and characters, pronunciation format,
      no duplicates, a unique id, and a "check with family" flag on every draft
      (a model's Tagalog is never treated as verified).
  All pure functions, so they're unit-tested in phraseDraft.test.js.
*/

import { CATEGORIES, REGISTERS } from '../data/categories.js';

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const REGISTER_IDS = Object.keys(REGISTERS);

export const DEFAULT_VERIFY = 'Drafted by an AI model (Claude). Not yet checked by a native speaker; ask your family.';

const LIMITS = { tagalog: 80, english: 100, literal: 100, pronunciation: 120, usage: 400, exampleTagalog: 160, exampleEnglish: 160, uncertainty: 300 };

/** JSON Schema passed to `claude -p --json-schema`, so the reply always has this shape. */
export const DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['tagalog', 'english', 'literal', 'pronunciation', 'example', 'usage', 'register', 'category', 'uncertainty'],
  properties: {
    tagalog: { type: 'string', maxLength: LIMITS.tagalog, description: 'One natural Tagalog phrase. No alternatives, no parentheses.' },
    english: { type: 'string', maxLength: LIMITS.english, description: 'Natural English meaning.' },
    literal: { type: 'string', maxLength: LIMITS.literal, description: 'Word-for-word meaning if it differs from `english`, else "".' },
    pronunciation: {
      type: 'string',
      maxLength: LIMITS.pronunciation,
      description: 'English-speaker guide: syllables split by "-", stressed syllable in CAPS, e.g. "koo-MOOS-tah kah".',
    },
    example: {
      type: 'object',
      additionalProperties: false,
      required: ['tagalog', 'english'],
      properties: {
        tagalog: { type: 'string', maxLength: LIMITS.exampleTagalog },
        english: { type: 'string', maxLength: LIMITS.exampleEnglish },
      },
    },
    usage: {
      type: 'string',
      maxLength: LIMITS.usage,
      description: 'When to use it with family, and when it may sound too formal or casual. 1–3 sentences.',
    },
    register: { type: 'string', enum: REGISTER_IDS },
    category: { type: 'string', enum: CATEGORY_IDS },
    uncertainty: {
      type: 'string',
      maxLength: LIMITS.uncertainty,
      description: 'Anything you are not sure about (wording, stress, regional use) in 1–2 sentences, else "".',
    },
  },
};

export const SYSTEM_PROMPT = `You write entries for "Usap Tayo", a personal app that helps a Filipino-American learner speak everyday Tagalog with their family.
Rules:
- Give ONE natural, everyday Tagalog phrase that a family member would actually say. No lists or alternatives inside fields.
- Use "po"/"opo" when speaking to elders is likely; say so in the usage note.
- Taglish is fine when that's how people really talk; set register to "taglish".
- Pronunciation: for English speakers, syllables split with "-", the stressed syllable in CAPITALS, vowels a=ah e=eh i=ee o=oh u=oo, e.g. "mah-BOO-tee nah-MAHN poh".
- Keep it short: the usage note is 1–3 sentences (max 400 characters).
- Be honest: put anything you're unsure about (word choice, stress, regional variation) in "uncertainty". Never present a guess as fact.`;

/** The user's request, plus the existing phrases so the model avoids duplicates. */
export function buildPrompt(request, existingPhrases, context = '') {
  const existing = existingPhrases.map((p) => `${p.tagalog} = ${p.english}`).join('\n');
  return [
    `Write a phrase entry for: "${request}"`,
    context ? `Context from the learner: ${context}` : '',
    `Allowed categories: ${CATEGORY_IDS.join(', ')}. Allowed registers: ${REGISTER_IDS.join(', ')}.`,
    `These phrases are already in the app (don't repeat one):\n${existing}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** "Ano'ng ginagawa mo?" -> "anong-ginagawa-mo" */
export function makeId(tagalog, takenIds) {
  const base =
    tagalog
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/, '') || 'phrase';
  let id = base;
  for (let n = 2; takenIds.has(id); n++) id = `${base}-${n}`;
  return id;
}

const sameText = (a, b) => a.toLowerCase().replace(/[^a-zñ]/g, '') === b.toLowerCase().replace(/[^a-zñ]/g, '');

/**
 * Check a model draft. Returns { phrase, errors, warnings }.
 * `phrase` is only usable when `errors` is empty.
 */
export function validateDraft(draft, existingPhrases) {
  const errors = [];
  const warnings = [];
  if (!draft || typeof draft !== 'object') return { phrase: null, errors: ['The model returned no draft.'], warnings };

  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const d = {
    tagalog: text(draft.tagalog),
    english: text(draft.english),
    literal: text(draft.literal),
    pronunciation: text(draft.pronunciation),
    usage: text(draft.usage),
    exampleTagalog: text(draft.example?.tagalog),
    exampleEnglish: text(draft.example?.english),
    register: text(draft.register),
    category: text(draft.category),
    uncertainty: text(draft.uncertainty),
  };

  for (const field of ['tagalog', 'english', 'pronunciation', 'usage', 'exampleTagalog', 'exampleEnglish']) {
    if (!d[field]) errors.push(`"${field}" is empty.`);
  }
  for (const [field, max] of Object.entries(LIMITS)) {
    if (d[field].length > max) errors.push(`"${field}" is too long (${d[field].length} > ${max} characters).`);
  }

  // One phrase only: alternatives like "Salamat (or: Salamat po)" belong in the usage note.
  if (/[()[\]/;]/.test(d.tagalog)) errors.push(`"tagalog" should be one phrase, without ( ) [ ] / or ; — got "${d.tagalog}".`);
  if (/\d/.test(d.tagalog)) errors.push(`"tagalog" contains digits.`);

  // Pronunciation: letters, hyphens, spaces, apostrophes (and ___ for blanks); at least one CAPS syllable.
  if (d.pronunciation && !/^[A-Za-z' \-_]+$/.test(d.pronunciation)) {
    errors.push(`"pronunciation" has unexpected characters — got "${d.pronunciation}".`);
  } else if (d.pronunciation && !/\b[A-Z]{2,}\b|-[A-Z]{2,}|^[A-Z]{2,}/.test(d.pronunciation)) {
    errors.push(`"pronunciation" doesn't mark a stressed syllable in CAPS — got "${d.pronunciation}".`);
  }

  if (!CATEGORY_IDS.includes(d.category)) errors.push(`Unknown category "${d.category}".`);
  if (!REGISTER_IDS.includes(d.register)) errors.push(`Unknown register "${d.register}".`);

  const duplicate = existingPhrases.find((p) => sameText(p.tagalog, d.tagalog) || (p.spoken && sameText(p.spoken, d.tagalog)));
  if (duplicate) errors.push(`"${d.tagalog}" is already in the library (id "${duplicate.id}").`);

  if (d.literal && sameText(d.literal, d.english)) d.literal = '';
  if (!d.uncertainty) warnings.push('The model reported no uncertainty; the phrase is still flagged for checking.');

  const phrase = {
    id: makeId(d.tagalog, new Set(existingPhrases.map((p) => p.id))),
    category: d.category,
    tagalog: d.tagalog,
    english: d.english,
    ...(d.literal ? { literal: d.literal } : {}),
    pronunciation: d.pronunciation,
    example: { tagalog: d.exampleTagalog, english: d.exampleEnglish },
    usage: d.usage,
    register: d.register,
    // Always flagged: a model's Tagalog is a draft until a native speaker confirms it.
    verify: d.uncertainty ? `AI draft (Claude). ${d.uncertainty}` : DEFAULT_VERIFY,
  };
  return { phrase: errors.length ? null : phrase, errors, warnings };
}

/** Format a phrase as a JS object literal in the style of phrases.js. */
export function toSource(phrase, date = new Date()) {
  const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const lines = [`  // Added with \`npm run add-phrase\` on ${date.toISOString().slice(0, 10)} (drafted by Claude, checked by code).`, '  {'];
  for (const [key, value] of Object.entries(phrase)) {
    if (key === 'example') lines.push(`    example: { tagalog: ${q(value.tagalog)}, english: ${q(value.english)} },`);
    else lines.push(`    ${key}: ${q(value)},`);
  }
  lines.push('  },');
  return lines.join('\n');
}

/** Insert a phrase's source just before the end of the PHRASES array. */
export function insertIntoPhrasesFile(fileSource, snippet) {
  const anchor = '\n];\n\nexport function getPhrase';
  const at = fileSource.indexOf(anchor);
  if (at === -1) throw new Error('Could not find the end of the PHRASES array in phrases.js.');
  return `${fileSource.slice(0, at)}\n\n${snippet}${fileSource.slice(at)}`;
}
