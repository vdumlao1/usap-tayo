import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon.jsx';
import Pronunciation from '../Pronunciation.jsx';
import AudioControls from '../AudioControls.jsx';
import { phraseKey } from '../../lib/recordings.js';

/*
  One multiple-choice question.
  kind 'tl-en': prompt is Tagalog, options are English meanings.
  kind 'en-tl': prompt is English, options are Tagalog phrases.
*/
export default function MultipleChoice({ question, onAnswer, onNext, isLast }) {
  const { kind, phrase, options } = question;
  const [chosen, setChosen] = useState(null);
  const nextRef = useRef(null);
  const answered = chosen !== null;
  const correct = chosen?.id === phrase.id;

  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  const choose = (option) => {
    if (answered) return;
    setChosen(option);
    onAnswer(option.id === phrase.id, option);
  };

  const label = (p) => (kind === 'tl-en' ? p.english : p.tagalog);

  return (
    <div className="question">
      <p className="question__kind">{kind === 'tl-en' ? 'What does this mean?' : 'How do you say this in Tagalog?'}</p>
      <div className="question__prompt">
        {kind === 'tl-en' ? (
          <>
            <h2 className="question__text" lang="tl">
              {phrase.tagalog}
            </h2>
            <AudioControls text={phrase.spoken ?? phrase.tagalog} label={phrase.tagalog} audioKey={phraseKey(phrase.id)} compact />
          </>
        ) : (
          <h2 className="question__text">“{phrase.english}”</h2>
        )}
      </div>

      <ul className="options" aria-label="Answer choices">
        {options.map((o, i) => {
          let state = '';
          if (answered && o.id === phrase.id) state = 'is-correct';
          else if (answered && o.id === chosen.id) state = 'is-wrong';
          return (
            <li key={o.id}>
              <button
                type="button"
                className={`option ${state}`}
                onClick={() => choose(o)}
                disabled={answered && !state}
                aria-disabled={answered}
                lang={kind === 'en-tl' ? 'tl' : undefined}
              >
                <span className="option__letter" aria-hidden="true">
                  {'ABCD'[i]}
                </span>
                <span className="option__text">{label(o)}</span>
                {state === 'is-correct' && <Icon name="check" size={20} className="option__mark" />}
                {state === 'is-wrong' && <Icon name="x" size={20} className="option__mark" />}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="feedback-slot" aria-live="assertive">
        {answered && (
          <div className={`feedback ${correct ? 'feedback--good' : 'feedback--bad'}`}>
            <p className="feedback__title">
              {correct ? 'Tama! Correct!' : 'Not quite.'}{' '}
              {!correct && (
                <span>
                  The answer is <strong lang={kind === 'en-tl' ? 'tl' : undefined}>“{label(phrase).replace(/\.$/, '')}”</strong>.
                </span>
              )}
            </p>
            <p className="feedback__detail">
              <span lang="tl">
                <strong>{phrase.tagalog}</strong>
              </span>{' '}
              — {phrase.english} · <Pronunciation text={phrase.pronunciation} />
            </p>
            <button ref={nextRef} type="button" className="btn btn--primary" onClick={onNext}>
              {isLast ? 'See results' : 'Next question'} <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
