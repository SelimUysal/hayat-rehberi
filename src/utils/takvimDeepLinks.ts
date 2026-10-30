/** Public, shareable sub-pages of Namaz Vakitleri Takvimi. */
export type TakvimRoute = 'daily' | 'monthly' | 'qibla' | 'mosques' | 'goals';

const routeNames: readonly TakvimRoute[] = ['daily', 'monthly', 'qibla', 'mosques', 'goals'];

export const makeTakvimHash = (tab: TakvimRoute): string => `#takvim/${tab}`;

export function parseTakvimHash(hash: string): TakvimRoute | null {
  const normalized = hash.replace(/^#/, '').toLowerCase().split('/');
  if (normalized[0] !== 'takvim') return null;
  const tab = normalized[1] || 'daily';
  return routeNames.includes(tab as TakvimRoute) ? tab as TakvimRoute : 'daily';
}
