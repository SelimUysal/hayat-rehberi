export function localOwner(): string {
  try {return localStorage.getItem('hayat-account-owner-v1') || 'guest';} catch {return 'guest';}
}
export function recordingDatabaseName(owner: string) {
  const legacy = 'hayat_rehberi_ezber_recordings_db';
  return owner === 'guest' ? legacy : `${legacy}:account:${encodeURIComponent(owner)}`;
}
