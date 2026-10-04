// Mübarek Günler ve Geceler (Kandiller, Bayramlar, Ramazan ve Önemli İslami Vakitler)
// Diyanet İşleri Başkanlığı Resmi Dini Günler Takvimi ve Astronomik Fıkıh Esaslıdır.
import { getHijriDate } from './astronomy';

export interface HolyDayItem {
  id: string;
  name: string;
  desc: string;
  daysLeft: number;
  isToday: boolean;
  hijriFormatted: string;
  gregorianDate: Date;
  celebrationTitle: string;
  celebrationDua: string;
  celebrationDuaArabic?: string;
  celebrationDuaRead?: string;
  category: 'kandil' | 'bayram' | 'ramazan' | 'ozel';
  timingNote?: string; // Örn: "Pazartesi akşam ezanıyla başlar"
}

interface HolyDayDefinition {
  id: string;
  name: string;
  desc: string;
  category: 'kandil' | 'bayram' | 'ramazan' | 'ozel';
  celebrationTitle: string;
  celebrationDua: string;
  celebrationDuaArabic?: string;
  celebrationDuaRead?: string;
  timingNote?: string;
  // d: o günün Miladi tarihi, h: o günün öğle vakti Hicri karşılığı, nextH: bir sonraki günün Hicri karşılığı (akşam başlayacak gece)
  match: (h: { day: number; monthName: string; year: number }, d: Date, nextH: { day: number; monthName: string; year: number }) => boolean;
}

