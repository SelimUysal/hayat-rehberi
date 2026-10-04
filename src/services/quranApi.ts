import { Ayah, VerseWbw } from '../types';

const surahCache = new Map<string, { ayahs: Ayah[]; translations: Ayah[] }>();
const wbwCache = new Map<number, VerseWbw[]>();

export async function fetchSurahData(surahNumber: number, reciter: string): Promise<{ ayahs: Ayah[]; translations: Ayah[] }> {
  const cacheKey = `${surahNumber}_${reciter}`;
  if (surahCache.has(cacheKey)) {
    return surahCache.get(cacheKey)!;
  }

  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${reciter},tr.diyanet`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Sure verisi alınamadı (${res.status})`);
  }
  const json = await res.json();
  if (json.code === 200 && json.data && json.data.length >= 2) {
    const data = {
      ayahs: json.data[0].ayahs as Ayah[],
      translations: json.data[1].ayahs as Ayah[]
    };
    surahCache.set(cacheKey, data);
    return data;
  }
  throw new Error("Sure formatı geçersiz.");
}

export async function fetchWbwData(surahNumber: number): Promise<VerseWbw[]> {
  if (wbwCache.has(surahNumber)) {
    return wbwCache.get(surahNumber)!;
  }

  const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?words=true&word_fields=text_uthmani&per_page=300`;
  const res = await fetch(url);
  if (!res.ok) {
    return [];
  }
  const json = await res.json();
  const verses: VerseWbw[] = json.verses || [];
  wbwCache.set(surahNumber, verses);
  return verses;
}
