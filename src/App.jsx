import { useEffect, useRef } from 'react';
import { useHashRoute } from './hooks/useHashRoute.js';
import { useProgress } from './context/ProgressContext.jsx';
import Icon from './components/Icon.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import HomePage from './pages/HomePage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import FlashcardsPage from './pages/FlashcardsPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ConversationsPage from './pages/ConversationsPage.jsx';
import ConversationDetail from './pages/ConversationDetail.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import GuidePage from './pages/GuidePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Avatar from './components/Avatar.jsx';

const NAV = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/phrases', label: 'Phrases', icon: 'book' },
  { to: '/cards', label: 'Cards', icon: 'cards' },
  { to: '/quiz', label: 'Quiz', icon: 'quiz' },
  { to: '/talk', label: 'Talk', icon: 'chat' },
  { to: '/review', label: 'Review', icon: 'review' },
];

const TITLES = {
  '': 'Home',
  phrases: 'Phrases',
  cards: 'Flashcards',
  quiz: 'Quiz',
  talk: 'Conversations',
  review: 'Review',
  guide: 'Guide',
  profile: 'Profile',
};

/* Picks which page to show for the current hash route. */
function renderPage(route) {
  const [first = '', second] = route.segments;
  switch (first) {
    case '':
      return <HomePage />;
    case 'phrases':
      return <LibraryPage params={route.params} />;
    case 'cards':
      return <FlashcardsPage params={route.params} />;
    case 'quiz':
      return <QuizPage params={route.params} />;
    case 'talk':
      return second ? <ConversationDetail id={second} /> : <ConversationsPage />;
    case 'review':
      return <ReviewPage />;
    case 'guide':
      return <GuidePage />;
    case 'profile':
      return <ProfilePage />;
    default:
      return <NotFoundPage />;
  }
}

export default function App() {
  const route = useHashRoute();
  const { saveFailed, progress } = useProgress();
  const profileName = progress.profile.name;
  const mainRef = useRef(null);
  const section = route.segments[0] ?? '';
  const isFirstRender = useRef(true);

  // On page change: update the tab title, scroll to top, and move keyboard /
  // screen-reader focus to the main content (like a real page load would).
  useEffect(() => {
    document.title = `${TITLES[section] ?? 'Not found'} · Usap Tayo`;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [route.path, section]);

  const skipToMain = (e) => {
    e.preventDefault(); // don't change the hash — the router uses it
    mainRef.current?.focus();
  };

  return (
    <div className="app">
      <a href="#main" className="skip-link" onClick={skipToMain}>
        Skip to main content
      </a>

      <header className="topbar">
        <div className="topbar__inner">
          <a href="#/" className="brand" aria-label="Usap Tayo home">
            <span className="brand__mark" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="34" height="34">
                <rect width="64" height="64" rx="16" fill="currentColor" />
                <path d="M14 20a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H28l-9 8v-8.6A8 8 0 0 1 14 34z" fill="#FBF6EC" />
                <circle cx="32" cy="27" r="6" fill="#E8A317" />
                <circle cx="24" cy="27" r="2" fill="#B42318" />
                <circle cx="40" cy="27" r="2" fill="#B42318" />
              </svg>
            </span>
            <span className="brand__text">
              <span className="brand__name">Usap Tayo</span>
              <span className="brand__sub">Let’s talk</span>
            </span>
          </a>

          <nav className="nav" aria-label="Main">
            <ul className="nav__list">
              {NAV.map((item) => {
                const active = item.to === '/' ? section === '' : `/${section}` === item.to;
                return (
                  <li key={item.to}>
                    <a
                      href={`#${item.to}`}
                      className={`nav__link ${active ? 'is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon name={item.icon} size={20} />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href="#/guide"
            className={`guide-link ${section === 'guide' ? 'is-active' : ''}`}
            aria-current={section === 'guide' ? 'page' : undefined}
          >
            <Icon name="help" size={20} />
            <span>Guide</span>
          </a>

          <a
            href="#/profile"
            className={`profile-link ${section === 'profile' ? 'is-active' : ''}`}
            aria-current={section === 'profile' ? 'page' : undefined}
            aria-label={profileName ? `Your profile (${profileName})` : 'Your profile'}
          >
            <Avatar name={profileName} size={30} />
            <span className="profile-link__name">{profileName || 'Profile'}</span>
          </a>
        </div>
      </header>

      {saveFailed && (
        <div className="banner banner--warn" role="status">
          Your browser isn’t letting Usap Tayo save progress (private browsing or blocked storage?). You can keep
          practicing, but progress will be lost when you close the tab.
        </div>
      )}

      <main id="main" className="main" ref={mainRef} tabIndex={-1}>
        <ErrorBoundary key={route.path}>
          <div className="page-enter">{renderPage(route)}</div>
        </ErrorBoundary>
      </main>

      <footer className="footer">
        <p>
          Usap Tayo is a personal study companion — real fluency grows from talking with family. Pronunciation guides
          are approximations; see the <a href="#/guide">Guide</a>.
        </p>
      </footer>
    </div>
  );
}
