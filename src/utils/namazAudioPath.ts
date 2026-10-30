/**
 * Audio in public/ is served beneath the deployed Vite base path.
 * On GitHub Pages, /audio/... points to the wrong domain root.
 */
export function resolveNamazAudioUrl(source: string, basePath: string, pageUrl: string): string {
  if (/^https?:\/\//i.test(source)) return source;
  const cleaned = source.replace(/^\/+/, '');
  // The base path is relative ('./') in the GitHub Pages build.
  return new URL(basePath + cleaned, pageUrl).href;
}
