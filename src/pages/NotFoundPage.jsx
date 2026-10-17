import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState
      emoji="🧭"
      headingLevel={1}
      title="Naligaw tayo — we got lost!"
      actions={
        <a className="btn btn--primary" href="#/">
          Go home
        </a>
      }
    >
      That page doesn’t exist.
    </EmptyState>
  );
}
