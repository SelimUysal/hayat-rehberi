import type { Coordinates } from '../types/prayer';

export function offsetForDate(date: Date, zone: string, fallback: number): number {
  try {
    const utcNoon = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date(utcNoon));
    const get = (kind: string) => Number(parts.find(x => x.type === kind)?.value);
    const localStamp = Date.UTC(get('year'), get('month')-1, get('day'), get('hour'), get('minute'));
    return (localStamp-utcNoon)/3600000;
  } catch { return fallback; }
}
export function zoneNowDate(zone?: string): Date {
  if (!zone) return new Date();
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year:'numeric', month:'2-digit', day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const g=(k:string)=>Number(p.find(x=>x.type===k)?.value);
    return new Date(g('year'),g('month')-1,g('day'),g('hour'),g('minute'),g('second'));
  } catch {return new Date();}
}
export async function resolveLocationTimezone(location: Coordinates): Promise<Coordinates> {
  // Preserve Turkey's existing fixed UTC+3 settings, calculations and chosen temkin.
  if (location.country === 'Türkiye' || location.country === 'Turkey') return { ...location, timezone: 3, timezoneId: 'Europe/Istanbul' };
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m&timezone=auto&forecast_days=1`;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),6500);
    try {
      const response = await fetch(url, {signal:controller.signal});
      if (!response.ok) throw Error('timezone lookup failed');
      const data = await response.json();
      if (typeof data.timezone !== 'string' || !Number.isFinite(data.utc_offset_seconds)) throw Error('bad timezone');
      return { ...location, timezoneId: data.timezone, timezone: offsetForDate(new Date(),data.timezone,data.utc_offset_seconds/3600) };
    } finally {clearTimeout(timeout);}
  } catch {
    // Do not silently claim a guessed timezone is accurate.
    return location;
  }
}
