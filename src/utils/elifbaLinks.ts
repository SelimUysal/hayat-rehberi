import { TEMEL_DATA_1, TEMEL_DATA_2, TEMEL_DATA_3 } from '../data/elifbaData';

/** Human-readable, stable deep links to every Temel Bilgiler card. */
const groups = [TEMEL_DATA_1, TEMEL_DATA_2, TEMEL_DATA_3] as const;
function toSlug(text: string): string {
  const normalized = text.toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[âáà]/g, 'a').replace(/[îíì]/g, 'i').replace(/[ûúù]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (normalized.includes('zamani-iki-defa-kullanmak')) return 'zamani-iki-defa-kullanmak';
  // Remove numeric section prefixes and use a concise, understandable address.
  return normalized.replace(/^\d+-/, '').split('-').slice(0, 7).join('-');
}
export const BASIC_INFO_LINKS = groups.flatMap((group, groupIndex) =>
  group.map((item, index) => ({
    key: `dua${groupIndex + 1}_${index}`,
    title: item.title,
    slug: toSlug(item.title),
    group: groupIndex + 1
  }))
);

export function resolveBasicInfoKey(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  let candidate: string;
  try { candidate = decodeURIComponent(raw).trim(); } catch { candidate = raw.trim(); }
  const slug = toSlug(candidate);
  const found = BASIC_INFO_LINKS.find(entry =>
    entry.key === candidate || entry.slug === candidate || entry.slug === slug
  );
  if (found) return found.key;
  // Older search links may contain an article title instead of a URL slug.
  return BASIC_INFO_LINKS.find(entry => toSlug(entry.title).includes(slug) && slug.length >= 5)?.key;
}
export function basicInfoHash(key: string): string {
  const slug = BASIC_INFO_LINKS.find(item => item.key === key)?.slug || key;
  return `#elifba/temel/${slug}`;
}
