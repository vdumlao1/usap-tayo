import { useCallback, useMemo, useState } from 'react';
import { PHRASES } from '../data/phrases.js';
import { CATEGORIES, getCategory } from '../data/categories.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { buildQuiz, totalPoints, QUIZ_TYPES, MIN_MATCH_POOL } from '../lib/quiz.js';
import { idsWithStatus } from '../lib/progress.js';
import MultipleChoice from '../components/quiz/MultipleChoice.jsx';
import MatchRound from '../components/quiz/MatchRound.jsx';
import Pronunciation from '../components/Pronunciation.jsx';
import Icon from '../components/Icon.jsx';

const QUESTION_COUNT = 10;

function poolFor(topic, statusOf) {
  if (topic === 'all') return PHRASES;
  if (topic === 'review') return PHRASES.filter((p) => statusOf(p.id) === 'review');
  return PHRASES.filter((p) => p.category === topic);
}

function topicLabel(topic) {
  if (topic === 'all') return 'All phrases';
  if (topic === 'review') return 'Needs review';
  return getCategory(topic)?.label ?? topic;
}

function resultMessage(pct) {
  if (pct === 100) return 'Perpekto! A perfect score!';
  if (pct >= 80) return 'Ang galing! Excellent work.';
  if (pct >= 50) return 'Magaling — good progress. Review the misses and try again.';
  return 'Kaya mo ’yan — you can do it! Every miss is now on your review list.';
}

