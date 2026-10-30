/**
 * Single navigation policy shared by all Hayat Rehberi modules.
 *
 * User navigation -> push: Android/browser Back returns to the last screen.
 * URL normalization on initial render -> replace: does not insert fake visits.
 * Browser Back/Forward -> do not write history; UI listens to popstate/hashchange.
 */
export type AppHistoryMode = 'push' | 'replace';

export function navigateToAppHash(hash: string, mode: AppHistoryMode = 'push'): boolean {
  if (typeof window === 'undefined') return false;
  const nextHash = hash.startsWith('#') ? hash : `#${hash}`;
  if (!nextHash || nextHash === '#') return false;
  if (window.location.hash === nextHash) return false;

  const url = `${window.location.pathname}${window.location.search}${nextHash}`;
  const state = window.history.state;
  if (mode === 'replace') {
    window.history.replaceState(state, '', url);
  } else {
    window.history.pushState(state, '', url);
  }
  return true;
}
