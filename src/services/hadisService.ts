import rawHadisData from '../../public/hadis-data.json';

export interface HadisItem {
  id: number;
  arapcaMetin: string;
  okunusu?: string;
  meali: string;
  kaynagi: string;
  kategori: string;
  isFavorite: boolean;
  isMemorized: boolean;
  userNote: string;
  eklenmeTarihi?: string;
  hikmeti?: string;
  memorizedAt?: string;
  lastReviewedAt?: string;
  reviewCount?: number;
}

export type HadisSortOption =
  | 'custom'
  | 'default'
  | 'date'
  | 'alphabetical'
  | 'favorites'
  | 'category'
  | 'memorized'
  | 'unmemorized';

export type HadisStatPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | '1y'
  | '2y'
  | '3y'
  | '4y'
  | '5y'
  | '6y'
  | '7y'
  | '8y'
  | '9y'
  | '10y'
  | 'custom';

export interface HadisUserOverlay {
  isFavorite?: boolean;
  isMemorized?: boolean;
  userNote?: string;
  memorizedAt?: string;
  lastReviewedAt?: string;
  reviewCount?: number;
}

export interface HadisActivityEntry {
  id: string;
  hadisId: number;
  action: 'memorize' | 'review' | 'read' | 'quiz_correct' | 'quiz_wrong' | 'favorite' | 'note';
  timestamp: string; // ISO date string
  kategori: string;
}

export interface HadisQuizQuestion {
  id: string;
  hadisId: number;
  type: 'multiple_choice_meal' | 'multiple_choice_source' | 'true_false';
  questionTitle: string;
  arabicPrompt: string;
  okunusPrompt?: string;
  statementToVerify?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  kaynagi: string;
  kategori: string;
}

export interface HadisUIAlternativeMeta {
  id: number; // 1..7 (Sıralama: [8, 1, 2, 4, 11, 9, 5])
  legacyId: number; // Orijinal mod numarası: 8, 1, 2, 4, 11, 9, 5
  shortTitle: string;
  fullTitle: string;
  badge: string;
  uxSummary: string;
  uxAdvantages: string[];
}

/**
 * Kullanıcının belirlediği [8, 1, 2, 4, 11, 9, 5] özel sıralamasına göre
 * 1'den 7'ye kadar Türkçe başlıklarla yapılandırılmış 7 temel görünüm modu.
 */
export const HADIS_UI_ALTERNATIVES: HadisUIAlternativeMeta[] = [
  {
    id: 1,
    legacyId: 8,
    shortTitle: '1. Mod · İki Sütunlu Masa',
    fullTitle: '1. Mod: İki Sütunlu Çalışma Masası (Fihrist ve Detay Görünümü)',
    badge: 'Okuma ve Ezber Görünümü',
    uxSummary:
      'Sol sütunda kaydırılabilir hadis fihristi, sağ sütunda seçili hadis-i şerifin geniş okuma ve ezber alanı yer alır.',
    uxAdvantages: [
      'Aynı anda hem hadis fihristini hem de seçili hadisin Arapça metin, okunuş ve mealini gösterir.',
      'Soldan hadis seçildikçe sağ panel sayfa kaybolmadan anında güncellenir.',
      'Sadeleştirilmiş okuma ve ezber odaklı çalışma deneyimi sunar.'
    ]
  },
  {
    id: 2,
    legacyId: 1,
    shortTitle: '2. Mod · Kart Kaydırma',
    fullTitle: '2. Mod: Tekli Kart Kaydırma (Odaklı Ezber Görünümü)',
    badge: 'Okuma ve Ezber Görünümü',
    uxSummary:
      'Ekranda tek seferde bir hadis kartı gösterilir; önceki ve sonraki geçiş butonlarıyla dikkat dağılmadan sıradaki hadise geçilir.',
    uxAdvantages: [
      'Tek bir hadis-i şerifin Arapça metni ve mealine tam odaklanma sağlar.',
      'İleri ve geri geçişlerle hızlı tekrar ve ezber kontrolü imkânı sunar.',
      'Kart üzerindeki ezber, tekrar ve kişisel not araçlarıyla öğrenmeyi hızlandırır.'
    ]
  },
  {
    id: 3,
    legacyId: 2,
    shortTitle: '3. Mod · Dikey Liste',
    fullTitle: '3. Mod: Klasik Dikey Liste (Akış Görünümü)',
    badge: 'Okuma ve Ezber Görünümü',
    uxSummary:
      'Tüm hadis-i şeriflerin belirlenen sırada alt alta dizildiği, hızlıca taranabilir klasik okuma ve ezber listesi.',
    uxAdvantages: [
      'Çok sayıda hadisi aynı anda tarama, okuma ve gözden geçirme kolaylığı sağlar.',
      'Kaydırma hafızası sayesinde sayfadan çıkıp dönüldüğünde kalınan yerden devam edilir.',
      '7. Modda belirlenen sıralamayı birebir dikey akışta yansıtır.'
    ]
  },
  {
    id: 4,
    legacyId: 4,
    shortTitle: '4. Mod · Çevrilebilir Kart',
    fullTitle: '4. Mod: Çevrilebilir Kart (Ön ve Arka Yüz Ezber Görünümü)',
    badge: 'Okuma ve Ezber Görünümü',
    uxSummary:
      'Kartın ön yüzünde Arapça metin ve okunuş; karta tıklandığında arka yüzünde Türkçe meal, kaynak ve hikmet yer alır.',
    uxAdvantages: [
      'Aktif hatırlama yöntemiyle kullanıcıyı meali zihninden bulmaya teşvik eder.',
      'Ön yüzde sadece Arapça ve okunuşu görerek kendi kendine sözlü ezber kontrolü sağlar.',
      'Tek tıkla ön ve arka yüz arasında hızlı geçiş sunar.'
    ]
  },
  {
    id: 5,
    legacyId: 11,
    shortTitle: '5. Mod · Kelime Gizleme (Hıfz)',
    fullTitle: '5. Mod: İnteraktif Kelime Gizleme (Hıfz ve Boşluk Doldurma Görünümü)',
    badge: 'Okuma ve Ezber Görünümü',
    uxSummary:
      'Arapça, okunuş ve Türkçe mealdeki kelimeleri %35, %65 veya %100 oranında gizleyerek tıkladıkça açan hıfz çalışma alanı.',
    uxAdvantages: [
      'Gizlenen kelimeleri önce zihinden okuyup ardından tıklayarak doğrulama imkânı verir.',
      'Kademeli gizleme seviyeleriyle ezberin kalıcılığını pekiştirir.',
      'Açılan kelimeleri tek tuşla yeniden gizleyerek sınırsız tekrar yaptırır.'
    ]
  },
  {
    id: 6,
    legacyId: 9,
    shortTitle: '6. Mod · Hikâye Akışı',
    fullTitle: '6. Mod: Hikâye Akışı (Adım Adım Tam Odak Görünümü)',
    badge: 'Okuma ve Ezber Görünümü',
    uxSummary:
      'Üstte adım adım ilerleme çubukları bulunan, tam odak sağlayan sahne ve seri tekrar görünümü.',
    uxAdvantages: [
      'Üstteki ilerleme çubukları sayesinde liste içindeki konumu net biçimde gösterir.',
      'Önceki ve sonraki adımlarla seri hadis tekrarı yapılmasını kolaylaştırır.',
      'Göz yormayan sade sahne yapısıyla ezber tefekkürünü destekler.'
    ]
  },
  {
    id: 7,
    legacyId: 5,
    shortTitle: '7. Mod · Kompakt Tablo, Sıralama & İndirme',
    fullTitle: '7. Mod: Kompakt Tablo, Sıralama & İndirme Merkezi',
    badge: 'Tablo, Sıralama & İndirme',
    uxSummary:
      'Canlı sürükle-bırak sıralama, satır içi sıra numarasıyla taşıma ve PDF, Word, Excel indirme işlemlerinin yapıldığı ana yönetim tablosu.',
    uxAdvantages: [
      'Bu modda yapılan sıralama anında kaydedilir ve 1–6 numaralı tüm modlara otomatik yansır.',
      'Tutup sürükleyerek, ok tuşlarıyla veya sıra numarası yazarak anında dinamik sıralama sağlar.',
      'Mevcut sıralamaya veya seçilen hadislere göre PDF, Word ve Excel çıktısı üretir.'
    ]
  }
];

