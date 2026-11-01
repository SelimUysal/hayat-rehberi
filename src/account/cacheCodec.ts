import LZString from 'lz-string';

// Synchronous durable writes remain safe during pagehide. Compression avoids
// storing the working copy, guest backup and outbox as repeated multi-MB JSON.
export function encodeStoredCache(value: unknown): string {
  return encodeCacheText(JSON.stringify(value));
}
export function encodeCacheText(raw: string): string {
  if(raw.length>16_000_000)throw new Error('Cihaz eşitleme yedeği boyut sınırını aştı. Kayıtlar silinmedi.');
  return 'lz1:'+LZString.compressToUTF16(raw);
}
export function decodeStoredCache(text: string): any {
  const raw=text.startsWith('lz1:') ? LZString.decompressFromUTF16(text.slice(4)) : text;
  if(!raw || raw.length>16_000_000)throw new Error('Cihaz eşitleme yedeği okunamadı.');
  return JSON.parse(raw);
}
