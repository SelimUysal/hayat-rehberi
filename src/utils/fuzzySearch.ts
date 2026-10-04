/**
 * Akıllı Yazım Toleransı ve Fonetik Eşleştirme Motoru (Fuzzy & Phonetic Search Engine)
 * 
 * Kullanıcı "asin", "sysin", "yasn", "ysn" yazdığında -> "Yâsîn"
 * "fatha", "fth" yazdığında -> "Fâtiha"
 * "sbhaneke", "sbhnk" yazdığında -> "Sübhâneke"
 * gibi yazım hatalarını, eksik harfleri ve sesli harf düşmelerini akıllıca algılar.
 */

// Karakter normalizasyonu: Türkçe ve Arapça transkripsiyon işaretlerini temizler
export function normalizeText(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[âáàäãāǎ]/g, 'a')
    .replace(/[îíìïīǐ]/g, 'i')
    .replace(/[ıİI]/g, 'i')
    .replace(/[ûúùüūǔ]/g, 'u')
    .replace(/[ôóòöōǒ]/g, 'o')
    .replace(/[êéèëēě]/g, 'e')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[''’`\-_\.\,\:\;\(\)\/\\!\?"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sesli harfleri ve gereksiz ekleri çıkarıp sessiz harf iskeletini (consonant skeleton) çıkarır
// Örn: "yasin" -> "ysn", "subhaneke" -> "sbhnk", "fatiha" -> "fth"
export function getConsonantSkeleton(str?: string): string {
  if (!str) return '';
  const norm = normalizeText(str);
  return norm.replace(/[aeıioöuü\s]/g, '');
}

// Levenshtein Mesafesi (İki metin arasındaki düzenleme mesafesi)
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // değiştirme
          matrix[i][j - 1] + 1,     // ekleme
          matrix[i - 1][j] + 1      // silme
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// İki metin arasındaki benzerlik oranı (0.0 ile 1.0 arası)
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return Math.max(0, 1.0 - distance / maxLen);
}

// En Uzun Ortak Alt Dizi Oranı (Longest Common Subsequence - Karakter sırası uyumu)
export function lcsRatio(query: string, target: string): number {
  const q = normalizeText(query);
  const t = normalizeText(target);
  if (!q || !t) return 0;

  let qIdx = 0;
  let matches = 0;

  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      matches++;
      qIdx++;
    }
  }

  return matches / q.length;
}

export interface FuzzyMatchResult {
  isMatch: boolean;
  score: number; // 0 - 100 arası uyum puanı
  matchedOn?: string;
}

/**
 * Akıllı Arama Eşleştirme Fonksiyonu
 * @param query Kullanıcının yazdığı arama kelimesi (örn: "asin", "sysin", "sbhaneke")
 * @param target Hedef metin (örn: "Yâsîn Sûresi", "Sübhâneke Duası")
 * @param additionalKeywords Ek anahtar kelimeler listesi
 */
export function fuzzyMatch(
  query: string, 
  target: string, 
  additionalKeywords: string[] = []
): FuzzyMatchResult {
  const cleanQ = normalizeText(query);
  if (!cleanQ || cleanQ.length < 2) {
    return { isMatch: false, score: 0 };
  }

  const allTargets = [target, ...additionalKeywords].filter(Boolean);
  let highestScore = 0;
  let bestMatchedOn = target;

  const qSkeleton = getConsonantSkeleton(cleanQ);

  for (const t of allTargets) {
    const cleanT = normalizeText(t);
    if (!cleanT) continue;

    // 1. Tam Eşleşme (Birebir aynı)
    if (cleanT === cleanQ) {
      return { isMatch: true, score: 100, matchedOn: t };
    }

    // 2. Doğrudan İçerme (Prefix / Substring)
    if (cleanT.includes(cleanQ)) {
      const score = 90 + Math.min(10, Math.round((cleanQ.length / cleanT.length) * 10));
      if (score > highestScore) {
        highestScore = score;
        bestMatchedOn = t;
      }
      continue;
    }

    // 3. Kelime Başı Eşleşmesi (Örn: "yas" -> "yasin")
    const words = cleanT.split(/\s+/);
    let matchedWord = false;
    for (const w of words) {
      if (w.startsWith(cleanQ)) {
        const score = 88;
        if (score > highestScore) {
          highestScore = score;
          bestMatchedOn = t;
        }
        matchedWord = true;
        break;
      }
    }
    if (matchedWord) continue;

    // 4. Sessiz Harf İskeleti Eşleşmesi (Örn: "ysn" -> "yasin", "sbhnk" -> "subhaneke", "fth" -> "fatiha")
    if (qSkeleton.length >= 3) {
      const tSkeleton = getConsonantSkeleton(cleanT);
      if (tSkeleton === qSkeleton || (tSkeleton.startsWith(qSkeleton) && qSkeleton.length >= 4)) {
        const score = 85;
        if (score > highestScore) {
          highestScore = score;
          bestMatchedOn = t;
        }
        continue;
      }
    }

    // 5. Kelime bazlı Levenshtein Toleransı (Örn: "asin", "sysin", "yasn" -> "yasin")
    for (const w of words) {
      if (w.length < 3) continue;
      const maxLen = Math.max(cleanQ.length, w.length);
      const dist = levenshteinDistance(cleanQ, w);
      
      // 3-4 harfli kelimelerde en fazla 1 harf hatası (örn: asin -> yasin, yasn -> yasin)
      // 5+ harfli kelimelerde en fazla 2 harf hatası (örn: sysin -> yasin, sbhaneke -> subhaneke)
      const allowedDist = maxLen <= 4 ? 1 : 2;

      if (dist <= allowedDist && (dist / maxLen) <= 0.35) {
        const similarity = 1.0 - (dist / maxLen);
        const score = Math.round(similarity * 80);
        if (score > highestScore) {
          highestScore = score;
          bestMatchedOn = t;
        }
      }
    }

    // 6. Sıralı Karakter Uyumu (LCS - Harf Atlamalı Yazım)
    // Örn: "sbhaneke" -> "subhaneke", "fatha" -> "fatiha"
    if (cleanQ.length >= 4) {
      const lcs = lcsRatio(cleanQ, cleanT);
      if (lcs >= 0.85) {
        const score = Math.round(lcs * 75);
        if (score > highestScore) {
          highestScore = score;
          bestMatchedOn = t;
        }
      }
    }
  }

  const isMatch = highestScore >= 55;
  return { isMatch, score: highestScore, matchedOn: bestMatchedOn };
}