/**
 * Eski alternatif numarasını (8, 1, 2, 4, 11, 9, 5) veya yeni mod numarasını (1..7)
 * 1..7 aralığındaki doğru mod numarasına çevirir.
 */
export function resolveHadisModeNumber(input?: number | null): number {
  if (!input || isNaN(input)) return 1;
  if (input >= 1 && input <= 7) return input;
  const byLegacy = HADIS_UI_ALTERNATIVES.find((m) => m.legacyId === input);
  return byLegacy ? byLegacy.id : 1;
}

const USER_STATE_STORAGE_KEY = 'hayat_rehberi_hadis_user_state_v1';
const ACTIVITY_LOG_STORAGE_KEY = 'hayat_rehberi_hadis_activity_logs_v1';
const CUSTOM_ORDER_STORAGE_KEY = 'hayat_rehberi_hadis_custom_order_v1';

export function loadCustomHadisOrder(defaultIds: number[]): number[] {
  if (typeof window === 'undefined') return defaultIds;
  try {
    const raw = localStorage.getItem(CUSTOM_ORDER_STORAGE_KEY);
    if (!raw) return defaultIds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultIds;
    const validIds = parsed
      .map((n) => Number(n))
      .filter((n) => !isNaN(n) && defaultIds.includes(n));
    const missingIds = defaultIds.filter((id) => !validIds.includes(id));
    return [...validIds, ...missingIds];
  } catch {
    return defaultIds;
  }
}

export function saveCustomHadisOrder(orderIds: number[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_ORDER_STORAGE_KEY, JSON.stringify(orderIds));
  } catch {
    // ignore storage errors
  }
}

/**
 * Türkçe Büyük/Küçük Harf (İ/i, I/ı, Ş/ş, Ğ/ğ, Ü/ü, Ö/ö, Ç/ç) ve Aksan Duyarsız
 * Gelişmiş Normalizasyon Fonksiyonu
 */
