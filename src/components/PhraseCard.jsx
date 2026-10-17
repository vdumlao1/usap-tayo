import { getCategory } from '../data/categories.js';
import Pronunciation from './Pronunciation.jsx';
import RegisterTag from './RegisterTag.jsx';
import AudioControls from './AudioControls.jsx';
import { phraseKey } from '../lib/recordings.js';
import StatusButtons from './StatusButtons.jsx';
import Icon from './Icon.jsx';
import YourVersion from './YourVersion.jsx';

/* One phrase in the Library / Review lists. */
export default function PhraseCard({ phrase, showCategory = true }) {
  const category = getCategory(phrase.category);
  return (
    <article className="phrase-card" aria-labelledby={`ph-${phrase.id}`}>
      <div className="phrase-card__top">
        <div className="phrase-card__tags">
          {showCategory && category && (
            <span className="tag tag--category">
              <span aria-hidden="true">{category.emoji}</span> {category.label}
            </span>
          )}
          <RegisterTag register={phrase.register} />
          {phrase.verify && (
            <span className="tag tag--verify" title={phrase.verify}>
              <Icon name="flag" size={12} /> Check with family
            </span>
          )}
        </div>
      </div>

      <div className="phrase-card__head">
        <h3 id={`ph-${phrase.id}`} className="phrase-card__tl" lang="tl">
          {phrase.tagalog}
        </h3>
        <AudioControls
          text={phrase.spoken ?? phrase.tagalog}
          label={phrase.tagalog}
          audioKey={phraseKey(phrase.id)}
          recordable
          compact
        />
      </div>
      <Pronunciation text={phrase.pronunciation} />
      {phrase.spoken && (
        <p className="audio-says">
          Audio says: <span lang="tl">“{phrase.spoken}”</span>
        </p>
      )}
      <p className="phrase-card__en">{phrase.english}</p>
      <YourVersion phrase={phrase} />
      {phrase.literal && (
        <p className="phrase-card__literal">
          <span className="muted">Literally:</span> {phrase.literal}
        </p>
      )}

      <details className="phrase-card__more">
        <summary>Example &amp; when to use it</summary>
        <div className="example">
          <p lang="tl" className="example__tl">
            {phrase.example.tagalog}
          </p>
          <p className="example__en">{phrase.example.english}</p>
        </div>
        <p className="phrase-card__usage">{phrase.usage}</p>
        {phrase.verify && (
          <p className="verify-note">
            <Icon name="flag" size={14} /> {phrase.verify}
          </p>
        )}
      </details>

      <StatusButtons phraseId={phrase.id} phraseLabel={phrase.tagalog} />
    </article>
  );
}
