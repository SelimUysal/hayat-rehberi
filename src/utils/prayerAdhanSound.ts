import { useCallback, useEffect, useRef, useState } from 'react';
import type { Coordinates, PrayerTimes } from '../types/prayer';
import { DEFAULT_CITY } from '../data/cities';
import { calculatePrayerTimesForDate, DEFAULT_TEMKIN } from '../utils/astronomy';

// Kaynak: Atcovi, "The Adhan - Muslim Call to Prayer - Aaqib Azeez.mp3"
// Wikimedia Commons, CC BY-SA 4.0. 87 saniye, MP3 134 kbps.
// https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3
// Kayıt değiştirilmedi; tarayıcıda 1,5× hızda oynatılır.
// Kullanıcı ayarı kapalıyken üçüncü taraf dosyaya istek gönderilmez.
export const ADHAN_RECORDING_URL =
  'https://upload.wikimedia.org/wikipedia/commons/7/7d/The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3';
export const ADHAN_PLAYBACK_RATE = 1.5;

const SETTING_KEY = 'namaz_adhan_sound_enabled_v1';
const LAST_EVENT_KEY = 'namaz_adhan_last_event_v1';
const PRAYERS: Array<{ key: keyof PrayerTimes; label: string }> = [
  { key: 'sabah', label: 'Sabah' },
  { key: 'ogle', label: 'Öğle' },
  { key: 'ikindi', label: 'İkindi' },
  { key: 'aksam', label: 'Akşam' },
  { key: 'yatsi', label: 'Yatsı' }
];
const DUE_WINDOW_MS = 75_000;

type ScheduledAdhan = { id: string; instant: number; label: string };
type ZoneParts = {
  year: number; month: number; day: number; hour: number; minute: number; second: number;
};
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();

function zoneParts(date: Date, zone: string): ZoneParts {
  let formatter = zoneFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    zoneFormatters.set(zone, formatter);
  }
  const fields: Record<string, number> = {};
  formatter.formatToParts(date).forEach(part => {
    if (part.type !== 'literal') fields[part.type] = Number(part.value);
  });
  return {
    year: fields.year, month: fields.month, day: fields.day,
    hour: fields.hour === 24 ? 0 : fields.hour,
    minute: fields.minute, second: fields.second
  };
}

function zoneOffsetMinutes(date: Date, zone: string): number {
  const p = zoneParts(date, zone);
  const zonedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((zonedAsUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

function zonedTimeToInstant(
  year: number, month: number, day: number, hour: number, minute: number, zone: string
): number | null {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const candidates = new Set([-30, -12, 0, 12, 30].map(hours =>
    zoneOffsetMinutes(new Date(localAsUtc + hours * 3_600_000), zone)
  ));
  const matches = Array.from(candidates).map(offset => localAsUtc - offset * 60_000)
    .filter(time => {
      const p = zoneParts(new Date(time), zone);
      return p.year === year && p.month === month && p.day === day &&
        p.hour === hour && p.minute === minute;
    }).sort((a, b) => a - b);
  // During a DST fall-back repeated local minute, use the first occurrence.
  // During a spring-forward nonexistent minute, no event is scheduled.
  return matches[0] ?? null;
}

function loadLocation(): Coordinates | null {
  let loc: Coordinates = DEFAULT_CITY;
  try {
    const raw = localStorage.getItem('namaz_current_location');
    if (raw) loc = JSON.parse(raw) as Coordinates;
  } catch { return DEFAULT_CITY; }
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number' ||
      !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng) ||
      Math.abs(loc.lat) > 90 || Math.abs(loc.lng) > 180 ||
      !Number.isFinite(loc.timezone)) return null;
  if (loc.timezoneStatus === 'unverified') return null;
  return loc;
}

function locationZone(loc: Coordinates): string | null {
  const zone = loc.timezoneId ||
    (loc.country === 'Türkiye' || loc.country === 'Turkey' ? 'Europe/Istanbul' : '');
  if (!zone) return null;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return zone;
  } catch { return null; }
}

function upcomingEvents(now: Date, location: Coordinates, zone: string): ScheduledAdhan[] {
  const z = zoneParts(now, zone);
  // Date components represent the selected city's calendar day, not the PC day.
  const localCalendarDay = new Date(z.year, z.month - 1, z.day, 12);
  const schedule = calculatePrayerTimesForDate(localCalendarDay, location, DEFAULT_TEMKIN, 1);
  const dayKey = `${z.year}-${String(z.month).padStart(2, '0')}-${String(z.day).padStart(2, '0')}`;
  return PRAYERS.flatMap(prayer => {
    const time = schedule.times[prayer.key];
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return [];
    const [hour, minute] = time.split(':').map(Number);
    if (hour > 23 || minute > 59) return [];
    const instant = zonedTimeToInstant(z.year, z.month, z.day, hour, minute, zone);
    if (instant === null) return [];
    return [{
      id: `${dayKey}|${location.lat.toFixed(5)}|${location.lng.toFixed(5)}|${zone}|${prayer.key}|${time}`,
      instant, label: `${prayer.label} namazı vakti`
    }];
  });
}

