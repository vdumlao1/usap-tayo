// Phrase categories, in the order they appear in the app.
// `id` is what each phrase's `category` field refers to.
export const CATEGORIES = [
  { id: 'greetings', label: 'Greetings & Intros', emoji: '👋' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'everyday', label: 'Everyday', emoji: '💬' },
  { id: 'questions', label: 'Questions & Answers', emoji: '❓' },
  { id: 'food', label: 'Food & Eating', emoji: '🍚' },
  { id: 'feelings', label: 'Feelings', emoji: '💛' },
  { id: 'household', label: 'Around the House', emoji: '🏠' },
  { id: 'slang', label: 'Casual & Slang', emoji: '😎' },
  { id: 'taglish', label: 'Taglish', emoji: '🔀' },
];

// Register labels: how formal/casual a phrase is.
// `hint` is shown as a tooltip and on the Guide page.
export const REGISTERS = {
  respectful: { label: 'Respectful', hint: 'Uses po/opo — good with parents, grandparents and elders.' },
  neutral: { label: 'Neutral', hint: 'Fine in most everyday situations.' },
  casual: { label: 'Casual', hint: 'Relaxed — siblings, cousins, friends. Add “po” for elders.' },
  slang: { label: 'Slang', hint: 'Very informal. Best with cousins and friends, not elders.' },
  taglish: { label: 'Taglish', hint: 'Tagalog mixed with English — extremely common in real life.' },
};

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
