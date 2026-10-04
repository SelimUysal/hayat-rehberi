import { AIAnalysisResult, WordData } from '../types';

function stripDiacritics(arabic: string): string {
  return arabic
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .trim();
}

function analyzeArabicMorphology(word: string, meaning: string, transliteration?: string): string {
  const bare = stripDiacritics(word);
  const notes: string[] = [];

  if (bare.startsWith('ال') && bare.length > 3) {
    notes.push('Belirlilik takısı olan "Elif-Lâm" (ال - Harf-i Tarif) almış marife (belirli) bir isimdir.');
  } else if (bare.startsWith('وال') || bare.startsWith('بال') || bare.startsWith('كال') || bare.startsWith('فال')) {
    notes.push('Başına bağlaç/harf-i cer (و / ب / ف / ك) ve belirlilik takısı (ال) birleşmiş mürekkep bir lafızdır.');
  } else if (bare.startsWith('و') && bare.length > 2) {
    notes.push('Başındaki "Vav" (وَ) atıf veya hâl edatı olup cümle unsurlarını birbirine bağlar.');
  } else if (bare.startsWith('ف') && bare.length > 2) {
    notes.push('Başındaki "Fâ" (فَ)rabıt/takip harfi olup önceki hükümle sebep-sonuç ilişkisi kurar.');
  } else if (bare.startsWith('ب') || bare.startsWith('ل')) {
    notes.push('Başına cer harfi (بِ / لِ) bitişmiş olup cümlede mecrur konumda yer alır.');
  }

  if (bare.endsWith('ون') || bare.endsWith('ين')) {
    notes.push('Sonundaki ek itibarıyla Cem-i Müzekker Sâlim (kurallı eril çoğul) veya Ef\'âl-i Hamse (beş fiil) veznindedir.');
  } else if (bare.endsWith('ات')) {
    notes.push('Sonundaki "Elif-Tâ" (ات) ekiyle Cem-i Müennes Sâlim (kurallı dişil çoğul) kalıbındadır.');
  } else if (bare.endsWith('كم') || bare.endsWith('هم') || bare.endsWith('نا') || bare.endsWith('ها') || bare.endsWith('ه')) {
    notes.push('Sonuna muttasıl (bitişik) zamir eklenmiş olup isim tamlaması (muzâf-muzâfun ileyh) veya mef\'ûl (nesne) yapısı oluşturmuştur.');
  }

  const rootConsonants = bare
    .replace(/^(وال|فال|بال|كال|ال|لل)/, '')
    .replace(/(ون|ين|ات|كم|هم|نا|ها)$/, '');

  if (rootConsonants.length >= 3) {
    const r = rootConsonants.slice(0, 3).split('').join(' - ');
    notes.push(`Sülâsî (üç harfli) asli harf dizilimi "${r}" ekseninde şekillenen sarf yapısına sahiptir.`);
  }

  if (transliteration) {
    notes.push(`Kıraat okunuşu "${transliteration}" şeklindedir ve ayet içinde "${meaning || 'ilgili mana'}" anlamını taşır.`);
  } else if (notes.length === 0) {
    notes.push(`Kur'an Arapçasında "${meaning || 'temel mana'}" anlamını ifade eden asli kelime/edat unsurudur.`);
  }

  return notes.join(' ');
}

function buildStaticScholarlyAnalysis(params: {
  arabicText: string;
  translation: string;
  surahName: string;
  verseNumber?: number;
  selectedWords?: WordData[];
}): AIAnalysisResult {
  const { arabicText, translation, surahName, verseNumber, selectedWords } = params;
  const words = selectedWords && selectedWords.length > 0 ? selectedWords : [];

  const kelimeAnalizi = words.length > 0
    ? words.map((w) => {
        const ar = w.text_uthmani || w.text || '';
        const tr = w.translation?.text || 'Anlam unsuru';
        const translit = w.transliteration?.text || '';
        return {
          kelime: translit ? `${ar} (${translit})` : ar,
          anlam: tr,
          kok_ve_gramer: analyzeArabicMorphology(ar, tr, translit)
        };
      })
    : arabicText
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 12)
        .map((token) => ({
          kelime: token,
          anlam: 'Ayet Lafzı',
          kok_ve_gramer: analyzeArabicMorphology(token, '')
        }));

  const wordMeaningsSummary = words
    .map((w) => w.translation?.text)
    .filter(Boolean)
    .join(' • ');

  const verseRef = verseNumber ? `${surahName} Suresi ${verseNumber}. ayet-i kerimesinde` : `${surahName} Suresi'nde`;

  return {
    terkip_anlami: `${verseRef} yer alan "${arabicText}" terkibi; ${
      wordMeaningsSummary ? `kelime dizilimi itibarıyla (${wordMeaningsSummary}) unsurlarının bir araya gelmesiyle ` : ''
    }Diyanet İşleri mealinde "${translation}" şeklinde ifade edilen ilahi mesajı veciz bir belagat örgüsüyle beyan etmektedir.`,
    kelime_analizi: kelimeAnalizi,
    tafsir_baglami: `Bu ayet-i kerime, ${surahName} Suresi'nin ana mesajı çerçevesinde tevhid bilincini, kulluk sorumluluğunu ve ilahi hikmeti hatırlatmaktadır. "${translation}" mealiyle özetlenen hüküm, müminin kalp ve amel dünyasına doğrudan rehberlik eden külli bir ilke niteliğindedir.`,
    nuzul_ve_teknik: `Kur'an-ı Kerim'in nazım ve icaz (az sözle derin mana ifade etme) sanatı açısından bu ifade; ses uyumu (fâsıla), kelime seçimi ve cümle dizilimiyle muhatabın zihninde hem tefekkür hem de huşu uyandıran yüksek bir belagat üslubuna sahiptir.`
  };
}

export async function analyzeWithGemini(params: {
  arabicText: string;
  translation: string;
  surahName: string;
  verseNumber?: number;
  selectedWords?: WordData[];
}): Promise<AIAnalysisResult> {
  try {
    const response = await fetch('./api/gemini-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arabicText: params.arabicText,
        translation: params.translation,
        surahName: params.surahName
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.terkip_anlami) {
        return data as AIAnalysisResult;
      }
    }
  } catch {
    // Statik ortam (GitHub Pages vb.) veya sunucu erişilemez olduğunda yerleşik filolojik analiz motoruna geç
  }

  return buildStaticScholarlyAnalysis(params);
}
