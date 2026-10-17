export default function EmptyState({ emoji = '🌱', title, children, actions, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className="empty">
      <div className="empty__emoji" aria-hidden="true">
        {emoji}
      </div>
      <Heading className="empty__title">{title}</Heading>
      {children && <p className="empty__text">{children}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}
