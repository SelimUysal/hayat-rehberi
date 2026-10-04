export interface SpecialGoalItem {
  id: string;
  title: string;
  description: string;
  targetISO: string; // YYYY-MM-DDTHH:mm
  targetTimestamp: number; // Milliseconds since epoch (local time)
  createdAt: number;
}

export interface GoalCountdownBreakdown {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  diffMs: number;
  // Süresi dolmuş hedefler için 5 günlük saklama / otomatik silinme bilgisi
  autoDeleteRemainingDays: number;
  autoDeleteRemainingHours: number;
  autoDeleteRemainingMinutes: number;
  autoDeleteTimestamp: number;
  progressPercent: number;
}

export const SPECIAL_GOALS_STORAGE_KEY = 'hayat_rehberi_special_goals_v1';
export const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 5 Gün (milisaniye)
export const SPECIAL_GOALS_UPDATED_EVENT = 'hayat-rehberi-special-goals-updated';

/**
 * Verilen tarih (YYYY-MM-DD) ve saat (HH:mm) bilgisini yerel sistem zaman diliminde milisaniyeye çevirir.
 */
export function parseLocalDateTimeToTimestamp(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map((n) => parseInt(n, 10));
  const [hour, minute] = timeStr.split(':').map((n) => parseInt(n, 10));
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hour) ||
    isNaN(minute)
  ) {
    return NaN;
  }
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  return d.getTime();
}

/**
 * Süresi dolduktan sonra 5 günü aşmış hedefleri otomatik olarak filtreler.
 * Süresi dolan hedefler 5 gün boyunca saklanır, 5. günün sonunda kalıcı olarak silinir.
 */
export function purgeExpiredGoalsBeyondFiveDays(
  goals: SpecialGoalItem[],
  nowMs: number = Date.now()
): { validGoals: SpecialGoalItem[]; purgedCount: number } {
  const validGoals: SpecialGoalItem[] = [];
  let purgedCount = 0;

  for (const goal of goals) {
    if (
      !goal ||
      typeof goal.id !== 'string' ||
      typeof goal.title !== 'string' ||
      typeof goal.targetTimestamp !== 'number' ||
      isNaN(goal.targetTimestamp)
    ) {
      purgedCount++;
      continue;
    }

    // Hedef süresinin üzerinden 5 gün (FIVE_DAYS_MS) geçtiyse otomatik olarak sil
    const timeSinceTargetReached = nowMs - goal.targetTimestamp;
    if (timeSinceTargetReached >= FIVE_DAYS_MS) {
      purgedCount++;
      continue;
    }

    validGoals.push(goal);
  }

  // Tarihe göre sırala: Aktif (gelecek) hedefler en yakından en uzağa, süresi dolmuşlar en son
  validGoals.sort((a, b) => {
    const aExpired = a.targetTimestamp <= nowMs;
    const bExpired = b.targetTimestamp <= nowMs;
    if (aExpired !== bExpired) {
      return aExpired ? 1 : -1;
    }
    return a.targetTimestamp - b.targetTimestamp;
  });

  return { validGoals, purgedCount };
}

/**
 * Yerel hafızadan (localStorage) özel hedefleri okur ve 5 günü geçmiş olanları otomatik temizler.
 */
export function loadSpecialGoalsFromStorage(nowMs: number = Date.now()): SpecialGoalItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SPECIAL_GOALS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const { validGoals, purgedCount } = purgeExpiredGoalsBeyondFiveDays(parsed, nowMs);
    if (purgedCount > 0) {
      localStorage.setItem(SPECIAL_GOALS_STORAGE_KEY, JSON.stringify(validGoals));
    }
    return validGoals;
  } catch {
    return [];
  }
}

/**
 * Özel hedefleri yerel hafızaya (localStorage) kaydeder ve uygulama içi bileşenleri bilgilendirir.
 */
