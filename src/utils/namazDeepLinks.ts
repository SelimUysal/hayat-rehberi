import { NAMAZ_ITEMS, VIRTUAL_NEW_ITEMS } from '../data/namazData';

// GitHub Pages'in tek sayfalı uygulaması için sunucu yönlendirmesi gerektirmeyen URL'ler.
// #namaz/sureler, #namaz/dualar, #namaz/rehber ve #namaz/<bolum>/<icerik-id>
export type NamazSection = 'sureler' | 'dualar' | 'rehber';

export const getNamazSectionForId = (itemId: string): NamazSection | undefined => {
  const known = NAMAZ_ITEMS.find((item) => item.id === itemId);
  if (known) return known.category === 'dua' ? 'dualar' : 'sureler';
  if (VIRTUAL_NEW_ITEMS.some((item) => item.id === itemId)) return 'rehber';
  return undefined;
};

export const getDefaultNamazItemId = (section: NamazSection): string => {
  if (section === 'rehber') return VIRTUAL_NEW_ITEMS[0]?.id || 'fatiha';
  const category = section === 'dualar' ? 'dua' : 'sure';
  return NAMAZ_ITEMS.find((item) => item.category === category)?.id || 'fatiha';
};

export const makeNamazSectionHash = (section: NamazSection): string =>
  `#namaz/${section}`;

export const makeNamazItemHash = (itemId: string): string => {
  const section = getNamazSectionForId(itemId);
  return section ? `#namaz/${section}/${encodeURIComponent(itemId)}` : '#namaz';
};

export const parseNamazHash = (hash: string): { section: NamazSection; itemId: string } | null => {
  const segments = hash.trim().replace(/^#/, '').split('/').filter(Boolean);
  if (segments[0]?.toLowerCase() !== 'namaz') return null;
  const segment = (segments[1] || '').toLowerCase();
  if (segment === 'sureler' || segment === 'dualar' || segment === 'rehber') {
    const section: NamazSection = segment;
    let itemId = '';
    try {
      itemId = decodeURIComponent(segments[2] || '');
    } catch {
      return { section, itemId: getDefaultNamazItemId(section) };
    }
    return {
      section,
      itemId: getNamazSectionForId(itemId) === section ? itemId : getDefaultNamazItemId(section)
    };
  }

  // Eski #namaz/fatiha gibi kısa bağlantıları da destekle.
  let legacyId = '';
  try {
    legacyId = decodeURIComponent(segment);
  } catch {}
  const legacySection = getNamazSectionForId(legacyId);
  if (legacySection) return { section: legacySection, itemId: legacyId };
  return { section: 'sureler', itemId: getDefaultNamazItemId('sureler') };
};

export const getNamazTargetFromUrl = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const directRoute = parseNamazHash(window.location.hash);
  if (directRoute) return directRoute.itemId;

  // Elifba ve diğer sayfalara ait parametreler namaz seçimini etkilememeli.
  const hash = window.location.hash;
  if (hash && !hash.startsWith('#item/')) return undefined;

  try {
    if (hash.startsWith('#item/')) {
      const legacyId = decodeURIComponent(hash.slice('#item/'.length));
      if (getNamazSectionForId(legacyId)) return legacyId;
    }

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || params.get('tab') || params.get('page');
    if (mode && mode !== 'namaz') return undefined;
    const itemId = params.get('item') || params.get('namaz') || params.get('dua') || params.get('sure') || params.get('id');
    if (itemId && getNamazSectionForId(itemId)) return itemId;
  } catch {}
  return undefined;
};
