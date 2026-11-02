import type { Ayah } from '../types';

const TRUSTED_AUDIO_HOST = 'cdn.islamic.network';
const MAX_SECONDARY_SOURCES = 2;

/**
 * Accept only the Quran audio CDN's HTTPS MP3 paths. API-provided secondary
 * URLs are optional and are never allowed to redirect playback to arbitrary hosts.
 */
export function getSafeAyahAudioSources(
  ayah: Pick<Ayah, 'audio' | 'audioSecondary'>
): string[] {
  const candidates = [
    ayah.audio,
    ...(Array.isArray(ayah.audioSecondary)
      ? ayah.audioSecondary.slice(0, MAX_SECONDARY_SOURCES)
      : []),
  ];
  const safe: string[] = [];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || candidate.length > 2048) continue;
    try {
      const url = new URL(candidate);
      if (
        url.protocol !== 'https:' ||
        url.hostname !== TRUSTED_AUDIO_HOST ||
        url.username ||
        url.password ||
        url.port ||
        !url.pathname.startsWith('/quran/audio/') ||
        !url.pathname.toLowerCase().endsWith('.mp3')
      ) continue;

      const normalized = url.href;
      if (!safe.includes(normalized)) safe.push(normalized);
    } catch {
      // Invalid API values are ignored; playback must not trust arbitrary URLs.
    }
  }

  return safe;
}

/** Short exponential backoff, capped to avoid long interruptions in recitation. */
export function getEzberAudioRetryDelayMs(retryNumber: number): number {
  const safeRetry = Number.isFinite(retryNumber)
    ? Math.max(1, Math.floor(retryNumber))
    : 1;
  return Math.min(700 * safeRetry, 1400);
}
