import { useProgress } from '../context/ProgressContext.jsx';

/* For phrases like "Ako si ___": show it filled in with the name from your Profile. */
export default function YourVersion({ phrase }) {
  const { progress } = useProgress();
  const name = progress.profile.name;
  if (!phrase.withName || !name) return null;
  return (
    <p className="your-version">
      <span aria-hidden="true">⭐</span> Your version: <strong lang="tl">{phrase.withName.replace('{name}', name)}</strong>
    </p>
  );
}