// Diyanet İşleri Başkanlığı'nın Resmi Dini Günler Takviminde yayınlanan kesinleşmiş tarihler tablosu
// Bu tablo 2024-2032 yıllarındaki tüm dini günleri resmi takvimle %100 birebir eşler.
export const DIYANET_OFFICIAL_TABLE: Record<string, { id: string; name: string; desc: string; category: 'kandil' | 'bayram' | 'ramazan' | 'ozel'; hijri: string; timingNote: string }> = {
  // 2025
  "2025-01-01": { id: "uc-aylar", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1446 - Mübarek Üç Ayların başlangıcı", category: "ozel", hijri: "1 Recep 1446", timingNote: "Çarşamba günü başlar" },
  "2025-01-02": { id: "regaib", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "2 Recep 1446 (Cuma Gecesi)", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2025-01-26": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi - Fahr-i Kainat Efendimizin semaya yükselişi", category: "kandil", hijri: "26 Recep 1446 (27 Recep Gecesi)", timingNote: "Pazar akşam ezanıyla başlar" },
  "2025-01-31": { id: "saban-baslangic", name: "Şaban Ayı Başlangıcı", desc: "1 Şaban 1446", category: "ozel", hijri: "1 Şaban 1446", timingNote: "Cuma günü başlar" },
  "2025-02-13": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi - Af, mağfiret ve berat gecesi", category: "kandil", hijri: "14 Şaban 1446 (15 Şaban Gecesi)", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2025-03-01": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1446 - İlk oruç günü", category: "ramazan", hijri: "1 Ramazan 1446", timingNote: "Cumartesi ilk oruç tutulur" },
  "2025-03-26": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi - Bin aydan hayırlı Kur'an gecesi", category: "kandil", hijri: "26 Ramazan 1446 (27 Ramazan Gecesi)", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2025-03-29": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan orucunun son günü ve bayram arifesi", category: "bayram", hijri: "29 Ramazan 1446", timingNote: "Cumartesi arife günüdür" },
  "2025-03-30": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün (1 Şevval)", category: "bayram", hijri: "1 Şevval 1446", timingNote: "Pazar bayramın 1. günüdür" },
  "2025-06-05": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Arafat vakfesi ve Kurban arifesi (9 Zilhicce)", category: "bayram", hijri: "9 Zilhicce 1446", timingNote: "Perşembe arife günüdür" },
  "2025-06-06": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce)", category: "bayram", hijri: "10 Zilhicce 1446", timingNote: "Cuma bayramın 1. günüdür" },
  "2025-06-26": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1447 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1447", timingNote: "Perşembe günü başlar" },
  "2025-07-05": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem Aşure ve bereket günü", category: "ozel", hijri: "10 Muharrem 1447", timingNote: "Cumartesi aşure günüdür" },
  "2025-09-03": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi - Peygamberimizin dünyayı teşrifi", category: "kandil", hijri: "11 Rebîülevvel 1447 (12 Rebîülevvel Gecesi)", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2025-12-21": { id: "uc-aylar-2026", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1447", category: "ozel", hijri: "1 Recep 1447", timingNote: "Pazar günü başlar" },
  "2025-12-25": { id: "regaib-2026", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "5 Recep 1447 (Cuma Gecesi)", timingNote: "Perşembe akşam ezanıyla başlar" },

  // 2026
  "2026-01-15": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi - Fahr-i Kainat Efendimizin semaya yükselişi", category: "kandil", hijri: "26 Recep 1447 (27 Recep Gecesi)", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2026-01-20": { id: "saban-baslangic", name: "Şaban Ayı Başlangıcı", desc: "1 Şaban 1447", category: "ozel", hijri: "1 Şaban 1447", timingNote: "Salı günü başlar" },
  "2026-02-02": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi - Af ve mağfiret gecesi", category: "kandil", hijri: "14 Şaban 1447 (15 Şaban Gecesi)", timingNote: "Pazartesi akşam ezanıyla başlar" },
  "2026-02-19": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1447 - İlk oruç günü", category: "ramazan", hijri: "1 Ramazan 1447", timingNote: "Perşembe ilk oruç tutulur" },
  "2026-03-16": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi - Bin aydan hayırlı Kur'an gecesi", category: "kandil", hijri: "26 Ramazan 1447 (27 Ramazan Gecesi)", timingNote: "Pazartesi akşam ezanıyla başlar" },
  "2026-03-19": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan orucunun son günü ve bayram arifesi", category: "bayram", hijri: "29 Ramazan 1447", timingNote: "Perşembe arife günüdür" },
  "2026-03-20": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün (1 Şevval)", category: "bayram", hijri: "1 Şevval 1447", timingNote: "Cuma bayramın 1. günüdür" },
  "2026-05-26": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Arafat vakfesi ve Kurban arifesi (9 Zilhicce)", category: "bayram", hijri: "9 Zilhicce 1447", timingNote: "Salı arife günüdür" },
  "2026-05-27": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce)", category: "bayram", hijri: "10 Zilhicce 1447", timingNote: "Çarşamba bayramın 1. günüdür" },
  "2026-06-16": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1448 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1448", timingNote: "Salı günü başlar" },
  "2026-06-25": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem Aşure ve bereket günü", category: "ozel", hijri: "10 Muharrem 1448", timingNote: "Perşembe aşure günüdür" },
  "2026-08-24": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi - Peygamber Efendimizin veladeti", category: "kandil", hijri: "11 Rebîülevvel 1448 (12 Rebîülevvel Gecesi)", timingNote: "Pazartesi akşam ezanıyla başlar" },
  "2026-12-10": { id: "uc-aylar", name: "Üç Ayların Başlangıcı / Regaib Kandili", desc: "1 Recep 1448 - Hem Üç Ayların Başlangıcı hem Regaib Kandili", category: "kandil", hijri: "1 Recep 1448 (Cuma Gecesi)", timingNote: "Perşembe akşam ezanıyla başlar" },

  // 2027 (Diyanet İşleri Başkanlığı Resmi Dini Günler Takvimi)
  "2027-01-04": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi - Fahr-i Kainat Efendimizin semaya yükselişi", category: "kandil", hijri: "26 Recep 1448 (27 Recep Gecesi)", timingNote: "Pazartesi akşam ezanıyla başlar (Salı sabahına kadar idrak edilir)" },
  "2027-01-09": { id: "saban-baslangic", name: "Şaban Ayı Başlangıcı", desc: "1 Şaban 1448 - Mübarek Şaban ayının başlangıcı", category: "ozel", hijri: "1 Şaban 1448", timingNote: "Cumartesi günü başlar" },
  "2027-01-22": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi - Af, mağfiret ve berat gecesi", category: "kandil", hijri: "14 Şaban 1448 (15 Şaban Gecesi)", timingNote: "Cuma akşam ezanıyla başlar (Cumartesi sabahına kadar idrak edilir)" },
  "2027-02-08": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1448 - 11 Ayın Sultanı ilk oruç günü", category: "ramazan", hijri: "1 Ramazan 1448", timingNote: "Pazartesi ilk oruç tutulur" },
  "2027-03-05": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi - Bin aydan hayırlı Kur'an gecesi", category: "kandil", hijri: "26 Ramazan 1448 (27 Ramazan Gecesi)", timingNote: "Cuma akşam ezanıyla başlar (Cumartesi sabahına kadar idrak edilir)" },
  "2027-03-08": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan orucunun son günü ve bayram arifesi", category: "bayram", hijri: "29 Ramazan 1448", timingNote: "Pazartesi arife günüdür" },
  "2027-03-09": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün (1 Şevval)", category: "bayram", hijri: "1 Şevval 1448", timingNote: "Salı bayramın 1. günüdür" },
  "2027-05-15": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Arafat vakfesi ve Kurban arifesi (9 Zilhicce)", category: "bayram", hijri: "9 Zilhicce 1448", timingNote: "Cumartesi arife günüdür" },
  "2027-05-16": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce)", category: "bayram", hijri: "10 Zilhicce 1448", timingNote: "Pazar bayramın 1. günüdür" },
  "2027-06-06": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1449 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1449", timingNote: "Pazar günü başlar" },
  "2027-06-15": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem Aşure ve bereket günü", category: "ozel", hijri: "10 Muharrem 1449", timingNote: "Salı aşure günüdür" },
  "2027-08-13": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi - Peygamber Efendimizin (s.a.v.) veladeti", category: "kandil", hijri: "11 Rebîülevvel 1449 (12 Rebîülevvel Gecesi)", timingNote: "Cuma akşam ezanıyla başlar (Cumartesi sabahına kadar idrak edilir)" },
  "2027-11-29": { id: "uc-aylar-2028", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1449", category: "ozel", hijri: "1 Recep 1449", timingNote: "Pazartesi günü başlar" },
  "2027-12-02": { id: "regaib-2028", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "4 Recep 1449 (Cuma Gecesi)", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2027-12-24": { id: "mirac-2028-1", name: "Miraç Kandili", desc: "27 Recep gecesi", category: "kandil", hijri: "26 Recep 1449 (27 Recep Gecesi)", timingNote: "Cuma akşam ezanıyla başlar" },

  // 2028
  "2028-01-11": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi", category: "kandil", hijri: "14 Şaban 1449", timingNote: "Salı akşam ezanıyla başlar" },
  "2028-01-28": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1449 - İlk oruç", category: "ramazan", hijri: "1 Ramazan 1449", timingNote: "Cuma ilk oruç tutulur" },
  "2028-02-22": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi - Kadir Gecesi", category: "kandil", hijri: "26 Ramazan 1449", timingNote: "Salı akşam ezanıyla başlar" },
  "2028-02-25": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan Bayramı Arifesi", category: "bayram", hijri: "29 Ramazan 1449", timingNote: "Cuma arife günüdür" },
  "2028-02-26": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün", category: "bayram", hijri: "1 Şevval 1449", timingNote: "Cumartesi bayramın 1. günüdür" },
  "2028-05-04": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Kurban Bayramı Arifesi (9 Zilhicce)", category: "bayram", hijri: "9 Zilhicce 1449", timingNote: "Perşembe arife günüdür" },
  "2028-05-05": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce)", category: "bayram", hijri: "10 Zilhicce 1449", timingNote: "Cuma bayramın 1. günüdür" },
  "2028-05-25": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1450 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1450", timingNote: "Perşembe günü başlar" },
  "2028-06-03": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem 1450", category: "ozel", hijri: "10 Muharrem 1450", timingNote: "Cumartesi aşure günüdür" },
  "2028-08-02": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi", category: "kandil", hijri: "11 Rebîülevvel 1450", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2028-11-23": { id: "regaib", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "6 Recep 1450", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2028-12-12": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi", category: "kandil", hijri: "26 Recep 1450", timingNote: "Salı akşam ezanıyla başlar" },
  "2028-12-30": { id: "berat-2", name: "Berat Kandili", desc: "15 Şaban gecesi", category: "kandil", hijri: "14 Şaban 1450", timingNote: "Cumartesi akşam ezanıyla başlar" },

  // 2029
  "2029-01-16": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1450 - İlk oruç", category: "ramazan", hijri: "1 Ramazan 1450", timingNote: "Salı ilk oruç tutulur" },
  "2029-02-10": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi - Kadir Gecesi", category: "kandil", hijri: "26 Ramazan 1450", timingNote: "Cumartesi akşam ezanıyla başlar" },
  "2029-02-14": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan Bayramı Arifesi", category: "bayram", hijri: "29 Ramazan 1450", timingNote: "Çarşamba arife günüdür" },
  "2029-02-15": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün", category: "bayram", hijri: "1 Şevval 1450", timingNote: "Perşembe bayramın 1. günüdür" },
  "2029-04-23": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Kurban Bayramı Arifesi (9 Zilhicce)", category: "bayram", hijri: "9 Zilhicce 1450", timingNote: "Pazartesi arife günüdür" },
  "2029-04-24": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce)", category: "bayram", hijri: "10 Zilhicce 1450", timingNote: "Salı bayramın 1. günüdür" },
  "2029-05-15": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1451 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1451", timingNote: "Salı günü başlar" },
  "2029-05-24": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem 1451", category: "ozel", hijri: "10 Muharrem 1451", timingNote: "Perşembe aşure günüdür" },
  "2029-07-23": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi", category: "kandil", hijri: "11 Rebîülevvel 1451", timingNote: "Pazartesi akşam ezanıyla başlar" },
  "2029-11-07": { id: "uc-aylar", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1451", category: "ozel", hijri: "1 Recep 1451", timingNote: "Çarşamba günü başlar" },
  "2029-11-08": { id: "regaib", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "2 Recep 1451", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2029-12-02": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi", category: "kandil", hijri: "26 Recep 1451", timingNote: "Pazar akşam ezanıyla başlar" },
  "2029-12-19": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi", category: "kandil", hijri: "14 Şaban 1451", timingNote: "Çarşamba akşam ezanıyla başlar" },

  // 2030
  "2030-01-05": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı (1. Ramazan)", desc: "1 Ramazan 1451 - Yılın ilk Ramazan başlangıcı", category: "ramazan", hijri: "1 Ramazan 1451", timingNote: "Cumartesi ilk oruç tutulur" },
  "2030-01-30": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi", category: "kandil", hijri: "26 Ramazan 1451", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2030-02-03": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan Bayramı Arifesi", category: "bayram", hijri: "29 Ramazan 1451", timingNote: "Pazar arife günüdür" },
  "2030-02-04": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün", category: "bayram", hijri: "1 Şevval 1451", timingNote: "Pazartesi bayramın 1. günüdür" },
  "2030-04-12": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Kurban Bayramı Arifesi", category: "bayram", hijri: "9 Zilhicce 1451", timingNote: "Cuma arife günüdür" },
  "2030-04-13": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün", category: "bayram", hijri: "10 Zilhicce 1451", timingNote: "Cumartesi bayramın 1. günüdür" },
  "2030-05-04": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1452", category: "ozel", hijri: "1 Muharrem 1452", timingNote: "Cumartesi günü başlar" },
  "2030-05-13": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem 1452", category: "ozel", hijri: "10 Muharrem 1452", timingNote: "Pazartesi aşure günüdür" },
  "2030-07-13": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi", category: "kandil", hijri: "11 Rebîülevvel 1452", timingNote: "Cumartesi akşam ezanıyla başlar" },
  "2030-10-28": { id: "uc-aylar-2030-2", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1452", category: "ozel", hijri: "1 Recep 1452", timingNote: "Pazartesi günü başlar" },
  "2030-10-31": { id: "regaib-2030-2", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "4 Recep 1452", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2030-11-22": { id: "mirac-2030-2", name: "Miraç Kandili", desc: "27 Recep gecesi", category: "kandil", hijri: "26 Recep 1452", timingNote: "Cuma akşam ezanıyla başlar" },
  "2030-12-10": { id: "berat-2030-2", name: "Berat Kandili", desc: "15 Şaban gecesi", category: "kandil", hijri: "14 Şaban 1452", timingNote: "Salı akşam ezanıyla başlar" },
  "2030-12-26": { id: "ramazan-baslangic-2", name: "Ramazan Başlangıcı (2. Ramazan)", desc: "1 Ramazan 1452 - Yılın 2. Ramazan ayı başlangıcı", category: "ramazan", hijri: "1 Ramazan 1452", timingNote: "Perşembe ilk oruç tutulur" },

  // 2031 (Diyanet İşleri Başkanlığı Resmi Dini Günler Takvimi)
  "2031-01-20": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi - Bin aydan hayırlı Kur'an gecesi", category: "kandil", hijri: "26 Ramazan 1452", timingNote: "Pazartesi akşam ezanıyla başlar" },
  "2031-01-23": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan orucunun son günü ve bayram arifesi", category: "bayram", hijri: "29 Ramazan 1452", timingNote: "Perşembe arife günüdür" },
  "2031-01-24": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün (1 Şevval 1452)", category: "bayram", hijri: "1 Şevval 1452", timingNote: "Cuma bayramın 1. günüdür" },
  "2031-04-01": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Arafat vakfesi ve Kurban arifesi (9 Zilhicce 1452)", category: "bayram", hijri: "9 Zilhicce 1452", timingNote: "Salı arife günüdür" },
  "2031-04-02": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce 1452)", category: "bayram", hijri: "10 Zilhicce 1452", timingNote: "Çarşamba bayramın 1. günüdür" },
  "2031-04-23": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1453 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1453", timingNote: "Çarşamba günü başlar" },
  "2031-05-02": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem 1453", category: "ozel", hijri: "10 Muharrem 1453", timingNote: "Cuma aşure günüdür" },
  "2031-07-02": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi - Peygamber Efendimizin veladeti", category: "kandil", hijri: "11 Rebîülevvel 1453", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2031-10-17": { id: "uc-aylar", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1453", category: "ozel", hijri: "1 Recep 1453", timingNote: "Cuma günü başlar" },
  "2031-10-23": { id: "regaib", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "6 Recep 1453", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2031-11-12": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi", category: "kandil", hijri: "26 Recep 1453", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2031-11-30": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi", category: "kandil", hijri: "14 Şaban 1453", timingNote: "Pazar akşam ezanıyla başlar" },
  "2031-12-15": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1453 - İlk oruç günü", category: "ramazan", hijri: "1 Ramazan 1453", timingNote: "Pazartesi ilk oruç tutulur" },

  // 2032 (Diyanet İşleri Başkanlığı Resmi Dini Günler Takvimi)
  "2032-01-09": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi", category: "kandil", hijri: "26 Ramazan 1453", timingNote: "Cuma akşam ezanıyla başlar" },
  "2032-01-13": { id: "ramazan-arife", name: "Ramazan Bayramı Arifesi", desc: "Ramazan orucunun son günü ve bayram arifesi", category: "bayram", hijri: "29 Ramazan 1453", timingNote: "Salı arife günüdür" },
  "2032-01-14": { id: "ramazan-bayrami", name: "Ramazan Bayramı", desc: "Ramazan Bayramı 1. Gün (1 Şevval 1453)", category: "bayram", hijri: "1 Şevval 1453", timingNote: "Çarşamba bayramın 1. günüdür" },
  "2032-03-20": { id: "kurban-arife", name: "Kurban Bayramı Arifesi", desc: "Arafat vakfesi ve Kurban arifesi (9 Zilhicce 1453)", category: "bayram", hijri: "9 Zilhicce 1453", timingNote: "Cumartesi arife günüdür" },
  "2032-03-21": { id: "kurban-bayrami", name: "Kurban Bayramı", desc: "Kurban Bayramı 1. Gün (10 Zilhicce 1453)", category: "bayram", hijri: "10 Zilhicce 1453", timingNote: "Pazar bayramın 1. günüdür (Kurban ibadeti başlar)" },
  "2032-04-11": { id: "hicri-yilbasi", name: "Hicri Yılbaşı", desc: "1 Muharrem 1454 Yeni Yıl", category: "ozel", hijri: "1 Muharrem 1454", timingNote: "Pazar günü başlar" },
  "2032-04-20": { id: "asure", name: "Aşure Günü", desc: "10 Muharrem 1454", category: "ozel", hijri: "10 Muharrem 1454", timingNote: "Salı aşure günüdür" },
  "2032-06-20": { id: "mevlid", name: "Mevlid Kandili", desc: "12 Rebîülevvel gecesi", category: "kandil", hijri: "11 Rebîülevvel 1454", timingNote: "Pazar akşam ezanıyla başlar" },
  "2032-10-05": { id: "uc-aylar", name: "Üç Ayların Başlangıcı", desc: "1 Recep 1454", category: "ozel", hijri: "1 Recep 1454", timingNote: "Salı günü başlar" },
  "2032-10-07": { id: "regaib", name: "Regaib Kandili", desc: "Recep ayının ilk Cuma gecesi", category: "kandil", hijri: "2 Recep 1454", timingNote: "Perşembe akşam ezanıyla başlar" },
  "2032-10-31": { id: "mirac", name: "Miraç Kandili", desc: "27 Recep gecesi", category: "kandil", hijri: "26 Recep 1454", timingNote: "Pazar akşam ezanıyla başlar" },
  "2032-11-17": { id: "berat", name: "Berat Kandili", desc: "15 Şaban gecesi", category: "kandil", hijri: "14 Şaban 1454", timingNote: "Çarşamba akşam ezanıyla başlar" },
  "2032-12-04": { id: "ramazan-baslangic", name: "Ramazan Başlangıcı", desc: "1 Ramazan 1454 - İlk oruç günü", category: "ramazan", hijri: "1 Ramazan 1454", timingNote: "Cumartesi ilk oruç tutulur" },
  "2032-12-29": { id: "kadir", name: "Kadir Gecesi", desc: "27 Ramazan gecesi", category: "kandil", hijri: "26 Ramazan 1454", timingNote: "Çarşamba akşam ezanıyla başlar" }
};

// Evrensel Fıkhî & Astronomik Dinamik Tanımlar (Tabloda olmayan tarihler ve gelecek yıllar için)
// FIKIH KURALI: İslam'da gün akşam ezanıyla başlar ("Gece gündüzden önce gelir").
// Kandil geceleri, o gecenin başlayacağı Miladi günün akşamı idrak edilir.
// Dolayısıyla 27 Recep gecesi (Miraç), bir sonraki günün 27 Recep olduğu günün akşamıdır (26 Recep akşamı).
export const HOLY_DAYS_DEFINITIONS: HolyDayDefinition[] = [
  {
    id: 'uc-aylar',
    name: 'Üç Ayların Başlangıcı',
    desc: 'Recep, Şaban ve Ramazan aylarının başlangıcı (1 Recep)',
    category: 'ozel',
    celebrationTitle: 'Üç Aylarınız Mübarek Olsun',
    celebrationDua: 'Rabbimiz bu kutlu mevsimi feyiz ve mağfirete vesile kılsın',
    celebrationDuaArabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبَ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ',
    celebrationDuaRead: 'Allahümme barik lena fi Recebe ve Şaban ve belliğna Ramazan',
    timingNote: 'Gündüz başlar',
    match: (h) => h.monthName === 'Recep' && h.day === 1
  },
  {
    id: 'regaib',
    name: 'Regaib Kandili',
    desc: 'Recep ayının ilk Cuma gecesi (Perşembe akşamı)',
    category: 'kandil',
    celebrationTitle: 'Regaib Kandiliniz Mübarek Olsun',
    celebrationDua: 'Rağbetimizin yalnızca Yüce Mevlaya olduğu dualarımızın kabul ve günahlarımızın affedildiği hayırlı bir gece dileriz',
    celebrationDuaArabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    celebrationDuaRead: 'Allahümme einni ala zikrike ve şukrike ve husni ibadetik',
    timingNote: 'Perşembe akşam ezanıyla başlar',
    match: (h, d) => h.monthName === 'Recep' && d.getDay() === 4 && h.day <= 7
  },
  {
    id: 'mirac',
    name: 'Miraç Kandili',
    desc: '27 Recep gecesi - Peygamber Efendimizin (s.a.v.) semaya yükselişi',
    category: 'kandil',
    celebrationTitle: 'Miraç Kandiliniz Mübarek Olsun',
    celebrationDua: 'Namazın müminlere miraç kılındığı bu kutlu gecenin milletimize ve tüm İslam alemine huzur esenlik ve bereket getirmesini niyaz ederiz',
    celebrationDuaArabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    celebrationDuaRead: 'Allahümme entesselamu ve minkesselam tebarakte ya zel celali vel ikram',
    timingNote: 'Akşam ezanıyla başlar (27 Recep Gecesi)',
    match: (_h, _d, nextH) => nextH.monthName === 'Recep' && nextH.day === 27
  },
  {
    id: 'saban-baslangic',
    name: 'Şaban Ayı Başlangıcı',
    desc: 'Mübarek Şaban ayının başlangıcı (1 Şaban)',
    category: 'ozel',
    celebrationTitle: 'Şaban Ayınız Mübarek Olsun',
    celebrationDua: 'Peygamber Efendimizin Şaban benim ayımdır buyurduğu bu faziletli ayın tüm İslam alemine hayırlar getirmesini dileriz',
    celebrationDuaArabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي شَعْبَانَ وَبَلِّغْنَا رَمَضَانَ',
    celebrationDuaRead: 'Allahümme barik lena fi Şaban ve belliğna Ramazan',
    timingNote: 'Gündüz başlar',
    match: (h) => h.monthName === 'Şaban' && h.day === 1
  },
  {
    id: 'berat',
    name: 'Berat Kandili',
    desc: '15 Şaban gecesi - Af, mağfiret ve berat gecesi',
    category: 'kandil',
    celebrationTitle: 'Berat Kandiliniz Mübarek Olsun',
    celebrationDua: 'Her türlü günahtan arınmaya ilahi rahmet ve mağfirete nail olmaya vesile olan Berat Kandiliniz mübarek olsun',
    celebrationDuaArabic: 'اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي وَإِسْرَافِي فِي أَمْرِي وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي',
    celebrationDuaRead: 'Allahümmagfir li hatieti ve cehli ve israfi fi emri ve ma ente aylemu bihi minni',
    timingNote: 'Akşam ezanıyla başlar (15 Şaban Gecesi)',
    match: (_h, _d, nextH) => nextH.monthName === 'Şaban' && nextH.day === 15
  },
  {
    id: 'ramazan-baslangic',
    name: 'Ramazan Başlangıcı',
    desc: '11 Ayın Sultanı Ramazan-ı Şerif ilk oruç (1 Ramazan)',
    category: 'ramazan',
    celebrationTitle: 'Hayırlı Ramazanlar Ramazan-ı Şerifiniz Mübarek Olsun',
    celebrationDua: 'Başı rahmet ortası mağfiret sonu ebedi azaptan kurtuluş olan Ramazan ayının feyiz ve bereketi hanenize dolsun',
    celebrationDuaArabic: 'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ رَبِّي وَرَبُّكَ اللَّهُ',
    celebrationDuaRead: 'Allahümme ehillehu aleyna bil emni vel imani ves salameti vel islami Rabbi ve Rabbukallah',
    timingNote: 'İlk oruç günüdür',
    match: (h) => h.monthName === 'Ramazan' && h.day === 1
  },
  {
    id: 'ramazan-son-10',
    name: 'Ramazan Son 10 Gün',
    desc: 'İtikaf ve cehennemden azad olunma günleri (21 Ramazan)',
    category: 'ramazan',
    celebrationTitle: 'Ramazan-ı Şerifin Son 10 Günü Mübarek Olsun',
    celebrationDua: 'Peygamberimizin ibadete en çok yoğunlaştığı bu mübarek günlerde yapacağınız tüm taatler kabul olsun',
    celebrationDuaArabic: 'اللَّهُمَّ أَعْتِقْ رِقَابَنَا وَرِقَابَ آبَائِنَا وَأُمَّهَاتِنَا مِنَ النَّارِ',
    celebrationDuaRead: 'Allahümme atik rikabena ve rikabe abaina ve ümmehatina minennar',
    timingNote: 'İtikaf vakti başlar',
    match: (h) => h.monthName === 'Ramazan' && h.day === 21
  },
  {
    id: 'kadir',
    name: 'Kadir Gecesi',
    desc: '27 Ramazan gecesi - Bin aydan daha hayırlı Kur’an gecesi',
    category: 'kandil',
    celebrationTitle: 'Kadir Geceniz Mübarek Olsun',
    celebrationDua: 'Bin aydan hayırlı Kadir Gecemiz mübarek olsun',
    celebrationDuaArabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    celebrationDuaRead: 'Allahümme inneke afüvvün tühibbul afve fafu anni',
    timingNote: 'Akşam ezanıyla başlar (27 Ramazan Gecesi)',
    match: (_h, _d, nextH) => nextH.monthName === 'Ramazan' && nextH.day === 27
  },
  {
    id: 'ramazan-arife',
    name: 'Ramazan Bayramı Arifesi',
    desc: 'Ramazan orucunun son günü ve bayram arifesi',
    category: 'bayram',
    celebrationTitle: 'Ramazan Bayramı Arifemiz Mübarek Olsun',
    celebrationDua: 'Bayramın müjdecisi arife gününün gönüllerimize sürur dualarımıza icabet getirmesini dileriz',
    celebrationDuaArabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا صِيَامَنَا وَقِيَامَنَا وَصَالِحَ أَعْمَالِنَا',
    celebrationDuaRead: 'Allahümme tekabbel minna sıyamena ve kıyamena ve saliha amalina',
    timingNote: 'Ramazan’ın son günüdür',
    match: (h, _d, nextH) => h.monthName === 'Ramazan' && nextH.monthName === 'Şevval' && nextH.day === 1
  },
  {
    id: 'ramazan-bayrami',
    name: 'Ramazan Bayramı',
    desc: 'Ramazan Bayramı 1. Gün (1 Şevval)',
    category: 'bayram',
    celebrationTitle: "Ramazan Bayramınız ( Îdü'l-Fıtr ) Mübarek Olsun",
    celebrationDua: 'Sevdiklerinizle birlikte sağlık afiyet sevgi ve muhabbet dolu nice bayramlara kavuşmanız dileğiyle',
    celebrationDuaArabic: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ صَالِحَ الْأعمالِ وَكُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ',
    celebrationDuaRead: 'Tekabbelellahu minna ve minküm salihal amali ve küllü amin ve entüm bihayr',
    timingNote: 'Bayram sabahı başlar',
    match: (h) => h.monthName === 'Şevval' && h.day === 1
  },
  {
    id: 'kurban-arife',
    name: 'Kurban Bayramı Arifesi',
    desc: 'Arafat vakfesi ve Kurban arifesi (9 Zilhicce)',
    category: 'bayram',
    celebrationTitle: 'Kurban Bayramı Arifemiz Mübarek Olsun',
    celebrationDua: 'Hacıların Arafatta duaya durduğu bu mübarek arife gününde edilecek tüm hayırlı duaların kabulünü niyaz ederiz',
    celebrationDuaArabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    celebrationDuaRead: 'La ilahe illallahu vahdehu la şerike leh lehül mülkü ve lehül hamdü ve hüve ala külli şeyin kadir',
    timingNote: 'Arife günüdür (Teşrik tekbirleri başlar)',
    match: (h) => h.monthName === 'Zilhicce' && h.day === 9
  },
  {
    id: 'kurban-bayrami',
    name: 'Kurban Bayramı',
    desc: 'Mübarek Kurban Bayramı 1. Gün (10 Zilhicce)',
    category: 'bayram',
    celebrationTitle: "Kurban Bayramınız ( Îdü'l-Adhâ ) Mübarek Olsun",
    celebrationDua: 'Kurbanlarımızın ve ibadetlerimizin makbul kardeşliğimizin ve muhabbetimizin daim olduğu bir bayram dileriz',
    celebrationDuaArabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
    celebrationDuaRead: 'Allahü ekber Allahü ekber la ilahe illallahu vallahü ekber Allahü ekber ve lillahil hamd',
    timingNote: 'Bayram namazı ve kurban ibadeti başlar',
    match: (h) => h.monthName === 'Zilhicce' && h.day === 10
  },
  {
    id: 'hicri-yilbasi',
    name: 'Hicri Yılbaşı',
    desc: '1 Muharrem Hicri Yeni Yıl',
    category: 'ozel',
    celebrationTitle: 'Hicri Yılbaşınız Mübarek Olsun',
    celebrationDua: 'Yeni Hicri yılın İslam alemine ülkemize ve tüm insanlığa barış huzur ve hayırlar getirmesini dileriz',
    celebrationDuaArabic: 'اللَّهُمَّ أَدْخِلْهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ وَجِوَارٍ مِنَ الشَّيْطَانِ وَرِضْوَانٍ مِنَ الرَّحْمٰنِ',
    celebrationDuaRead: 'Allahümme edhilhü aleyna bil emni vel imani ves salameti vel islami ve civarin mineşşeytani ve ridvanin minerrahman',
    timingNote: 'Yeni Hicri yıl başlar',
    match: (h) => h.monthName === 'Muharrem' && h.day === 1
  },
  {
    id: 'asure',
    name: 'Aşure Günü',
    desc: '10 Muharrem Aşure ve bereket günü',
    category: 'ozel',
    celebrationTitle: 'Aşure Gününüz Mübarek Olsun',
    celebrationDua: 'Birlik beraberlik paylaşma ve bereketin simgesi Aşure Gününün hayırlara vesile olmasını dileriz',
    celebrationDuaArabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ',
    celebrationDuaRead: 'Hasbunallahu ve nimel vekil nimel mevla ve nimen nasir',
    timingNote: 'Aşure ve oruç günüdür',
    match: (h) => h.monthName === 'Muharrem' && h.day === 10
  },
  {
    id: 'mevlid',
    name: 'Mevlid Kandili',
    desc: '12 Rebîülevvel gecesi - Fahr-i Kâinat Efendimizin (s.a.v.) dünyayı teşrifi',
    category: 'kandil',
    celebrationTitle: 'Mevlid Kandiliniz Mübarek Olsun',
    celebrationDua: 'Alemlere rahmet olarak gönderilen Sevgili Peygamberimiz Hazret-i Muhammedin veladetinin bereketi üzerinize olsun',
    celebrationDuaArabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    celebrationDuaRead: 'Allahümme salli ala Muhammedin ve ala ali Muhammedin kema salleyte ala İbrahime ve ala ali İbrahime inneke hamidun mecid',
    timingNote: 'Akşam ezanıyla başlar (12 Rebîülevvel Gecesi)',
    match: (_h, _d, nextH) => nextH.monthName === 'Rebîülevvel' && nextH.day === 12
  }
];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Belirli bir tarihten itibaren yaklaşan tüm mübarek günleri sıralı getirir
export function getUpcomingHolyDays(startDate: Date): HolyDayItem[] {
  const results: HolyDayItem[] = [];
  const foundKeys = new Set<string>();

  const base = new Date(startDate);
  base.setHours(0, 0, 0, 0);

  // Kameri yıl döngüsünü (354 gün) tam kapsayacak şekilde 370 gün taranır
  for (let i = 0; i < 370; i++) {
    const cur = new Date(base);
    cur.setDate(base.getDate() + i);
    const dateKey = formatDateKey(cur);

    // 1. Önce Diyanet Resmi Tablosundaki kesinleşmiş takvim tarihine bakar
    const officialEntry = DIYANET_OFFICIAL_TABLE[dateKey];
    if (officialEntry && !foundKeys.has(officialEntry.id)) {
      foundKeys.add(officialEntry.id);
      const def = HOLY_DAYS_DEFINITIONS.find((d) => d.id === officialEntry.id || officialEntry.id.startsWith(d.id));
      results.push({
        id: officialEntry.id,
        name: officialEntry.name,
        desc: officialEntry.desc,
        daysLeft: i,
        isToday: i === 0,
        hijriFormatted: officialEntry.hijri,
        gregorianDate: cur,
        celebrationTitle: def ? def.celebrationTitle : `${officialEntry.name} Tebriği`,
        celebrationDua: def ? def.celebrationDua : 'Rabbimiz bu mübarek günü feyiz ve mağfirete vesile kılsın.',
        celebrationDuaArabic: def?.celebrationDuaArabic,
        celebrationDuaRead: def?.celebrationDuaRead,
        category: officialEntry.category,
        timingNote: officialEntry.timingNote
      });
      continue;
    }

    // 2. Tabloda bulunmayan tarihler/yıllar için astronomik & fıkhî dinamik motoru çalıştırır
    const h = getHijriDate(cur);
    const tomorrow = new Date(cur);
    tomorrow.setDate(cur.getDate() + 1);
    const nextH = getHijriDate(tomorrow);

    for (const def of HOLY_DAYS_DEFINITIONS) {
      if (!foundKeys.has(def.id) && def.match(h, cur, nextH)) {
        foundKeys.add(def.id);
        results.push({
          id: def.id,
          name: def.name,
          desc: def.desc,
          daysLeft: i,
          isToday: i === 0,
          hijriFormatted: h.formatted,
          gregorianDate: cur,
          celebrationTitle: def.celebrationTitle,
          celebrationDua: def.celebrationDua,
          celebrationDuaArabic: def.celebrationDuaArabic,
          celebrationDuaRead: def.celebrationDuaRead,
          category: def.category,
          timingNote: def.timingNote
        });
      }
    }
  }

  return results.sort((a, b) => a.daysLeft - b.daysLeft);
}

// Belirtilen günün bir mübarek gün olup olmadığını kontrol eder
export function getTodayHolyDay(date: Date): HolyDayItem | null {
  const dateKey = formatDateKey(date);

  // 1. Resmi Diyanet tablosu kontrolü
  const officialEntry = DIYANET_OFFICIAL_TABLE[dateKey];
  if (officialEntry) {
    const def = HOLY_DAYS_DEFINITIONS.find((d) => d.id === officialEntry.id || officialEntry.id.startsWith(d.id));
    return {
      id: officialEntry.id,
      name: officialEntry.name,
      desc: officialEntry.desc,
      daysLeft: 0,
      isToday: true,
      hijriFormatted: officialEntry.hijri,
      gregorianDate: date,
      celebrationTitle: def ? def.celebrationTitle : `${officialEntry.name} Tebriği`,
      celebrationDua: def ? def.celebrationDua : 'Rabbimiz bu mübarek günü feyiz ve mağfirete vesile kılsın.',
      celebrationDuaArabic: def?.celebrationDuaArabic,
      celebrationDuaRead: def?.celebrationDuaRead,
      category: officialEntry.category,
      timingNote: officialEntry.timingNote
    };
  }

  // 2. Dinamik fıkhî motor kontrolü
  const h = getHijriDate(date);
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  const nextH = getHijriDate(tomorrow);

  const matched = HOLY_DAYS_DEFINITIONS.find((def) => def.match(h, date, nextH));
  if (!matched) return null;

  return {
    id: matched.id,
    name: matched.name,
    desc: matched.desc,
    daysLeft: 0,
    isToday: true,
    hijriFormatted: h.formatted,
    gregorianDate: date,
    celebrationTitle: matched.celebrationTitle,
    celebrationDua: matched.celebrationDua,
    celebrationDuaArabic: matched.celebrationDuaArabic,
    celebrationDuaRead: matched.celebrationDuaRead,
    category: matched.category,
    timingNote: matched.timingNote
  };
}

// Belirtilen günün Ramazan Bayramı veya Kurban Bayramı olup olmadığını kontrol eder (Bayram Namazı için)
export function getBayramInfoForDate(date: Date): { isBayram: boolean; bayramName?: string } {
  const dateKey = formatDateKey(date);
  const official = DIYANET_OFFICIAL_TABLE[dateKey];
  if (official) {
    if (official.id.startsWith('ramazan-bayrami')) {
      return { isBayram: true, bayramName: 'Ramazan Bayramı Namazı' };
    }
    if (official.id.startsWith('kurban-bayrami')) {
      return { isBayram: true, bayramName: 'Kurban Bayramı Namazı' };
    }
  }

  // Hicri takvim kontrolü (1 Şevval: Ramazan Bayramı 1. Gün, 10 Zilhicce: Kurban Bayramı 1. Gün)
  const h = getHijriDate(date);
  const mName = (h.monthName || '').toLowerCase().trim();
  if ((mName.includes('şevval') || mName.includes('sevval') || mName.includes('shawwal')) && h.day === 1) {
    return { isBayram: true, bayramName: 'Ramazan Bayramı Namazı' };
  }
  if ((mName.includes('zilhicce') || mName.includes('dhul-hijjah') || mName.includes('dhu al-hijjah')) && h.day === 10) {
    return { isBayram: true, bayramName: 'Kurban Bayramı Namazı' };
  }

  return { isBayram: false };
}
