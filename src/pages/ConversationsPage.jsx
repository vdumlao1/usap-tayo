import { CONVERSATIONS } from '../data/conversations.js';
import { useProgress } from '../context/ProgressContext.jsx';
import Icon from '../components/Icon.jsx';

export default function ConversationsPage() {
  const { progress } = useProgress();
  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Family Conversations</h1>
        <p className="page-sub">
          Short, real-life dialogues. English is hidden at first — read each line, guess the meaning, then reveal.
        </p>
      </header>

      <ul className="convo-grid">
        {CONVERSATIONS.map((c) => {
          const done = progress.conversations[c.id];
          return (
            <li key={c.id}>
              <a className="convo-card" href={`#/talk/${c.id}`}>
                <span className="convo-card__emoji" aria-hidden="true">
                  {c.emoji}
                </span>
                <span className="convo-card__body">
                  <span className="convo-card__title">{c.title}</span>
                  <span className="convo-card__setting">{c.setting}</span>
                  <span className="convo-card__meta">
                    {c.lines.length} lines
                    {done && (
                      <span className="tag tag--status-known">
                        <Icon name="check" size={12} /> Practiced
                      </span>
                    )}
                  </span>
                </span>
                <Icon name="right" size={20} className="convo-card__arrow" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