export function saveSpecialGoalsToStorage(
  goals: SpecialGoalItem[],
  nowMs: number = Date.now()
): SpecialGoalItem[] {
  if (typeof window === 'undefined') return goals;
  try {
    const { validGoals } = purgeExpiredGoalsBeyondFiveDays(goals, nowMs);
    localStorage.setItem(SPECIAL_GOALS_STORAGE_KEY, JSON.stringify(validGoals));
    window.dispatchEvent(new CustomEvent(SPECIAL_GOALS_UPDATED_EVENT));
    return validGoals;
  } catch {
    return goals;
  }
}

/**
 * Anlık sistem saatine ("Canlı Saat Rozeti") göre hedef için Gün, Saat, Dakika ve Saniye bazında geri sayım hesaplar.
 */
export function calculateGoalCountdown(
  goal: SpecialGoalItem,
  nowDate: Date = new Date()
): GoalCountdownBreakdown {
  const nowMs = nowDate.getTime();
  const diffMs = goal.targetTimestamp - nowMs;
  const autoDeleteTimestamp = goal.targetTimestamp + FIVE_DAYS_MS;

  if (diffMs > 0) {
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    const totalMinutes = Math.floor(diffMs / 60000);

    const totalSpan = Math.max(1, goal.targetTimestamp - goal.createdAt);
    const elapsedSpan = Math.max(0, nowMs - goal.createdAt);
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSpan / totalSpan) * 100)));

    return {
      isExpired: false,
      days,
      hours,
      minutes,
      seconds,
      totalMinutes,
      diffMs,
      autoDeleteRemainingDays: 5,
      autoDeleteRemainingHours: 0,
      autoDeleteRemainingMinutes: 0,
      autoDeleteTimestamp,
      progressPercent
    };
  } else {
    // Süresi dolmuş ancak henüz 5 gün geçmemiş hedef
    const elapsedSinceExpiryMs = Math.abs(diffMs);
    const remainingUntilDeleteMs = Math.max(0, FIVE_DAYS_MS - elapsedSinceExpiryMs);

    const autoDeleteRemainingDays = Math.floor(remainingUntilDeleteMs / (1000 * 60 * 60 * 24));
    const autoDeleteRemainingHours = Math.floor(
      (remainingUntilDeleteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const autoDeleteRemainingMinutes = Math.floor(
      (remainingUntilDeleteMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    const expiredDays = Math.floor(elapsedSinceExpiryMs / (1000 * 60 * 60 * 24));
    const expiredHours = Math.floor(
      (elapsedSinceExpiryMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const expiredMinutes = Math.floor(
      (elapsedSinceExpiryMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    const expiredSeconds = Math.floor((elapsedSinceExpiryMs % (1000 * 60)) / 1000);

    return {
      isExpired: true,
      days: expiredDays,
      hours: expiredHours,
      minutes: expiredMinutes,
      seconds: expiredSeconds,
      totalMinutes: 0,
      diffMs,
      autoDeleteRemainingDays,
      autoDeleteRemainingHours,
      autoDeleteRemainingMinutes,
      autoDeleteTimestamp,
      progressPercent: 100
    };
  }
}

/**
 * Kullanıcının girdiği hedeflerden en yakın tarihli (en erken) olanını döndürür.
 * Öncelikle süresi henüz dolmamış en yakın hedefi seçer; tüm hedeflerin süresi dolmuşsa
 * 5 günlük saklama süresinde olan en güncel hedefi döndürür.
 */
export function getNearestSpecialGoal(
  goals: SpecialGoalItem[],
  nowMs: number = Date.now()
): SpecialGoalItem | null {
  if (!goals || goals.length === 0) return null;

  const upcoming = goals
    .filter((g) => g.targetTimestamp > nowMs)
    .sort((a, b) => a.targetTimestamp - b.targetTimestamp);

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  // Aktif gelecek hedef yoksa, 5 günlük bekleme süresindeki en yakın geçmiş hedefi döndür
  const recentExpired = goals
    .filter((g) => nowMs - g.targetTimestamp < FIVE_DAYS_MS)
    .sort((a, b) => b.targetTimestamp - a.targetTimestamp);

  return recentExpired.length > 0 ? recentExpired[0] : null;
}
