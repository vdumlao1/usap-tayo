import { useState } from 'react';
import { getConversation } from '../data/conversations.js';
import { getPhrase } from '../data/phrases.js';
import { useProgress } from '../context/ProgressContext.jsx';
import Icon from '../components/Icon.jsx';
import Pronunciation from '../components/Pronunciation.jsx';
import AudioControls from '../components/AudioControls.jsx';
import { lineKey } from '../lib/recordings.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function ConversationDetail({ id }) {
  const convo = getConversation(id);
  const { progress, finishConversation } = useProgress();
  const [revealed, setRevealed] = useState(() => new Set());
  const [showPron, setShowPron] = useState(true);

  if (!convo) return <NotFoundPage />;

  const toggle = (i) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const revealNext = () => {
    const i = convo.lines.findIndex((_, idx) => !revealed.has(idx));
    if (i !== -1) toggle(i);
  };
  const allRevealed = revealed.size === convo.lines.length;
  const lastDone = progress.conversations[convo.id];

  return (
    <div className="convo">
      <a href="#/talk" className="back-link">
        <Icon name="left" size={18} /> All conversations
      </a>

      <header className="page-head">
        <h1 className="page-title">
          <span aria-hidden="true">{convo.emoji}</span> {convo.title}
        </h1>
        <p className="page-sub">{convo.setting}</p>
      </header>

      <div className="convo__toolbar" role="group" aria-label="Conversation controls">
        <button type="button" className="btn btn--primary btn--sm" onClick={revealNext} disabled={allRevealed}>
          <Icon name="eye" size={16} /> Reveal next
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setRevealed(allRevealed ? new Set() : new Set(convo.lines.map((_, i) => i)))}
        >
          {allRevealed ? 'Hide all English' : 'Show all English'}
        </button>
        <label className="switch">
          <input type="checkbox" checked={showPron} onChange={(e) => setShowPron(e.target.checked)} />
          <span>Pronunciation</span>
        </label>
      </div>

      <ol className="dialogue">
        {convo.lines.map((line, i) => {
          const mine = line.speaker === 'You';
          const isOpen = revealed.has(i);
          return (
            <li key={i} className={`line ${mine ? 'line--me' : ''}`}>
              <span className="line__speaker">{mine ? 'You' : line.speaker}</span>
              <div className="line__bubble">
                <div className="line__row">
                  <p className="line__tl" lang="tl">
                    {line.tagalog}
                  </p>
                  <AudioControls text={line.tagalog} audioKey={lineKey(convo.id, i)} recordable compact />
                </div>
                {showPron && <Pronunciation text={line.pronunciation} className="line__pron" />}
                {line.verify && <p className="verify-note verify-note--sm">⚑ {line.verify}</p>}
                <button
                  type="button"
                  className="line__toggle"
                  aria-expanded={isOpen}
                  aria-controls={`tr-${i}`}
                  onClick={() => toggle(i)}
                >
                  {isOpen ? 'Hide English' : 'Reveal English'}
                </button>
                <p id={`tr-${i}`} className="line__en" hidden={!isOpen}>
                  {line.english}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {convo.note && (
        <aside className="tip" aria-label="Tip">
          <p className="tip__title">💡 Tip</p>
          <p>{convo.note}</p>
        </aside>
      )}

      {convo.keyPhrases?.length > 0 && (
        <section className="section" aria-labelledby="key-title">
          <h2 id="key-title" className="section__title">
            Key phrases in this conversation
          </h2>
          <ul className="key-phrases">
            {convo.keyPhrases.map(getPhrase).filter(Boolean).map((p) => (
              <li key={p.id}>
                <a href={`#/phrases?q=${encodeURIComponent(p.tagalog.replace(/_+/g, '').trim())}`} className="key-phrase">
                  <span lang="tl" className="key-phrase__tl">
                    {p.tagalog}
                  </span>
                  <span className="key-phrase__en">{p.english}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="convo__done">
        <button type="button" className="btn btn--primary btn--lg" onClick={() => finishConversation(convo.id)}>
          <Icon name="check" size={18} /> I practiced this {lastDone ? 'again' : ''}
        </button>
        <p className="muted" role="status">
          {lastDone
            ? `Last practiced ${new Date(lastDone).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}. Try reading your lines out loud!`
            : 'Tip: read your lines out loud — or even better, try them with a family member.'}
        </p>
      </div>
    </div>
  );
}
