/*
  Renders a pronunciation guide like "koo-MOOS-tah kah",
  emphasising the CAPITALISED (stressed) syllables.
*/
export default function Pronunciation({ text, className = '' }) {
  const parts = text.split(/(\s+|-|\/)/);
  return (
    <span className={`pron ${className}`}>
      <span className="sr-only">Pronunciation: </span>
      {parts.map((part, i) =>
        /[A-Z]/.test(part) && part === part.toUpperCase() && part.length > 1 ? (
          <strong key={i} className="pron__stress">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
