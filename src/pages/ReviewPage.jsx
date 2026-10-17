import { PHRASES } from '../data/phrases.js';
import { useProgress } from '../context/ProgressContext.jsx';
import PhraseCard from '../components/PhraseCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

export default function ReviewPage() {
  const { statusOf } = useProgress();
  const review = PHRASES.filter((p) => statusOf(p.id) === 'review');
  const known = PHRASES.filter((p) => statusOf(p.id) === 'known');

  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Review</h1>
        <p className="page-sub">
          Phrases you marked “still learning” or missed in a quiz. Mark them <strong>Known</strong> once they stick.
        </p>
      </header>

      {review.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="Your review list is empty"
          actions={
            <>
              <a className="btn btn--primary" href="#/cards">
                Study flashcards
              </a>
              <a className="btn btn--ghost" href="#/quiz">
                Take a quiz
              </a>
            </>
          }
        >
          When a phrase feels tricky, mark it “Review” and it will wait for you here.
        </EmptyState>
      ) : (
        <>
          <div className="btn-row review-actions">
            <a className="btn btn--primary" href="#/cards?deck=review">
              <Icon name="cards" size={18} /> Flashcards ({review.length})
            </a>
            <a className="btn btn--ghost" href="#/quiz?topic=review">
              <Icon name="quiz" size={18} /> Quiz me on these
            </a>
          </div>
          <div className="phrase-grid">
            {review.map((p) => (
              <PhraseCard key={p.id} phrase={p} />
            ))}
          </div>
        </>
      )}

      {known.length > 0 && (
        <details className="known-list section">
          <summary>
            <span className="section__title">Known phrases ({known.length})</span>
          </summary>
          <div className="phrase-grid">
            {known.map((p) => (
              <PhraseCard key={p.id} phrase={p} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
