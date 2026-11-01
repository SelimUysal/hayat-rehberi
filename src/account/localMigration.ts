// Additive migration: the original session is retained, never reset or uploaded.
export const COMPLETED_CYCLES_KEY = 'quran_listening_completed_cycles_v1';
export function migrateLocalProgress(storage: Storage) {
  if (storage.getItem(COMPLETED_CYCLES_KEY) !== null) return;
  try {
    const session = JSON.parse(storage.getItem('quran_listening_full_cycle_v1') || 'null');
    if (Number.isSafeInteger(session?.total) && session.total >= 0)
      storage.setItem(COMPLETED_CYCLES_KEY,JSON.stringify(session.total));
  } catch { /* The source remains available to the existing recovery screens. */ }
}