export function usePrayerAdhanSound() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(SETTING_KEY) === 'true'; }
    catch { return false; }
  });
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSessionKeyRef = useRef('');
  const enabledSinceRef = useRef(Date.now());
  const cachedEventsRef = useRef<{ key: string; events: ScheduledAdhan[] } | null>(null);

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = ADHAN_RECORDING_URL;
      audio.preload = 'none';
      audio.volume = 0.7;
      // Ezanın yaklaşık 58 saniyede tamamlanması için 1,5× oynat.
      // Modern tarayıcılar varsayılan olarak ses perdesini korur.
      audio.defaultPlaybackRate = ADHAN_PLAYBACK_RATE;
      audio.playbackRate = ADHAN_PLAYBACK_RATE;
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => {
        setPlaying(false);
        setStatus('Ezan sesi tamamlandı.');
      };
      audio.onerror = () => {
        setPlaying(false);
        setStatus('Ezan kaydı yüklenemedi. İnternet bağlantısını ve tarayıcı ses desteğini kontrol edin.');
      };
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      try { audio.currentTime = 0; } catch { /* not seekable yet */ }
    }
    setPlaying(false);
  }, []);

  const play = useCallback(async (label?: string) => {
    const audio = ensureAudio();
    audio.pause();
    try { audio.currentTime = 0; } catch { /* metadata not loaded yet */ }
    // Test ve vakit geldiğinde aynı hız kullanılır.
    audio.playbackRate = ADHAN_PLAYBACK_RATE;
    try {
      await audio.play();
      setStatus(label ? `${label} · kısa ezan çalıyor.` : 'Ses denemesi oynatılıyor.');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setPlaying(false);
      setStatus('Tarayıcı sesin otomatik başlamasını engelledi. Takvimde “Sesi dene” düğmesine basın.');
    }
  }, [ensureAudio]);

  const changeEnabled = useCallback((next: boolean) => {
    let persisted = true;
    try {
      localStorage.setItem(SETTING_KEY, next ? 'true' : 'false');
    } catch {
      persisted = false;
    }
    // Depolama başarısız olsa bile kapatma komutu sesi anında durdurur.
    enabledSinceRef.current = Date.now();
    setEnabled(next);
    cachedEventsRef.current = null;
    if (!next) {
      stop();
      setStatus(persisted ? 'Vakit ezanı kapatıldı.' : 'Vakit ezanı kapatıldı; tercih tarayıcıya kaydedilemedi.');
    } else {
      setStatus(persisted
        ? 'Vakit ezanı açık. Sesin çalıştığını kontrol etmek için “Sesi dene”ye basın.'
        : 'Vakit ezanı bu sekmede açık ancak tercih kaydedilemedi. “Sesi dene” ile kontrol edin.');
    }
  }, [stop]);

  // Birden çok Hayat Rehberi sekmesinde aç/kapat ayarı anında eşitlensin.
  // Özellikle diğer sekmeden kapatma geldiğinde orada da çalan ses durur.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SETTING_KEY) return;
      const next = event.newValue === 'true';
      enabledSinceRef.current = Date.now();
      setEnabled(next);
      cachedEventsRef.current = null;
      if (!next) {
        stop();
        setStatus('Vakit ezanı başka bir sekmeden kapatıldı.');
      } else {
        setStatus('Vakit ezanı açıldı. Sesin çalışması için “Sesi dene” ile kontrol edin.');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [stop]);

  const testSound = useCallback(() => {
    if (playing) {
      stop();
      setStatus('Ses durduruldu.');
      return;
    }
    // play() is called directly inside the user's click, to satisfy browser gesture policies.
    void play();
  }, [playing, play, stop]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      const now = new Date();
      const location = loadLocation();
      const zone = location && locationZone(location);
      if (!location || !zone) return;

      try {
        const z = zoneParts(now, zone);
        const cacheKey = [z.year, z.month, z.day, zone, location.lat, location.lng,
          location.timezone, location.timezoneStatus].join('|');
        if (!cachedEventsRef.current || cachedEventsRef.current.key !== cacheKey) {
          cachedEventsRef.current = {
            key: cacheKey,
            events: upcomingEvents(now, location, zone)
          };
        }
        const event = cachedEventsRef.current.events.find(item =>
          now.getTime() >= item.instant &&
          now.getTime() - item.instant <= DUE_WINDOW_MS &&
          item.instant >= enabledSinceRef.current
        );
        if (!event || currentSessionKeyRef.current === event.id) return;
        const execute = () => {
          if (cancelled || currentSessionKeyRef.current === event.id) return;
          try {
            if (localStorage.getItem(LAST_EVENT_KEY) === event.id) return;
            localStorage.setItem(LAST_EVENT_KEY, event.id);
          } catch { /* still prevent duplicate in this tab */ }
          currentSessionKeyRef.current = event.id;
          void play(event.label);
        };

        // Multiple tabs: exclusive permission to claim the same scheduled event.
        if ('locks' in navigator && navigator.locks) {
          void navigator.locks.request('hayat-rehberi-adhan-event', { ifAvailable: true }, lock => {
            if (lock) execute();
          });
        } else execute();
      } catch {
        // Invalid timezone/date data must never break other application views.
      }
    };

    check();
    const timer = window.setInterval(check, 4000);
    const onResume = () => check();
    document.addEventListener('visibilitychange', onResume);
    window.addEventListener('focus', onResume);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('focus', onResume);
    };
  }, [enabled, play]);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  return { enabled, changeEnabled, playing, testSound, status };
}