export function normalizeHadisSearch(str?: string): string {
  if (!str) return '';
  return str
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[âáàäãā]/g, 'a')
    .replace(/[îíìïīıi]/g, 'i')
    .replace(/[ûúùüū]/g, 'u')
    .replace(/[ôóòöō]/g, 'o')
    .replace(/[êéèëē]/g, 'e')
    .replace(/[ş]/g, 's')
    .replace(/[ç]/g, 'c')
    .replace(/[ğ]/g, 'g')
    .replace(/[''’`\-_\.\,\:\;\(\)\/\\!\?"«»“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kelimenin harflerini alfabetik sıraya dizerek harf yer değiştirmelerini (anagram) yakalar.
 * Örn: "İND" -> normalize: "ind" -> sorted: "din" === "din" ("din" -> sorted: "din")
 */
function getSortedLetters(word: string): string {
  return word.split('').sort().join('');
}

/**
 * Sesli harfleri çıkararak sessiz harf iskeletini döndürür.
 */
function getConsonantSkeleton(word: string): string {
  return word.replace(/[aeiou]/g, '');
}

/**
 * Damerau-Levenshtein Mesafesi (Yan yana harf yer değiştirmesini tek hata sayar: örn "ind" <-> "din")
 */
function damerauLevenshtein(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const dp: number[][] = Array.from({ length: lenA + 1 }, () =>
    new Array(lenB + 1).fill(0)
  );

  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // silme
        dp[i][j - 1] + 1, // ekleme
        dp[i - 1][j - 1] + cost // değiştirme
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost); // yer değiştirme
      }
    }
  }
  return dp[lenA][lenB];
}

/**
 * Akıllı Kavramsal ve Mantıksal Eşleştirme Sözlüğü:
 * Kullanıcının yazdığı devrik/hatalı kelimeleri (örn: "ind" -> "din") ve
 * eş/yakın anlamlı İslami kavramları genişletir.
 */
const SMART_SYNONYM_MAP: Record<string, string[]> = {
  ind: ['din', 'dinin', 'dini', 'iman', 'islam', 'samimiyet'],
  dni: ['din', 'dinin', 'dini', 'iman', 'islam'],
  idn: ['din', 'dinin', 'dini', 'iman', 'islam'],
  ndi: ['din', 'dinin', 'dini'],
  nid: ['din', 'dinin', 'dini'],
  din: ['din', 'dinin', 'dini', 'iman', 'islam', 'samimiyet', 'nasihat'],
  iman: ['iman', 'mumin', 'inanc', 'din', 'ihlas', 'haya', 'temizlik'],
  imn: ['iman', 'mumin', 'din', 'ihlas'],
  islam: ['islam', 'musluman', 'mumin', 'din', 'iman'],
  islm: ['islam', 'musluman', 'mumin', 'din'],
  namaz: ['namaz', 'salat', 'ibadet', 'dinin diregi'],
  nmz: ['namaz', 'salat', 'ibadet'],
  nmaaz: ['namaz', 'salat', 'ibadet'],
  salat: ['namaz', 'salat', 'ibadet'],
  ilim: ['ilim', 'alimler', 'ogrenen', 'ogreten', 'kuran', 'farz', 'cennet'],
  ilm: ['ilim', 'ogrenen', 'ogreten', 'kuran'],
  bilgi: ['ilim', 'ogrenen', 'ogreten'],
  kuran: ['kuran', 'kurani', 'kitabina', 'ogrenen', 'ogreten', 'ilim'],
  kran: ['kuran', 'kurani', 'ogrenen', 'ogreten'],
  ahlak: ['ahlak', 'huluk', 'guzel', 'iyilik', 'haya', 'edep', 'merhamet'],
  ahlk: ['ahlak', 'huluk', 'guzel', 'edep'],
  edep: ['haya', 'edep', 'utanma', 'ahlak', 'dilini'],
  haya: ['haya', 'edep', 'utanma', 'imandandir'],
  merhamet: ['merhamet', 'yerham', 'sefkat', 'rahmet', 'tebessum'],
  mrhmt: ['merhamet', 'yerham', 'sefkat'],
  sefkat: ['merhamet', 'sefkat', 'ailesine', 'hayirli'],
  sadaka: ['sadaka', 'tebessum', 'guzel soz', 'iyilik'],
  tebessum: ['tebessum', 'gulumseme', 'yuzune', 'sadaka'],
  gulumseme: ['tebessum', 'yuzune', 'sadaka', 'guzel soz'],
  sabir: ['sabir', 'sabreder', 'isiktir', 'ofkelendigi', 'pehlivan', 'sikinti'],
  sbr: ['sabir', 'sabreder', 'isiktir', 'sukur'],
  sukur: ['sukur', 'sukreder', 'tesekkur', 'hamd', 'elhamdulillah'],
  skr: ['sukur', 'sukreder', 'tesekkur'],
  tesekkur: ['tesekkur', 'sukretmez', 'sukur', 'insanlara'],
  ofke: ['ofkelendigi', 'ofkesindedir', 'pehlivan', 'nefsine', 'gadab'],
  pehlivan: ['pehlivan', 'guclu', 'gureste', 'ofkelendigi', 'nefsine'],
  niyet: ['niyet', 'niyyat', 'ameller', 'ihlas', 'samimiyet', 'kalp'],
  nyt: ['niyet', 'niyyat', 'ameller', 'ihlas'],
  ihlas: ['ihlas', 'niyet', 'samimiyet', 'kalplerinize', 'amellerinize'],
  ihls: ['ihlas', 'niyet', 'samimiyet', 'kalplerinize'],
  kalp: ['kalplerinize', 'kalp', 'niyet', 'suretlerinize', 'amellerinize'],
  dua: ['dua', 'zikir', 'ibadetin', 'elhamdulillah', 'subhanallahi'],
  zikir: ['zikir', 'zikrin', 'la ilahe illallah', 'subhanallahi', 'dua'],
  zkr: ['zikir', 'zikrin', 'subhanallahi', 'dua'],
  anne: ['anne', 'baba', 'valid', 'rizasi', 'ailesine'],
  baba: ['anne', 'baba', 'valid', 'rizasi', 'ailesine'],
  ebeveyn: ['anne', 'baba', 'valid', 'ailesine'],
  aile: ['ailesine', 'aileme', 'anne', 'baba', 'ehline'],
  temizlik: ['temizlik', 'tuhur', 'taharet', 'imanin yarisi'],
  tmzlk: ['temizlik', 'tuhur', 'taharet'],
  dil: ['dilinden', 'dilini', 'susan', 'soz', 'kurtuldu'],
  susmak: ['susan', 'dilini', 'samete', 'kurtuldu'],
  kolay: ['kolaylastiriniz', 'zorlastirmayiniz', 'mujdeleyiniz'],
  hayir: ['hayir', 'hayirliniz', 'hayra', 'vesile', 'faydasi'],
  buhari: ['buhari'],
  bhri: ['buhari'],
  muslim: ['muslim'],
  mslm: ['muslim'],
  tirmizi: ['tirmizi'],
  trmzi: ['tirmizi']
};

/**
 * Tek bir arama kelimesinin (token) hadis metin havuzunda ne kadar güçlü eşleştiğini (0..100) hesaplar.
 */
function scoreTokenAgainstHadis(
  token: string,
  normalizedFullText: string,
  normalizedWords: string[],
  rawArabic: string,
  rawQueryToken: string
): number {
  if (!token) return 100;

  // 1. Arapça doğrudan eşleşme
  if (rawArabic.includes(rawQueryToken)) return 100;

  // 2. Doğrudan tam kelime veya alt dizgi (substring) eşleşmesi
  if (normalizedWords.includes(token)) return 100;
  if (normalizedFullText.includes(token)) return 95;

  // 3. Sözlük / Mantıksal / Anagram genişletme eşleşmesi (Örn: "İND" -> "ind" -> "din")
  const expandedTerms = new Set<string>([token]);
  if (SMART_SYNONYM_MAP[token]) {
    for (const syn of SMART_SYNONYM_MAP[token]) {
      expandedTerms.add(syn);
    }
  }

  const tokenSorted = getSortedLetters(token);

  // Eğer token'ın harf dizilimi (anagramı) sözlükteki bir anahtarla aynıysa (örn: "ind" -> "din")
  for (const [key, syns] of Object.entries(SMART_SYNONYM_MAP)) {
    if (key.length === token.length && getSortedLetters(key) === tokenSorted) {
      expandedTerms.add(key);
      for (const s of syns) expandedTerms.add(s);
    }
  }

  for (const term of expandedTerms) {
    if (term === token) continue;
    if (normalizedWords.includes(term)) return 92;
    if (normalizedFullText.includes(term)) return 88;
  }

  // 4. Kelime bazlı Anagram (Harf Yer Değiştirme: örn "ind" -> "din" / "dinin", "nmaaz" -> "namaz")
  if (token.length >= 2) {
    for (const w of normalizedWords) {
      if (w.length < 2) continue;
      // Birebir aynı uzunlukta anagram (örn: "ind" === "din")
      if (w.length === token.length && getSortedLetters(w) === tokenSorted) {
        return 90;
      }
      // Ek almış Türkçe kelime kökünde anagram (örn: "ind" (3 harf) -> "dinin" ilk 3 harfi "din")
      if (
        token.length >= 3 &&
        w.length > token.length &&
        w.length <= token.length + 4 &&
        getSortedLetters(w.slice(0, token.length)) === tokenSorted
      ) {
        return 86;
      }
    }
  }

  // 5. Sessiz Harf İskeleti Eşleşmesi (Örn: "nmz" -> "namaz", "mrhmt" -> "merhamet")
  const tokenSkeleton = getConsonantSkeleton(token);
  if (tokenSkeleton.length >= 2) {
    for (const w of normalizedWords) {
      const wSkel = getConsonantSkeleton(w);
      if (!wSkel) continue;
      if (wSkel === tokenSkeleton || wSkel.startsWith(tokenSkeleton)) {
        return 82;
      }
    }
  }

  // 6. Toleranslı Yazım (Damerau-Levenshtein & Kök Yakınlığı)
  if (token.length >= 3) {
    let bestFuzzy = 0;
    for (const w of normalizedWords) {
      if (w.length < 2) continue;
      // Kelimenin kendisiyle veya aynı uzunluktaki köküyle karşılaştır
      const candidateRoot = w.length > token.length + 1 ? w.slice(0, token.length) : w;
      const distFull = damerauLevenshtein(token, w);
      const distRoot = damerauLevenshtein(token, candidateRoot);
      const dist = Math.min(distFull, distRoot);
      const maxLen = Math.max(token.length, candidateRoot.length);
      const allowedDist = token.length <= 3 ? 1 : token.length <= 6 ? 2 : 3;

      if (dist <= allowedDist) {
        const simScore = Math.round((1 - dist / maxLen) * 78);
        if (simScore > bestFuzzy) bestFuzzy = simScore;
      }
    }
    if (bestFuzzy >= 48) return bestFuzzy;
  }

  // 7. Sıralı Karakter Uyumu (Subsequence) - Eksik harfle yazım için
  if (token.length >= 3) {
    for (const w of normalizedWords) {
      if (w.length < token.length) continue;
      let tIdx = 0;
      for (let i = 0; i < w.length && tIdx < token.length; i++) {
        if (w[i] === token[tIdx]) tIdx++;
      }
      if (tIdx === token.length && token.length / w.length >= 0.5) {
        return 65;
      }
    }
  }

  return 0;
}

export function loadUserHadisOverlays(): Record<number, HadisUserOverlay> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_STATE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveUserHadisOverlays(overlays: Record<number, HadisUserOverlay>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STATE_STORAGE_KEY, JSON.stringify(overlays));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Harici JSON dosyasından temel hadis verilerini okur ve kullanıcının
 * yerel hafızadaki (Favori, Ezber, Not, Tekrar Sayısı) verileriyle birleştirir.
 */
export function getAllHadisler(): HadisItem[] {
  const overlays = loadUserHadisOverlays();
  return (rawHadisData as HadisItem[]).map((item) => {
    const userOverlay = overlays[item.id] || {};
    return {
      ...item,
      isFavorite: userOverlay.isFavorite ?? item.isFavorite ?? false,
      isMemorized: userOverlay.isMemorized ?? item.isMemorized ?? false,
      userNote: userOverlay.userNote ?? item.userNote ?? '',
      memorizedAt: userOverlay.memorizedAt,
      lastReviewedAt: userOverlay.lastReviewedAt,
      reviewCount: userOverlay.reviewCount ?? 0
    };
  });
}

/**
 * Günün hadisini tarihe duyarlı deterministik olarak döndürür (Widget ve Bildirimler için).
 */
export function getGunlukHadis(date: Date = new Date()): HadisItem {
  const list = getAllHadisler();
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return list[dayOfYear % list.length] || list[0];
}

/**
 * Gelişmiş Akıllı Arama ve Dinamik Sıralama Motoru
 */
export function filterAndSortHadisler(
  items: HadisItem[],
  options: {
    searchQuery: string;
    category: string;
    quickFilter: 'all' | 'favorites' | 'memorized' | 'unmemorized' | 'noted';
    sortBy: HadisSortOption;
    customOrderIds?: number[];
  }
): HadisItem[] {
  const { searchQuery, category, quickFilter, sortBy, customOrderIds } = options;
  const qRaw = searchQuery.trim();
  const qNorm = normalizeHadisSearch(qRaw);
  const queryTokens = qNorm ? qNorm.split(/\s+/).filter(Boolean) : [];
  const rawTokens = qRaw ? qRaw.split(/\s+/).filter(Boolean) : [];

  // Özel sıralama indeks haritası
  const orderMap = new Map<number, number>();
  if (customOrderIds && customOrderIds.length > 0) {
    customOrderIds.forEach((id, idx) => orderMap.set(id, idx));
  }

  const getCustomRank = (id: number) =>
    orderMap.has(id) ? (orderMap.get(id) as number) : id + 10000;

  const matchScores = new Map<number, number>();

  const filtered = items.filter((item) => {
    // Hızlı filtre
    if (quickFilter === 'favorites' && !item.isFavorite) return false;
    if (quickFilter === 'memorized' && !item.isMemorized) return false;
    if (quickFilter === 'unmemorized' && item.isMemorized) return false;
    if (quickFilter === 'noted' && (!item.userNote || !item.userNote.trim())) return false;

    // Kategori filtresi
    if (category && category !== 'all' && item.kategori !== category) {
      return false;
    }

    // Arama sorgusu yoksa tümünü geçir
    if (!qRaw || queryTokens.length === 0) {
      matchScores.set(item.id, 100);
      return true;
    }

    // Numara ile arama (#3 veya 3)
    const cleanNum = qRaw.replace(/^#/, '').trim();
    if (cleanNum && /^\d+$/.test(cleanNum) && Number(cleanNum) === item.id) {
      matchScores.set(item.id, 100);
      return true;
    }

    // Hadisin tüm aranabilir alanlarını birleştir ve normalize et
    const combinedNorm = normalizeHadisSearch(
      `${item.meali} ${item.okunusu || ''} ${item.kategori} ${item.kaynagi} ${item.hikmeti || ''} ${item.userNote || ''}`
    );
    const words = Array.from(new Set(combinedNorm.split(/\s+/).filter(Boolean)));

    // Her bir arama kelimesini (token) puanla
    let totalScore = 0;
    for (let i = 0; i < queryTokens.length; i++) {
      const tokenScore = scoreTokenAgainstHadis(
        queryTokens[i],
        combinedNorm,
        words,
        item.arapcaMetin,
        rawTokens[i] || qRaw
      );
      if (tokenScore <= 0) {
        return false; // Çok kelimeli aramada kelimelerden biri hiç eşleşmiyorsa ele
      }
      totalScore += tokenScore;
    }

    const avgScore = totalScore / queryTokens.length;
    matchScores.set(item.id, avgScore);
    return avgScore >= 48;
  });

  // Dinamik Sıralama (7. Mod tablosundaki özel sıralama diğer tüm modlara yansır)
  const sorted = [...filtered];
  sorted.sort((a, b) => {
    // Eğer aktif bir arama varsa ve biri çok daha güçlü bir eşleşmeyse önce onu göster
    if (qRaw && queryTokens.length > 0) {
      const scoreA = matchScores.get(a.id) ?? 0;
      const scoreB = matchScores.get(b.id) ?? 0;
      if (Math.abs(scoreA - scoreB) >= 12) {
        return scoreB - scoreA;
      }
    }

    switch (sortBy) {
      case 'custom':
        return getCustomRank(a.id) - getCustomRank(b.id);
      case 'date': {
        const dA = a.memorizedAt || a.eklenmeTarihi || '2025-01-01';
        const dB = b.memorizedAt || b.eklenmeTarihi || '2025-01-01';
        return dB.localeCompare(dA) || getCustomRank(a.id) - getCustomRank(b.id);
      }
      case 'alphabetical':
        return a.meali.localeCompare(b.meali, 'tr-TR');
      case 'favorites':
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return getCustomRank(a.id) - getCustomRank(b.id);
      case 'category':
        return (
          a.kategori.localeCompare(b.kategori, 'tr-TR') ||
          getCustomRank(a.id) - getCustomRank(b.id)
        );
      case 'memorized':
        if (a.isMemorized !== b.isMemorized) return a.isMemorized ? -1 : 1;
        return getCustomRank(a.id) - getCustomRank(b.id);
      case 'unmemorized':
        if (a.isMemorized !== b.isMemorized) return a.isMemorized ? 1 : -1;
        return getCustomRank(a.id) - getCustomRank(b.id);
      case 'default':
      default: {
        // Eğer kullanıcı özel bir tablo sıralaması oluşturmuşsa onu temel al
        if (customOrderIds && customOrderIds.length > 0) {
          return getCustomRank(a.id) - getCustomRank(b.id);
        }
        return a.id - b.id;
      }
    }
  });

  return sorted;
}

/**
 * Uzun Vadeli (Günlük, Haftalık, Aylık, 1-10 Yıllık) Aktivite Kayıtları
 */
export function loadActivityLogs(): HadisActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function logHadisActivity(
  hadisId: number,
  action: HadisActivityEntry['action'],
  kategori: string
): HadisActivityEntry[] {
  const current = loadActivityLogs();
  const entry: HadisActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    hadisId,
    action,
    timestamp: new Date().toISOString(),
    kategori
  };
  const updated = [entry, ...current].slice(0, 5000);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export interface HadisPeriodReport {
  startDate: Date;
  endDate: Date;
  memorizedCount: number;
  reviewCount: number;
  quizTotal: number;
  quizCorrect: number;
  quizAccuracy: number;
  activeDaysCount: number;
  categoryBreakdown: Array<{ kategori: string; memorized: number; reviews: number }>;
  yearlyTimeline: Array<{ yearLabel: string; memorized: number; reviews: number; quizzes: number }>;
}

export function calculatePeriodReport(
  items: HadisItem[],
  logs: HadisActivityEntry[],
  period: HadisStatPeriod,
  customStart?: string,
  customEnd?: string
): HadisPeriodReport {
  const now = new Date();
  let endDate = new Date(now);
  let startDate = new Date(now);

  if (period === 'daily') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'monthly') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (period.endsWith('y')) {
    const years = parseInt(period.replace('y', ''), 10) || 1;
    startDate.setFullYear(now.getFullYear() - years);
  } else if (period === 'custom') {
    startDate = customStart ? new Date(`${customStart}T00:00:00`) : new Date(now.getFullYear() - 1, 0, 1);
    endDate = customEnd ? new Date(`${customEnd}T23:59:59`) : new Date(now);
  }

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const filteredLogs = logs.filter((l) => {
    const t = new Date(l.timestamp).getTime();
    return t >= startMs && t <= endMs;
  });

  // Mevcut ezberlenmiş hadislerden bu tarih aralığına düşenler
  const memorizedInPeriod = items.filter((item) => {
    if (!item.isMemorized) return false;
    if (!item.memorizedAt) return true;
    const t = new Date(item.memorizedAt).getTime();
    return t >= startMs && t <= endMs;
  });

  const reviewLogs = filteredLogs.filter((l) => l.action === 'review' || l.action === 'read');
  const totalReviewsFromItems = items.reduce((acc, it) => acc + (it.reviewCount || 0), 0);
  const reviewCount = Math.max(reviewLogs.length, period !== 'custom' ? totalReviewsFromItems : reviewLogs.length);

  const quizCorrect = filteredLogs.filter((l) => l.action === 'quiz_correct').length;
  const quizWrong = filteredLogs.filter((l) => l.action === 'quiz_wrong').length;
  const quizTotal = quizCorrect + quizWrong;
  const quizAccuracy = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 100;

  const uniqueDays = new Set(
    filteredLogs.map((l) => l.timestamp.slice(0, 10))
  );
  if (memorizedInPeriod.length > 0 && uniqueDays.size === 0) {
    uniqueDays.add(now.toISOString().slice(0, 10));
  }

  // Kategori bazlı dağılım
  const categories = Array.from(new Set(items.map((i) => i.kategori)));
  const categoryBreakdown = categories.map((kat) => {
    const katItems = items.filter((i) => i.kategori === kat);
    const memorized = katItems.filter((i) => i.isMemorized).length;
    const reviews =
      katItems.reduce((sum, i) => sum + (i.reviewCount || 0), 0) +
      filteredLogs.filter((l) => l.kategori === kat && l.action === 'review').length;
    return { kategori: kat, memorized, reviews };
  });

  // 1 - 10 Yıllık Zaman Çizelgesi Özeti
  const currentYear = now.getFullYear();
  const yearsSpan = period.endsWith('y') ? parseInt(period.replace('y', ''), 10) : 10;
  const displayYears = Math.min(Math.max(yearsSpan, 5), 10);
  const yearlyTimeline: Array<{ yearLabel: string; memorized: number; reviews: number; quizzes: number }> = [];

  for (let i = displayYears - 1; i >= 0; i--) {
    const y = currentYear - i;
    const yStr = String(y);
    const yLogs = logs.filter((l) => l.timestamp.startsWith(yStr));
    const yMem = items.filter(
      (it) => it.isMemorized && (it.memorizedAt ? it.memorizedAt.startsWith(yStr) : y === currentYear)
    ).length;
    const yRev =
      yLogs.filter((l) => l.action === 'review' || l.action === 'read').length +
      (y === currentYear ? items.reduce((s, it) => s + (it.reviewCount || 0), 0) : 0);
    const yQuiz = yLogs.filter((l) => l.action === 'quiz_correct' || l.action === 'quiz_wrong').length;
    yearlyTimeline.push({
      yearLabel: `${y}`,
      memorized: yMem,
      reviews: yRev,
      quizzes: yQuiz
    });
  }

  return {
    startDate,
    endDate,
    memorizedCount: memorizedInPeriod.length,
    reviewCount,
    quizTotal,
    quizCorrect,
    quizAccuracy,
    activeDaysCount: uniqueDays.size,
    categoryBreakdown,
    yearlyTimeline
  };
}

/**
 * Akıllı Ezber Testi Üretici (Çoktan Seçmeli & Doğru/Yanlış Eşleştirmeli)
 */
export function generateHadisQuiz(
  allItems: HadisItem[],
  onlyMemorized: boolean,
  questionCount = 6
): HadisQuizQuestion[] {
  const memorizedPool = allItems.filter((i) => i.isMemorized);
  const sourcePool = onlyMemorized && memorizedPool.length >= 2 ? memorizedPool : allItems;

  const shuffled = [...sourcePool].sort(() => Math.random() - 0.5).slice(0, questionCount);

  return shuffled.map((target, idx) => {
    const distractors = allItems
      .filter((i) => i.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const mod = idx % 3;

    if (mod === 0) {
      // Tip 1: Arapça Metinden Doğru Meali Bulma
      const options = [target.meali, ...distractors.map((d) => d.meali)].sort(() => Math.random() - 0.5);
      return {
        id: `q-${target.id}-meal`,
        hadisId: target.id,
        type: 'multiple_choice_meal',
        questionTitle: 'Yukarıdaki hadis-i şerifin doğru meali aşağıdakilerden hangisidir?',
        arabicPrompt: target.arapcaMetin,
        okunusPrompt: target.okunusu,
        options,
        correctAnswer: target.meali,
        explanation: `${target.meali} (${target.kaynagi})`,
        kaynagi: target.kaynagi,
        kategori: target.kategori
      };
    } else if (mod === 1) {
      // Tip 2: Doğru / Yanlış (Anlam - Doğruluk Eşleştirmesi)
      const isCorrectPair = Math.random() >= 0.45;
      const pairedItem = isCorrectPair ? target : distractors[0] || target;
      const correctAns = isCorrectPair ? 'Doğru Eşleşme' : 'Yanlış Eşleşme';
      return {
        id: `q-${target.id}-tf`,
        hadisId: target.id,
        type: 'true_false',
        questionTitle: 'Verilen Arapça hadis-i şerif ile altındaki Türkçe meal eşleşmesi doğru mudur?',
        arabicPrompt: target.arapcaMetin,
        okunusPrompt: target.okunusu,
        statementToVerify: `"${pairedItem.meali}"`,
        options: ['Doğru Eşleşme', 'Yanlış Eşleşme'],
        correctAnswer: correctAns,
        explanation: `Asıl Meali: "${target.meali}" — Kaynak: ${target.kaynagi}`,
        kaynagi: target.kaynagi,
        kategori: target.kategori
      };
    } else {
      // Tip 3: Mealden Ravi / Kaynak ve Konu Eşleştirme
      const options = [
        `${target.kaynagi} (${target.kategori})`,
        ...distractors.map((d) => `${d.kaynagi} (${d.kategori})`)
      ].sort(() => Math.random() - 0.5);
      return {
        id: `q-${target.id}-src`,
        hadisId: target.id,
        type: 'multiple_choice_source',
        questionTitle: `"${target.meali}" hadis-i şerifinin kaynağı (ravisi) ve konusu hangisidir?`,
        arabicPrompt: target.arapcaMetin,
        okunusPrompt: target.okunusu,
        options,
        correctAnswer: `${target.kaynagi} (${target.kategori})`,
        explanation: `Kaynak: ${target.kaynagi} · Kategori: ${target.kategori}`,
        kaynagi: target.kaynagi,
        kategori: target.kategori
      };
    }
  });
}

/**
 * Raporlama ve Dışa Aktarım (PDF, Word, Excel)
 * Üst ve alt kısımlarda gözü yormayan şık "Hayat Rehberi" anteti ve özel filigranı içerir.
 */
function buildBrandedHtmlDocument(items: HadisItem[], reportTitle: string): string {
  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const rowsHtml = items
    .map(
      (h, i) => `
      <div class="hadis-card">
        <div class="hadis-meta">
          <span><strong>#${i + 1} (Hadis No: ${h.id})</strong> · Kategori: ${h.kategori}</span>
          <span>${h.isMemorized ? '✓ Ezberlendi' : '○ Ezberlenecek'} ${h.isFavorite ? '· ★ Favori' : ''}</span>
        </div>
        <div class="arabic" dir="rtl">${h.arapcaMetin}</div>
        ${h.okunusu ? `<div class="okunus"><strong>Okunuşu:</strong> ${h.okunusu}</div>` : ''}
        <div class="meal"><strong>Meali:</strong> ${h.meali}</div>
        <div class="kaynak"><strong>Kaynak / Ravi:</strong> ${h.kaynagi}</div>
        ${h.userNote ? `<div class="note"><strong>Kişisel Notum:</strong> ${h.userNote}</div>` : ''}
      </div>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>Hayat Rehberi — ${reportTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 16mm 22mm 16mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      position: relative;
      line-height: 1.55;
    }
    .watermark {
      position: fixed;
      top: 46%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-28deg);
      font-size: 54px;
      font-weight: 800;
      color: rgba(6, 78, 59, 0.045);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 4px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #065f46;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #064e3b;
      color: #fde68a;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #064e3b;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .report-info {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .hadis-card {
      position: relative;
      z-index: 1;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      background: #fcfdfd;
    }
    .hadis-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #047857;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .arabic {
      font-family: 'Amiri', 'Traditional Arabic', serif;
      font-size: 22px;
      color: #064e3b;
      text-align: right;
      margin: 8px 0 10px 0;
      line-height: 1.9;
    }
    .okunus {
      font-size: 12px;
      color: #334155;
      font-style: italic;
      margin-bottom: 6px;
    }
    .meal {
      font-size: 13.5px;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .kaynak {
      font-size: 11.5px;
      color: #64748b;
    }
    .note {
      margin-top: 8px;
      padding: 6px 10px;
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      font-size: 11.5px;
      color: #065f46;
    }
    .brand-footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="watermark">☾ HAYAT REHBERİ</div>

  <header class="brand-header">
    <div class="brand-left">
      <div class="brand-icon">☾</div>
      <div>
        <h1 class="brand-title">Hayat Rehberi — Hadis-i Şerif Ezberle</h1>
        <p class="brand-sub">Kur'an-ı Kerim, Sünnet-i Seniyye, İbadet ve Maneviyat Rehberi</p>
      </div>
    </div>
    <div class="report-info">
      <div><strong>${reportTitle}</strong></div>
      <div>Tarih: ${dateStr} · Toplam: ${items.length} Hadis-i Şerif</div>
    </div>
  </header>

  <main>
    ${rowsHtml}
  </main>

  <footer class="brand-footer">
    <span><strong>☾ Hayat Rehberi</strong> — Hadis-i Şerif Ezber ve İlim Modülü</span>
    <span>Selim Uysal · Kaynaklar: Kütüb-i Sitte & Riyâzü's-Sâlihîn</span>
  </footer>
</body>
</html>`;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text || !text.trim()) return [];
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
  }

  return lines;
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function buildPdfFromJpegPages(
  pages: { jpegBytes: Uint8Array; width: number; height: number }[]
): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0]; // index 0 is free object
  let currentOffset = 0;

  const pushStr = (str: string) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const startObj = (id: number) => {
    offsets[id] = currentOffset;
    pushStr(`${id} 0 obj\n`);
  };

  const endObj = () => {
    pushStr(`endobj\n`);
  };

  // PDF 1.4 Header
  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  startObj(1);
  pushStr('<< /Type /Catalog /Pages 2 0 R >>\n');
  endObj();

  // Object 2: Pages
  const pageCount = pages.length;
  const kidsRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  startObj(2);
  pushStr(`<< /Type /Pages /Kids [${kidsRefs}] /Count ${pageCount} >>\n`);
  endObj();

  // Page, Content Stream, and Image XObject for each page (A4: 595.28 x 841.89 pt)
  const pdfPageW = 595.28;
  const pdfPageH = 841.89;

  pages.forEach((page, i) => {
    const pageObjId = 3 + i * 3;
    const contentObjId = 4 + i * 3;
    const imageObjId = 5 + i * 3;
    const imgName = `/Im${i + 1}`;

    // Page Object
    startObj(pageObjId);
    pushStr(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPageW} ${pdfPageH}] /Resources << /XObject << ${imgName} ${imageObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\n`
    );
    endObj();

    // Content Stream
    const contentStream = `q\n${pdfPageW} 0 0 ${pdfPageH} 0 0 cm\n${imgName} Do\nQ\n`;
    const contentBytes = encoder.encode(contentStream);
    startObj(contentObjId);
    pushStr(`<< /Length ${contentBytes.length} >>\nstream\n`);
    pushBytes(contentBytes);
    pushStr('\nendstream\n');
    endObj();

    // Image XObject (DCTDecode = raw JPEG)
    startObj(imageObjId);
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpegBytes.length} >>\nstream\n`
    );
    pushBytes(page.jpegBytes);
    pushStr('\nendstream\n');
    endObj();
  });

  // Cross-reference table (xref)
  const totalObjects = 2 + pageCount * 3;
  const xrefOffset = currentOffset;
  pushStr(`xref\n0 ${totalObjects + 1}\n`);
  pushStr('0000000000 65535 f \n');
  for (let id = 1; id <= totalObjects; id++) {
    const off = (offsets[id] || 0).toString().padStart(10, '0');
    pushStr(`${off} 00000 n \n`);
  }

  // Trailer
  pushStr(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  const pdfBuffer = new ArrayBuffer(currentOffset);
  const merged = new Uint8Array(pdfBuffer);
  let pos = 0;
  for (const chunk of chunks) {
    merged.set(chunk, pos);
    pos += chunk.length;
  }

  return new Blob([pdfBuffer], { type: 'application/pdf' });
}

export function exportHadislerToPDF(
  items: HadisItem[],
  reportTitle = 'Hadis-i Şerif Ezber Raporu'
): void {
  if (typeof window === 'undefined') return;

  const PAGE_W = 1240;
  const PAGE_H = 1754;
  const MARGIN_X = 76;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;
  const CONTENT_TOP = 204;
  const CONTENT_BOTTOM = 1630;
  const CARD_PAD_X = 30;
  const CARD_PAD_Y = 22;
  const INNER_W = CONTENT_W - CARD_PAD_X * 2;
  const CARD_GAP = 22;

  const FONT_SANS = '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif';
  const FONT_ARABIC = '"Amiri", "Traditional Arabic", "Scheherazade New", "Times New Roman", serif';

  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) return;

  interface PreparedCard {
    item: HadisItem;
    index: number;
    arabicLines: string[];
    okunusLines: string[];
    mealLines: string[];
    kaynakLines: string[];
    noteLines: string[];
    height: number;
  }

  const preparedCards: PreparedCard[] = items.map((h, idx) => {
    mCtx.font = `bold 32px ${FONT_ARABIC}`;
    const arabicLines = wrapCanvasText(mCtx, h.arapcaMetin, INNER_W);

    mCtx.font = `italic 19px ${FONT_SANS}`;
    const okunusLines = h.okunusu
      ? wrapCanvasText(mCtx, `Okunuşu: ${h.okunusu}`, INNER_W)
      : [];

    mCtx.font = `21px ${FONT_SANS}`;
    const mealLines = wrapCanvasText(mCtx, `Meali: ${h.meali}`, INNER_W);

    mCtx.font = `18px ${FONT_SANS}`;
    const kaynakLines = wrapCanvasText(mCtx, `Kaynak / Ravi: ${h.kaynagi}`, INNER_W);

    mCtx.font = `18px ${FONT_SANS}`;
    const noteLines = h.userNote
      ? wrapCanvasText(mCtx, `Kişisel Notum: ${h.userNote}`, INNER_W - 28)
      : [];

    let height = CARD_PAD_Y * 2;
    height += 42; // meta bar + divider
    height += arabicLines.length * 52 + 12;
    if (okunusLines.length > 0) height += okunusLines.length * 28 + 10;
    height += mealLines.length * 31 + 10;
    height += kaynakLines.length * 26;
    if (noteLines.length > 0) height += 14 + noteLines.length * 26 + 18;

    return {
      item: h,
      index: idx,
      arabicLines,
      okunusLines,
      mealLines,
      kaynakLines,
      noteLines,
      height
    };
  });

  // Paginate cards
  const pageGroups: PreparedCard[][] = [];
  let currentGroup: PreparedCard[] = [];
  let currentY = CONTENT_TOP;

  for (const card of preparedCards) {
    if (currentGroup.length > 0 && currentY + card.height > CONTENT_BOTTOM) {
      pageGroups.push(currentGroup);
      currentGroup = [card];
      currentY = CONTENT_TOP + card.height + CARD_GAP;
    } else {
      currentGroup.push(card);
      currentY += card.height + CARD_GAP;
    }
  }
  if (currentGroup.length > 0 || pageGroups.length === 0) {
    pageGroups.push(currentGroup);
  }

  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const totalPages = pageGroups.length;
  const renderedPages: { jpegBytes: Uint8Array; width: number; height: number }[] = [];

  pageGroups.forEach((group, pageIdx) => {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. White Page Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);

    // 2. Subtle Diagonal Watermark
    ctx.save();
    ctx.translate(PAGE_W / 2, PAGE_H / 2);
    ctx.rotate((-28 * Math.PI) / 180);
    ctx.font = `800 72px ${FONT_SANS}`;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.04)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☾ HAYAT REHBERİ', 0, 0);
    ctx.restore();

    // 3. Branded Header
    const headerY = 68;
    // Brand Badge
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.roundRect(MARGIN_X, headerY, 64, 64, 14);
    ctx.fill();

    ctx.fillStyle = '#fde68a';
    ctx.font = `bold 32px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☾', MARGIN_X + 32, headerY + 33);

    // Brand Title & Subtitle
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#064e3b';
    ctx.font = `800 28px ${FONT_SANS}`;
    ctx.fillText('Hayat Rehberi — Hadis-i Şerif Ezberle', MARGIN_X + 82, headerY + 4);

    ctx.fillStyle = '#64748b';
    ctx.font = `18px ${FONT_SANS}`;
    ctx.fillText(
      "Kur'an-ı Kerim, Sünnet-i Seniyye, İbadet ve Maneviyat Rehberi",
      MARGIN_X + 82,
      headerY + 40
    );

    // Right Report Info
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 19px ${FONT_SANS}`;
    ctx.fillText(reportTitle, PAGE_W - MARGIN_X, headerY + 6);

    ctx.fillStyle = '#475569';
    ctx.font = `17px ${FONT_SANS}`;
    ctx.fillText(
      `Tarih: ${dateStr} · Toplam: ${items.length} Hadis-i Şerif`,
      PAGE_W - MARGIN_X,
      headerY + 36
    );

    // Header Divider Line
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, headerY + 84);
    ctx.lineTo(PAGE_W - MARGIN_X, headerY + 84);
    ctx.stroke();

    // 4. Cards
    let y = CONTENT_TOP;

    if (group.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = `22px ${FONT_SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'Dışa aktarılacak hadis-i şerif bulunamadı.',
        PAGE_W / 2,
        CONTENT_TOP + 120
      );
    }

    for (const card of group) {
      const { item: h } = card;

      // Card background & border
      ctx.fillStyle = '#fcfdfd';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(MARGIN_X, y, CONTENT_W, card.height, 16);
      ctx.fill();
      ctx.stroke();

      let cy = y + CARD_PAD_Y;

      // Meta Row
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#047857';
      ctx.font = `bold 19px ${FONT_SANS}`;
      ctx.fillText(
        `#${card.index + 1} (Hadis No: ${h.id})  ·  Kategori: ${h.kategori}`,
        MARGIN_X + CARD_PAD_X,
        cy
      );

      ctx.textAlign = 'right';
      ctx.fillStyle = h.isMemorized ? '#047857' : '#64748b';
      ctx.font = `bold 18px ${FONT_SANS}`;
      const statusStr = `${h.isMemorized ? '✓ Ezberlendi' : '○ Ezberlenecek'}${
        h.isFavorite ? '  ·  ★ Favori' : ''
      }`;
      ctx.fillText(statusStr, PAGE_W - MARGIN_X - CARD_PAD_X, cy);

      cy += 30;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN_X + CARD_PAD_X, cy);
      ctx.lineTo(PAGE_W - MARGIN_X - CARD_PAD_X, cy);
      ctx.stroke();
      cy += 12;

      // Arabic Text (RTL)
      ctx.save();
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#064e3b';
      ctx.font = `bold 32px ${FONT_ARABIC}`;
      for (const line of card.arabicLines) {
        ctx.fillText(line, PAGE_W - MARGIN_X - CARD_PAD_X, cy);
        cy += 52;
      }
      ctx.restore();
      cy += 12;

      // Okunuşu
      if (card.okunusLines.length > 0) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#334155';
        ctx.font = `italic 19px ${FONT_SANS}`;
        for (const line of card.okunusLines) {
          ctx.fillText(line, MARGIN_X + CARD_PAD_X, cy);
          cy += 28;
        }
        cy += 10;
      }

      // Meali
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = `21px ${FONT_SANS}`;
      for (const line of card.mealLines) {
        ctx.fillText(line, MARGIN_X + CARD_PAD_X, cy);
        cy += 31;
      }
      cy += 10;

      // Kaynak / Ravi
      ctx.fillStyle = '#64748b';
      ctx.font = `18px ${FONT_SANS}`;
      for (const line of card.kaynakLines) {
        ctx.fillText(line, MARGIN_X + CARD_PAD_X, cy);
        cy += 26;
      }

      // Kişisel Not
      if (card.noteLines.length > 0) {
        cy += 14;
        const noteBoxH = card.noteLines.length * 26 + 18;
        ctx.fillStyle = '#f0fdf4';
        ctx.beginPath();
        ctx.roundRect(MARGIN_X + CARD_PAD_X, cy, INNER_W, noteBoxH, 8);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.fillRect(MARGIN_X + CARD_PAD_X, cy, 5, noteBoxH);

        ctx.fillStyle = '#065f46';
        ctx.font = `18px ${FONT_SANS}`;
        let ny = cy + 9;
        for (const line of card.noteLines) {
          ctx.fillText(line, MARGIN_X + CARD_PAD_X + 16, ny);
          ny += 26;
        }
      }

      y += card.height + CARD_GAP;
    }

    // 5. Branded Footer
    const footerY = 1660;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, footerY);
    ctx.lineTo(PAGE_W - MARGIN_X, footerY);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#475569';
    ctx.font = `bold 17px ${FONT_SANS}`;
    ctx.fillText(
      '☾ Hayat Rehberi — Hadis-i Şerif Ezber ve İlim Modülü',
      MARGIN_X,
      footerY + 18
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = `17px ${FONT_SANS}`;
    ctx.fillText(
      `Sayfa ${pageIdx + 1} / ${totalPages}  ·  Kaynaklar: Kütüb-i Sitte & Riyâzü's-Sâlihîn`,
      PAGE_W - MARGIN_X,
      footerY + 18
    );

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    renderedPages.push({
      jpegBytes: dataUrlToUint8Array(jpegDataUrl),
      width: PAGE_W,
      height: PAGE_H
    });
  });

  const pdfBlob = buildPdfFromJpegPages(renderedPages);
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hayat-rehberi-hadis-raporu-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportHadislerToWord(items: HadisItem[], reportTitle = 'Hadis-i Şerif Ezber Listesi'): void {
  if (typeof window === 'undefined') return;
  const html = buildBrandedHtmlDocument(items, reportTitle);
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hayat-rehberi-hadis-raporu-${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHadislerToExcel(items: HadisItem[], reportTitle = 'Hadis-i Şerif Ezber Tablosu'): void {
  if (typeof window === 'undefined') return;
  const dateStr = new Date().toLocaleDateString('tr-TR');

  const tableRows = items
    .map(
      (h) => `
      <tr>
        <td style="text-align:center;">${h.id}</td>
        <td>${h.kategori}</td>
        <td dir="rtl" style="font-size:14pt; color:#064e3b;">${h.arapcaMetin}</td>
        <td>${h.okunusu || ''}</td>
        <td>${h.meali}</td>
        <td>${h.kaynagi}</td>
        <td style="text-align:center;">${h.isMemorized ? 'Ezberlendi' : 'Çalışılıyor'}</td>
        <td style="text-align:center;">${h.isFavorite ? 'Evet' : 'Hayır'}</td>
        <td>${h.userNote || ''}</td>
      </tr>`
    )
    .join('');

  const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8" />
</head>
<body>
  <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; font-family:Segoe UI, sans-serif;">
    <thead>
      <tr style="background-color:#064e3b; color:#ffffff; font-weight:bold;">
        <th colspan="9" style="font-size:14pt; padding:10px; text-align:left;">
          ☾ HAYAT REHBERİ — ${reportTitle} (${dateStr})
        </th>
      </tr>
      <tr style="background-color:#ecfdf5; color:#065f46; font-weight:bold;">
        <th>No</th>
        <th>Kategori</th>
        <th>Arapça Metin</th>
        <th>Okunuşu</th>
        <th>Türkçe Meali</th>
        <th>Kaynak / Ravi</th>
        <th>Ezber Durumu</th>
        <th>Favori</th>
        <th>Kişisel Not</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
    <tfoot>
      <tr style="background-color:#f8fafc; color:#475569; font-style:italic;">
        <td colspan="9" style="padding:8px;">
          ☾ Hayat Rehberi — Kur'an-ı Kerim, Sünnet-i Seniyye ve Maneviyat Rehberi (Toplam ${items.length} Hadis-i Şerif)
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

  const blob = new Blob(['\ufeff', excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hayat-rehberi-hadis-tablosu-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
