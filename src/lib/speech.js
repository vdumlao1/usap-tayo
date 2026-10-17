/*
  Text-to-speech using the browser's built-in Web Speech API.
  Free, offline-capable, no API key — but quality depends entirely on which
  voices your operating system/browser provides. Many systems have NO
  Filipino/Tagalog voice, in which case we fall back to the default voice
  and tell the user the result is only a rough approximation.
*/

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Find a Filipino/Tagalog voice. BCP-47 codes: "fil-PH", "fil", "tl-PH", "tl". */
export function findTagalogVoice(voices) {
  return voices.find((v) => /^(fil|tl)([-_]|$)/i.test(v.lang)) ?? null;
}

/*
  No Filipino voice? Tagalog spelling is close to phonetic, so voices for
  languages with similar vowel sounds read it far better than an English
  voice would. Indonesian and Malay are related languages; Spanish shares
  many loanwords and similar vowels. Still only an approximation!
*/
const FALLBACK_LANGS = [/^id([-_]|$)/i, /^ms([-_]|$)/i, /^es([-_]|$)/i];

export function findFallbackVoice(voices) {
  for (const pattern of FALLBACK_LANGS) {
    const match = voices.find((v) => pattern.test(v.lang));
    if (match) return match;
  }
  return null;
}

/** Text to read aloud: blanks ("___") removed so the voice doesn't say "underscore". */
export function speakableText(text) {
  return text.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Speak `text`. Returns the utterance (or null if unsupported).
 * Any speech already playing is cancelled first.
 */
export function speak(text, { voice = null, rate = 0.85, onEnd } = {}) {
  if (!isSpeechSupported()) return null;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(speakableText(text));
  utterance.lang = voice?.lang ?? 'fil-PH';
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  synth.speak(utterance);
  return utterance;
}
