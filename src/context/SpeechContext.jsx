import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { findFallbackVoice, findTagalogVoice, isSpeechSupported, speak as speakText } from '../lib/speech.js';
import { useProgress } from './ProgressContext.jsx';

/*
  Shares text-to-speech status with every Listen button:
  - supported:   does this browser have speech synthesis at all?
  - tagalogVoice:  a Filipino/Tagalog voice if the system has one, else null
  - fallbackVoice: a stand-in voice (Indonesian/Malay/Spanish) for when there's no Tagalog voice
  - generatedUrl:  URL of pre-generated Tagalog audio for a phrase/line key (made by
                   scripts/generate_tts.py with Meta's MMS Tagalog model), or null
  - canSpeak:      true if Listen buttons should use text-to-speech at all. Without a
                   Filipino voice this is only true if you opted in to the stand-in voice
                   (Guide page), because the accent is noticeably wrong.
  Browsers load voices asynchronously, so we listen for "voiceschanged".
*/

const SpeechContext = createContext(null);
const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/tts/`;

export function SpeechProvider({ children }) {
  const supported = isSpeechSupported();
  const { progress } = useProgress();
  const standInEnabled = Boolean(progress.standInVoice);
  const [voices, setVoices] = useState([]);
  const [speakingText, setSpeakingText] = useState(null);
  const [generated, setGenerated] = useState({}); // { key: { file, text } }

  // Load the list of pre-generated audio files. If it's missing, the app still works.
  useEffect(() => {
    fetch(`${AUDIO_BASE}manifest.json`)
      .then((res) => (res.ok ? res.json() : {}))
      .then(setGenerated)
      .catch(() => {});
  }, []);

  // Clips the generator marked "low" quality (still unclear after many tries) are
  // skipped, so you never hear audio that's likely wrong.
  const generatedUrl = useCallback(
    (key) => {
      const entry = key && generated[key];
      return entry && entry.quality !== 'low' ? `${AUDIO_BASE}${entry.file}` : null;
    },
    [generated],
  );

  useEffect(() => {
    if (!supported) return undefined;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => {
      synth.removeEventListener?.('voiceschanged', load);
      synth.cancel();
    };
  }, [supported]);

  const tagalogVoice = useMemo(() => findTagalogVoice(voices), [voices]);
  const fallbackVoice = useMemo(() => (tagalogVoice ? null : findFallbackVoice(voices)), [voices, tagalogVoice]);

  const speak = useCallback(
    (text) => {
      setSpeakingText(text);
      speakText(text, { voice: tagalogVoice ?? fallbackVoice, onEnd: () => setSpeakingText((t) => (t === text ? null : t)) });
    },
    [tagalogVoice, fallbackVoice],
  );

  const canSpeak = supported && (Boolean(tagalogVoice) || standInEnabled);

  const value = useMemo(
    () => ({
      supported,
      canSpeak,
      tagalogVoice,
      fallbackVoice,
      voicesLoaded: voices.length > 0,
      speak,
      speakingText,
      generatedUrl,
      generatedCount: Object.values(generated).filter((e) => e.quality !== 'low').length,
    }),
    [supported, canSpeak, tagalogVoice, fallbackVoice, voices.length, speak, speakingText, generatedUrl, generated],
  );

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSpeech() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeech must be used inside <SpeechProvider>');
  return ctx;
}