export default function QuizPage({ params }) {
  const { progress, statusOf, practice, finishQuiz } = useProgress();
  const [phase, setPhase] = useState('setup'); // 'setup' | 'play' | 'done'
  const [type, setType] = useState('mixed');
  const [topic, setTopic] = useState(params.get('topic') ?? 'all');
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]); // [{ phrase, kind, chosen? }]

  const pool = useMemo(() => poolFor(topic, statusOf), [topic, statusOf]);
  const minPool = type === 'match' ? MIN_MATCH_POOL : 1;
  const canStart = pool.length >= minPool;
  const reviewCount = idsWithStatus(progress, 'review').length;

  const start = () => {
    setQuestions(buildQuiz(pool, PHRASES, { type, count: QUESTION_COUNT }));
    setQIndex(0);
    setScore(0);
    setMissed([]);
    setPhase('play');
  };

  const total = totalPoints(questions);
  const current = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  const next = () => {
    if (!isLast) {
      setQIndex((i) => i + 1);
      return;
    }
    finishQuiz({
      score,
      total,
      type,
      missed: [...new Set(missed.map((m) => m.phrase.id))],
    });
    setPhase('done');
  };

  const onMcAnswer = (correct, chosen) => {
    practice(current.phrase.id);
    if (correct) setScore((s) => s + 1);
    else setMissed((m) => [...m, { phrase: current.phrase, kind: current.kind, chosen }]);
  };

  const onMatchComplete = useCallback(
    ({ points, missed: missedPhrases }) => {
      setScore((s) => s + points);
      setMissed((m) => [...m, ...missedPhrases.map((phrase) => ({ phrase, kind: 'match' }))]);
      // Count each phrase in the round as practiced.
      for (const p of questions[qIndex].pairs) practice(p.id);
    },
    [questions, qIndex, practice],
  );

  // ───────────── Setup screen ─────────────
  if (phase === 'setup') {
    const recent = progress.quizzes.slice(0, 5);
    return (
      <div>
        <header className="page-head">
          <h1 className="page-title">Quiz</h1>
          <p className="page-sub">Test yourself. Missed phrases are added to your Review list automatically.</p>
        </header>

        <div className="quiz-setup">
          <fieldset className="fieldset">
            <legend>Question type</legend>
            <div className="type-grid">
              {QUIZ_TYPES.map((t) => (
                <label key={t.id} className={`type-card ${type === t.id ? 'is-on' : ''}`}>
                  <input type="radio" name="quiz-type" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} />
                  <span className="type-card__title">{t.label}</span>
                  <span className="type-card__text">{t.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="quiz-topic" className="field-label">
              Phrases to quiz
            </label>
            <select id="quiz-topic" className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="all">All phrases ({PHRASES.length})</option>
              <option value="review">Needs review ({reviewCount})</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({PHRASES.filter((p) => p.category === c.id).length})
                </option>
              ))}
            </select>
          </div>

          {!canStart && (
            <p className="notice" role="status">
              {topic === 'review'
                ? 'Your review list is empty — nice! Pick another set of phrases.'
                : `This needs at least ${minPool} phrases. Pick a bigger set.`}
            </p>
          )}

          <button type="button" className="btn btn--primary btn--lg" onClick={start} disabled={!canStart}>
            Start quiz <Icon name="arrow" size={18} />
          </button>
        </div>

        {recent.length > 0 && (
          <section className="section" aria-labelledby="recent-title">
            <h2 id="recent-title" className="section__title">
              Recent results
            </h2>
            <ul className="history">
              {recent.map((q) => (
                <li key={q.date} className="history__item">
                  <span className="history__score">
                    {q.score}/{q.total}
                  </span>
                  <span>{QUIZ_TYPES.find((t) => t.id === q.type)?.label ?? q.type}</span>
                  <span className="muted">
                    {new Date(q.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // ───────────── Results screen ─────────────
  if (phase === 'done') {
    const pct = total ? Math.round((score / total) * 100) : 0;
    return (
      <div>
        <section className="results" aria-labelledby="results-title">
          <p className="results__label">{topicLabel(topic)} · {QUIZ_TYPES.find((t) => t.id === type)?.label}</p>
          <h1 id="results-title" className="results__score">
            {score}
            <span>/{total}</span>
          </h1>
          <p className="results__pct">{pct}%</p>
          <p className="results__msg">{resultMessage(pct)}</p>
          <div className="btn-row btn-row--center">
            <button type="button" className="btn btn--primary" onClick={start}>
              Try again
            </button>
            {missed.length > 0 && (
              <a className="btn btn--ghost" href="#/cards?deck=review">
                Study missed phrases
              </a>
            )}
            <button type="button" className="btn btn--ghost" onClick={() => setPhase('setup')}>
              New quiz
            </button>
          </div>
        </section>

        {missed.length > 0 && (
          <section className="section" aria-labelledby="missed-title">
            <h2 id="missed-title" className="section__title">
              Review what you missed
            </h2>
            <p className="muted">These have been added to your Review list.</p>
            <ul className="missed">
              {missed.map((m, i) => (
                <li key={`${m.phrase.id}-${i}`} className="missed__item">
                  <p className="missed__tl" lang="tl">
                    {m.phrase.tagalog}
                  </p>
                  <p className="missed__en">{m.phrase.english}</p>
                  <Pronunciation text={m.phrase.pronunciation} />
                  {m.chosen && (
                    <p className="missed__chosen">
                      You chose: <span lang={m.kind === 'en-tl' ? 'tl' : undefined}>“{m.kind === 'en-tl' ? m.chosen.tagalog : m.chosen.english}”</span>
                    </p>
                  )}
                  {m.kind === 'match' && <p className="missed__chosen">Mismatched in the matching round</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // ───────────── Playing ─────────────
  return (
    <div className="quiz">
      <div className="quiz__top">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPhase('setup')}>
          <Icon name="x" size={16} /> Quit
        </button>
        <span>
          Question <strong>{qIndex + 1}</strong> of {questions.length}
        </span>
        <span className="quiz__score" aria-label={`Score: ${score}`}>
          <Icon name="star" size={16} /> {score}
        </span>
      </div>
      <div className="bar bar--thin" aria-hidden="true">
        <span style={{ width: `${(qIndex / questions.length) * 100}%` }} />
      </div>

      <div className="quiz__card" key={qIndex}>
        {current.kind === 'match' ? (
          <MatchRound question={current} onComplete={onMatchComplete} onNext={next} isLast={isLast} />
        ) : (
          <MultipleChoice question={current} onAnswer={onMcAnswer} onNext={next} isLast={isLast} />
        )}
      </div>
    </div>
  );
}
