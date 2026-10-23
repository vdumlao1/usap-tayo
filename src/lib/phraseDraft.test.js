import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases.js';
import { DEFAULT_VERIFY, buildPrompt, insertIntoPhrasesFile, makeId, toSource, validateDraft } from './phraseDraft.js';

// A small fixed library, so these tests don't break when real phrases are added
// (an earlier version used the real PHRASES list and failed once "Saan ka galing?" was added).
const LIBRARY = [
  { id: 'salamat', tagalog: 'Salamat po.', english: 'Thank you.' },
  { id: 'kumusta-ka', tagalog: 'Kumusta ka?', english: 'How are you?' },
];

// A well-formed draft, like the model returns.
const good = () => ({
  tagalog: 'Saan ka galing?',
  english: 'Where have you been?',
  literal: 'Where are you from?',
  pronunciation: 'sah-AHN kah gah-LEENG',
  example: { tagalog: 'Anak, saan ka galing?', english: 'Where have you been, dear?' },
  usage: 'A common question when someone comes home. Use "Saan po kayo galing?" with elders.',
  register: 'casual',
  category: 'questions',
  uncertainty: '',
});

describe('validateDraft', () => {
  it('accepts a good draft and always flags it for checking', () => {
    const { phrase, errors, warnings } = validateDraft(good(), LIBRARY);
    expect(errors).toEqual([]);
    expect(phrase.id).toBe('saan-ka-galing');
    expect(phrase.verify).toBe(DEFAULT_VERIFY);
    expect(warnings.length).toBe(1); // "model reported no uncertainty"
  });

  it('puts the model’s own uncertainty into the flag', () => {
    const { phrase } = validateDraft({ ...good(), uncertainty: 'Stress on "galing" may vary.' }, LIBRARY);
    expect(phrase.verify).toBe('AI draft (Claude). Stress on "galing" may vary.');
  });

  it('rejects alternatives crammed into the Tagalog field (seen in a real test call)', () => {
    const draft = { ...good(), tagalog: 'Salamat (more polite/formal: Salamat po)' };
    const { phrase, errors } = validateDraft(draft, LIBRARY);
    expect(phrase).toBeNull();
    expect(errors.join(' ')).toMatch(/one phrase/);
  });

  it('rejects unknown categories and registers', () => {
    const { errors } = validateDraft({ ...good(), category: 'travel', register: 'formalish' }, LIBRARY);
    expect(errors).toEqual(expect.arrayContaining(['Unknown category "travel".', 'Unknown register "formalish".']));
  });

  it('rejects pronunciation without a CAPS stress or with odd characters', () => {
    expect(validateDraft({ ...good(), pronunciation: 'sah-ahn kah gah-leeng' }, LIBRARY).errors.join()).toMatch(/stressed/);
    expect(validateDraft({ ...good(), pronunciation: 'sa·ˈan ka' }, LIBRARY).errors.join()).toMatch(/unexpected/);
  });

  it('rejects phrases already in the library, ignoring case and punctuation', () => {
    const { errors } = validateDraft({ ...good(), tagalog: 'salamat po' }, LIBRARY);
    expect(errors.join()).toMatch(/already in the library/);
  });

  it('rejects empty or missing fields and non-objects', () => {
    expect(validateDraft({ ...good(), english: '  ' }, LIBRARY).errors).toContain('"english" is empty.');
    expect(validateDraft({ ...good(), example: undefined }, LIBRARY).errors).toContain('"exampleTagalog" is empty.');
    expect(validateDraft(null, LIBRARY).errors).toEqual(['The model returned no draft.']);
  });

  it('rejects overly long fields', () => {
    expect(validateDraft({ ...good(), usage: 'x'.repeat(401) }, LIBRARY).errors.join()).toMatch(/too long/);
  });

  it('drops a literal meaning that just repeats the English', () => {
    const { phrase } = validateDraft({ ...good(), literal: 'where have you been' }, LIBRARY);
    expect(phrase).not.toHaveProperty('literal');
  });
});

describe('makeId', () => {
  it('makes a kebab-case id and avoids collisions', () => {
    expect(makeId('Ano’ng ginagawa mo?', new Set())).toBe('anong-ginagawa-mo');
    expect(makeId('Salamat po.', new Set(['salamat-po']))).toBe('salamat-po-2');
  });
});

describe('source editing', () => {
  it('produces code that evaluates back to the same phrase', () => {
    const { phrase } = validateDraft({ ...good(), usage: "It's \\ tricky" }, LIBRARY);
    const snippet = toSource(phrase, new Date('2026-10-23'));
    expect(snippet).toContain('2026-10-23');
    // eslint-disable-next-line no-new-func
    const parsed = new Function(`return [${snippet}][0];`)();
    expect(parsed).toEqual(phrase);
  });

  it('inserts before the end of the PHRASES array, and refuses an unexpected file', () => {
    const file = "export const PHRASES = [\n  { id: 'a' },\n];\n\nexport function getPhrase(id) {}\n";
    const out = insertIntoPhrasesFile(file, "  { id: 'b' },");
    expect(out.indexOf("id: 'b'")).toBeGreaterThan(out.indexOf("id: 'a'"));
    expect(out.indexOf("id: 'b'")).toBeLessThan(out.indexOf('];'));
    expect(() => insertIntoPhrasesFile('nonsense', 'x')).toThrow();
  });
});

describe('buildPrompt', () => {
  it('includes the request, context, and existing phrases', () => {
    const prompt = buildPrompt('Where have you been?', PHRASES.slice(0, 2), 'my Lola asks this');
    expect(prompt).toContain('Where have you been?');
    expect(prompt).toContain('my Lola asks this');
    expect(prompt).toContain(PHRASES[0].tagalog);
  });
});
