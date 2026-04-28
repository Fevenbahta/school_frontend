// Map subject names to a representative emoji icon.
// Falls back to a book emoji for unknown subjects.
const rules: { keywords: string[]; emoji: string }[] = [
  { keywords: ['math', 'algebra', 'geometry', 'calculus', 'arithmetic'], emoji: '📐' },
  { keywords: ['physic'], emoji: '⚛️' },
  { keywords: ['chem'], emoji: '⚗️' },
  { keywords: ['bio', 'life science'], emoji: '🧬' },
  { keywords: ['science'], emoji: '🔬' },
  { keywords: ['history'], emoji: '🏛️' },
  { keywords: ['geograph'], emoji: '🌍' },
  { keywords: ['civic', 'social'], emoji: '🏫' },
  { keywords: ['english', 'literature', 'language', 'amharic', 'grammar', 'reading'], emoji: '📚' },
  { keywords: ['art', 'draw', 'paint'], emoji: '🎨' },
  { keywords: ['music'], emoji: '🎵' },
  { keywords: ['sport', 'physical ed', 'pe'], emoji: '⚽' },
  { keywords: ['computer', 'ict', 'informatics', 'coding', 'programming'], emoji: '💻' },
  { keywords: ['econ', 'business', 'account', 'finance'], emoji: '💼' },
  { keywords: ['religion', 'ethic', 'moral'], emoji: '🕊️' },
  { keywords: ['health'], emoji: '❤️' },
  { keywords: ['agriculture', 'farm'], emoji: '🌾' },
  { keywords: ['tech', 'engineering'], emoji: '🛠️' },
];

export function getSubjectEmoji(name?: string | null): string {
  if (!name) return '📘';
  const n = name.toLowerCase();
  for (const r of rules) {
    if (r.keywords.some(k => n.includes(k))) return r.emoji;
  }
  return '📘';
}
