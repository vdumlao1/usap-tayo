import { useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { MAX_NAME_LENGTH } from '../lib/progress.js';

/* Shown on Home until you save a name or choose "Maybe later". */
export default function WelcomeCard() {
  const { updateProfile } = useProgress();
  const [name, setName] = useState('');

  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome__emoji" aria-hidden="true">
        👋
      </div>
      <div className="welcome__body">
        <h2 id="welcome-title" className="welcome__title">
          Maligayang pagdating! <span className="welcome__en">Welcome!</span>
        </h2>
        <p className="muted">What should Usap Tayo call you? You can change this anytime on your Profile.</p>
        <form
          className="welcome__form"
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile({ name, welcomed: true });
          }}
        >
          <label htmlFor="welcome-name" className="sr-only">
            Your name
          </label>
          <input
            id="welcome-name"
            className="input"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="given-name"
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
            Save
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => updateProfile({ welcomed: true })}>
            Maybe later
          </button>
        </form>
      </div>
    </section>
  );
}
