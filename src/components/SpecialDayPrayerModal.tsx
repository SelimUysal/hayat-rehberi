import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Volume2, BookOpen, Info, ShieldAlert, Clock, MoonStar, Sparkles, ChevronRight } from 'lucide-react';
import { getTodayHolyDay, DIYANET_OFFICIAL_TABLE } from '../utils/holyDays';
import { getHijriDate } from '../utils/astronomy';

export interface DhikrBlock {
  badge?: string;
  title: string;
  arabic?: string;
  reading?: string;
  meaning?: string;
  note?: string;
}

export interface RakatGroup {
  badge: string;
  title: string;
  subtitle?: string;
  rakats: {
    name: string;
    surahs: string[];
  }[];
  footerNote?: string;
}

export interface SpecialDayPrayerGuide {
  id: string;
  buttonLabel: string; // Sabit "Günün İbadeti"
  buttonSubLabel: string; // Alt kısa başlık
  headerTitle: string; // Açılan Pencerenin Başlığı (Header)
  mainTitle: string;
  introText: string;
  timeInfo?: string;
  intentionText?: string;
  rakatGroups?: RakatGroup[];
  dhikrSectionTitle?: string;
  dhikrSectionSubtitle?: string;
  dhikrBlocks?: DhikrBlock[];
  extraSections?: {
    badge: string;
    title: string;
    description: string;
    items?: string[];
  }[];
  closingDuaText?: string;
  namazTargetId?: string;
  namazTargetTitle?: string;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Kurban Bayramı Arefesi ve Bayramın 1-4. günlerini (toplam 5 gün: 9-13 Zilhicce) kontrol eder
function isTashriqDay(date: Date, h: { day: number; monthName: string; year: number }): boolean {
  if (h.monthName === 'Zilhicce' && h.day >= 9 && h.day <= 13) {
    return true;
  }
  // Resmi Diyanet tablosunda Kurban Arefesi tarihinden itibaren 5 gün (Arefe + 4 Bayram günü) kontrolü
  for (let offset = 0; offset <= 4; offset++) {
    const checkDate = new Date(date);
    checkDate.setDate(date.getDate() - offset);
    const key = formatDateKey(checkDate);
    const entry = DIYANET_OFFICIAL_TABLE[key];
    if (entry && entry.id.startsWith('kurban-arife')) {
      return true;
    }
  }
  return false;
}

export function getSpecialDayPrayersForDate(
  date: Date,
  hijriDate?: { day: number; monthName: string; year: number }
): SpecialDayPrayerGuide[] {
  const guides: SpecialDayPrayerGuide[] = [];
  const h = hijriDate || getHijriDate(date);
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  const nextH = getHijriDate(tomorrow);
  const holyDay = getTodayHolyDay(date);

  // =========================================================================
  // 1. MUHARREM AYI (1 - 10 ARASI)
  // =========================================================================
  if (h.monthName === 'Muharrem' && h.day >= 1 && h.day <= 10) {
    guides.push({
      id: 'muharrem-1-10',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Muharrem Ayı (1-10) Namazı',
      headerTitle: 'Muharrem Ayının İlk Günleri İbadeti',
      mainTitle: "Muharrem Ayının 1'i ile 10'u Arasındaki Namaz",
      introText:
        "Hicri yılın ilk ayı olan Muharrem ayının 1. günü ile 10. günü (Âşûrâ günü dâhil) arasında bir defaya mahsus olmak üzere kılınan mübarek bir nafile namazdır. 2 rekatta bir selam verilerek toplam 6 rekat olarak eda edilir.",
      timeInfo:
        "Bu namaz öncelikli olarak Akşam namazı ile Yatsı namazı arasında kılınır. Bu vakitte kılınamazsa yatsı namazından sonra da eda edilebilir.",
      intentionText:
        "Niyet eyledim ya Rabbî Senin rızâ-yı şerîfin için namaza. Herhangi bir komşumun, din kardeşimin veya herhangi bir kimsenin bana hakkı geçmiş ise bu hakkın ödenmesi niyetine... Allâhü Ekber",
      rakatGroups: [
        {
          badge: '1. SELAM',
          title: 'Birinci 2 Rekat (1. Selam)',
          rakats: [
            {
              name: '1. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', "1 Âyetü'l-Kürsî", '11 İhlâs-ı Şerîf']
            },
            {
              name: '2. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '10 İhlâs-ı Şerîf']
            }
          ],
          footerNote: 'Oturuşta Et-Tahiyyatü, Salli-Barik ve Rabbenâ okunarak selam verilir.'
        },
        {
          badge: '2. SELAM',
          title: 'İkinci 2 Rekat (2. Selam)',
          rakats: [
            {
              name: '3. Rekat (Ayağa Kalkış)',
              surahs: ['1 Fâtiha-i Şerîfe', '1 Tekâsür Sûresi ("Elhâkümüt-tekâsür...")', '11 İhlâs-ı Şerîf']
            },
            {
              name: '4. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '10 İhlâs-ı Şerîf']
            }
          ],
          footerNote: 'Oturuşta Et-Tahiyyatü, Salli-Barik ve Rabbenâ okunarak selam verilir.'
        },
        {
          badge: '3. SELAM VE KAPANIŞ',
          title: 'Üçüncü 2 Rekat (3. Selam ve Kapanış)',
          rakats: [
            {
              name: '5. Rekat (Ayağa Kalkış)',
              surahs: ['1 Fâtiha-i Şerîfe', '3 Kâfirûn Sûresi ("Kul yâ eyyühe\'l-kâfirûn...")', '11 İhlâs-ı Şerîf']
            },
            {
              name: '6. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '10 İhlâs-ı Şerîf']
            }
          ],
          footerNote: 'Oturuşta dualar okunarak selam verilir ve namaz tamamlanır.'
        }
      ],
      closingDuaText:
        'Namaz tamamlandıktan sonra eller açılır; günahların affı, kul haklarının ödenmesi, din kardeşlerimizin ve milletimizin selameti için yürekten dua edilir.',
      namazTargetId: 'muharrem-ayi-namazi',
      namazTargetTitle: 'Muharrem Ayı Namazı (1 - 10 Muharrem)'
    });
  }

  // =========================================================================
  // 1B. MEVLİD GECESİ (Rebîülevvel 12. Gecesi - 11'ini 12'sine Bağlayan Gece)
  // =========================================================================
  if (
    (holyDay && (holyDay.id.startsWith('mevlid') || holyDay.name.toLowerCase().includes('mevlid'))) ||
    (h.monthName === 'Rebîülevvel' && (h.day === 11 || h.day === 12)) ||
    (nextH.monthName === 'Rebîülevvel' && nextH.day === 12)
  ) {
    guides.push({
      id: 'mevlid-gecesi',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Mevlid Gecesi ve Tesbih Namazı',
      headerTitle: 'Mevlid Gecesi İbadeti ve Tesbih Namazı',
      mainTitle: "Mevlid Gecesi (Rebîülevvel Ayının 12'nci Gecesi) ve Tesbih Namazı",
      introText:
        "Rebîulevvel ayının 12'nci yani onbirini onikisine bağlayan gece Mevlid Gecesi; Peygamber Efendimiz'in (s.a.v.) dünyâyı şereflendirdikleri gecedir. Bu gecede bir tesbih namazı kılınır.",
      timeInfo:
        "Rebîulevvel ayının 11'ini 12'sine bağlayan Mevlid Gecesi'nde akşam namazından veya yatsı namazından sonra (kerahat vakitleri dışında) kılınır.",
      intentionText:
        "Ya Rabbi! Bu gece teşrifleri ile dünyâyı nûra gark ettiğin Sevgili Habibin, başımızın tâcı Resûlü Zişân Efendimizin hürmetine, ben âciz kulunu da afv-ı ilâhîne, feyz-i ilâhîne mazhar eyle. Allâhü Ekber.",
      dhikrSectionTitle: 'Tesbih Namazı İçinde Toplam 300 Defa Okunacak Tesbih Zikri',
      dhikrSectionSubtitle: 'Her rekatta 75 defa, 4 rekatta toplam 300 defa aşağıdaki tesbih okunur:',
      dhikrBlocks: [
        {
          badge: 'Her Rekatta 75 • Toplam 300 Defa',
          title: 'Tesbih Namazı Zikri',
          arabic:
            'سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ',
          reading:
            '"Sübhânallâhi ve’l-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber ve lâ havle ve lâ kuvvete illâ billâhi’l-aliyyi’l-azîm"',
          meaning:
            '"Allah’ı tüm noksan sıfatlardan tenzih ederim. Hamd Allah’a mahsustur. Allah’tan başka ilah yoktur ve Allah en büyüktür. Yüce ve azim olan Allah’tan başka hiçbir güç ve kuvvet yoktur."'
        }
      ],
      rakatGroups: [
        {
          badge: '4 REKAT • 300 TESBİH',
          title: 'Tesbih Namazı Kılınış Özeti (Her Rekatta 75 Tesbih)',
          subtitle: '4 rekatın her birinde tesbih zikri şu sırayla okunur:',
          rakats: [
            {
              name: 'Ayakta Kıraat Öncesi ve Sonrası (25 Tesbih)',
              surahs: [
                'Sübhaneke (veya 2. ve 4. rekat başında namaza kalkınca Fâtiha’dan önce): 15 defa tesbih okunur.',
                'Fâtiha ve Zamm-ı Sûre okunduktan sonra rükûya gitmeden ayaktayken: 10 defa tesbih okunur.'
              ]
            },
            {
              name: 'Rükû, Kavme, Secdeler ve Celse (50 Tesbih)',
              surahs: [
                'Rükûda ("Sübhâne Rabbiye\'l-Azîm"den sonra): 10 defa tesbih.',
                'Rükûdan doğrulunca (Kavmede ayaktayken): 10 defa tesbih.',
                '1. Secdede ("Sübhâne Rabbiye\'l-A\'lâ"dan sonra): 10 defa tesbih.',
                'İki secde arası oturuşta (Celsede): 10 defa tesbih.',
                '2. Secdede ("Sübhâne Rabbiye\'l-A\'lâ"dan sonra): 10 defa tesbih.'
              ]
            }
          ],
          footerNote:
            'Her rekatta 75 tesbih olmak üzere 4 rekatta toplam 300 tesbih tamamlanır. 2. rekat sonunda oturulduğunda Ettehiyyâtü ile Salli-Bârik okunur, 3. rekat başında tekrar Sübhaneke okunur.'
        }
      ],
      closingDuaText:
        "Tesbih namazı tamamlandıktan sonra Sevgili Peygamberimiz Hazret-i Muhammed Mustafa'ya (s.a.v.) bolca salât ü selâm getirilir; afv-ı ilâhîne ve feyz-i ilâhîne mazhar olmak niyetiyle dua edilir.",
      namazTargetId: 'mevlid-gecesi-namazi',
      namazTargetTitle: 'Mevlid Gecesi Namazı ve Tesbih Namazı Rehberi'
    });
  }

