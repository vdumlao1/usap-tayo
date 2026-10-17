import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES, getPhrase } from '../data/phrases.js';
import { CATEGORIES, getCategory } from '../data/categories.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { shuffle } from '../lib/quiz.js';
import { navigate } from '../hooks/useHashRoute.js';
import Icon from '../components/Icon.jsx';
import Pronunciation from '../components/Pronunciation.jsx';
import RegisterTag from '../components/RegisterTag.jsx';
import AudioControls from '../components/AudioControls.jsx';
import { phraseKey } from '../lib/recordings.js';
import EmptyState from '../components/EmptyState.jsx';
import YourVersion from '../components/YourVersion.jsx';

/*
  Flashcards: see the Tagalog, try to recall, reveal, then rate yourself.
  The deck's card order is fixed when the session starts, so marking a card
  "known" while studying the Review deck doesn't make it vanish mid-session.
*/

const BASE_DECKS = [
  { id: 'all', label: 'All phrases' },
  { id: 'review', label: 'Needs review' },
  { id: 'new', label: 'Not marked yet' },
];

function deckIds(deck, statusOf) {
  if (deck === 'all') return PHRASES.map((p) => p.id);
  if (deck === 'review') return PHRASES.filter((p) => statusOf(p.id) === 'review').map((p) => p.id);
  if (deck === 'new') return PHRASES.filter((p) => statusOf(p.id) === null).map((p) => p.id);
  return PHRASES.filter((p) => p.category === deck).map((p) => p.id);
}

