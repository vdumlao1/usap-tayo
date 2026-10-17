import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as P from '../lib/progress.js';

/*
  ProgressContext makes your saved progress available to every page.
  "Context" is React's way to share data without passing props through
  every component. Any change is saved to localStorage automatically.
*/

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => P.loadProgress());
  const [saveFailed, setSaveFailed] = useState(false);

  // Save whenever progress changes.
  useEffect(() => {
    setSaveFailed(!P.saveProgress(progress));
  }, [progress]);

  // If the app is open in two tabs, keep them in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === P.STORAGE_KEY) setProgress(P.loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markStatus = useCallback((id, status) => setProgress((p) => P.setStatus(p, id, status)), []);
  const practice = useCallback((id) => setProgress((p) => P.recordPractice(p, id)), []);
  const rate = useCallback(
    (id, status) => setProgress((p) => P.setStatus(P.recordPractice(p, id), id, status)),
    [],
  );
  const finishQuiz = useCallback((result) => setProgress((p) => P.recordQuiz(p, result)), []);
  const finishConversation = useCallback((id) => setProgress((p) => P.recordConversation(p, id)), []);
  const setGoal = useCallback((goal) => setProgress((p) => P.setDailyGoal(p, goal)), []);
  const setStandInVoice = useCallback((on) => setProgress((p) => P.setStandInVoice(p, on)), []);
  const updateProfile = useCallback((changes) => setProgress((p) => P.updateProfile(p, changes)), []);
  // Reset clears learning progress but keeps your profile and settings.
  const reset = useCallback(
    () =>
      setProgress((p) => ({
        ...P.defaultProgress(),
        dailyGoal: p.dailyGoal,
        standInVoice: p.standInVoice,
        profile: p.profile,
      })),
    [],
  );

  const value = useMemo(
    () => ({
      progress,
      saveFailed,
      statusOf: (id) => P.getStatus(progress, id),
      markStatus,
      practice,
      rate,
      finishQuiz,
      finishConversation,
      setGoal,
      setStandInVoice,
      updateProfile,
      reset,
    }),
    [progress, saveFailed, markStatus, practice, rate, finishQuiz, finishConversation, setGoal, setStandInVoice, updateProfile, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
