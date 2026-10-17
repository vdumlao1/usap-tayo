import { describe, expect, it } from 'vitest';
import { findFallbackVoice, findTagalogVoice, speakableText } from './speech.js';

describe('findTagalogVoice', () => {
  const v = (lang, name = lang) => ({ lang, name });

  it('finds Filipino or Tagalog voices', () => {
    expect(findTagalogVoice([v('en-US'), v('fil-PH')])?.lang).toBe('fil-PH');
    expect(findTagalogVoice([v('tl-PH')])?.lang).toBe('tl-PH');
    expect(findTagalogVoice([v('fil')])?.lang).toBe('fil');
  });

  it('returns null when none is available', () => {
    expect(findTagalogVoice([v('en-US'), v('es-ES')])).toBeNull();
    expect(findTagalogVoice([])).toBeNull();
  });

  it('does not match languages that merely start with "tl"/"fil" letters', () => {
    expect(findTagalogVoice([v('tlh')])).toBeNull(); // Klingon!
  });
});

describe('speakableText', () => {
  it('removes blanks', () => {
    expect(speakableText('Pakiabot po ng ___.')).toBe('Pakiabot po ng .');
  });
});

describe('findFallbackVoice', () => {
  const v = (lang) => ({ lang, name: lang });
  it('prefers Indonesian, then Malay, then Spanish', () => {
    expect(findFallbackVoice([v('es-ES'), v('ms-MY'), v('id-ID')]).lang).toBe('id-ID');
    expect(findFallbackVoice([v('es-ES'), v('ms-MY')]).lang).toBe('ms-MY');
    expect(findFallbackVoice([v('en-US'), v('es-MX')]).lang).toBe('es-MX');
    expect(findFallbackVoice([v('en-US')])).toBeNull();
  });
});
