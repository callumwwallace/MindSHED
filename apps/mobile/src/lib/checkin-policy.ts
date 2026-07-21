export const MAX_RESEARCH_NEEDS = 3;

export function toggleNeedSelection(current: readonly string[], requested: string): string[] {
  if (current.includes(requested)) return current.filter((value) => value !== requested);
  if (requested === 'Nothing yet') return ['Nothing yet'];
  const selected = current.filter((value) => value !== 'Nothing yet');
  return selected.length >= MAX_RESEARCH_NEEDS ? selected : [...selected, requested];
}
