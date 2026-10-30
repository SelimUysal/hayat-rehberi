import type { TabType } from '../components/Navbar';

/** Main Hayat Rehberi routes. Hash routing works on GitHub Pages without server rewrites. */
const MAIN_TABS: readonly TabType[] = [
  'elifba', 'namaz', 'kaza', 'mushaf', 'ezber', 'takvim', 'osmanli',
  'hadis', 'esma', 'listen', 'search', 'support', 'worldclock'
];

const ALIASES: Record<string, TabType> = {
  'elif-ba': 'elifba',
  'tecvid': 'elifba',
  'hadisler': 'hadis',
  'saat': 'worldclock',
  'saatler': 'worldclock',
  'alaturka': 'osmanli',
  'muvakkithane': 'osmanli'
};

/** Preserve existing routes like #elifba/harfler and #takvim/qibla. */
export function getMainTabFromHash(hash: string): TabType | null {
  const first = hash.replace(/^#/, '').trim().toLowerCase().split(/[/?]/)[0];
  if (!first) return null;
  if (MAIN_TABS.includes(first as TabType)) return first as TabType;
  return ALIASES[first] ?? null;
}

export function makeMainTabHash(tab: TabType): string {
  return `#${tab}`;
}

export function makeMainTabUrl(tab: TabType): string {
  return `${window.location.origin}${window.location.pathname}${makeMainTabHash(tab)}`;
}