export default function FlashcardsPage({ params }) {
  const { statusOf, rate } = useProgress();
  const deck = params.get('deck') ?? 'all';

  // The ordered list of phrase ids for this session.
  const [order, setOrder] = useState(() => deckIds(deck, statusOf));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState({}); // { id: 'known' | 'review' } for this session
  const revealBtnRef = useRef(null);
  const answerRef = useRef(null);

  // Restart the session when the deck changes (via the dropdown or URL).
  const deckRef = useRef(deck);
  useEffect(() => {
    if (deckRef.current === deck) return;
    deckRef.current = deck;
    setOrder(deckIds(deck, statusOf));
    setIndex(0);
    setRevealed(false);
    setRatings({});
  }, [deck, statusOf]);

  const finished = order.length > 0 && index >= order.length;
  const phrase = !finished && order.length ? getPhrase(order[index]) : null;

  const go = useCallback(
    (delta) => {
      setIndex((i) => Math.max(0, Math.min(order.length, i + delta)));
      setRevealed(false);
    },
    [order.length],
  );

  const doRate = useCallback(
    (status) => {
      if (!phrase) return;
      rate(phrase.id, status);
      setRatings((r) => ({ ...r, [phrase.id]: status }));
      go(1);
    },
    [phrase, rate, go],
  );

  const reveal = () => setRevealed(true);

  // Move focus to the answer after revealing, so keyboard/screen-reader users land on it.
  useEffect(() => {
    if (revealed) answerRef.current?.focus();
  }, [revealed]);

  // After rating or skipping, the clicked button may disappear; keep focus on the card controls.
  useEffect(() => {
    if (document.activeElement === document.body) revealBtnRef.current?.focus({ preventScroll: true });
  }, [index]);

  // Keyboard shortcuts (ignored while typing in a form field).
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (finished || !phrase) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ' && !revealed && !e.target.closest('button, a')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && e.key === '1') doRate('review');
      else if (revealed && e.key === '2') doRate('known');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished, phrase, revealed, go, doRate]);

  const restart = (ids = order) => {
    setOrder(ids);
    setIndex(0);
    setRevealed(false);
    setRatings({});
  };

  const changeDeck = (e) => navigate(`/cards?deck=${e.target.value}`);

  const deckLabel = useMemo(() => {
    const base = BASE_DECKS.find((d) => d.id === deck);
    return base ? base.label : getCategory(deck)?.label ?? 'Phrases';
  }, [deck]);

  const knownCount = Object.values(ratings).filter((s) => s === 'known').length;
  const reviewIds = Object.entries(ratings)
    .filter(([, s]) => s === 'review')
    .map(([id]) => id);

  return (
    <div className="flash">
      <header className="page-head page-head--row">
        <div>
          <h1 className="page-title">Flashcards</h1>
          <p className="page-sub">Say it out loud, try to recall the meaning, then reveal.</p>
        </div>
        <div className="deck-controls">
          <label htmlFor="deck" className="field-label">
            Deck
          </label>
          <select id="deck" className="select" value={deck} onChange={changeDeck}>
            <optgroup label="Collections">
              {BASE_DECKS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Topics">
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          </select>
          {order.length > 1 && !finished && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => restart(shuffle(order))}>
              <Icon name="shuffle" size={16} /> Shuffle
            </button>
          )}
        </div>
      </header>

      {order.length === 0 ? (
        <EmptyState
          emoji={deck === 'review' ? '🎉' : '🃏'}
          title={deck === 'review' ? 'Nothing to review right now' : 'This deck is empty'}
          actions={
            <a className="btn btn--primary" href="#/cards?deck=all">
              Study all phrases
            </a>
          }
        >
          {deck === 'review'
            ? 'Phrases you mark “Still learning” (or miss in a quiz) will show up here.'
            : 'You’ve marked every phrase in this deck. Try another deck!'}
        </EmptyState>
      ) : finished ? (
        <section className="card-done" aria-labelledby="done-title">
          <div className="card-done__emoji" aria-hidden="true">
            🎉
          </div>
          <h2 id="done-title">Tapos na! Deck complete.</h2>
          <p>
            You went through {order.length} card{order.length === 1 ? '' : 's'} in <strong>{deckLabel}</strong>.
            {Object.keys(ratings).length > 0 && (
              <>
                {' '}
                You knew <strong>{knownCount}</strong> and are still learning <strong>{reviewIds.length}</strong>.
              </>
            )}
          </p>
          <div className="btn-row">
            {reviewIds.length > 0 && (
              <button type="button" className="btn btn--primary" onClick={() => restart(reviewIds)}>
                Practice the {reviewIds.length} tricky one{reviewIds.length === 1 ? '' : 's'} again
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={() => restart(shuffle(order))}>
              Go through again (shuffled)
            </button>
            <a className="btn btn--ghost" href="#/quiz">
              Take a quiz
            </a>
          </div>
        </section>
      ) : (
        <>
          <div className="flash__meta">
            <span>
              Card <strong>{index + 1}</strong> of {order.length}
            </span>
            <div className="bar bar--thin" aria-hidden="true">
              <span style={{ width: `${(index / order.length) * 100}%` }} />
            </div>
          </div>

          <article key={phrase.id} className={`flashcard ${revealed ? 'is-revealed' : ''}`} aria-labelledby="fc-tl">
            <div className="flashcard__front">
              <div className="flashcard__tags">
                <span className="tag tag--category">
                  <span aria-hidden="true">{getCategory(phrase.category)?.emoji}</span> {getCategory(phrase.category)?.label}
                </span>
                <RegisterTag register={phrase.register} />
                {statusOf(phrase.id) && (
                  <span className={`tag tag--status-${statusOf(phrase.id)}`}>
                    {statusOf(phrase.id) === 'known' ? 'Marked known' : 'In review'}
                  </span>
                )}
              </div>
              <h2 id="fc-tl" className="flashcard__tl" lang="tl">
                {phrase.tagalog}
              </h2>
              <AudioControls
                text={phrase.spoken ?? phrase.tagalog}
                label={phrase.tagalog}
                audioKey={phraseKey(phrase.id)}
                recordable
              />
            </div>

            {!revealed ? (
              <div className="flashcard__prompt">
                <p className="muted">What does it mean? Say it out loud first.</p>
                <button ref={revealBtnRef} type="button" className="btn btn--primary btn--lg" onClick={reveal}>
                  <Icon name="eye" size={18} /> Show answer
                </button>
                <p className="kbd-hint">
                  <kbd>Space</kbd> reveal · <kbd>←</kbd>
                  <kbd>→</kbd> move
                </p>
              </div>
            ) : (
              <div className="flashcard__answer" ref={answerRef} tabIndex={-1} aria-live="polite">
                <p className="flashcard__en">{phrase.english}</p>
                <YourVersion phrase={phrase} />
                {phrase.literal && (
                  <p className="flashcard__literal">
                    <span className="muted">Literally:</span> {phrase.literal}
                  </p>
                )}
                <Pronunciation text={phrase.pronunciation} className="pron--lg" />
                {phrase.spoken && (
                  <p className="audio-says audio-says--center">
                    Audio says: <span lang="tl">“{phrase.spoken}”</span>
                  </p>
                )}
                <div className="example">
                  <p lang="tl" className="example__tl">
                    {phrase.example.tagalog}
                  </p>
                  <p className="example__en">{phrase.example.english}</p>
                </div>
                <details className="flashcard__usage">
                  <summary>When to use it</summary>
                  <p>{phrase.usage}</p>
                  {phrase.verify && <p className="verify-note">{phrase.verify}</p>}
                </details>
              </div>
            )}
          </article>

          {revealed && (
            <div className="rate" role="group" aria-label="How well did you know it?">
              <button type="button" className="btn btn--rate btn--rate-review" onClick={() => doRate('review')}>
                <Icon name="review" size={18} /> Still learning <kbd aria-hidden="true">1</kbd>
              </button>
              <button type="button" className="btn btn--rate btn--rate-known" onClick={() => doRate('known')}>
                <Icon name="check" size={18} /> I know this <kbd aria-hidden="true">2</kbd>
              </button>
            </div>
          )}

          <div className="flash__nav">
            <button type="button" className="btn btn--ghost" onClick={() => go(-1)} disabled={index === 0}>
              <Icon name="left" size={18} /> Previous
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => go(1)}>
              Skip <Icon name="right" size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
