import { useState } from 'react';
import { PHRASES } from '../data/phrases.js';
import { CONVERSATIONS } from '../data/conversations.js';
import { REGISTERS } from '../data/categories.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { useSpeech } from '../context/SpeechContext.jsx';
import { useRecordings } from '../context/RecordingsContext.jsx';
import Pronunciation from '../components/Pronunciation.jsx';
import AudioControls from '../components/AudioControls.jsx';
import { phraseKey } from '../lib/recordings.js';
import RegisterTag from '../components/RegisterTag.jsx';

const VOWELS = [
  ['a', 'ah', 'like “father”'],
  ['e', 'eh', 'like “bed”'],
  ['i', 'ee', 'like “see” (shorter)'],
  ['o', 'oh', 'like “go” (shorter, no “w” glide)'],
  ['u', 'oo', 'like “food” (shorter)'],
];

function AudioSettings() {
  const { supported, tagalogVoice, fallbackVoice, voicesLoaded, generatedCount } = useSpeech();
  const { progress, setStandInVoice } = useProgress();
  const rec = useRecordings();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <>
      <h3 className="panel__h3">🎤 Family recordings (recommended)</h3>
      <p>
        Computer voices can’t reproduce a real Filipino accent. The best audio is a family member’s voice. On any
        phrase or conversation line, tap <strong>Record</strong>, have Nanay, Lola, or a cousin say it, then tap stop.
        The <strong>♥ Family</strong> button plays it back from then on.
      </p>
      {rec.supported ? (
        <p className="muted">
          You have <strong>{rec.count}</strong> recording{rec.count === 1 ? '' : 's'}. Recordings stay in this browser on
          this device. They’re never uploaded, and clearing site data deletes them.
        </p>
      ) : (
        <p className="notice">This browser can’t record audio. Try a recent Chrome, Edge, Firefox, or Safari.</p>
      )}
      {rec.count > 0 &&
        (!confirmClear ? (
          <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setConfirmClear(true)}>
            Delete all recordings…
          </button>
        ) : (
          <div className="btn-row" role="group" aria-label="Confirm deleting recordings">
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => {
                rec.removeAll();
                setConfirmClear(false);
              }}
            >
              Yes, delete all {rec.count}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmClear(false)} autoFocus>
              Cancel
            </button>
          </div>
        ))}

      <h3 className="panel__h3">🔊 Tagalog computer voice</h3>
      <p>
        When there’s no family recording, <strong>Listen</strong> plays audio generated with{' '}
        <a href="https://huggingface.co/facebook/mms-tts-tgl" target="_blank" rel="noreferrer">
          Meta’s MMS Tagalog model
        </a>
        , a free, open-source voice trained on Tagalog speech ({generatedCount} clips included). Each clip was generated
        several times and a speech recognizer picked the clearest take. Clips that stayed unclear were left out, so
        those phrases have no Listen button. Very short words are spoken inside a short phrase (shown as “Audio
        says”), because the model garbles single words. It’s still synthetic: questions don’t rise at the end, and
        stress may be off. Compare it with the written guide, and trust your family over it.
      </p>
      <p className="muted">
        Model: MMS-TTS (Pratap et al., Meta AI), licensed CC-BY-NC 4.0 for non-commercial use. To regenerate after
        editing phrases, see the README.
      </p>

      <h3 className="panel__h3">💻 Device voice (last resort)</h3>
      {!supported ? (
        <p className="muted">This browser doesn’t support text-to-speech.</p>
      ) : tagalogVoice ? (
        <p className="notice notice--good">
          Filipino device voice found: <strong>{tagalogVoice.name}</strong> ({tagalogVoice.lang}). It’s used only for
          text that has no recording or generated audio.
        </p>
      ) : (
        <div className="notice">
          <p>
            This device has no Filipino voice{voicesLoaded ? '' : ' (yet)'}. That only matters for text without
            generated audio, since a non-Filipino voice reads Tagalog with the wrong sounds.
          </p>
          <label className="switch switch--block">
            <input
              type="checkbox"
              checked={Boolean(progress.standInVoice)}
              onChange={(e) => setStandInVoice(e.target.checked)}
            />
            <span>
              Use a stand-in voice for that text anyway
              {fallbackVoice ? ` (${fallbackVoice.name}, ${fallbackVoice.lang})` : ' (default voice)'}. The accent will be
              wrong.
            </span>
          </label>
        </div>
      )}
    </>
  );
}

