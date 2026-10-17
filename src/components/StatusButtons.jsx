import { useProgress } from '../context/ProgressContext.jsx';
import Icon from './Icon.jsx';

/* Toggle a phrase between "Known", "Review", and no status. */
export default function StatusButtons({ phraseId, phraseLabel }) {
  const { statusOf, markStatus } = useProgress();
  const status = statusOf(phraseId);
  const toggle = (s) => markStatus(phraseId, status === s ? null : s);

  return (
    <div className="status-btns" role="group" aria-label={`Progress for ${phraseLabel}`}>
      <button
        type="button"
        className={`chip-btn chip-btn--review ${status === 'review' ? 'is-on' : ''}`}
        aria-pressed={status === 'review'}
        onClick={() => toggle('review')}
      >
        <Icon name="review" size={16} /> Review
      </button>
      <button
        type="button"
        className={`chip-btn chip-btn--known ${status === 'known' ? 'is-on' : ''}`}
        aria-pressed={status === 'known'}
        onClick={() => toggle('known')}
      >
        <Icon name="check" size={16} /> Known
      </button>
    </div>
  );
}
