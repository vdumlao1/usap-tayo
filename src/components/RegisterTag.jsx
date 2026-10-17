import { REGISTERS } from '../data/categories.js';

export default function RegisterTag({ register }) {
  const info = REGISTERS[register];
  if (!info) return null;
  return (
    <span className={`tag tag--${register}`} title={info.hint}>
      {info.label}
    </span>
  );
}