export default function GuidePage() {
  const flagged = PHRASES.filter((p) => p.verify).length + CONVERSATIONS.flatMap((c) => c.lines).filter((l) => l.verify).length;

  return (
    <div className="guide">
      <header className="page-head">
        <h1 className="page-title">Guide</h1>
        <p className="page-sub">How to read pronunciations, audio options, and how the content was made.</p>
      </header>

      <section className="panel" aria-labelledby="pron-title">
        <h2 id="pron-title">Reading the pronunciation guides</h2>
        <p>
          Guides are written for English speakers. Syllables are split with dashes and the{' '}
          <strong>STRESSED</strong> syllable is in capitals (and bold):
        </p>
        <p className="guide-example">
          <span lang="tl">Kumusta ka?</span> → <Pronunciation text="koo-MOOS-tah kah" className="pron--lg" />
          <AudioControls text="Kumusta ka?" audioKey={phraseKey('kumusta-ka')} compact />
        </p>
        <table className="vowel-table">
          <caption>Tagalog vowels are short and steady</caption>
          <thead>
            <tr>
              <th scope="col">Letter</th>
              <th scope="col">Written as</th>
              <th scope="col">Sounds like</th>
            </tr>
          </thead>
          <tbody>
            {VOWELS.map(([l, g, s]) => (
              <tr key={l}>
                <td>
                  <strong>{l}</strong>
                </td>
                <td>{g}</td>
                <td>{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="tips-list">
          <li>
            <strong>ng</strong> is one sound, like the end of “si<strong>ng</strong>” — even at the start of a word (
            <span lang="tl">ngayon</span> = <em>ngah-YOHN</em>). Practice it by saying “singing” and stopping before the last “-ing”.
          </li>
          <li>
            The small word <strong lang="tl">ng</strong> (“of”) is pronounced <em>nahng</em>, and <strong lang="tl">mga</strong> (plural marker) is <em>mah-NGAH</em>.
          </li>
          <li>
            Some words end in a quick catch in the throat (a <em>glottal stop</em>), like the break in “uh-oh” — e.g.{' '}
            <span lang="tl">hindi</span>. Guides don’t always show this, so listen to family.
          </li>
          <li>
            <strong>Stress changes meaning</strong> in Tagalog (<span lang="tl">BU-kas</span> “open” vs. <span lang="tl">bu-KAS</span>{' '}
            “tomorrow”), so the capitals matter.
          </li>
          <li>
            <strong lang="tl">Po</strong> and <strong lang="tl">opo</strong> add respect. Use them with parents, grandparents, and
            anyone older.
          </li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="voice-title">
        <h2 id="voice-title">Audio</h2>
        <AudioSettings />
      </section>

      <section className="panel" aria-labelledby="labels-title">
        <h2 id="labels-title">Phrase labels</h2>
        <dl className="labels">
          {Object.entries(REGISTERS).map(([id, r]) => (
            <div key={id}>
              <dt>
                <RegisterTag register={id} />
              </dt>
              <dd>{r.hint}</dd>
            </div>
          ))}
          <div>
            <dt>
              <span className="tag tag--verify">⚑ Check with family</span>
            </dt>
            <dd>Something (usually stress placement) that should be double-checked with a native speaker.</dd>
          </div>
        </dl>
      </section>

      <section className="panel" aria-labelledby="accuracy-title">
        <h2 id="accuracy-title">About the content</h2>
        <p>
          The phrases were chosen for everyday family life and written to sound natural rather than textbook-formal.
          They have <strong>not</strong> been reviewed by a native speaker yet. {flagged} item{flagged === 1 ? ' is' : 's are'}{' '}
          flagged “Check with family.” Tagalog also varies by region and family — if your relatives say something
          differently, <em>their</em> way is the one to learn.
        </p>
        <p>
          Usap Tayo can help you build a foundation, but it won’t make you fluent on its own. Use it to get ready for
          real conversations, then go have them.
        </p>
      </section>

      <p className="muted">
        Looking for your name, daily goal, or reset? They’re on your <a href="#/profile">Profile</a>.
      </p>
    </div>
  );
}
