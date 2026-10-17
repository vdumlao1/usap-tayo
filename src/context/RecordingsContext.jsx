import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as R from '../lib/recordings.js';

/*
  RecordingsContext: record a family member saying a phrase, then play it back.
  - keys:         Set of recording keys that exist (so buttons know what to show)
  - recordingKey: the key currently being recorded, or null
  - playingKey:   the key currently playing, or null
  Only one recording or playback happens at a time.
*/

const RecordingsContext = createContext(null);

export function RecordingsProvider({ children }) {
  const supported = R.isRecordingSupported();
  const [keys, setKeys] = useState(() => new Set());
  const [recordingKey, setRecordingKey] = useState(null);
  const [playingKey, setPlayingKey] = useState(null);
  const [error, setError] = useState(null); // { key, message }
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef(null);
  const audioRef = useRef(null);
  const urlCache = useRef(new Map()); // key → object URL, so each blob is loaded once

  // Load the list of existing recordings once.
  useEffect(() => {
    if (!('indexedDB' in window)) return;
    R.listRecordingKeys()
      .then((list) => setKeys(new Set(list)))
      .catch(() => {});
  }, []);

  const forgetUrl = (key) => {
    const url = urlCache.current.get(key);
    if (url) URL.revokeObjectURL(url);
    urlCache.current.delete(key);
  };

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingKey(null);
  }, []);

  /* Play any audio URL through one shared player, so two clips never overlap.
     `id` identifies what's playing (for the button's "playing" style). */
  const playUrl = useCallback(
    async (id, url, errorKey = id) => {
      stopPlayback();
      window.speechSynthesis?.cancel();
      try {
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingKey(id);
        audio.onended = () => setPlayingKey((k) => (k === id ? null : k));
        await audio.play();
      } catch {
        setPlayingKey(null);
        setError({ key: errorKey, message: 'Couldn’t play this audio.' });
      }
    },
    [stopPlayback],
  );

  /** Play the family recording saved under `key`. */
  const play = useCallback(
    async (key) => {
      let url = urlCache.current.get(key);
      if (!url) {
        const blob = await R.getRecording(key).catch(() => null);
        if (!blob) return;
        url = URL.createObjectURL(blob);
        urlCache.current.set(key, url);
      }
      playUrl(key, url);
    },
    [playUrl],
  );

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  }, []);

  const startRecording = useCallback(
    async (key) => {
      if (!supported) return;
      stopRecording();
      stopPlayback();
      window.speechSynthesis?.cancel();
      setError(null);
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        setError({ key, message: R.micErrorMessage(e) });
        return;
      }

      const recorder = new MediaRecorder(stream);
      const chunks = [];
      let timer = null;
      let ticker = null;
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        clearTimeout(timer);
        clearInterval(ticker);
        stream.getTracks().forEach((t) => t.stop()); // turn the mic light off
        recorderRef.current = null;
        setRecordingKey(null);
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        try {
          await R.saveRecording(key, blob);
          forgetUrl(key);
          setKeys((prev) => new Set(prev).add(key));
        } catch (e) {
          setError({ key, message: R.micErrorMessage(e) });
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecordingKey(key);
      setElapsed(0);
      const startedAt = Date.now();
      ticker = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
      timer = setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), R.MAX_RECORDING_SECONDS * 1000);
    },
    [supported, stopRecording, stopPlayback],
  );

  const remove = useCallback(
    async (key) => {
      if (playingKey === key) stopPlayback();
      await R.deleteRecording(key).catch(() => {});
      forgetUrl(key);
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [playingKey, stopPlayback],
  );

  const removeAll = useCallback(async () => {
    stopPlayback();
    await R.clearRecordings().catch(() => {});
    for (const key of urlCache.current.keys()) forgetUrl(key);
    setKeys(new Set());
  }, [stopPlayback]);

  // Clean up if the app unmounts mid-recording.
  useEffect(() => () => recorderRef.current?.stop(), []);

  const value = useMemo(
    () => ({
      supported,
      has: (key) => keys.has(key),
      count: keys.size,
      recordingKey,
      playingKey,
      elapsed,
      error,
      clearError: () => setError(null),
      play,
      playUrl,
      stopPlayback,
      startRecording,
      stopRecording,
      remove,
      removeAll,
    }),
    [supported, keys, recordingKey, playingKey, elapsed, error, play, playUrl, stopPlayback, startRecording, stopRecording, remove, removeAll],
  );

  return <RecordingsContext.Provider value={value}>{children}</RecordingsContext.Provider>;
}

export function useRecordings() {
  const ctx = useContext(RecordingsContext);
  if (!ctx) throw new Error('useRecordings must be used inside <RecordingsProvider>');
  return ctx;
}
