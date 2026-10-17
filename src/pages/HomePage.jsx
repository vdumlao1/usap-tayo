import { PHRASES } from '../data/phrases.js';
import { CONVERSATIONS } from '../data/conversations.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { computeStreak, idsWithStatus, practicedCount, quizStats, todayCount, dateKey } from '../lib/progress.js';
import Icon from '../components/Icon.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import Pronunciation from '../components/Pronunciation.jsx';
import AudioControls from '../components/AudioControls.jsx';
import WelcomeCard from '../components/WelcomeCard.jsx';
import { phraseKey } from '../lib/recordings.js';

const MOTIVATION = [
  'Every phrase you learn is one more way to connect with your family.',
  'Hindi kailangang perpekto — it doesn’t have to be perfect. Just try!',
  'Your Lola won’t grade your grammar. She’ll just be happy you tried.',
  'Small daily practice beats one big cram session.',
  'Mistakes are proof you’re speaking. Keep going!',
  'Paunti-unti — little by little. That’s how every language is learned.',
  'Try one new phrase at dinner tonight.',
];

function timeGreeting(hour) {
  if (hour < 12) return { tl: 'Magandang umaga!', en: 'Good morning!' };
  if (hour < 18) return { tl: 'Magandang hapon!', en: 'Good afternoon!' };
  return { tl: 'Magandang gabi!', en: 'Good evening!' };
}

/** Same phrase all day, a different one tomorrow. */
function dailyIndex(length, offset = 0) {
  const key = dateKey().replaceAll('-', '');
  return (Number(key) + offset) % length;
}

const ACTIONS = [
  { to: '/phrases', icon: 'book', title: 'Phrase Library', text: `Browse ${PHRASES.length} practical phrases by topic.` },
  { to: '/cards', icon: 'cards', title: 'Flashcards', text: 'Recall first, then reveal. Mark what you know.' },
  { to: '/quiz', icon: 'quiz', title: 'Quiz', text: 'Multiple choice and matching with instant feedback.' },
  { to: '/talk', icon: 'chat', title: 'Family Conversations', text: `${CONVERSATIONS.length} real-life dialogues to practice.` },
  { to: '/review', icon: 'review', title: 'Review', text: 'Revisit the phrases you’re still learning.' },
  { to: '/guide', icon: 'help', title: 'Pronunciation Guide', text: 'How to read the guides, and voice settings.' },
];

