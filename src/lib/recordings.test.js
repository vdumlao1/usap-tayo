import { describe, expect, it } from 'vitest';
import { lineKey, micErrorMessage, phraseKey } from './recordings.js';

describe('recording keys', () => {
  it('builds distinct keys for phrases and conversation lines', () => {
    expect(phraseKey('salamat')).toBe('phrase:salamat');
    expect(lineKey('greeting-lola', 2)).toBe('line:greeting-lola:2');
  });
});

describe('micErrorMessage', () => {
  it('explains blocked microphones', () => {
    expect(micErrorMessage({ name: 'NotAllowedError' })).toMatch(/blocked/);
  });
  it('has a generic fallback', () => {
    expect(micErrorMessage(new Error('?'))).toMatch(/try again/);
  });
});
