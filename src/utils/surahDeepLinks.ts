import type { TabType } from '../components/Navbar';
export type SurahTab = Extract<TabType, 'mushaf' | 'ezber' | 'listen'>;
export type SurahLinkMode = 'mushaf' | 'computer';
export type SurahRoute = { tab: SurahTab; surahId: number; mode?: SurahLinkMode };

export function makeSurahHash(tab: SurahTab, surahId: number, mode?: SurahLinkMode): string {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) return `#${tab}`;
  return `#${tab}/surah/${surahId}${tab === 'mushaf' && mode ? `/${mode}` : ''}`;
}

export function parseSurahHash(hash: string): SurahRoute | null {
  const match = /^#(mushaf|ezber|listen)\/surah\/(\d{1,3})(?:\/(mushaf|computer))?$/i.exec(hash);
  if (!match) return null;
  const [, tab, rawId, mode] = match;
  const surahId = Number(rawId);
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) return null;
  return { tab: tab.toLowerCase() as SurahTab, surahId, ...(tab.toLowerCase() === 'mushaf' && mode ? {mode: mode as SurahLinkMode} : {}) };
}