  // =========================================================================
  // 2. REGAİP GECESİ (Recep Ayının İlk Cuma Gecesi)
  // =========================================================================
  if (holyDay && (holyDay.id.startsWith('regaib') || holyDay.name.toLowerCase().includes('regaib'))) {
    guides.push({
      id: 'regaip-gecesi',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Regaip Gecesi ve Namazı',
      headerTitle: 'Regaip Gecesi ve Namazı',
      mainTitle: 'Regaip Gecesi 12 Rekatlık Hâcet Namazı ve Tesbihatı',
      introText:
        'Receb-i Şerîf ayının ilk Cuma gecesi olan Regaip Gecesi, duaların geri çevrilmediği ve ilahi rahmetin coştuğu mübarek bir gecedir. Bu gecede 2 rekatta bir selam verilerek 12 rekat Hâcet Namazı kılınır.',
      timeInfo:
        'Regaip Gecesi akşam namazı ile yatsı namazı arasında veya yatsı namazından sonra kılınabilir.',
      intentionText:
        'Yâ Rabbî! Niyet eyledim Senin rızâ-yı şerîfin için Regaip Gecesi hâcet namazını kılmaya. Beni afv-ı İlâhî’ne, feyz-i İlâhî’ne mazhar eyle... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '12 REKAT (2 REKATTA BİR SELAM)',
          title: 'Her 2 Rekatta Bir Selam Verilerek 12 Rekat Tamamlanır',
          subtitle: '12 rekatın her bir rekatında sırasıyla şu sûreler okunur:',
          rakats: [
            {
              name: 'Her Rekatta Okunacaklar',
              surahs: [
                '1 Fâtiha-i Şerîfe',
                '3 Kadir Sûresi ("İnnâ enzelnâhü fî leyletil-kadr...")',
                '12 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")'
              ]
            }
          ],
          footerNote: 'Her 2 rekatta bir oturulup Et-Tahiyyatü, Salli-Barik ve Rabbenâ okunarak selam verilir.'
        }
      ],
      dhikrSectionTitle: 'Namaz Bittiğinde Yapılacak Özel Secde ve Tesbihat',
      dhikrBlocks: [
        {
          badge: 'Adım 1 (70 Defa)',
          title: '70 Defa Salât-ı Ümmiye Okunur',
          arabic: 'اَللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدِنِ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
          reading: "Allâhümme salli alâ seyyidinâ Muhammedini'n-nebiyyi'l-ümmiyyi ve alâ âlihî ve sahbihî ve sellim.",
          meaning: "Allah'ım! Ümmî Peygamber Efendimiz Muhammed'e, âline ve ashabına salât ve selâm eyle."
        },
        {
          badge: 'Adım 2 (1. Secdede 70 Defa)',
          title: 'Secdeye Varılır ve 70 Defa Tesbih Okunur',
          arabic: 'سُبُّوحٌ قُدُّوسٌ رَبُّنَا وَرَبُّ الْمَلَائِكَةِ وَالرُّوحِ',
          reading: "Sübhûhun Kuddûsün Rabbunâ ve Rabbü'l-melâiketi ve'r-rûh.",
          meaning: 'Rabbimiz, meleklerin ve Rûh’un (Cebrâil’in) Rabbi, her türlü noksandan münezzeh ve mukaddestir.'
        },
        {
          badge: 'Adım 3 (Oturuşta 70 Defa)',
          title: 'Secdeden Kalkıp Oturulur ve 70 Defa Okunur',
          arabic: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَتَجَاوَزْ عَمَّا تَعْلَمُ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ',
          reading: "Rabbiğfirlî verhamnî ve tecâvez ammâ ta'lem, inneke ente'l-eazzü'l-ekrem.",
          meaning: 'Rabbim! Beni bağışla, bana merhamet et ve bildiğin günahlarımı affet. Şüphesiz Sen en yüce ve en kerem sahibisin.'
        },
        {
          badge: 'Adım 4 (2. Secdede 70 Defa)',
          title: 'Tekrar Secdeye Varılır ve 70 Defa Okunur',
          arabic: 'سُبُّوحٌ قُدُّوسٌ رَبُّنَا وَرَبُّ الْمَلَائِكَةِ وَالرُّوحِ',
          reading: "Sübhûhun Kuddûsün Rabbunâ ve Rabbü'l-melâiketi ve'r-rûh."
        }
      ],
      closingDuaText:
        'İkinci secdeden sonra dünya ve ahiret hacetleri için Yüce Mevlâ’ya samimiyetle dua edilir.',
      namazTargetId: 'regaip-gecesi-namazi',
      namazTargetTitle: 'Regaip Gecesi Namazı (12 Rekat & Secde Zikirleri)'
    });
  }

  // =========================================================================
  // 3. MİRAÇ GECESİ (Recep Ayının 27. Gecesi)
  // =========================================================================
  if (
    (holyDay && holyDay.id.startsWith('mirac')) ||
    (h.monthName === 'Recep' && h.day === 27) ||
    (nextH.monthName === 'Recep' && nextH.day === 27)
  ) {
    guides.push({
      id: 'mirac-gecesi',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Miraç Gecesi Namazı ve İbadetleri',
      headerTitle: 'Miraç Gecesi Namazı ve İbadetleri',
      mainTitle: 'Receb-i Şerîf 27. Gece (Miraç Kandili) Gece ve Gündüz İbadetleri',
      introText:
        "Peygamber Efendimiz'in (s.a.v.) Mescid-i Harâm'dan Mescid-i Aksâ'ya ve oradan ilahi huzura yükseldiği, yedi kat göklerin sırlarıyla müşerref kılındığı Miraç Gecesi (27 Receb); gece 12 rekat hacet namazı, gündüz ise öğle ile ikindi arası kılınan 4 rekat namaz ve oruçla ihya edilir. Bu mübarek gecede süt içmek dini bir farz, vacip veya özel bir sünnet ibadeti olmasa da Hz. Peygamber'in miraçta kendisine sunulan ikramlar arasından sütü tercih etmesini yâd etmek amacıyla yapılan güzel bir gelenektir.",
      timeInfo:
        'Gece ibadeti Yatsı namazından sonra kılınır. Gündüz ibadeti ise Miraç Kandili gününde Öğle namazı ile İkindi namazı arasında eda edilir.',
      intentionText:
        "Yâ Rabbî, rızâ-yı şerîfin için niyet eyledim namaza. Bu gece, yedi kat gökleri ve bütün esrârını göstererek muhabbetin ile müşerref kıldığın Habîbin Resûl-i Zîşân Efendimiz hürmetine, ben âciz kulunu afv-ı İlâhî'ne, feyz-i İlâhî'ne ve rızâ-yı İlâhî'ne mazhar eyle... Allâhü Ekber",
      rakatGroups: [
        {
          badge: '1. BÖLÜM • 12 REKAT',
          title: 'Gece Kılınacak 12 Rekatlık Hâcet Namazı (2 Rekatta Bir Selam)',
          subtitle: '2 Rekatta Bir Selam Verilerek 12 Rekat Kılınır',
          rakats: [
            {
              name: 'Her Rekatta Okunacaklar',
              surahs: ['1 Fâtiha-i Şerîfe', '10 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")']
            }
          ],
          footerNote: 'Her 2 rekatın sonunda oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunarak selam verilir.'
        }
      ],
      dhikrSectionTitle: '2. BÖLÜM: 12 Rekat Bittikten Sonra Yapılacak Zikirler',
      dhikrBlocks: [
        {
          badge: 'Adım 1',
          title: '4 Fâtiha-i Şerîfe Okunur',
          note: 'Namaz tamamlandıktan sonra yerinizden kalkmadan 4 defa Fâtiha-i Şerîfe okunur.'
        },
        {
          badge: 'Adım 2',
          title: '100 Defa Tesbih ve Tevhid Zikri',
          arabic:
            'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
          reading:
            '"Sübhânallâhi ve\'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber, velâ havle velâ kuvvete illâ billâhi\'l-aliyyi\'l-azîm."',
          meaning:
            '"Allah\'ı tüm noksan sıfatlardan tenzih ederim, hamd Allah\'a mahsustur, Allah\'tan başka ilah yoktur ve Allah en büyüktür. Yüce ve azim olan Allah\'tan başka hiçbir güç ve kuvvet yoktur."'
        },
        {
          badge: 'Adım 3',
          title: '100 Defa İstiğfâr-ı Şerîf',
          arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
          reading:
            '"Estağfirullahel\'azîm ellezî lâ ilâhe illâ hüvel-Hayyel-Kayyûme ve etûbü ileyh." (Kısaca: "Estağfirullah")',
          meaning:
            '"Azamet sahibi, kendisinden başka ilah olmayan, diri (Hayy) ve her şeyi ayakta tutan (Kayyûm) Allah\'tan af diler ve O\'na tövbe ederim."'
        },
        {
          badge: 'Adım 4',
          title: '100 Defa Salevât-ı Şerîfe',
          arabic: 'اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
          reading: '"Allâhümme salli alâ Muhammedin ve alâ âli Muhammed." (Veya: "Allâhümme salli alâ Muhammed")',
          meaning: '"Allah\'ım! Efendimiz Muhammed\'e ve O\'nun âline (Ehl-i Beyti\'ne) rahmet, salât ve selam eyle."'
        }
      ],
      extraSections: [
        {
          badge: '☀️ 3. BÖLÜM • 4 REKAT',
          title: 'Miraç Kandili Gündüzü İbadeti (Öğle - İkindi Arası 4 Rekat)',
          description:
            "Miraç gecesini takip eden gündüzde, öğle namazı ile ikindi namazı arasında 4 rekat namaz kılınır. Her rekatta Fâtiha-i Şerîfe'den sonra sırasıyla şu sûreler 5'er defa okunur:",
          items: [
            '1 Fâtiha-i Şerîfe',
            "5 Âyetü'l-Kürsî",
            '5 Kâfirûn Sûresi ("Kul yâ eyyühe\'l-kâfirûn...")',
            '5 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")',
            '5 Felak Sûresi ("Kul eûzü birabbi\'l-felak...")',
            '5 Nâs Sûresi ("Kul eûzü birabbi\'n-nâs...")'
          ]
        },
        {
          badge: 'MÜJDELER & FAZİLET',
          title: 'Miraç Gecesi Müjdeleri & Oruç Fazileti',
          description: 'Bu mübarek gece ve gündüzün ihya edilmesine dair faziletler:',
          items: [
            "Namaz Borçlarının Ödenmesi Müjdesi: Bu gecede kılınan namazın feyz ve bereketiyle mümin huzûr-ı İlâhî'ye namaz borçlusu olarak çıkmaz; namaz borçlarını eda etmeye muvaffak kılınır.",
            '60 Ay Oruç Sevabı: Hadîs-i şerîfte buyrulmuştur ki: Receb-i şerîfin 27. gününde (kandil gecesini takip eden gündüzde) oruç tutan kimseye 60 ay oruç tutmuş gibi sevap yazılacağı vaad edilmiştir.'
          ]
        }
      ],
      namazTargetId: 'mirac-gecesi-namazi',
      namazTargetTitle: 'Miraç Gecesi Namazı (27 Receb)'
    });
  }

  // =========================================================================
  // 4. RECEP AYI (1 - 10 ARASI HÂCET NAMAZI)
  // =========================================================================
  if (h.monthName === 'Recep' && h.day >= 1 && h.day <= 10) {
    guides.push({
      id: 'recep-1-10',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Recep Ayı İlk 10 Gün Hâcet Namazı',
      headerTitle: 'Recep Ayı İlk 10 Gün Hâcet Namazı',
      mainTitle: 'Receb-i Şerîf Ayı Hâcet Namazı — İlk 10 Gün Namazı (1 - 10 Receb-i Şerîf)',
      introText:
        "Resûlullah Efendimizin (s.a.v.) berberi Selmân-ı Pâk (r.a.) Hazretleri tarafından rivâyet edilen bu mübarek hacet namazı, Receb ayında toplam 30 rekat olarak kılınır. 10'ar rekatlık 3 ayrı döneme (1-10, 11-20, 21-30 günleri) ayrılmıştır. Bu namazı eda edenlerin hidayete ereceği ve kalplerinin ölmeyeceği müjdelenmiştir.",
      timeInfo:
        'Akşam namazından sonra veya yatsı namazından sonra kılınabilir. Özellikle Cuma ve Pazartesi gecelerinde ve bilhassa teheccüd vaktinde kılınması çok daha faziletlidir.',
      intentionText:
        'Yâ Rabbî! Teşrifleriyle dünyayı nûra gark ettiğin Efendimiz hürmetine, sevgili ayın Receb-i şerîf hürmetine, beni feyz-i İlâhî’ne, afv-ı İlâhî’ne, rızâ-yı İlâhî’ne nâil eyle, âbid, zâhid kullarının arasına kaydeyle, dünya ve âhiret sıkıntılarından halâs eyle, rızâ-yı şerîfin için... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '10 REKAT (2 REKATTA BİR SELAM)',
          title: 'Her 2 Rekatta Bir Selam Verilerek 10 Rekat Tamamlanır',
          subtitle: 'Bu 10 rekatın her bir rekatında sırasıyla şu sûreler okunur:',
          rakats: [
            {
              name: 'Her Rekatta Okunacak Sûreler',
              surahs: [
                '1 Fâtiha-i Şerîfe',
                '3 Kâfirûn Sûresi ("Kul yâ eyyühe\'l-kâfirûn...")',
                '3 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")'
              ]
            }
          ],
          footerNote:
            'Her 2 rekatta bir oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunarak selam verilir. Böylece 10 rekat eda edilmiş olur.'
        }
      ],
      dhikrSectionTitle: 'Namaz Bittiğinde İlk 10 Gün Namazı (1 - 10 Receb-i Şerîf) İçin 11 Defa Okunacak Özel Zikir',
      dhikrBlocks: [
        {
          badge: '11 Defa Okunur',
          title: '1. Dönem (1 - 10 Receb) Özel Zikri',
          arabic:
            'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. اَللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
          reading:
            '"Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü’l-mülkü ve lehü’l-hamdü yuhyî ve yümît ve hüve Hayyün lâ yemût, biyedihi’l-hayr ve hüve alâ külli şey’in kadîr. Allâhümme lâ mânia limâ a\'tayte, velâ mu\'tiye limâ mena\'te, velâ yenfeu ze\'l-ceddi minke\'l-ceddü."',
          meaning:
            '"Allah’tan başka hiçbir ilâh yoktur, sâdece O vardır. O tektir ve şerîki (ortağı) yoktur. Mülk O’nundur, hamd de O’na mahsustur. O diriltir ve öldürür. O daima diridir, asla ölmez. Bütün hayırlar O’nun kudret elindedir ve O her şeye kadirdir. Allah’ım! Sen’in verdiğine mâni olacak yoktur, Sen’in menettiğini de verecek yoktur. Servet ve makam sahiplerine Sen’in katında malları ve şanları fayda vermez (ancak salih ameller fayda verir)."'
        }
      ],
      closingDuaText:
        '11 defa bu zikir okunduktan sonra eller açılıp dünya ve ahiret sıkıntılarından kurtuluş, ilahi affa ve rızaya nailiyet için yürekten dua edilir.',
      namazTargetId: 'recep-1-10-namazi',
      namazTargetTitle: 'Recep Ayı (1 - 10 Arası Hâcet Namazı)'
    });
  }

  // =========================================================================
  // 5. RECEP AYI (11 - 20 ARASI HÂCET NAMAZI)
  // =========================================================================
  if (h.monthName === 'Recep' && h.day >= 11 && h.day <= 20) {
    guides.push({
      id: 'recep-11-20',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Recep Ayı İkinci 10 Gün Hâcet Namazı',
      headerTitle: 'Recep Ayı İkinci 10 Gün Hâcet Namazı',
      mainTitle: 'Receb-i Şerîf Ayı Hâcet Namazı — İkinci 10 Gün Namazı (11 - 20 Receb-i Şerîf)',
      introText:
        "Resûlullah Efendimizin (s.a.v.) berberi Selmân-ı Pâk (r.a.) Hazretleri tarafından rivâyet edilen bu mübarek hacet namazı, Receb ayında toplam 30 rekat olarak kılınır. 10'ar rekatlık 3 ayrı döneme (1-10, 11-20, 21-30 günleri) ayrılmıştır. Bu namazı eda edenlerin hidayete ereceği ve kalplerinin ölmeyeceği müjdelenmiştir.",
      timeInfo:
        'Akşam namazından sonra veya yatsı namazından sonra kılınabilir. Özellikle Cuma ve Pazartesi gecelerinde ve bilhassa teheccüd vaktinde kılınması çok daha faziletlidir.',
      intentionText:
        'Yâ Rabbî! Teşrifleriyle dünyayı nûra gark ettiğin Efendimiz hürmetine, sevgili ayın Receb-i şerîf hürmetine, beni feyz-i İlâhî’ne, afv-ı İlâhî’ne, rızâ-yı İlâhî’ne nâil eyle, âbid, zâhid kullarının arasına kaydeyle, dünya ve âhiret sıkıntılarından halâs eyle, rızâ-yı şerîfin için... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '10 REKAT (2 REKATTA BİR SELAM)',
          title: 'Her 2 Rekatta Bir Selam Verilerek 10 Rekat Tamamlanır',
          subtitle: 'Bu 10 rekatın her bir rekatında sırasıyla şu sûreler okunur:',
          rakats: [
            {
              name: 'Her Rekatta Okunacak Sûreler',
              surahs: [
                '1 Fâtiha-i Şerîfe',
                '3 Kâfirûn Sûresi ("Kul yâ eyyühe\'l-kâfirûn...")',
                '3 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")'
              ]
            }
          ],
          footerNote:
            'Her 2 rekatta bir oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunarak selam verilir. Böylece 10 rekat eda edilmiş olur.'
        }
      ],
      dhikrSectionTitle: 'Namaz Bittiğinde İkinci 10 Gün Namazı (11 - 20 Receb-i Şerîf) İçin 11 Defa Okunacak Özel Zikir',
      dhikrBlocks: [
        {
          badge: '11 Defa Okunur',
          title: '2. Dönem (11 - 20 Receb) Özel Zikri',
          arabic: 'إِلٰهاً وَاحِداً أَحَداً صَمَداً فَرْداً وِتْراً حَيّاً قَيُّوماً دَائِمًا أَبَدًا',
          reading: '"İlâhen Vâhiden Ehaden Sameden Ferden Vitran Hayyen Kayyûmen Dâimen Ebedâ."',
          meaning:
            '"(O Allah) Birdir, tektir; hiçbir şeye muhtaç olmayıp her şey Kendisine muhtaçtır; tektir, eşi ve benzeri yoktur; daima diridir, kâinatı ayakta tutandır, daimîdir ve ebedîdir; öyle bir ilâhtır ki ancak O vardır."'
        }
      ],
      closingDuaText:
        '11 defa bu zikir okunduktan sonra eller açılıp dünya ve ahiret sıkıntılarından kurtuluş, ilahi affa ve rızaya nailiyet için yürekten dua edilir.',
      namazTargetId: 'recep-11-20-namazi',
      namazTargetTitle: 'Recep Ayı (11 - 20 Arası Hâcet Namazı)'
    });
  }

  // =========================================================================
  // 6. RECEP AYI (21 - 30 ARASI HÂCET NAMAZI)
  // =========================================================================
  if (h.monthName === 'Recep' && h.day >= 21 && h.day <= 30) {
    guides.push({
      id: 'recep-21-30',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Recep Ayı Son 10 Gün Hâcet Namazı',
      headerTitle: 'Recep Ayı Son 10 Gün Hâcet Namazı',
      mainTitle: 'Receb-i Şerîf Ayı Hâcet Namazı — Üçüncü 10 Gün Namazı (21 - 30 Receb-i Şerîf)',
      introText:
        "Resûlullah Efendimizin (s.a.v.) berberi Selmân-ı Pâk (r.a.) Hazretleri tarafından rivâyet edilen bu mübarek hacet namazı, Receb ayında toplam 30 rekat olarak kılınır. 10'ar rekatlık 3 ayrı döneme (1-10, 11-20, 21-30 günleri) ayrılmıştır. Bu namazı eda edenlerin hidayete ereceği ve kalplerinin ölmeyeceği müjdelenmiştir.",
      timeInfo:
        'Akşam namazından sonra veya yatsı namazından sonra kılınabilir. Özellikle Cuma ve Pazartesi gecelerinde ve bilhassa teheccüd vaktinde kılınması çok daha faziletlidir.',
      intentionText:
        'Yâ Rabbî! Teşrifleriyle dünyayı nûra gark ettiğin Efendimiz hürmetine, sevgili ayın Receb-i şerîf hürmetine, beni feyz-i İlâhî’ne, afv-ı İlâhî’ne, rızâ-yı İlâhî’ne nâil eyle, âbid, zâhid kullarının arasına kaydeyle, dünya ve âhiret sıkıntılarından halâs eyle, rızâ-yı şerîfin için... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '10 REKAT (2 REKATTA BİR SELAM)',
          title: 'Her 2 Rekatta Bir Selam Verilerek 10 Rekat Tamamlanır',
          subtitle: 'Bu 10 rekatın her bir rekatında sırasıyla şu sûreler okunur:',
          rakats: [
            {
              name: 'Her Rekatta Okunacak Sûreler',
              surahs: [
                '1 Fâtiha-i Şerîfe',
                '3 Kâfirûn Sûresi ("Kul yâ eyyühe\'l-kâfirûn...")',
                '3 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")'
              ]
            }
          ],
          footerNote:
            'Her 2 rekatta bir oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunarak selam verilir. Böylece 10 rekat eda edilmiş olur.'
        }
      ],
      dhikrSectionTitle: 'Namaz Bittiğinde Üçüncü 10 Gün Namazı (21 - 30 Receb-i Şerîf) İçin 11 Defa Okunacak Özel Zikir',
      dhikrBlocks: [
        {
          badge: '11 Defa Okunur',
          title: '3. Dönem (21 - 30 Receb) Özel Zikri',
          arabic:
            'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا رَادَّ لِمَا قَضَيْتَ، وَلَا مُبَدِّلَ لِمَا حَكَمْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ. سُبْحَانَ رَبِّيَ الْعَلِيِّ الْأَعْلَى الْوَهَّابِ، سُبْحَانَ رَبِّيَ الْعَلِيِّ الْأَعْلَى الْوَهَّابِ، سُبْحَانَ رَبِّيَ الْعَلِيِّ الْأَعْلَى الْكَرِيمِ الْوَهَّابِ، يَا وَهَّابُ يَا وَهَّابُ يَا وَهَّابُ',
          reading:
            '"Allâhümme lâ mânia limâ a’tayte, velâ mu’tiye limâ mena’te, velâ râdde limâ kadayte, velâ mübeddile limâ hakemte, velâ yenfeu ze’l-ceddi minke’l-ceddü. Sübhâne Rabbiye’l-Aliyyi’l-a’le’l-Vehhâb, Sübhâne Rabbiye’l-Aliyyi’l-a’le’l-Vehhâb, Sübhâne Rabbiye’l-Aliyyi’l-a’le’l-Kerîmi’l-Vehhâb, yâ Vehhâbü yâ Vehhâbü yâ Vehhâb."',
          meaning:
            '"Allah\'ım! Senin verdiğine engel olacak kimse yoktur, engellediğini verecek de yoktur. Hükmettiğini geri çevirecek yoktur, hükmünü değiştirecek de yoktur. Kişinin serveti ve şansı (makamı) Senin azabına karşı kendisine bir fayda vermez (kurtarıcı olan ancak Senin rahmetindir). Yüce, en üstün ve bahşeden Rabbim bütün noksan sıfatlardan uzaktır. Yüce, en üstün ve bahşeden Rabbim münezzehtir. Yüce, en üstün, cömert ve bahşeden Rabbim münezzehtir. Ey çokça bağışlayan ve lütfeden Vehhâb, ey Vehhâb, ey Vehhâb!"'
        }
      ],
      closingDuaText:
        '11 defa bu zikir okunduktan sonra eller açılıp dünya ve ahiret sıkıntılarından kurtuluş, ilahi affa ve rızaya nailiyet için yürekten dua edilir.',
      namazTargetId: 'recep-21-30-namazi',
      namazTargetTitle: 'Recep Ayı (21 - 30 Arası Hâcet Namazı)'
    });
  }

  // =========================================================================
  // 7. ŞÂBÂN-I ŞERÎF 1. GÜNÜ
  // =========================================================================
  if (
    (holyDay && holyDay.id.startsWith('saban-baslangic')) ||
    (h.monthName === 'Şaban' && h.day === 1)
  ) {
    guides.push({
      id: 'saban-1',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Şâbân-ı Şerîf Başlangıç İbadeti',
      headerTitle: 'Şâbân-ı Şerîf Başlangıç İbadeti',
      mainTitle: 'Şâbân-ı Şerîf Ayının 1. Gece Namazı (Tesbih Namazı)',
      introText:
        'Peygamber Efendimiz\'in (s.a.v.) "Benim ayımdır" buyurduğu mübarek Şâbân-ı Şerîf ayının ilk gecesini ihya etmek vesilesiyle kılınan hususi bir tesbih namazıdır.',
      timeInfo: 'Şâbân-ı Şerîf ayının 1. gecesinde Akşam namazından hemen sonra kılınır.',
      intentionText:
        'Niyet eyledim ya Rabbî Senin rızâ-yı şerîfin için Tesbih Namazı kılmaya, Şâbân-ı Şerîf ayının şerefine... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '4 REKAT TESBİH NAMAZI',
          title: 'Tesbih Namazı Usûlü ile 4 Rekat Eda Edilir',
          rakats: [
            {
              name: 'Her Rekatta Okunacaklar',
              surahs: [
                '1 Fâtiha-i Şerîfe',
                "3 Âyetü'l-Kürsî",
                'Gerekli rükünlerde Tesbih Zikri ("Sübhânallâhi ve\'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber") toplam 75\'er defa (4 rekatta 300 defa) tekrarlanır.'
              ]
            }
          ]
        }
      ],
      namazTargetId: 'saban-1-gecesi-namazi',
      namazTargetTitle: 'Şaban Ayı 1. Gece Namazı'
    });
  }

  // =========================================================================
  // 8. BERAT GECESİ (Şâbân-ı Şerîf 15. Gecesi)
  // =========================================================================
  if (
    (holyDay && holyDay.id.startsWith('berat')) ||
    (h.monthName === 'Şaban' && h.day === 15) ||
    (nextH.monthName === 'Şaban' && nextH.day === 15)
  ) {
    guides.push({
      id: 'berat-gecesi',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Berat Gecesi Namazı ve İbadetleri',
      headerTitle: 'Berat Gecesi Namazı ve İbadetleri',
      mainTitle: "Berât Gecesi İbadeti (15 Şâbân — Hayır Namazı ve 14'erli Zikirler)",
      introText:
        'Şâbân-ı Şerîf\'in 15. gecesi olan Berât Gecesi, kulların bir yıllık rızık, ecel ve amel takdirlerinin yazıldığı mübarek af gecesidir. Bu gecede en azından bir Tesbih Namazı kılınması ve tavsiye edilen 100 rekatlık "Hayır Namazı" eda edilmesi büyük bir fazilettir.',
      timeInfo: "Berât Gecesi'nde Yatsı namazından sonra imsak vaktine kadar kılınabilir.",
      intentionText:
        'Yâ Rabbî! Niyet ettim Senin rızâ-yı şerîfin için namaza. Beni afv-ı İlâhî’ne, feyz-i İlâhî’ne mazhar eyle. Kasvet-i kalpten, dünya ve âhiret sıkıntılarından halâs eyleyip saîdler defterine kaydeyle... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '100 REKAT HAYIR NAMAZI',
          title: '2 Rekatta Bir Selam Verilerek 100 Rekat Tamamlanır',
          rakats: [
            {
              name: 'Her Rekatta Okunacaklar',
              surahs: ['1 Fâtiha-i Şerîfe', '10 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")']
            }
          ],
          footerNote:
            '⭐ Müjde: Bu 100 rekatlık Hayır Namazını kılan kimse, o sene vefat ederse şehitlik mertebesine nail olur.'
        }
      ],
      dhikrSectionTitle: "Namaz Bittiğinde 14'er Adet Okunacak Zikir ve Sûreler",
      dhikrSectionSubtitle:
        'Hikmeti: Allâhü Teâlâ’nın "Hû" ism-i şerîfinin ebced değeri 11, Efendimiz\'in "Tâhâ" isminin ebced değeri 14 olduğu için aşağıdaki 11 özel husus 14\'er defa okunur:',
      dhikrBlocks: [
        {
          badge: '1. Husus (14 Kere)',
          title: '14 Kere İstiğfâr-ı Şerîf',
          arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
          reading: '"Estağfirullâhe\'l-azîm ellezî lâ ilâhe illâ hüve\'l-Hayyü\'l-Kayyûmü ve etûbü ileyh."'
        },
        {
          badge: '2. Husus (14 Kere)',
          title: '14 Kere Salât-ı Münciye (Kurtuluş Salavatı)',
          arabic:
            'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، صَلَاةً تُنجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ',
          reading:
            '"Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed. Salâten tüncînâ bihâ min cemî’il-ehvâli ve’l-âfât. Ve takdî lenâ bihâ cemî’al-hâcât. Ve tütahhirunâ bihâ min cemî’is-seyyiât. Ve terfe’unâ bihâ indeke a’led-derecât. Ve tübelliğunâ bihâ aksal-ğâyât. Min cemî’il-hayrâti fi’l-hayâti ve ba’del-memât."',
          meaning:
            '"Allah’ım! Efendimiz Muhammed’in ve O’nun ailesinin üzerine öyle bir salât (rahmet) eyle ki; o salât vesilesiyle bizi bütün korku ve afetlerden kurtar. Bizim bütün ihtiyaçlarımızı karşıla. Bizi bütün kötülüklerden temizle. Bizi katındaki en yüce derecelere yükselt. Hayatta ve ölümden sonra, bütün hayırlı gayelerin en son noktasına ulaştır."'
        },
        {
          badge: '3. Husus (14 Kere)',
          title: '14 Kere Fâtiha-i Şerîfe',
          note: 'Besmele-i Şerîfe ile 14 defa Fâtiha okunur.'
        },
        {
          badge: '4. Husus (14 Kere)',
          title: "14 Kere Âyetü'l-Kürsî",
          note: "Besmele-i Şerîfe ile 14 defa Âyetü'l-Kürsî okunur."
        },
        {
          badge: '5. Husus (14 Kere)',
          title: '14 Kere Tevbe Sûresi 128-129. Âyetleri ("Lekad Câeküm...")',
          arabic:
            'لَقَدْ جَاءَكُمْ رَسُولٌ مِنْ أَنْفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُمْ بِالْمُؤْمِنِينَ رَءُوفٌ رَحِيمٌ ﴿١٢٨﴾ فَإِنْ تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ ﴿١٢٩﴾',
          reading:
            '"Lekad câeküm rasûlün min enfüsiküm azîzün aleyhi mâ anittüm harîsün aleyküm bil-mü\'minîne raûfür-rahîm. Fe in tevellev fekul hasbiyallâhü lâ ilâhe illâ hüve, aleyhi tevekkeltü ve hüve rabbül-arşil-azîm."'
        },
        {
          badge: '6. Husus',
          title: '14 Kere "Yâsîn, Yâsîn..." Dedikten Sonra 1 Yâsîn-i Şerîf',
          note: '14 defa "Yâsîn" nidasından sonra 1 Yâsîn-i Şerîf okunur (içindeki 7 zâhirî, 7 bâtınî mübîn ile 14\'e tamamlanır).'
        },
        {
          badge: '7. Husus (14 Kere)',
          title: '14 Kere İhlâs-ı Şerîf',
          note: 'Besmele ile 14 defa İhlâs-ı Şerîf okunur.'
        },
        {
          badge: '8. Husus (14 Kere)',
          title: '14 Kere Felak Sûresi',
          note: 'Besmele ile 14 defa Felak Sûresi okunur.'
        },
        {
          badge: '9. Husus (14 Kere)',
          title: '14 Kere Nâs Sûresi',
          note: 'Besmele ile 14 defa Nâs Sûresi okunur.'
        },
        {
          badge: '10. Husus (14 Kere)',
          title: '14 Kere Tesbih ve Tevhid Zikri',
          arabic:
            'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
          reading:
            '"Sübhânallâhi ve\'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber. Velâ havle velâ kuvvete illâ billâhi\'l-aliyyi\'l-azîm."'
        }
      ],
      closingDuaText:
        'Zikirler bittikten sonra eller dergah-ı ilahiye açılır; afv-ı ilahiye mazhariyet, kasvet-i kalpten ve dünya-ahiret sıkıntılarından kurtuluş niyetiyle dua edilip tamamlanır.',
      namazTargetId: 'berat-gecesi-namazi',
      namazTargetTitle: 'Berât Gecesi Namazı (15 Şâbân Hayır Namazı)'
    });
  }

  // =========================================================================
  // 9. ŞÂBÂN-I ŞERÎF 27. GECESİ (Teşekkür Namazı)
  // =========================================================================
  if (
    (h.monthName === 'Şaban' && h.day === 27) ||
    (nextH.monthName === 'Şaban' && nextH.day === 27)
  ) {
    guides.push({
      id: 'saban-27',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Şâbân-ı Şerîf 27. Gecesi Namazı',
      headerTitle: 'Şâbân-ı Şerîf Ayının 27. Gecesi Teşekkür Namazı',
      mainTitle: 'Şâbân-ı Şerîf Ayının 27. Gecesi Teşekkür Namazı',
      introText:
        "Peygamber Efendimiz'in (s.a.v.) mübarek ayının sonuna yaklaşmanın bir şükran ifadesi olarak Şâbân-ı Şerîf'in 27. gecesinde eda edilen 2 rekatlık özel bir teşekkür ve şefaat isteme namazıdır.",
      timeInfo: 'Şâbân-ı Şerîf ayının 27. gecesi Akşam namazı ile Yatsı namazı arasında kılınır.',
      intentionText:
        'Yâ Rabbî! Beni Resûl-i Zîşân Efendimizin ayının sonuna yaklaştırdın. Resûlullah Efendimizi (s.a.v.) ve mübarek ayını bana hem şefaatçi ve hem de şâhit eyle... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '2 REKAT TEŞEKKÜR NAMAZI',
          title: '2 Rekat Olarak Kılınır',
          rakats: [
            {
              name: '1. ve 2. Rekat',
              surahs: [
                'Her rekatta 1 Fâtiha-i Şerîfe okunur.',
                "Fâtiha'dan sonra istenilen herhangi bir sûre (örneğin İhlâs, Felak, Nâs veya Kadir) okunabilir."
              ]
            }
          ]
        }
      ],
      dhikrSectionTitle: 'Namaz Bittiğinde Yapılacak İstiğfar, Salavat ve İltica',
      dhikrBlocks: [
        {
          badge: 'Adım 1',
          title: '70 Defa İstiğfâr-ı Şerîf',
          arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْكَ',
          reading: '"Estağfirullâhe\'l-azîm ve etûbü ileyk."',
          meaning: '"Yüce Allah\'tan bağışlanma diler ve O\'na tövbe ederim."'
        },
        {
          badge: 'Adım 2',
          title: '100 Defa Salât-ı Rûh-i Muhammedî',
          arabic:
            'اَللَّهُمَّ صَلِّ عَلَى رُوحِ مُحَمَّدٍ فِي الْأَرْوَاحِ وَصَلِّ عَلَى جَسَدِ مُحَمَّدٍ فِي الْأَجْسَادِ وَصَلِّ عَلَى قَبْرِ مُحَمَّدٍ فِي الْقُبُورِ',
          reading:
            '"Allâhümme salli alâ rûhi Muhammedin fi\'l-ervâhi, ve salli alâ cesedi Muhammedin fi\'l-ecsâdi, ve salli alâ kabri Muhammedin fi\'l-kubûr."',
          meaning:
            '"Allah\'ım! Ruhlar içinde Efendimiz Muhammed\'in ruhuna salât eyle, cesetler içinde Efendimiz Muhammed\'in cesedine salât eyle ve kabirler içinde Efendimiz Muhammed\'in kabrine salât eyle."'
        }
      ],
      closingDuaText:
        'Salavat bittikten sonra eller açılır ve "Yâ Rabbî! Senin huzûr-ı sırr-ı ehadiyyetine ilticâ ediyorum..." denilerek Yüce Allah\'a sığınılır, Efendimiz\'in (s.a.v.) şefaatı ve Şâbân ayının şahitliği niyaz edilerek dua tamamlanır.',
      namazTargetId: 'saban-27-gecesi-namazi',
      namazTargetTitle: 'Şaban Ayı 27. Gece Teşekkür Namazı'
    });
  }

  // =========================================================================
  // 10. KADİR GECESİ (Ramazan Ayının 27. Gecesi)
  // =========================================================================
  if (
    (holyDay && holyDay.id.startsWith('kadir')) ||
    (h.monthName === 'Ramazan' && h.day === 27) ||
    (nextH.monthName === 'Ramazan' && nextH.day === 27)
  ) {
    guides.push({
      id: 'kadir-gecesi',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Kadir Gecesi Namazı ve İbadetleri',
      headerTitle: 'Kadir Gecesi Namazı ve İbadetleri',
      mainTitle: 'Kadir Gecesi İbadeti (Bin Aydan Hayırlı Mübarek Gece)',
      introText:
        'Kutsal kitabımız Kur\'ân-ı Kerîm\'in indirilmeye başlandığı Kadir Gecesi, "bin aydan (80 yıllık bir ömürden) daha hayırlı" olan mübarek gecedir. Hz. Cebrail (a.s.) vasıtasıyla Peygamber Efendimiz\'e (s.a.v.) müjdelenen bu gecede 4 rekatlık Kadir Gecesi namazı ve özel tesbihatlar eda edilir.',
      timeInfo: "Kadir Gecesi'nde Yatsı ve Teravih namazından sonra imsak vakti girinceye kadar eda edilebilir.",
      intentionText:
        'Niyet ettim ya Rabbî Senin rızâ-yı şerîfin için Kadir Gecesi namazını kılmaya. Ya Rabbî! Bu gecedeki tecelliyat-ı ilâhiyyenden, afv-ı ilâhînden ve feyz-i ilâhînden hissedar olabilmek niyetiyle... Allâhü Ekber',
      rakatGroups: [
        {
          badge: '4 REKAT KADİR GECESİ NAMAZI',
          title: 'Rekat Rekat Kılınış & Okunacak Sûreler (4 Rekat)',
          rakats: [
            {
              name: '1. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '3 Kadir Sûresi ("İnnâ enzelnâhü fî leyletil-kadr...")']
            },
            {
              name: '2. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '3 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")']
            },
            {
              name: '3. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '3 Kadir Sûresi ("İnnâ enzelnâhü fî leyletil-kadr...")']
            },
            {
              name: '4. Rekat',
              surahs: ['1 Fâtiha-i Şerîfe', '3 İhlâs-ı Şerîf ("Kul hüvellâhü ehad...")']
            }
          ],
          footerNote:
            '2. rekatta oturulduğunda Et-Tahiyyatü, Salli-Barik okunur. 3. rekat için kalkıldığında Sübhaneke okunarak başlanır. 4. rekat sonunda selam verilir.'
        }
      ],
      dhikrSectionTitle: 'Namaz Bittiğinde Yapılacak Özel Zikir ve Sûreler',
      dhikrBlocks: [
        {
          badge: 'Adım 1',
          title: '1 Defa Tekbir ve Hamd Okunur',
          arabic:
            'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ وَلِلّٰهِ الْحَمْدُ',
          reading: '"Allâhü ekber, Allâhü ekber, lâ ilâhe illallâhü vallâhü ekber, Allâhü ekber ve lillâhi\'l-hamd."'
        },
        {
          badge: 'Adım 2',
          title: '100 Defa İnşirâh Sûresi ("Elem Neşrah Leke")',
          arabic:
            'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ. وَوَضَعْنَا عَنْكَ وِزْرَكَ. الَّذِي أَنْقَضَ ظَهْرَكَ. وَرَفَعْنَا لَكَ ذِكْرَكَ. فَإِنَّ مَعَ الْعُسْرِ يُسْرًا. إِنَّ مَعَ الْعُسْرِ يُسْرًا. فَإِذَا فَرَغْتَ فَانْصَبْ. وَإِلَىٰ رَبِّكَ فَارْغَبْ',
          reading:
            '"Bismillâhirrahmânirrahîm. Elem neşrah leke sadrek. Ve vada\'nâ anke vizrek. Ellezî enkada zahrek. Ve refa\'nâ leke zikrek. Fe inne me\'al-usri yusrâ. İnne me\'al-usri yusrâ. Fe izâ ferağte fensab. Ve ilâ rabbike ferğab."',
          meaning:
            '"Senin göğsünü açıp genişletmedik mi? Belini büken yükünü senden kaldırmadık mı? Senin şanını ve şerefini yüceltmedik mi? Şüphesiz güçlükle beraber bir kolaylık vardır. Gerçekten güçlükle beraber bir kolaylık vardır. Öyleyse bir işi bitirdiğinde diğerine koyul ve yalnız Rabbine yönel."'
        },
        {
          badge: 'Adım 3',
          title: '100 Defa Kadir Sûresi ("İnnâ Enzelnâhü")',
          arabic:
            'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ. وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ. لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ. تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ. سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
          reading:
            '"Bismillâhirrahmânirrahîm. İnnâ enzelnâhü fî leyletil-kadr. Ve mâ edrâke mâ leyletül-kadr. Leyletül-kadri hayrün min elfi şehr. Tenezzelül-melâiketü verrûhu fîhâ bi-izni rabbihim min külli emr. Selâmün hiye hattâ matla\'il-fecr."',
          meaning:
            '"Şüphesiz biz Kur\'an\'ı Kadir Gecesi\'nde indirdik. Kadir Gecesi\'nin ne olduğunu sen ne bileceksin? Kadir Gecesi bin aydan daha hayırlıdır. Melekler ve Ruh (Cebrail), Rablerinin izniyle her türlü iş için o gece inerler. O gece, tan yerinin ağarmasına kadar esenliktir."'
        },
        {
          badge: 'Adım 4',
          title: "100 Defa Peygamber Efendimiz'in (s.a.v.) Öğrettiği Af Duası",
          arabic: 'اَللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
          reading: '"Allâhümme inneke afüvvün kerîmün, tuhibbü\'l-afve fa\'fü \'annî."',
          meaning: '"Allah\'ım! Şüphesiz Sen çok affedicisin, kerîmsin. Affetmeyi seversin; beni de affet."'
        }
      ],
      closingDuaText:
        "Tesbihat tamamlandıktan sonra eller açılıp ümmet-i Muhammed'in birliği, dirlik ve beraberliği için dua edilir. Mümkünse bu gecede bir de Tesbih Namazı kılınarak gece ihya edilir.",
      namazTargetId: 'kadir-gecesi-namazi',
      namazTargetTitle: 'Kadir Gecesi Namazı ve Zikirleri'
    });
  }

  // =========================================================================
  // 11. ZİLHİCCE AYI (ÖZEL GÜNLERİ - İLK 10 GÜN)
  // =========================================================================
  if (h.monthName === 'Zilhicce' && h.day >= 1 && h.day <= 10) {
    guides.push({
      id: 'zilhicce-1-10',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Zilhicce Ayı İlk On Gün İbadetleri',
      headerTitle: 'Zilhicce Ayı İlk On Gün İbadetleri',
      mainTitle: 'Zilhicce Ayı (Leyâlî-i Aşere) İbadetleri ve Sabah Tesbihatı',
      introText:
        'Hicrî-Kamerî yılın 12. ayı olan Zilhicce, İslâm\'ın beş esasından biri olan Hac farizasının ifa edildiği, Arafat vakfesinin yapıldığı ve amel defterlerinin kapandığı umûmî af ayıdır. İlk 10 gecesi "Leyâlî-i Aşere" (10 Mübarek Gece) olarak anılır.',
      extraSections: [
        {
          badge: '🌙 ORUÇ VE MENDÛB AMELLER',
          title: 'Oruç ve Mendûb Ameller',
          description: 'Zilhicce ayının ilk 10 gününde tavsiye edilen faziletli ameller:',
          items: [
            'Hacca gidemeyen müminlerin ilk 9 gün oruç tutması çok büyük fazilettir. Hiç olmazsa 8. gün (Terviye) ile 9. gün (Arefe günü) oruçlu olunmalıdır.',
            'Kurban günü (10. gün) kurban kesilinceye kadar bir şey yemeyip ilk olarak kurban etinden yemek mendûbdur.'
          ]
        },
        {
          badge: '📢 TEŞRÎK TEKBİRLERİ',
          title: 'Vâcip Olan Teşrîk Tekbirleri',
          description:
            'Arefe günü sabah namazından başlayıp Bayramın 4. günü ikindi namazı dâhil, her farz namazın ardından kadın-erkek her mükellef Müslümana vâciptir:',
          items: ['"Allâhü ekber, Allâhü ekber, Lâ ilâhe illallâhü vallâhü ekber, Allâhü ekber ve lillâhi\'l-hamd"']
        }
      ],
      dhikrSectionTitle: "Zilhicce'nin 1'inden 10'una Kadar Her Gün Sabah Namazından Sonra Yapılacak Zikirler",
      dhikrBlocks: [
        {
          badge: '1. Zikir (10 Defa)',
          title: '10 Defa Salevât-ı Şerîfe',
          arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ',
          reading: '"Allâhümme salli ve sellim ve bârik alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed."',
          meaning: '"Allah\'ım! Efendimiz Muhammed\'e ve Efendimiz Muhammed\'in âline salât, selâm ve bereket eyle."'
        },
        {
          badge: '2. Zikir (10 Defa)',
          title: '10 Defa İstiğfâr-ı Şerîf',
          arabic:
            'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الْكَرِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ وَنَسْأَلُهُ التَّوْبَةَ وَالْمَغْفِرَةَ وَالْهِدَايَةَ لَنَا إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ',
          reading:
            '"Estağfirullâhe\'l-Azîme\'l-Kerîme ellezî lâ ilâhe illâ Hüve\'l-Hayyü\'l-Kayyûmü ve etûbü ileyk ve nes\'elühü\'t-tevbete ve\'l-mağfirate ve\'l-hidâyete lenâ innehû hüve\'t-Tevvâbü\'r-Rahîm."',
          meaning:
            '"Kerîm ve Azîm olan Allah\'tan bağışlanma dilerim. O\'ndan başka ilâh yoktur. O Hayy\'dır, Kayyûm\'dur. O\'na tövbe ederim. O\'ndan bizim için tövbe, mağfirat ve hidayet dileriz. Şüphesiz O, tövbeleri çokça kabul eden ve çok merhamet edendir."'
        },
        {
          badge: '3. Zikir (10 Defa)',
          title: '10 Defa Kelime-i Tevhid',
          arabic:
            'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          reading:
            '"Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü\'l-mülkü ve lehü\'l-hamdü, yuhyî ve yümît, ve hüve Hayyün lâ yemût, bi-yedihi\'l-hayr ve hüve alâ külli şey\'in Kadîr."',
          meaning:
            '"Allah\'tan başka ilâh yoktur. O tektir, ortağı yoktur. Mülk O\'nundur ve hamd O\'na mahsustur. Diriltir ve öldürür. O, Hayy\'dır; ölmez. Hayır O\'nun elindedir. O\'nun her şeye gücü yeter."'
        }
      ],
      closingDuaText:
        'Zikirler tamamlandıktan sonra eller açılıp hacıların dualarına ortak olmak, senelik amellerin rıza-yı ilahiye uygun kapanması ve feyizlenmek niyetiyle samimiyetle dua edilir.',
      namazTargetId: 'zilhicce-10-gun-ibadetleri',
      namazTargetTitle: 'Zilhicce Ayı (Leyâlî-i Aşere) İbadetleri ve Tesbihatı'
    });
  }

  // =========================================================================
  // 12. KURBAN BAYRAMI GÜNLERİ / TEŞRİK TEKBİRLERİ (9 - 13 Zilhicce)
  // =========================================================================
  if (isTashriqDay(date, h)) {
    guides.push({
      id: 'tesrik-tekbirleri',
      buttonLabel: 'Günün İbadeti',
      buttonSubLabel: 'Teşrik Tekbirleri ve Kurban Bayramı Günleri',
      headerTitle: 'Teşrik Tekbirleri ve Kurban Bayramı Günleri',
      mainTitle: 'Teşrik Tekbiri: Arapça Metni, Okunuşu ve Anlamı',
      introText:
        'Kurban bayramı günlerinde, arife günü sabah namazından bayramın dördüncü günü ikindi namazına kadar (ikindi namazı dahil) toplam 23 vakit farz namazların ardından kadın-erkek her mükellef Müslümanın getirmesi vâcip olan Teşrik tekbirinin detayları:',
      timeInfo:
        'Zilhicce ayının 9. günü (Arefe) sabah namazından başlayıp, bayramın 4. günü (Zilhicce ayının 13. günü) ikindi namazına kadar her farz namazdan hemen sonra selam verir vermez okunur.',
      dhikrSectionTitle: 'Farz Namazların Ardından Okunacak Teşrik Tekbiri',
      dhikrBlocks: [
        {
          badge: 'Her Farz Namaz Sonrası 1 Defa (Vâcip)',
          title: 'Teşrik Tekbiri Metni, Okunuşu ve Anlamı',
          arabic:
            'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
          reading:
            '"Allâhu ekber, Allâhu ekber, Lâ ilâhe illallâhu vallâhu ekber, Allâhu ekber ve lillâhi\'l-hamd."',
          meaning:
            '"Allah en büyüktür, Allah en büyüktür. Allah\'tan başka ilah yoktur, ancak Allah vardır. Allah en büyüktür, Allah en büyüktür ve hamd Allah\'a mahsustur."'
        }
      ],
      closingDuaText:
        'Farz namazdan selam verir vermez, konuşmadan ve camiden çıkmadan önce 1 defa Teşrik Tekbiri getirilir.',
      namazTargetId: 'zilhicce-10-gun-ibadetleri',
      namazTargetTitle: 'Zilhicce Ayı & Teşrik Tekbirleri Rehberi'
    });
  }

  // =========================================================================
  // 13. HER AYIN İLK PAZAR GÜNÜ — TESBİH NAMAZI
  // =========================================================================
  if (date.getDay() === 0 && date.getDate() <= 7) {
    guides.push({
      id: 'ayin-ilk-pazari-tesbih',
      buttonLabel: 'Her Ayın İlk Pazar Günü',
      buttonSubLabel: 'Tesbih Namazı Kılınışı',
      headerTitle: 'Her Ayın İlk Pazar Günü • Tesbih Namazı Kılınışı',
      mainTitle: 'Tesbih Namazı Nasıl Kılınır? (4 Rekat • 300 Tesbih Formülü)',
      introText:
        'Peygamber Efendimizin (s.a.v.) amcası Hz. Abbas\'a (r.a.) büyük faziletlerini müjdeleyerek öğrettiği Tesbih Namazı 4 rekattır. Her rekatta 75 defa, 4 rekatta toplam 300 defa aşağıdaki tesbih zikri okunarak eda edilir.',
      timeInfo: 'Kerahat vakitleri dışındaki tüm vakitlerde (gündüz veya gece) kılınabilir.',
      intentionText: '“Allah rızası için tesbih namazı kılmaya niyet ettim.” — Ardından “Allahu ekber” denilerek iftitah tekbiri alınır ve eller bağlanır.',
      dhikrSectionTitle: 'Namaz İçinde Toplam 300 Defa Okunacak Temel Tesbih',
      dhikrSectionSubtitle: 'Her rekatta 75 defa, 4 rekat boyunca aşağıdaki tesbih rükünlerde okunur:',
      dhikrBlocks: [
        {
          title: 'Okunacak Tesbih Zikri (Arapça, Okunuş ve Anlamı)',
          arabic: 'سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ',
          reading: '“Sübhânallâhi ve’l-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber ve lâ havle ve lâ kuvvete illâ billâhi’l-aliyyi’l-azîm”',
          meaning:
            '“Allah’ı tüm noksan sıfatlardan tenzih ederim. Hamd Allah’a mahsustur. Allah’tan başka ilah yoktur ve Allah en büyüktür. Yüce ve azim olan Allah’tan başka hiçbir güç ve kuvvet yoktur.”'
        }
      ],
      rakatGroups: [
        {
          badge: '1. REKÂT (75 TESBİH)',
          title: '1. Rekâtın Kılınışı — Sıfırdan Adım Adım (75 Tesbih)',
          subtitle: 'Kıbleye dönülüp niyet edilir ve “Allahu ekber” denilerek eller bağlandıktan sonra:',
          rakats: [
            {
              name: '1. Adım: Başlangıçta / Sübhaneke Sonrası (15 Defa)',
              surahs: [
                'Eller bağlı ayaktayken önce “Sübhaneke” duası okunur.',
                'Sübhaneke biter bitmez ayaktayken 15 defa tesbih okunur.',
                'Tesbih: “Sübhânallâhi ve’l-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber ve lâ havle ve lâ kuvvete illâ billâhi’l-aliyyi’l-azîm”'
              ]
            },
            {
              name: '2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa)',
              surahs: [
                'Eûzü-Besmele çekilir, Fâtiha Sûresi ve ardından bir zamm-ı sûre (İhlâs, Kevser, Felak vb.) okunur.',
                'Sûre biter bitmez (rükûya eğilmeden önce ayaktayken) 10 defa aynı tesbih okunur.'
              ]
            },
            {
              name: '3. Adım: Rükûda (10 Defa)',
              surahs: [
                '“Allahu ekber” denilerek rükûya eğilinir.',
                '3 defa “Sübhâne Rabbiye’l-Azîm” denir.',
                'Ardından rükû duruşu bozulmadan 10 defa aynı tesbih okunur.'
              ]
            },
            {
              name: '4. Adım: Rükûdan Doğrulunca / Kavmede (10 Defa)',
              surahs: [
                '“Semiallâhü limen hamideh” denilerek rükûdan doğrulunur ve ayakta dik dururken “Rabbenâ lekel-hamd” denir.',
                'Ayakta dik dururken 10 defa aynı tesbih okunur.'
              ]
            },
            {
              name: '5. Adım: Birinci Secdede (10 Defa)',
              surahs: [
                '“Allahu ekber” denilerek 1. secdeye varılır.',
                '3 defa “Sübhâne Rabbiye’l-A‘lâ” denir.',
                'Ardından secdedeyken 10 defa aynı tesbih okunur.'
              ]
            },
            {
              name: '6. Adım: İki Secde Arasındaki Oturuşta / Celsede (10 Defa)',
              surahs: [
                '“Allahu ekber” denilerek secdeden kalkılır ve dizüstü oturulur.',
                'İki secde arasında otururken 10 defa aynı tesbih okunur.'
              ]
            },
            {
              name: '7. Adım: İkinci Secdede (10 Defa)',
              surahs: [
                'Tekrar “Allahu ekber” denilerek 2. secdeye varılır.',
                '3 defa “Sübhâne Rabbiye’l-A‘lâ” denir.',
                'Ardından secdedeyken 10 defa aynı tesbih okunur.'
              ]
            }
          ],
          footerNote:
            '👉 1. Rekât Sayımı: 15 (ayakta) + 10 (sûre sonu) + 10 (rükû) + 10 (kavme) + 10 (1. secde) + 10 (oturuş) + 10 (2. secde) = Tam 75 Tesbih. 2. rekât için “Allahu ekber” denilerek ayağa kalkılır.'
        },
        {
          badge: '2. REKÂT (75 TESBİH • TOPLAM: 150)',
          title: '2. Rekâtın Kılınışı ve İlk Oturuş (75 Tesbih)',
          subtitle: 'Ayağa kalkıp eller bağlandıktan sonra sırasıyla:',
          rakats: [
            {
              name: '1. Adım: Ayakta Fâtiha’dan Önce (15 Defa)',
              surahs: [
                '2. rekât için ayağa kalkıp eller bağlanınca, hiçbir şey okumadan önce ayaktayken 15 defa tesbih okunur.'
              ]
            },
            {
              name: '2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa)',
              surahs: [
                'Besmele çekilir, Fâtiha Sûresi ve bir zamm-ı sûre okunur.',
                'Sûre biter bitmez rükûya gitmeden ayaktayken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '3. Adım: Rükûda (10 Defa)',
              surahs: [
                '“Allahu ekber” ile rükûya varılır. 3 defa “Sübhâne Rabbiye’l-Azîm” dedikten sonra rükûdayken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '4. Adım: Rükûdan Doğrulunca (10 Defa)',
              surahs: [
                '“Semiallâhü limen hamideh, Rabbenâ lekel-hamd” diyerek doğrulunur ve ayakta dik dururken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '5. Adım: Birinci Secdede (10 Defa)',
              surahs: [
                '“Allahu ekber” ile 1. secdeye gidilir. 3 defa “Sübhâne Rabbiye’l-A‘lâ” dedikten sonra secdede 10 defa tesbih okunur.'
              ]
            },
            {
              name: '6. Adım: İki Secde Arası Oturuşta (10 Defa)',
              surahs: [
                '“Allahu ekber” ile secdeden kalkılıp oturulur ve otururken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '7. Adım: İkinci Secdede (10 Defa)',
              surahs: [
                'Tekrar “Allahu ekber” ile 2. secdeye varılır. 3 defa “Sübhâne Rabbiye’l-A‘lâ” dedikten sonra 10 defa tesbih okunur.'
              ]
            },
            {
              name: '8. Adım: İlk Oturuş (Kāde-i Ûlâ)',
              surahs: [
                '2. secdeden sonra ayağa kalkılmaz, dizüstü oturulur ve yalnızca “Ettehiyyâtü” duası ile "Allâhümme Salli” ve “Allâhümme Bârik” duaları okunur.',
                'Ettehiyyâtü bittikten sonra “Allahu ekber” denilerek 3. rekât için ayağa kalkılır.'
              ]
            }
          ],
          footerNote:
            '👉 2. Rekât Sayımı: 75 Tesbih daha tamamlandı (Kümülatif Toplam: 150 Tesbih). 3. rekât için ayağa kalkılır.'
        },
        {
          badge: '3. REKÂT (75 TESBİH • TOPLAM: 225)',
          title: '3. Rekâtın Kılınışı (75 Tesbih)',
          subtitle: 'Ayağa kalkıp eller bağlandıktan sonra sırasıyla:',
          rakats: [
            {
              name: '1. Adım: Ayakta Başlarken (15 Defa)',
              surahs: [
                '3. rekât için ayağa kalkıp eller bağlanınca önce “Sübhaneke” duası okunur.',
                'Sübhaneke biter bitmez ayaktayken 15 defa tesbih okunur.'
              ]
            },
            {
              name: '2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa)',
              surahs: [
                'Eûzü-Besmele, Fâtiha Sûresi ve bir zamm-ı sûre okunur.',
                'Sûre bitince rükûya gitmeden ayaktayken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '3. Adım: Rükûda (10 Defa)',
              surahs: [
                '“Allahu ekber” ile rükûya varılır. 3 defa “Sübhâne Rabbiye’l-Azîm” dedikten sonra 10 defa tesbih okunur.'
              ]
            },
            {
              name: '4. Adım: Rükûdan Doğrulunca (10 Defa)',
              surahs: [
                '“Semiallâhü limen hamideh, Rabbenâ lekel-hamd” diyerek ayakta dik dururken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '5. Adım: Birinci Secdede (10 Defa)',
              surahs: [
                '“Allahu ekber” ile 1. secdeye gidilir. 3 defa “Sübhâne Rabbiye’l-A‘lâ” dedikten sonra 10 defa tesbih okunur.'
              ]
            },
            {
              name: '6. Adım: İki Secde Arası Oturuşta (10 Defa)',
              surahs: [
                '“Allahu ekber” ile oturulur ve otururken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '7. Adım: İkinci Secdede (10 Defa)',
              surahs: [
                'Tekrar “Allahu ekber” ile 2. secdeye varılır. 3 defa “Sübhâne Rabbiye’l-A‘lâ” dedikten sonra 10 defa tesbih okunur ve 4. rekât için ayağa kalkılır.'
              ]
            }
          ],
          footerNote:
            '👉 3. Rekât Sayımı: 75 Tesbih daha tamamlandı (Kümülatif Toplam: 225 Tesbih). 4. rekât için “Allahu ekber” denilerek ayağa kalkılır.'
        },
        {
          badge: '4. REKÂT & SON OTURUŞ (75 TESBİH • GENEL TOPLAM: 300)',
          title: '4. Rekâtın Kılınışı, Son Oturuş ve Selam (75 Tesbih)',
          subtitle: 'Ayağa kalkıp eller bağlandıktan sonra namazın tamamlanışı:',
          rakats: [
            {
              name: '1. Adım: Ayakta Fâtiha’dan Önce (15 Defa)',
              surahs: [
                '4. rekât için ayağa kalkıp eller bağlanınca ayaktayken 15 defa tesbih okunur.'
              ]
            },
            {
              name: '2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa)',
              surahs: [
                'Besmele çekilir, Fâtiha Sûresi ve bir zamm-ı sûre okunur.',
                'Sûre bittikten sonra ayaktayken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '3. Adım: Rükûda (10 Defa)',
              surahs: [
                'Rükûya varılır. 3 defa “Sübhâne Rabbiye’l-Azîm” dedikten sonra rükûda 10 defa tesbih okunur.'
              ]
            },
            {
              name: '4. Adım: Rükûdan Doğrulunca (10 Defa)',
              surahs: [
                '“Semiallâhü limen hamideh, Rabbenâ lekel-hamd” denilerek doğrulunur ve ayakta 10 defa tesbih okunur.'
              ]
            },
            {
              name: '5. Adım: Birinci Secdede (10 Defa)',
              surahs: [
                '1. secdeye gidilir. 3 defa “Sübhâne Rabbiye’l-A‘lâ” dedikten sonra secdede 10 defa tesbih okunur.'
              ]
            },
            {
              name: '6. Adım: İki Secde Arası Oturuşta (10 Defa)',
              surahs: [
                'Secdeden kalkılıp oturulur ve iki secde arasında otururken 10 defa tesbih okunur.'
              ]
            },
            {
              name: '7. Adım: İkinci Secdede (10 Defa)',
              surahs: [
                '2. secdeye varılır. 3 defa “Sübhâne Rabbiye’l-A‘lâ” dedikten sonra secdede 10 defa tesbih okunur.'
              ]
            },
            {
              name: '8. Adım: Son Oturuş ve Selam (Kāde-i Âhire)',
              surahs: [
                '2. secdeden sonra dizüstü oturulur ve sırasıyla:',
                '• “Ettehiyyâtü” duası',
                '• “Allâhümme Salli” ve “Allâhümme Bârik” duaları',
                '• “Rabbenâ Âtinâ” ve “Rabbenagfirlî” duaları okunur.',
                'Dualar bitince önce sağ omuza bakılarak “Esselâmü aleyküm ve rahmetullâh”, sonra sol omuza bakılarak “Esselâmü aleyküm ve rahmetullâh” denilerek selam verilir.'
              ]
            }
          ],
          footerNote:
            '👉 4 Rekâtın tamamında: 75 × 4 = 300 Tesbih tam ve eksiksiz olarak tamamlanmış olur.'
        }
      ],
      extraSections: [
        {
          badge: '⚡ PRATİK ÖZET FORMÜL',
          title: 'Tesbih Namazı Hızlı Akıl Kartı',
          description: 'Namazı eda ederken zihinde tutulacak pratik akış formülü:',
          items: [
            '• Fâtiha\'dan önce: 15 defa tesbih okunur.',
            '• Fâtiha\'dan sonra: 10 defa tesbih okunur.',
            '• Diğer her durakta (Rükûda, rükûdan doğrulunca, secdelerde, iki secde arasında): 10\'ar defa tesbih okunur.',
            '• 1. Oturuş (2. rekât sonu): Ettehiyyâtü, Allâhümme Salli ve Allâhümme Bârik duaları okunur.',
            '• 3. Rekâtın Başı: Ayağa kalkıldığında (oturuştan sonra) tekrardan Sübhaneke okunarak başlanır.'
          ]
        },
        {
          badge: 'ÖNEMLİ İPUÇLARI',
          title: 'Tesbih Namazında Kolaylık ve Fıkhî İncelikler',
          description: 'Namazı kılarken zihninizi rahatlatacak pratik kurallar:',
          items: [
            'Sayı Sayma Usûlü: Namaz içinde sesli sayı sayılmaz ve tesbih tanesi çekilmez. Parmak uçlarını hafifçe dizlere veya yere bastırarak ya da kalpten takip edilir.',
            'Rükün Tesbihlerinden Sonra Okunur: Rükû ve secdelerdeki tesbihler, o rüknün kendi zikrinden (Sübhâne Rabbiye’l-Azîm / A‘lâ) hemen sonra okunur.',
            'Unutulursa Telafi Edilir: Eğer bir rükünde (örneğin rükûda) 10 tesbihi okumayı unutursanız, bir sonraki duruşta (doğrulunca veya secdede) unutulan 10 tesbihi ekleyerek 20 defa okuyabilirsiniz.'
          ]
        }
      ],
      closingDuaText:
        'Selam verildikten sonra eller semaya açılarak geçmiş ve gelecek günahların bağışlanması, af ve mağfiret niyetiyle Yüce Allah’a samimiyetle dua edilir.',
      namazTargetId: 'tesbih-namazi-kilinisi',
      namazTargetTitle: 'Tesbih Namazı (4 Rekat • 300 Tesbih)'
    });
  }

  // =========================================================================
  // 13B. HER AYIN 2. PAZAR GÜNÜ — DUHA (KUŞLUK) NAMAZI
  // =========================================================================
  if (date.getDay() === 0 && date.getDate() >= 8 && date.getDate() <= 14) {
    guides.push({
      id: 'ayin-ikinci-pazari-duha',
      buttonLabel: 'Günün İbadeti • Ayın 2. Pazarı',
      buttonSubLabel: 'Duha (Kuşluk) Namazı Kılınışı',
      headerTitle: 'Her Ayın 2. Pazar Günü • Duha (Kuşluk) Namazı Kılınışı',
      mainTitle: 'Kuşluk (Duha) Namazı Nasıl Kılınır? (6 Rekat • Vakti, Niyeti ve Adım Adım Kılınışı)',
      introText:
        'Kuşluk (Duha) namazı; güneş doğduktan yaklaşık 45 dakika sonra (kerahat vakti çıktıktan sonra) başlar. Uygulamamızdaki takvim sayfasında "Günün Namaz Saatleri" başlığı altında yer alan İşrak / Kuşluk vaktinden sonra öğle namazına 30 dakika kalana kadar kılınabilir. Genellikle 6 rekât olarak kılınır.',
      timeInfo:
        'Güneş doğduktan yaklaşık 45 dakika sonra (Takvim ekranındaki "İşrak / Kuşluk" vakti girdikten sonra) başlar ve Öğle namazı vaktine 30 dakika kalana kadar kılınabilir.',
      intentionText:
        '“Niyet ettim Allah rızası için Duha (kuşluk) namazının iki rekâtını kılmaya.” — (Her 2 rekâtta bir selam verilerek niyet yenilenir ve “Allahu Ekber” diyerek namaza başlanır.)',
      rakatGroups: [
        {
          badge: '1. VE 2. REKÂT (1. SELAM)',
          title: '1. ve 2. Rekâtın Kılınışı (Normal Nafile Usûlü)',
          subtitle: 'Kıbleye dönülüp niyet edilir ve “Allahu Ekber” diyerek namaza başlanır:',
          rakats: [
            {
              name: '1. Rekât (Başlangıç, Kıraat, Rükû ve Secdeler)',
              surahs: [
                'Kıbleye dönülür ve “Niyet ettim Allah rızası için Duha (kuşluk) namazının iki rekâtını kılmaya” diye niyet edilir, “Allahu Ekber” diyerek eller bağlanır.',
                'Sübhaneke, Eûzü-Besmele, Fâtiha Sûresi ve ardından bir sûre veya birkaç âyet okunur.',
                'Rükû ve iki secde yapılarak 2. rekâta kalkılır.'
              ]
            },
            {
              name: '2. Rekât (Kıraat, Oturuş ve 1. Selam)',
              surahs: [
                '2. rekâtta Besmele çekilir, Fâtiha Sûresi ve bir sûre okunur.',
                'Rükû ve secdelerden sonra oturulur.',
                'Oturuşta Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ duaları okunup sağa ve sola selam verilerek ilk 2 rekât tamamlanır.'
              ]
            }
          ],
          footerNote:
            '👉 İlk 2 rekât tamamlandıktan sonra 3. ve 4. rekâtı kılmak üzere ayağa kalkılır.'
        },
        {
          badge: '3. VE 4. REKÂT (2. SELAM)',
          title: '3. ve 4. Rekâtın Kılınışı',
          subtitle: 'Ayağa kalkılarak yeniden niyet edilir:',
          rakats: [
            {
              name: '3. Rekât (Ayağa Kalkış ve Kıraat)',
              surahs: [
                'Ayağa kalkılarak niyet edilir: “Niyet ettim Allah rızası için Duha namazının iki rekâtını kılmaya.”',
                'Yine Sübhaneke, Eûzü-Besmele, Fâtiha ve bir sûre okunarak rükû ve secdeler yapılır, ardından 4. rekâta kalkılır.'
              ]
            },
            {
              name: '4. Rekât (Oturuş ve 2. Selam)',
              surahs: [
                'Besmele, Fâtiha ve bir sûre okunarak rükû ve secdeler yapılır.',
                '4. rekât sonunda oturulup Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ duaları okunarak sağa ve sola selam verilir.'
              ]
            }
          ],
          footerNote:
            '👉 İlk 4 rekât tamamlandıktan sonra 5. ve 6. rekât için ayağa kalkılmaz; oturur vaziyette devam edilir.'
        },
        {
          badge: '5. VE 6. REKÂT (ÖZEL USÛL • 3. SELAM)',
          title: '5. ve 6. Rekâtın Kılınışı (Özel Usûl)',
          subtitle: 'İlk 4 rekât tamamlandıktan sonra son 2 rekât oturur vaziyette eda edilir:',
          rakats: [
            {
              name: '5. ve 6. Rekât Uygulaması (Oturarak)',
              surahs: [
                'İlk 4 rekât tamamlandıktan sonra ayağa kalkılmaz, oturur vaziyette son 2 rekâta niyet edilerek devam edilir.',
                'Oturur vaziyette Sübhaneke, Fâtiha ve sûre okunarak rükû ve secdeler oturularak yerine getirilir.',
                'Son oturuşta Ettehiyyâtü, Salli, Bârik ve Rabbenâ duaları okunarak sağa ve sola selam verilir ve namaz tamamlanır.'
              ]
            }
          ],
          footerNote:
            '👉 Böylece 6 rekâtlık Kuşluk (Duha) Namazı eksiksiz olarak tamamlanmış olur.'
        }
      ],
      extraSections: [
        {
          badge: '⚡ PRATİK ÖZET FORMÜL',
          title: 'Kuşluk (Duha) Namazı Hızlı Akıl Kartı',
          description: 'Duha namazını eda ederken zihinde tutulacak pratik özet:',
          items: [
            '• Kılınma Vakti: Takvim sayfasındaki "İşrak (Kuşluk)" vaktinden sonra başlar, öğle namazına 30 dakika kalana kadar kılınabilir.',
            '• Rekat Düzeni: Genellikle 6 rekât olarak (her 2 rekâtta bir selam verilerek 2 + 2 + 2 şeklinde) kılınır.',
            '• Son 2 Rekât Özel Usûlü: İlk 4 rekât ayakta kılındıktan sonra, 5. ve 6. rekât ayağa kalkılmadan oturur vaziyette tamamlanır.'
          ]
        }
      ],
      closingDuaText:
        'Selam verildikten sonra eller semaya açılarak kuşluk vaktinin feyzi, rızık bereketi, beden ve ruh sağlığı ile mağfiret için Yüce Allah’a samimiyetle dua edilir.',
      namazTargetId: 'kusluk-namazi-kilinisi',
      namazTargetTitle: 'Kuşluk (Duha) Namazı Kılınışı'
    });
  }

  // =========================================================================
  // 13C. HER AYIN 3. PAZAR GÜNÜ — EVVÂBÎN NAMAZI
  // =========================================================================
  if (date.getDay() === 0 && date.getDate() >= 15 && date.getDate() <= 21) {
    guides.push({
      id: 'ayin-ucuncu-pazari-evvabin',
      buttonLabel: 'Günün İbadeti • Ayın 3. Pazarı',
      buttonSubLabel: 'Evvâbîn Namazı Kılınışı',
      headerTitle: 'Her Ayın 3. Pazar Günü • Evvâbîn Namazı Kılınışı',
      mainTitle: 'Evvâbîn Namazı Nasıl Kılınır? (6 Rekat • 2 + 2 + 2 Formülü)',
      introText:
        'Evvâbîn namazı; akşam namazından sonra, yatsı namazının vakti girinceye kadar kılınan faziletli bir nafile namazdır. Akşam namazının farz ve sünnetlerinden sonra kılınması yaygındır. Genellikle 6 rekât olarak, ikişer rekâtlar hâlinde 2 + 2 + 2 şeklinde kılınır.',
      timeInfo:
        'Akşam namazının farzı ve sünneti kılındıktan sonra başlar; Yatsı namazının vakti girinceye kadar eda edilir.',
      intentionText:
        '“Niyet ettim Allah rızası için Evvâbîn namazını kılmaya.” — (Her iki rekâtta bir niyet edilir ve “Allahu ekber” denilerek namaza başlanır.)',
      rakatGroups: [
        {
          badge: '1. BÖLÜM • 1. VE 2. REKÂT (1. SELAM)',
          title: 'Birinci 2 Rekâtın Kılınışı (1. Selam)',
          subtitle: 'Akşam namazının ardından ilk 2 rekât için niyet edilerek:',
          rakats: [
            {
              name: '1. Rekât',
              surahs: [
                'Kıbleye dönülüp niyet edilir ve tekbir alınır: “Allahu ekber.”',
                'Sübhaneke okunur, Eûzü-Besmele çekilerek Fâtiha ve ardından Kur’ân’dan bir sûre veya birkaç âyet okunur.',
                'Rükû ve iki secde yapılarak ikinci rekâta kalkılır.'
              ]
            },
            {
              name: '2. Rekât ve İlk Selam',
              surahs: [
                'İkinci rekâtta Besmele ile Fâtiha ve bir sûre okunur, rükû ve secdelerden sonra oturulur.',
                'Oturuşta Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ duaları okunup sağa ve sola selam verilerek ilk 2 rekât tamamlanır.'
              ]
            }
          ],
          footerNote:
            '👉 İlk 2 rekât tamamlandıktan sonra 3. ve 4. rekât için tekrar ayağa kalkılır.'
        },
        {
          badge: '2. BÖLÜM • 3. VE 4. REKÂT (2. SELAM)',
          title: 'İkinci 2 Rekâtın Kılınışı (2. Selam)',
          subtitle: 'İlk selamdan sonra ayağa kalkılıp yeniden niyet edilerek:',
          rakats: [
            {
              name: '3. ve 4. Rekât Uygulaması',
              surahs: [
                'Yeniden “Niyet ettim Allah rızası için Evvâbîn namazını kılmaya” diye niyet edilip “Allahu ekber” ile namaza başlanır.',
                '3. rekâtta Sübhaneke, Eûzü-Besmele, Fâtiha ve bir sûre okunup rükû ve iki secde yapılır.',
                '4. rekâtta Besmele, Fâtiha ve bir sûre okunur; rükû ve secdelerden sonra oturulup Ettehiyyâtü, Salli, Bârik ve Rabbenâ duaları okunarak sağa ve sola selam verilir.'
              ]
            }
          ],
          footerNote:
            '👉 4 rekât tamamlandıktan sonra son 2 rekât (5. ve 6. rekât) için tekrar ayağa kalkılır.'
        },
        {
          badge: '3. BÖLÜM • 5. VE 6. REKÂT (3. SELAM)',
          title: 'Üçüncü 2 Rekâtın Kılınışı (3. Selam ve Tamamlama)',
          subtitle: 'Son 2 rekât için ayağa kalkılıp niyet edilerek:',
          rakats: [
            {
              name: '5. ve 6. Rekât Uygulaması',
              surahs: [
                'Aynı şekilde niyet edilip “Allahu ekber” ile namaza başlanır.',
                '5. rekâtta Sübhaneke, Eûzü-Besmele, Fâtiha ve bir sûre; 6. rekâtta Besmele, Fâtiha ve bir sûre okunur.',
                'Son oturuşta Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ duaları okunup sağa ve sola selam verilerek toplam 6 rekât tamamlanır.'
              ]
            }
          ],
          footerNote:
            '👉 İkişer rekâtlar hâlinde (2 + 2 + 2) toplam 6 rekât Evvâbîn Namazı tamamlanmış olur.'
        }
      ],
      extraSections: [
        {
          badge: '⚡ PRATİK ÖZET FORMÜL',
          title: 'Evvâbîn Namazı Hızlı Akıl Kartı',
          description: 'Evvâbîn namazını eda ederken zihinde tutulacak pratik noktalar:',
          items: [
            '• Vakti: Akşam namazının farz ve sünnetinden sonra, yatsı namazı vakti girinceye kadar kılınır.',
            '• 2 + 2 + 2 Formülü: Toplam 6 rekât olup her 2 rekâtta bir selam verilerek eda edilir.',
            '• Fazileti: "Evvâbîn", tövbe ve istiğfar ederek Allah’a yönelenlerin namazı anlamındadır; akşam ile yatsı arasındaki gaflet vaktini ihya etmeyi sağlar.'
          ]
        }
      ],
      closingDuaText:
        'Selam verildikten sonra eller semaya açılarak tövbelerin kabulü, günahların affı ve Allah’a samimi yönelen salih kullardan olmak niyetiyle dua edilir.',
      namazTargetId: 'evvabin-namazi-kilinisi',
      namazTargetTitle: 'Evvâbîn Namazı Kılınışı'
    });
  }

  // =========================================================================
  // 13D. HER AYIN 4. PAZAR / CUMARTESİ GÜNÜ — TEHECCÜD NAMAZI
  // =========================================================================
  if (
    (date.getDay() === 0 && date.getDate() >= 22 && date.getDate() <= 28) ||
    (date.getDay() === 6 && date.getDate() >= 21 && date.getDate() <= 28)
  ) {
    guides.push({
      id: 'ayin-dorduncu-pazari-teheccud',
      buttonLabel: date.getDay() === 6 ? 'Günün İbadeti • 4. Cumartesi/Pazar' : 'Günün İbadeti • Ayın 4. Pazarı',
      buttonSubLabel: 'Teheccüd Namazı Kılınışı',
      headerTitle: 'Her Ayın 4. Cumartesi / Pazar Günü • Teheccüd Namazı Kılınışı',
      mainTitle: 'Teheccüd Namazı Kılınışı ve Faziletleri (Gece İbadeti Rehberi)',
      introText:
        'Teheccüd namazının vakti, uygulamamızdaki takvim sayfasında "Günün Namaz Saatleri" başlığı altında bulunan Teheccüd vakti saatinden sonra başlar ve İmsak vaktine kadar devam eder. Gecenin son üçte biri teheccüd için en faziletli vakittir. Uygun olan, bir süre uyuyup gece kalkarak kılmaktır.',
      timeInfo:
        'Takvim sayfasında yer alan "Teheccüd Vakti" saatinden sonra başlar ve İmsak vaktine kadar devam eder. Gecenin son üçte biri (seher vakti) en faziletli vaktidir.',
      intentionText:
        '“Niyet ettim Allah rızası için teheccüd namazını kılmaya.” — Ardından “Allahu ekber” diyerek namaza başlanır.',
      rakatGroups: [
        {
          badge: '2 REKÂT TEHECCÜD KILINIŞI',
          title: '2 Rekât Teheccüd Nasıl Kılınır? (İkişer Rekâtlar Hâlinde)',
          subtitle: 'En az 2 rekât kılınabilir; ikişer rekâtlar hâlinde 4, 6, 8 veya daha fazla kılınabilir:',
          rakats: [
            {
              name: '1. Rekât',
              surahs: [
                'Kıbleye dönülüp niyet edilir ve “Allahu ekber” diyerek namaza başlanır.',
                'Sübhaneke okunur, Eûzü-Besmele çekilip Fâtiha ve ardından bildiğin bir sûre okunur.',
                'Rükû ve secdeler yapılarak 2. rekâta kalkılır.'
              ]
            },
            {
              name: '2. Rekât, Oturuş ve Selam',
              surahs: [
                'Besmele çekilip Fâtiha ve bir sûre okunur.',
                'Rükû ve secdelerden sonra oturulur.',
                'Oturuşta Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ duaları okunup sağa ve sola selam verilerek 2 rekât tamamlanır.'
              ]
            }
          ],
          footerNote:
            '👉 Yeni başlayan biri için 2 rekât kılması yeterlidir. İstersen selam verdikten sonra aynı şekilde 2 rekât daha kılabilirsin.'
        }
      ],
      extraSections: [
        {
          badge: '🌙 KAÇ REKÂT KILINIR?',
          title: 'Teheccüd Namazı Rekat Sayısı ve Vakit Bilgisi',
          description: 'Gece namazını eda ederken bilinmesi gereken temel kurallar:',
          items: [
            '• Kaç Rekât Kılınır?: En az 2 rekât kılınabilir. İkişer rekâtlar hâlinde 4, 6, 8 veya daha fazla kılınabilir. Yeni başlayan biri için 2 rekât kılması yeterlidir.',
            '• Vakti: Takvim sayfasındaki "Teheccüd Vakti" saatinden İmsak vaktine kadar olan seher vaktidir.'
          ]
        },
        {
          badge: '🤲 DUA VE VİTİR NAMAZI NOTU',
          title: 'Namaz Sonrası Dua ve Vitir Namazı İnceliği',
          description: 'Teheccüd sonrasında dua ve vitir namazı uygulaması:',
          items: [
            '• Dua: Teheccüdden sonra dua etmek için en güzel vakittir. Kendi dilinizle Allah’tan dilediğiniz şeyleri isteyebilir, tövbe ve istiğfar edebilirsiniz.',
            '• Vitir Namazı Notu: Eğer gece kalkacağınıza güveniyorsanız teheccüdden sonra vitir namazı kılmak sünnettir. Ancak gece kalkamayacağınızdan endişeniz varsa (alarmın çalmaması vb. durumlar için) vitri yatmadan önce kılabilirsiniz. Vitir namazını kaçırma tehlikesi olmadığından, kendine güvenenlerin teheccüdden sonra vitir kılması sünnettir.'
          ]
        }
      ],
      closingDuaText:
        'Teheccüd namazından sonra seher vaktinin icabet saatinde eller semaya açılarak kendi dilinizle samimi dua, tövbe ve istiğfar edilir.',
      namazTargetId: 'teheccud-namazi-kilinisi',
      namazTargetTitle: 'Teheccüd Namazı Kılınışı'
    });
  }

  // =========================================================================
  // 14. HER CUMA GÜNÜ — CUMA NAMAZI KILINIŞI VE HUTBE ADABI
  // =========================================================================
  if (date.getDay() === 5) {
    guides.push({
      id: 'cuma-gunu-namazi',
      buttonLabel: 'Cuma Günü İbadeti',
      buttonSubLabel: 'Cuma Namazı Kılınışı ve Hutbe Adabı',
      headerTitle: 'Cuma Günü • Cuma Namazı Kılınışı ve Hutbe Adabı',
      mainTitle: 'Cuma Namazı Nasıl Kılınır? (İlk Sünnet, Hutbe Adabı, Farz, Son Sünnet ve Zuhr-i Âhir)',
      introText:
        'Müminlerin haftalık bayramı olan mübarek Cuma gününde eda edilen Cuma namazı; 4 rekat ilk sünnet, hutbe dinleme, 2 rekat cemaatle farz ve 4 rekat son sünnetten oluşur. Ardından ihtiyaten 4 rekat Zuhr-i Âhir ve 2 (veya 4) rekat Vaktin Son Sünneti kılınır.',
      timeInfo:
        'Cuma günü Öğle namazı vaktinde camide cemaatle birlikte eda edilir.',
      intentionText:
        'İlk Sünnet: "Niyet ettim Allah rızası için cuma namazının ilk sünnetini kılmaya" • Farz: "Niyet ettim cuma namazının farzına, uydum hazır olan imama" • Son Sünnet: "Niyet ettim Allah rızası için cuma namazının son sünnetini kılmaya"',
      extraSections: [
        {
          badge: 'HUTBE ADABI',
          title: 'Hutbe Adabı ve Cemaatin Durumu',
          description:
            'Kıbleye dönük bir şekilde, namazda tahiyyatta oturuyormuş gibi veya bağdaş kurarak saygılı ve edepli bir duruşla oturulur.',
          items: [
            'Hadis-i Şerif Kuralı: Peygamber Efendimiz (s.a.v) şöyle buyurmuştur: "Cuma günü imam hutbe okurken arkadaşına \'Sus!\' bile desen, boş konuşmuş (ve cumanın sevabını iptal etmiş) olursun." (Buhârî, Cuma 36; Müslim, Cuma 11).',
            'Bu nedenle hutbe sırasında kesinlikle konuşulmaz, telefonla veya başka bir şeyle uğraşılmaz, tesbih çekilmez, namaz kılınmaz. Sadece imam dinlenir.'
          ]
        }
      ],
      rakatGroups: [
        {
          badge: '1. BÖLÜM • 4 REKAT (BİREYSEL)',
          title: 'Cuma Namazının İlk Sünneti (4 Rekat)',
          subtitle:
            'Bu namaz cemaat tarafından kendi başına (bireysel olarak) kılınır. Cuma farzından önce kılındığı için ilk sünnet olarak adlandırılır.',
          rakats: [
            {
              name: 'Niyet, 1. Rekat, 2. Rekat ve 1. Oturuş',
              surahs: [
                'Niyet: Besmele çekilir ve "Niyet ettim Allah rızası için cuma namazının ilk sünnetini kılmaya" denilir.',
                '1. Rekat: Sübhaneke, Fatiha, Zamm-ı Sure.',
                '2. Rekat: Fatiha, Zamm-ı Sure.',
                '1. Oturuş: Sadece Ettehiyyatü.'
              ]
            },
            {
              name: '3. Rekat, 4. Rekat ve Son Oturuş',
              surahs: [
                '3. Rekat: Fatiha, Zamm-ı Sure.',
                '4. Rekat: Fatiha, Zamm-ı Sure.',
                'Son Oturuş: Ettehiyyatü, Salli, Barik, Rabbena duaları okunur ve selam verilir.'
              ]
            }
          ],
          footerNote:
            'İlk sünnet tamamlandıktan sonra kıbleye dönük edepli bir şekilde oturularak iç ezan ve imamın hutbesi sessizce dinlenir.'
        },
        {
          badge: '2. BÖLÜM • 2 REKAT (CEMAATLE FARZ)',
          title: 'Cuma Namazının Farzı (Cemaatin Kılınış Şekli)',
          subtitle: 'Hutbe bitip kamet getirildikten sonra imama uyularak cemaatle 2 rekat olarak kılınır:',
          rakats: [
            {
              name: 'Niyet ve Ayakta Kıraat (Kılınış)',
              surahs: [
                'Niyet: "Niyet ettim cuma namazının farzına, uydum hazır olan imama" denilir. (Vaktin farzı denmez, direkt Cuma namazı diye belirtilir).',
                'Kılınış: İmam Fatiha ve Zamm-ı sureyi sesli (açıktan) okur. Cemaat ayaktayken içinden hiçbir şey okumaz, sadece imamı dinler.'
              ]
            },
            {
              name: 'Rüku, Secde ve Oturuş',
              surahs: [
                'Rüku ve Secde: Cemaat yalnızca rüku ve secdedeki tesbihleri okur. Bu tesbihler 3 kere okumakla bırakılmaz, imam "Allahu Ekber" diyip tekbir getirene kadar okunmaya devam edilir.',
                'Oturuş: Dualar (Ettehiyyatü, Salli, Barik, Rabbena) içinden okunarak imamla birlikte selam verilir.'
              ]
            }
          ]
        },
        {
          badge: '3. BÖLÜM • 4 REKAT (BİREYSEL)',
          title: 'Cuma Namazının Son Sünneti (4 Rekat)',
          subtitle: 'Farz kılındıktan sonra cemaat kendi başına kılar:',
          rakats: [
            {
              name: 'Niyet ve Kılınış Şekli',
              surahs: [
                'Niyet: "Niyet ettim Allah rızası için cuma namazının son sünnetini kılmaya" denilir.',
                'Kılınış: Tıpkı ilk 4 rekatlık sünnette olduğu gibi kılınır (1. oturuşta sadece Ettehiyyatü okunur, 3. rekata kalkıldığında Sübhaneke okunmaz direkt Fatiha ile başlanır).'
              ]
            }
          ]
        },
        {
          badge: '4. BÖLÜM • 4 REKAT (BİREYSEL)',
          title: 'Zuhr-i Âhir Namazı (4 Rekat)',
          subtitle: 'Cuma namazının son sünnetinin ardından kendi başına kılınır:',
          rakats: [
            {
              name: 'Niyet, 1. Rekat, 2. Rekat ve 1. Oturuş',
              surahs: [
                'Niyet: "Niyet ettim vaktine yetişip de henüz kılamadığım son öğle namazının vaktine (zuhr-i ahir namazına)" denilir.',
                '1. Rekat: Sübhaneke, Fatiha, Zamm-ı Sure.',
                '2. Rekat: Fatiha, Zamm-ı Sure.',
                '1. Oturuş: Ettehiyyatü, Salli, Barik duaları okunur ve ayağa kalkılır.'
              ]
            },
            {
              name: '3. Rekat, 4. Rekat ve Son Oturuş',
              surahs: [
                '3. Rekat: Sübhaneke, Fatiha, Zamm-ı Sure.',
                '4. Rekat: Fatiha, Zamm-ı Sure.',
                'Son Oturuş: Ettehiyyatü, Salli, Barik, Rabbena duaları okunur ve selam ile bitirilir.'
              ]
            }
          ]
        },
        {
          badge: '5. BÖLÜM • 2 VEYA 4 REKAT (BİREYSEL)',
          title: 'Vaktin Son Sünneti (2 veya 4 Rekat)',
          subtitle: 'Niyet: "Niyet ettim Allah rızası için vaktin son sünnetini kılmaya" denilir.',
          rakats: [
            {
              name: '2 Rekat Kılanlar İçin',
              surahs: [
                '1. ve 2. rekatta Fatiha ve Zamm-ı sure okunur.',
                'Son oturuşta Ettehiyyatü, Salli, Barik, Rabbena duaları okunup namaz sonlandırılır.'
              ]
            },
            {
              name: '4 Rekat Kılanlar İçin',
              surahs: [
                '1. ve 2. rekatlar kılınır. 1. oturuşta Ettehiyyatü, Salli, Barik duaları okunur.',
                '3. rekata kalkıldığında Sübhaneke okunması şartıyla Fatiha ve Zamm-ı sure ile devam edilir.',
                '4. rekat tamamlanıp son oturuşa geçildiğinde Ettehiyyatü, Salli, Barik, Rabbena duaları okunarak selam verilir.'
              ]
            }
          ]
        }
      ],
      closingDuaText:
        'Namazlar tamamlandıktan sonra Âyetü\'l-Kürsî ve 33\'er defa Sübhanallah, Elhamdülillah, Allahu Ekber tesbihatı yapılarak eller semaya açılır ve Cuma gününün feyzi ve bereketi için dua edilir.',
      namazTargetId: 'cuma-namazi-kilinisi',
      namazTargetTitle: 'Cuma Namazı Kılınışı, Müezzinlik Duaları ve Tesbihat Rehberi'
    });
  }

  return guides;
}

interface SpecialDayPrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  guides: SpecialDayPrayerGuide[];
  onNavigateToNamaz?: (targetId: string) => void;
}

export const SpecialDayPrayerModal: React.FC<SpecialDayPrayerModalProps> = ({
  isOpen,
  onClose,
  guides,
  onNavigateToNamaz
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [guides]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || guides.length === 0) return null;

  const guide = guides[selectedIndex] || guides[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden max-h-[88vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık Bandı (Header) */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b border-amber-500/40 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                <MoonStar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="pr-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30 inline-block">
                  {guide.buttonLabel || 'Günün İbadeti'}
                </span>
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-white mt-0.5 leading-snug">
                  {guide.headerTitle}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Aynı günde birden fazla özel ibadet çakışırsa sekme seçici */}
          {guides.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/15">
              {guides.map((g, idx) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    idx === selectedIndex
                      ? 'bg-amber-400 text-stone-950 shadow-xs scale-100'
                      : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                  }`}
                >
                  {g.headerTitle}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kaydırılabilir İçerik Gövdesi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-stone-800 text-xs sm:text-sm leading-relaxed scrollbar-thin bg-slate-50/50">
          {/* Ana Başlık ve Giriş Açıklaması */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-sm border border-emerald-700/60 space-y-1.5">
            <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-tight">
              {guide.mainTitle}
            </h3>
            <p className="text-xs sm:text-[13px] text-emerald-50/95 leading-relaxed">
              {guide.introText}
            </p>
          </div>

          {/* ⏰ Kılınma Vakti */}
          {guide.timeInfo && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Kılınma Vakti</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium">{guide.timeInfo}</p>
            </div>
          )}

          {/* 🤲 Özel Niyet Esası */}
          {guide.intentionText && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Niyet Esası</span>
              </div>
              <p className="font-bold text-stone-900 text-xs sm:text-sm italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/70">
                "{guide.intentionText}"
              </p>
            </div>
          )}

          {/* ✨ Namaz İçinde / Sonrasında Okunacak Zikir ve Tesbihatlar (Varsa Üstte de Gözüksün) */}
          {guide.dhikrBlocks && guide.dhikrBlocks.length > 0 && (
            <div className="space-y-3">
              {guide.dhikrSectionTitle && (
                <div className="p-3 rounded-xl bg-emerald-950 text-white border border-amber-400/40">
                  <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{guide.dhikrSectionTitle}</span>
                  </h4>
                  {guide.dhikrSectionSubtitle && (
                    <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">{guide.dhikrSectionSubtitle}</p>
                  )}
                </div>
              )}

              {guide.dhikrBlocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <span className="font-black text-emerald-950 text-xs sm:text-sm">
                      {block.title}
                    </span>
                    {block.badge && (
                      <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                        {block.badge}
                      </span>
                    )}
                  </div>

                  {block.arabic && (
                    <div
                      dir="rtl"
                      className="p-3.5 sm:p-5 rounded-xl bg-emerald-950 text-amber-300 font-serif text-xl sm:text-2xl md:text-3xl leading-[2.2] text-right select-all border border-amber-400/40 shadow-inner font-semibold tracking-wide"
                    >
                      {block.arabic}
                    </div>
                  )}

                  {block.reading && (
                    <div className="text-xs sm:text-[13px] text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <strong className="text-emerald-900">Okunuşu: </strong>
                      <span className="italic">{block.reading}</span>
                    </div>
                  )}

                  {block.meaning && (
                    <div className="text-xs sm:text-[13px] text-stone-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80">
                      <strong className="text-amber-950">Anlamı: </strong>
                      <span>{block.meaning}</span>
                    </div>
                  )}

                  {block.note && (
                    <p className="text-xs text-stone-700 font-medium">{block.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ⚡ Hızlı Formül & Ek Bilgi Kutuları (Varsa) */}
          {guide.extraSections &&
            guide.extraSections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="rounded-2xl border border-amber-300 bg-amber-50/80 overflow-hidden shadow-2xs"
              >
                <div className="bg-amber-400 text-stone-950 px-3.5 py-2 font-black text-xs sm:text-sm flex items-center justify-between">
                  <span>{sec.title}</span>
                  <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
                    {sec.badge}
                  </span>
                </div>
                <div className="p-3.5 space-y-1.5 text-xs sm:text-sm text-stone-800">
                  <p className="font-semibold text-amber-950">{sec.description}</p>
                  {sec.items && (
                    <ul className="space-y-1 pt-1">
                      {sec.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-1.5 font-medium">
                          <span className="text-emerald-800 font-black">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

          {/* 📖 Rekat Kılınışı & Okunacak Sûreler */}
          {guide.rakatGroups && guide.rakatGroups.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                <BookOpen className="w-4 h-4 text-emerald-800" />
                <span>Adım Adım Rekat Kılınışı</span>
              </div>

              {guide.rakatGroups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="rounded-2xl border border-emerald-200 bg-white overflow-hidden shadow-2xs"
                >
                  <div className="bg-emerald-900 text-white px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center justify-between gap-2">
                    <span>📖 {group.title}</span>
                    <span className="text-[10px] sm:text-[11px] bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full font-black shrink-0">
                      {group.badge}
                    </span>
                  </div>

                  {group.subtitle && (
                    <div className="px-3.5 py-1.5 bg-emerald-50 border-b border-emerald-100 text-xs font-bold text-emerald-950">
                      {group.subtitle}
                    </div>
                  )}

                  <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.rakats.map((rk, rIdx) => (
                      <div
                        key={rIdx}
                        className={`p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1 ${
                          group.rakats.length === 1 ? 'sm:col-span-2' : ''
                        }`}
                      >
                        <div className="font-black text-emerald-900 text-xs border-b border-stone-200/80 pb-1">
                          {rk.name}:
                        </div>
                        <ul className="space-y-1 text-xs text-stone-800 font-medium">
                          {rk.surahs.map((s, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {group.footerNote && (
                    <div className="px-3.5 py-2 bg-amber-50/70 border-t border-amber-200 text-[11px] sm:text-xs font-bold text-amber-950">
                      * {group.footerNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 🤲 Namaz Sonrası Dua ve Tamamlama */}
          {guide.closingDuaText && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="font-black text-xs text-emerald-900">
                🤲 Dua ve Tamamlama
              </div>
              <p className="text-xs sm:text-[13px] text-stone-800 font-medium">{guide.closingDuaText}</p>
            </div>
          )}

          {/* 📖 Namaz Rehberi & Tüyolar Sayfasına Direkt Geçiş Kartı */}
          {onNavigateToNamaz && guide.namazTargetId && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border border-amber-400/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  <BookOpen className="w-3 h-3" />
                  <span>Namaz Rehberi & Tüyolar</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white">
                  {guide.namazTargetTitle || guide.mainTitle}
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-100/85">
                  Bu ibadetin kalıcı rehber sayfasına, diğer özel gün namazlarına ve sesli namaz surelerine istediğiniz zaman ulaşabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = guide.namazTargetId!;
                  onClose();
                  onNavigateToNamaz(target);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Rehberde Aç</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Alt Kapat Butonu (Sabit Footer) */}
        <div className="shrink-0 px-4 sm:px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-600 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">Rabbimiz ibadetlerinizi kabul buyursun.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm shrink-0"
          >
            Anlaşıldı, Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