export default function HomePage() {
  const { progress } = useProgress();
  const greeting = timeGreeting(new Date().getHours());
  const { name, learningFor, welcomed } = progress.profile;
  // Some days, remind you who you're learning for (if you told us).
  const motivation =
    learningFor && dailyIndex(2) === 0
      ? `Every phrase you learn is one more way to connect with ${learningFor}.`
      : MOTIVATION[dailyIndex(MOTIVATION.length)];
  const phraseOfDay = PHRASES[dailyIndex(PHRASES.length, 7)];

  const known = idsWithStatus(progress, 'known').length;
  const review = idsWithStatus(progress, 'review').length;
  const practiced = practicedCount(progress);
  const today = todayCount(progress);
  const goal = progress.dailyGoal;
  const streak = computeStreak(progress.activity);
  const quiz = quizStats(progress);
  const convosDone = Object.keys(progress.conversations).length;
  const isNew = practiced === 0 && quiz.taken === 0 && convosDone === 0;
  const knownPct = Math.round((known / PHRASES.length) * 100);

  return (
    <div className="home">
      {!welcomed && !name && <WelcomeCard />}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__text">
          <p className="hero__greeting">
            <span lang="tl">{name ? `${greeting.tl.slice(0, -1)}, ${name}!` : greeting.tl}</span>{' '}
            <span className="hero__greeting-en">{greeting.en}</span>
          </p>
          <h1 id="hero-title" className="hero__title">
            Usap Tayo
          </h1>
          <p className="hero__lede">{motivation}</p>
          <div className="hero__cta">
            <a className="btn btn--primary btn--lg" href={isNew ? '#/phrases' : review > 0 ? '#/cards?deck=review' : '#/cards'}>
              {isNew ? 'Start with the basics' : review > 0 ? `Practice ${review} tricky phrase${review === 1 ? '' : 's'}` : 'Continue with flashcards'}
              <Icon name="arrow" size={18} />
            </a>
            <a className="btn btn--ghost btn--lg" href="#/talk">
              Practice a conversation
            </a>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="bubble bubble--a" lang="tl">Kumain ka na?</div>
          <div className="bubble bubble--b">Opo, Lola! 😊</div>
          <div className="sun" />
        </div>
      </section>

      <section aria-labelledby="stats-title" className="section">
        <h2 id="stats-title" className="section__title">
          Your progress
        </h2>
        <div className="stats">
          <div className="stat stat--goal">
            <ProgressRing value={today} max={goal} label={`${today} of ${goal} practice actions today`} />
            <div>
              <p className="stat__label">Today’s goal</p>
              <p className="stat__value">{today >= goal ? 'Goal reached! 🎉' : `${goal - today} to go`}</p>
              <p className="stat__hint">Cards rated, questions answered &amp; conversations practiced.</p>
            </div>
          </div>
          <div className="stat">
            <Icon name="flame" size={26} className="stat__icon stat__icon--flame" />
            <p className="stat__big">{streak}</p>
            <p className="stat__label">day streak</p>
          </div>
          <div className="stat">
            <Icon name="star" size={26} className="stat__icon" />
            <p className="stat__big">
              {known}
              <span className="stat__of">/{PHRASES.length}</span>
            </p>
            <p className="stat__label">phrases known</p>
            <div className="bar" role="progressbar" aria-valuenow={knownPct} aria-valuemin={0} aria-valuemax={100} aria-label="Phrases known">
              <span style={{ width: `${knownPct}%` }} />
            </div>
            <p className="stat__hint">{practiced} practiced so far</p>
          </div>
          <a className="stat stat--link" href="#/review">
            <Icon name="review" size={26} className="stat__icon stat__icon--red" />
            <p className="stat__big">{review}</p>
            <p className="stat__label">to review</p>
          </a>
          <a className="stat stat--link" href="#/quiz">
            <Icon name="quiz" size={26} className="stat__icon" />
            <p className="stat__big">{quiz.taken ? `${quiz.average}%` : '—'}</p>
            <p className="stat__label">{quiz.taken ? `avg over ${quiz.taken} quiz${quiz.taken === 1 ? '' : 'zes'}` : 'no quizzes yet'}</p>
          </a>
        </div>
      </section>

      <section className="section potd" aria-labelledby="potd-title">
        <div className="potd__label" id="potd-title">
          Phrase of the day
        </div>
        <div className="potd__body">
          <div className="potd__main">
            <p className="potd__tl" lang="tl">
              {phraseOfDay.tagalog}
            </p>
            <Pronunciation text={phraseOfDay.pronunciation} />
            <p className="potd__en">{phraseOfDay.english}</p>
          </div>
          <AudioControls
            text={phraseOfDay.spoken ?? phraseOfDay.tagalog}
            label={phraseOfDay.tagalog}
            audioKey={phraseKey(phraseOfDay.id)}
            recordable
          />
        </div>
        <p className="potd__usage">{phraseOfDay.usage}</p>
      </section>

      <section aria-labelledby="actions-title" className="section">
        <h2 id="actions-title" className="section__title">
          What would you like to practice?
        </h2>
        <ul className="actions">
          {ACTIONS.map((a) => (
            <li key={a.to}>
              <a className="action" href={`#${a.to}`}>
                <span className="action__icon">
                  <Icon name={a.icon} size={22} />
                </span>
                <span className="action__title">{a.title}</span>
                <span className="action__text">{a.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
