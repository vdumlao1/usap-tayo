import { useMemo, useState } from 'react';
import { PHRASES } from '../data/phrases.js';
import { CATEGORIES } from '../data/categories.js';
import { filterPhrases } from '../lib/search.js';
import { useProgress } from '../context/ProgressContext.jsx';
import PhraseCard from '../components/PhraseCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'Not marked' },
  { id: 'review', label: 'Review' },
  { id: 'known', label: 'Known' },
];

export default function LibraryPage({ params }) {
  const { statusOf } = useProgress();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [status, setStatus] = useState('all');

  const results = useMemo(
    () => filterPhrases(PHRASES, { query, category, status }, statusOf),
    [query, category, status, statusOf],
  );

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStatus('all');
  };

  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Phrase Library</h1>
        <p className="page-sub">
          {PHRASES.length} everyday phrases for talking with family. Tap <strong>Example &amp; when to use it</strong> on
          any card for context.
        </p>
      </header>

      <div className="filters">
        <div className="filters__row">
          <div className="search">
            <Icon name="search" size={18} className="search__icon" />
            <label htmlFor="phrase-search" className="sr-only">
              Search phrases in Tagalog or English
            </label>
            <input
              id="phrase-search"
              type="search"
              placeholder="Search in Tagalog or English… e.g. “eat”, “salamat”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="topic-select">
            <label htmlFor="phrase-topic" className="sr-only">
              Topic
            </label>
            <select id="phrase-topic" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All topics ({PHRASES.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label} ({PHRASES.filter((p) => p.category === c.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="segmented" role="group" aria-label="Filter by progress">
          {STATUS_FILTERS.map((s) => (
            <button
              type="button"
              key={s.id}
              className={status === s.id ? 'is-on' : ''}
              aria-pressed={status === s.id}
              onClick={() => setStatus(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="results-count" role="status" aria-live="polite">
        Showing {results.length} of {PHRASES.length} phrases
      </p>

      {results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No phrases match"
          actions={
            <button type="button" className="btn btn--primary" onClick={clearFilters}>
              Clear filters
            </button>
          }
        >
          Try a different word, or search in English — e.g. “thank”, “hungry”, “sorry”.
        </EmptyState>
      ) : (
        <div className="phrase-grid">
          {results.map((p) => (
            <PhraseCard key={p.id} phrase={p} />
          ))}
        </div>
      )}
    </div>
  );
}
