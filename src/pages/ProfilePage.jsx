import { useState } from 'react';
import { PHRASES } from '../data/phrases.js';
import { CONVERSATIONS } from '../data/conversations.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { useRecordings } from '../context/RecordingsContext.jsx';
import {
  MAX_NAME_LENGTH,
  computeStreak,
  idsWithStatus,
  practicedCount,
  quizStats,
} from '../lib/progress.js';
import Avatar from '../components/Avatar.jsx';

const GOALS = [5, 10, 15, 20, 30];

/*
  Your profile: name, who you're learning for, daily goal, and a summary.
  Everything is saved only in this browser — there's no account.
*/
export default function ProfilePage() {
  const { progress, updateProfile, setGoal, reset } = useProgress();
  const rec = useRecordings();
  const { profile } = progress;

  // Edit in local state; save on submit so typing doesn't save half a name.
  const [name, setName] = useState(profile.name);
  const [learningFor, setLearningFor] = useState(profile.learningFor);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const dirty = name.trim() !== profile.name || learningFor.trim() !== profile.learningFor;

  const save = (e) => {
    e.preventDefault();
    updateProfile({ name, learningFor, welcomed: true });
    setName(name.trim());
    setLearningFor(learningFor.trim());
    setSaved(true);
  };

  const quiz = quizStats(progress);
  const summary = [
    { label: 'Phrases known', value: `${idsWithStatus(progress, 'known').length}/${PHRASES.length}` },
    { label: 'Phrases practiced', value: practicedCount(progress) },
    { label: 'Day streak', value: computeStreak(progress.activity) },
    { label: 'Conversations practiced', value: `${Object.keys(progress.conversations).length}/${CONVERSATIONS.length}` },
    { label: 'Quizzes taken', value: quiz.taken },
    { label: 'Family recordings', value: rec.count },
  ];

  return (
    <div className="profile">
      <header className="profile__head">
        <Avatar name={profile.name} size={72} />
        <div>
          <h1 className="page-title">{profile.name ? `Kumusta, ${profile.name}!` : 'Your profile'}</h1>
          <p className="page-sub">
            {profile.learningFor
              ? `Learning Tagalog to talk with ${profile.learningFor}.`
              : 'Add your name so Usap Tayo can greet you.'}
          </p>
        </div>
      </header>

      <form className="panel" onSubmit={save} aria-labelledby="about-title">
        <h2 id="about-title">About you</h2>
        <div className="field">
          <label htmlFor="profile-name" className="field-label">
            Your name
          </label>
          <input
            id="profile-name"
            className="input"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="given-name"
            placeholder="e.g. Ana"
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
          <p className="field-hint">
            Used for greetings, and to practice introducing yourself: “Ako po si {name.trim() || '___'}.”
          </p>
        </div>
        <div className="field">
          <label htmlFor="profile-for" className="field-label">
            Who are you learning Tagalog for? <span className="muted">(optional)</span>
          </label>
          <input
            id="profile-for"
            className="input"
            value={learningFor}
            maxLength={MAX_NAME_LENGTH}
            placeholder="e.g. Lola and Tito Ben"
            onChange={(e) => {
              setLearningFor(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="btn-row profile__save">
          <button type="submit" className="btn btn--primary" disabled={!dirty}>
            Save profile
          </button>
          <p role="status" className="muted">
            {saved ? 'Saved! Na-save na.' : ''}
          </p>
        </div>
        <p className="muted profile__privacy">
          🔒 Your profile is saved only in this browser. There’s no account, and nothing is sent anywhere.
        </p>
      </form>

      <section className="panel" aria-labelledby="summary-title">
        <h2 id="summary-title">Your learning so far</h2>
        <dl className="summary">
          {summary.map((s) => (
            <div key={s.label} className="summary__item">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel" aria-labelledby="settings-title">
        <h2 id="settings-title">Settings</h2>
        <div className="field">
          <label htmlFor="goal" className="field-label">
            Daily practice goal
          </label>
          <select id="goal" className="select" value={progress.dailyGoal} onChange={(e) => setGoal(Number(e.target.value))}>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g} practice actions per day
              </option>
            ))}
          </select>
        </div>

        <div className="danger-zone">
          <h3>Reset progress</h3>
          <p className="muted">
            Clears known/review marks, quiz history, and your streak. Your profile, settings, and family recordings are
            kept. This can’t be undone.
          </p>
          {!confirming ? (
            <button
              type="button"
              className="btn btn--danger-ghost"
              onClick={() => {
                setConfirming(true);
                setResetDone(false);
              }}
            >
              Reset all progress…
            </button>
          ) : (
            <div className="btn-row" role="group" aria-label="Confirm reset">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  reset();
                  setConfirming(false);
                  setResetDone(true);
                }}
              >
                Yes, erase my progress
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)} autoFocus>
                Cancel
              </button>
            </div>
          )}
          <p role="status" className="muted">
            {resetDone ? 'Progress reset. Bagong simula — a fresh start!' : ''}
          </p>
        </div>
      </section>
    </div>
  );
}
