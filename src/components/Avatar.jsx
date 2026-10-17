/* A round badge with the first letter of your name (or a friendly default). */
export default function Avatar({ name, size = 32 }) {
  const initial = name?.trim().charAt(0).toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.45 }} aria-hidden="true">
      {initial || '🙂'}
    </span>
  );
}
