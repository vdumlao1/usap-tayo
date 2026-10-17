import { useEffect, useRef, useState } from 'react';
import { shuffle } from '../../lib/quiz.js';
import Icon from '../Icon.jsx';

/*
  Matching round: pick a Tagalog phrase, then its English meaning (or the
  other way round). Each pair is worth 1 point if matched with no mistakes.
*/
export default function MatchRound({ question, onComplete, onNext, isLast }) {
  const { pairs } = question;
  const [rightOrder] = useState(() => shuffle(pairs));
  const [left, setLeft] = useState(null); // selected Tagalog phrase id
  const [right, setRight] = useState(null); // selected English phrase id
  const [matched, setMatched] = useState([]); // ids
  const [mistakes, setMistakes] = useState([]); // ids of Tagalog phrases with a wrong attempt
  const [wrongPair, setWrongPair] = useState(null);
  const [message, setMessage] = useState('');
  const nextRef = useRef(null);
  const done = matched.length === pairs.length;

  // Check a pair once both sides are selected.
  useEffect(() => {
    if (!left || !right) return undefined;
    const tl = pairs.find((p) => p.id === left);
    if (left === right) {
      setMatched((m) => [...m, left]);
      setMessage(`Matched: ${tl.tagalog} — ${tl.english}`);
      setLeft(null);
      setRight(null);
      return undefined;
    }
    setMistakes((m) => (m.includes(left) ? m : [...m, left]));
    setWrongPair({ left, right });
    setMessage(`Not a match. Try again.`);
    const t = setTimeout(() => {
      setWrongPair(null);
      setLeft(null);
      setRight(null);
    }, 650);
    return () => clearTimeout(t);
  }, [left, right, pairs]);

  // Report the result once, when all pairs are matched.
  const reported = useRef(false);
  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete({
      points: pairs.filter((p) => !mistakes.includes(p.id)).length,
      missed: pairs.filter((p) => mistakes.includes(p.id)),
    });
    nextRef.current?.focus();
  }, [done, pairs, mistakes, onComplete]);

  const cls = (side, id) => {
    if (matched.includes(id)) return 'is-matched';
    if (wrongPair && wrongPair[side] === id) return 'is-wrong';
    if ((side === 'left' ? left : right) === id) return 'is-selected';
    return '';
  };

  const busy = Boolean(wrongPair);

  return (
    <div className="question">
      <p className="question__kind">Matching round</p>
      <h2 className="question__text question__text--sm">Match each Tagalog phrase with its meaning.</h2>

      <div className="match">
        <ul className="match__col" aria-label="Tagalog phrases">
          {pairs.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                lang="tl"
                className={`match__item ${cls('left', p.id)}`}
                aria-pressed={left === p.id}
                disabled={matched.includes(p.id) || busy}
                onClick={() => setLeft(left === p.id ? null : p.id)}
              >
                {p.tagalog}
                {matched.includes(p.id) && <Icon name="check" size={16} className="match__check" />}
              </button>
            </li>
          ))}
        </ul>
        <ul className="match__col" aria-label="English meanings">
          {rightOrder.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`match__item match__item--en ${cls('right', p.id)}`}
                aria-pressed={right === p.id}
                disabled={matched.includes(p.id) || busy}
                onClick={() => setRight(right === p.id ? null : p.id)}
              >
                {p.english}
                {matched.includes(p.id) && <Icon name="check" size={16} className="match__check" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {done && (
        <div className={`feedback ${mistakes.length === 0 ? 'feedback--good' : 'feedback--ok'}`}>
          <p className="feedback__title">
            {mistakes.length === 0
              ? 'Perfect matching! 🎉'
              : `All matched — ${pairs.length - mistakes.length} of ${pairs.length} on the first try.`}
          </p>
          <button ref={nextRef} type="button" className="btn btn--primary" onClick={onNext}>
            {isLast ? 'See results' : 'Next question'} <Icon name="arrow" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
