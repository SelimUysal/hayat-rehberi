export interface TecvidTopicCard {
  title: string;
  letters: string;
  desc: string;
}

export interface TecvidExample {
  rule: string;
  ar: string;
  read: string;
  desc: string;
}

export interface MixedTecvidWord {
  ar: string;
  read: string;
  rule: string;
  desc: string;
  level: 'kolay' | 'orta' | 'zor';
}

export interface TecvidQuizQuestion {
  question: string;
  ar: string;
  options: string[];
  correctRule: string;
  explanation: string;
}

export const TECVID_TOPIC_CARDS: TecvidTopicCard[] = [
  {
    title: 'İzhâr-ı Halkî',
    letters: 'ء ه ع ح غ خ',
    desc: 'Nûn-ı sâkin veya tenvinden sonra 6 boğaz harfinden biri gelirse nûn sesi gunnesiz ve net okunur.'
  },
  {
    title: 'İdğâm (Yermelûn)',
    letters: 'ي ر م ل و ن',
    desc: 'Nûn-ı sâkin veya tenvinden sonra bu 6 harften biri gelirse nûn sonraki harfe katılarak okunur.'
  },
  {
    title: 'İklâb',
    letters: 'نْ / ً ٍ ٌ + ب',
    desc: 'Nûn-ı sâkin veya tenvinden sonra Be (ب) harfi gelirse nûn sesi mîm (م) sesine çevrilip gunne ile tutulur.'
  },
  {
    title: 'İhfâ',
    letters: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
    desc: 'Nûn-ı sâkin veya tenvinden sonra 15 ihfâ harfinden biri gelirse ses genizden gizlenerek gunneli okunur.'
  },
  {
    title: 'Mîm-i Sâkin',
    letters: 'مْ + ب / م / سائر',
    desc: 'Cezimli mîm\'den sonra ب gelirse İhfâ-ı Şefevî, م gelirse İdğâm-ı Misleyn, diğer harflerde İzhâr-ı Şefevî olur.'
  },
  {
    title: 'Med (Uzatma) Halleri',
    letters: 'ا و ي + ء / ّ / ْ',
    desc: 'Harf-i medden sonra hemze veya sükûn gelmesine göre Tabîî, Muttasıl, Munfasıl, Lâzım ve Ârız medler oluşur.'
  },
  {
    title: 'Kalkale (Kutbu Ced)',
    letters: 'ق ط ب ج د',
    desc: 'Beş kalkale harfinden biri cezimli veya vakıf sebebiyle sâkin olduğunda mahrecinde yankılı vurguyla okunur.'
  },
  {
    title: 'Lâm-ı Tarif (ال)',
    letters: 'الشَّمْسُ / الْقَمَرُ',
    desc: 'Elif-Lâm takısından sonra şemsî harf gelirse lâm okunmayıp sonraki harf şeddelenir; kamerî harfte lâm açık okunur.'
  }
];

export const TECVID_EXAMPLES: Record<
  | 'intro'
  | 'izhar'
  | 'idgam'
  | 'iklab'
  | 'ihfa'
  | 'mim_ihfa'
  | 'mim_idgam'
  | 'mim_izhar'
  | 'med'
  | 'gunne'
  | 'gunne_practice'
  | 'kalkale'
  | 'lamtarif'
  | 'lafzatullah'
  | 'ra'
  | 'vakif',
  TecvidExample[]
> = {
  intro: [
    {
      rule: 'İzhâr',
      ar: 'مِنْ عِلْمٍ',
      read: 'Min ilmin',
      desc: 'Sâkin nûn\'dan sonra boğaz harfi olan Ayn (ع) geldiği için nûn sesi tutulmadan açıkça okunur.'
    },
    {
      rule: 'İdğâm-ı Meal-Gunne',
      ar: 'مَنْ يَعْمَلْ',
      read: 'Mey-ya\'mel',
      desc: 'Sâkin nûn\'dan sonra Ye (ي) harfi geldiği için nûn harfi Ye\'ye katılır ve genizden gunne ile tutulur.'
    },
    {
      rule: 'Kalkale',
      ar: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
      read: 'Kul hüvallâhü ehad',
      desc: 'Durulduğunda Dal (د) harfi sâkinleştiği için mahrecinde hafif yankılı (kalkaleli) okunur.'
    }
  ],
  izhar: [
    {
      rule: 'İzhâr (نْ + ء)',
      ar: 'مَنْ آمَنَ',
      read: 'Men âmene',
      desc: 'Sâkin nûn\'dan sonra Hemze (ء) geldiği için nûn açık ve net okunur.'
    },
    {
      rule: 'İzhâr (نْ + ه)',
      ar: 'مِنْهُمْ',
      read: 'Minhüm',
      desc: 'Sâkin nûn\'dan sonra He (ه) harfi geldiği için gunne yapılmadan açık okunur.'
    },
    {
      rule: 'İzhâr (نْ + ع)',
      ar: 'أَنْعَمْتَ',
      read: 'En\'amte',
      desc: 'Sâkin nûn\'dan sonra Ayn (ع) boğaz harfi geldiği için izhâr yapılır.'
    },
    {
      rule: 'İzhâr (ٌ + ح)',
      ar: 'عَلِيمٌ حَكِيمٌ',
      read: 'Alîmün Hakîm',
      desc: 'Tenvinden sonra Ha (ح) boğaz harfi geldiği için tenvin "n" sesiyle açık okunur.'
    },
    {
      rule: 'İzhâr (نْ + غ)',
      ar: 'مِنْ غِلٍّ',
      read: 'Min ğillin',
      desc: 'Sâkin nûn\'dan sonra Gayn (غ) harfi geldiği için izhâr uygulanır.'
    },
    {
      rule: 'İzhâr (نْ + خ)',
      ar: 'مِنْ خَوْفٍ',
      read: 'Min havfin',
      desc: 'Sâkin nûn\'dan sonra Hı (خ) harfi geldiği için nûn sesi açıkça telaffuz edilir.'
    }
  ],
  idgam: [
    {
      rule: 'İdğâm-ı Meal-Gunne (ي)',
      ar: 'فَمَنْ يَعْمَلْ',
      read: 'Femey-ya\'mel',
      desc: 'Sâkin nûn\'dan sonra Ye (ي) geldiği için nûn Ye\'ye katılır ve 1.5 elif gunne tutulur.'
    },
    {
      rule: 'İdğâm-ı Meal-Gunne (و)',
      ar: 'مِنْ وَالٍ',
      read: 'Miv-vâlin',
      desc: 'Sâkin nûn\'dan sonra Vav (و) geldiği için gunneli birleştirme yapılır.'
    },
    {
      rule: 'İdğâm-ı Meal-Gunne (م)',
      ar: 'مِنْ مَاءٍ',
      read: 'Mim-mâin',
      desc: 'Sâkin nûn\'dan sonra Mîm (م) geldiği için nûn Mîm\'e dönüşüp gunne ile okunur.'
    },
    {
      rule: 'İdğâm-ı Meal-Gunne (ن)',
      ar: 'مِنْ نِعْمَةٍ',
      read: 'Min-ni\'metin',
      desc: 'Sâkin nûn\'dan sonra Nûn (ن) geldiği için şeddeli ve gunneli okunur.'
    },
    {
      rule: 'İdğâm-ı Bilâ-Gunne (ل)',
      ar: 'مِنْ لَدُنْهُ',
      read: 'Mil-ledünhü',
      desc: 'Sâkin nûn\'dan sonra Lâm (ل) geldiği için gunne yapılmadan doğrudan Lâm\'a katılır.'
    },
    {
      rule: 'İdğâm-ı Bilâ-Gunne (ر)',
      ar: 'مِنْ رَبِّهِمْ',
      read: 'Mir-rabbihim',
      desc: 'Sâkin nûn\'dan sonra Râ (ر) geldiği için gunnesiz tam idğâm yapılır.'
    }
  ],
  iklab: [
    {
      rule: 'İklâb (نْ + ب)',
      ar: 'مِنْ بَعْدِ',
      read: 'Mim-ba\'di',
      desc: 'Sâkin nûn\'dan sonra Be (ب) geldiği için nûn mîm\'e çevrilip gunne ile tutulur.'
    },
    {
      rule: 'İklâb (نْ + ب)',
      ar: 'أَنْبِئْهُمْ',
      read: 'Embi\'hüm',
      desc: 'Kelime içinde sâkin nûn\'dan sonra Be (ب) geldiği için mîm sesiyle gunneli okunur.'
    },
    {
      rule: 'İklâb (ٌ + ب)',
      ar: 'سَمِيعٌ بَصِيرٌ',
      read: 'Semî\'um-Basîr',
      desc: 'Tenvinden sonra Be (ب) geldiği için tenvinin "n" sesi "m" sesine döner.'
    },
    {
      rule: 'İklâb (نْ + ب)',
      ar: 'لَيُنْبَذَنَّ',
      read: 'Leyümbezenne',
      desc: 'Hümeze Sûresi\'nde sâkin nûn\'dan sonra Be geldiği için iklâb yapılır.'
    }
  ],
  ihfa: [
    {
      rule: 'İhfâ (نْ + ت)',
      ar: 'أَنْتُمْ',
      read: 'En-tüm',
      desc: 'Sâkin nûn\'dan sonra Te (ت) geldiği için dil damağa değdirilmeden gunneli gizleme yapılır.'
    },
    {
      rule: 'İhfâ (نْ + ز)',
      ar: 'أُنْزِلَ',
      read: 'Ün-zile',
      desc: 'Sâkin nûn\'dan sonra Ze (ز) geldiği için nûn sesi genizde gizlenerek okunur.'
    },
    {
      rule: 'İhfâ (نْ + ص)',
      ar: 'يَنْصُرْكُمْ',
      read: 'Yen-surküm',
      desc: 'Sâkin nûn\'dan sonra kalın Sad (ص) harfi geldiği için gunne sesi de toklaşır.'
    },
    {
      rule: 'İhfâ (نْ + ش)',
      ar: 'مِنْ شَرِّ',
      read: 'Min-şerri',
      desc: 'Felak ve Nâs sûrelerinde geçen sâkin nûn + Şın (ش) ihfâsıdır.'
    },
    {
      rule: 'İhfâ (نْ + ق)',
      ar: 'مِنْ قَبْلُ',
      read: 'Min-kablü',
      desc: 'Sâkin nûn\'dan sonra Kaf (ق) geldiği için kalın tınılı ihfâ yapılır.'
    },
    {
      rule: 'İhfâ (نْ + ك)',
      ar: 'مِنْكُمْ',
      read: 'Min-küm',
      desc: 'Sâkin nûn\'dan sonra Kef (ك) geldiği için ince ihfâ yapılır.'
    }
  ],
  mim_ihfa: [
    {
      rule: 'İhfâ-ı Şefevî',
      ar: 'تَرْمِيهِمْ بِحِجَارَةٍ',
      read: 'Termîhim-bihicâratin',
      desc: 'Fîl Sûresi\'nde sâkin mîm\'den sonra Be (ب) geldiği için dudak ihfâsı yapılır.'
    },
    {
      rule: 'İhfâ-ı Şefevî',
      ar: 'وَهُمْ بِالْآخِرَةِ',
      read: 'Ve hüm-bil\'âhirati',
      desc: 'Sâkin mîm\'den sonra Be (ب) geldiği için mîm dudaklarda gunne ile tutulur.'
    },
    {
      rule: 'İhfâ-ı Şefevî',
      ar: 'رَبُّهُمْ بِهِمْ',
      read: 'Rabbühüm-bihim',
      desc: 'Âdiyât Sûresi\'nde sâkin mîm + Be birleşiminde dudak ihfâsı uygulanır.'
    }
  ],
  mim_idgam: [
    {
      rule: 'İdğâm-ı Misleyn',
      ar: 'لَهُمْ مَا يَشَاءُونَ',
      read: 'Lehüm-mâ yeşâûn',
      desc: 'Sâkin mîm\'den sonra harekeli mîm geldiği için iki mîm gunneli birleştirilir.'
    },
    {
      rule: 'İdğâm-ı Misleyn',
      ar: 'أَطْعَمَهُمْ مِنْ جُوعٍ',
      read: 'Et\'amehüm-min cû\'in',
      desc: 'Kureyş Sûresi\'nde sâkin mîm + mîm idğâm-ı misleyn meal-gunne olur.'
    },
    {
      rule: 'İdğâm-ı Misleyn',
      ar: 'فِي قُلُوبِهِمْ مَرَضٌ',
      read: 'Fî kulûbihim-meradun',
      desc: 'Sâkin mîm kendisinden sonraki mîm\'e katılarak 1.5 elif gunne ile okunur.'
    }
  ],
  mim_izhar: [
    {
      rule: 'İzhâr-ı Şefevî',
      ar: 'أَنْعَمْتَ عَلَيْهِمْ',
      read: 'En\'amte aleyhim',
      desc: 'Sâkin mîm\'den sonra Te (ت) geldiği için mîm tutulmadan net okunur.'
    },
    {
      rule: 'İzhâr-ı Şefevî',
      ar: 'أَلَمْ تَرَ',
      read: 'Elem tera',
      desc: 'Fîl Sûresi\'nde sâkin mîm\'den sonra Te geldiği için izhâr-ı şefevî yapılır.'
    },
    {
      rule: 'İzhâr-ı Şefevî',
      ar: 'لَكُمْ دِينُكُمْ',
      read: 'Leküm dînüküm',
      desc: 'Kâfirûn Sûresi\'nde sâkin mîm\'den sonra Dal (د) geldiği için açık okunur.'
    }
  ],
  med: [
    {
      rule: 'Medd-i Tabîî',
      ar: 'قَالَ',
      read: 'Kâle (1 Elif)',
      desc: 'Üstünden sonra harekesiz Elif geldiği için 1 elif miktarı doğal uzatılır.'
    },
    {
      rule: 'Medd-i Tabîî',
      ar: 'يَقُولُ',
      read: 'Yekûlü (1 Elif)',
      desc: 'Ötreden sonra sâkin Vav geldiği için 1 elif miktarı uzatılır.'
    },
    {
      rule: 'Medd-i Muttasıl',
      ar: 'إِذَا جَاءَ',
      read: 'İzâ câ\'e (4 Elif)',
      desc: 'Med harfi ile hemze aynı kelimede buluştuğu için 4 elif uzatmak vaciptir.'
    },
    {
      rule: 'Medd-i Munfasıl',
      ar: 'إِنَّا أَعْطَيْنَاكَ',
      read: 'İnnâ a\'taynâke',
      desc: 'Med harfi bir kelimenin sonunda, hemze sonraki kelimenin başında olduğu için 2-4 elif uzatılır.'
    },
    {
      rule: 'Medd-i Lâzım',
      ar: 'وَلَا الضَّالِّينَ',
      read: 'Ve led-dâllîn (4 Elif)',
      desc: 'Med harfinden sonra şeddeli (lâzımî sükûnlu) Lâm geldiği için 4 elif uzatmak farzdır.'
    },
    {
      rule: 'Medd-i Ârız',
      ar: 'الْعَالَمِينَ',
      read: 'El-âlemîn (Dururken)',
      desc: 'Med harfinden sonraki Nûn durak sebebiyle sâkinleştiği için medd-i ârız olur.'
    }
  ],
  gunne: [
    {
      rule: 'Şeddeli Nûn (نّ)',
      ar: 'إِنَّ',
      read: 'İnne',
      desc: 'Şeddeli nûn üzerinde ses genizden 1.5 elif miktarı tutularak okunur.'
    },
    {
      rule: 'Şeddeli Nûn (نّ)',
      ar: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
      read: 'Minel-cinneti ven-nâs',
      desc: 'Hem "cinneti" hem "ven-nâs" kelimelerindeki şeddeli nûn\'larda gunne yapılır.'
    },
    {
      rule: 'Şeddeli Mîm (مّ)',
      ar: 'عَمَّ يَتَسَاءَلُونَ',
      read: 'Amme yetesâ\'elûn',
      desc: 'Şeddeli mîm harfinde dudaklar kapatılıp genizden gunne verilir.'
    },
    {
      rule: 'Şeddeli Mîm (مّ)',
      ar: 'ثُمَّ كَلَّا',
      read: 'Sümme kellâ',
      desc: 'Şeddeli mîm harfi tutulmadan hızlı geçilmez, gunnesi hakkıyla verilir.'
    }
  ],
  gunne_practice: [
    {
      rule: 'Gunneli Şedde',
      ar: 'إِنَّا أَنْزَلْنَاهُ',
      read: 'İnnâ en-zelnâhü',
      desc: 'İlk kelimede şeddeli nûn gunnesi, ikinci kelimede ise ihfâ gunnesi vardır.'
    },
    {
      rule: 'Gunneli Şedde',
      ar: 'حَمَّالَةَ الْحَطَبِ',
      read: 'Hammâletel-hatab',
      desc: 'Tebbet Sûresi\'ndeki şeddeli mîm (مّ) gunne ile tutularak okunur.'
    },
    {
      rule: 'Gunneli Şedde',
      ar: 'الْوَسْوَاسِ الْخَنَّاسِ',
      read: 'El-vesvâsil-hannâs',
      desc: 'Nâs Sûresi\'nde şeddeli nûn (نّ) üzerinde belirgin gunne yapılır.'
    }
  ],
  kalkale: [
    {
      rule: 'Kalkale (ق)',
      ar: 'الْفَلَقِ',
      read: 'El-Felak (Dururken)',
      desc: 'Durulduğunda Kaf (ق) harfi sâkinleştiği için kuvvetli kalkale ile okunur.'
    },
    {
      rule: 'Kalkale (ط)',
      ar: 'مُحِيطٌ',
      read: 'Muhît (Dururken)',
      desc: 'Tı (ط) harfi sâkin olduğunda kalın yankı ile kalkale yapılır.'
    },
    {
      rule: 'Kalkale (ب)',
      ar: 'وَتَبَّ',
      read: 'Ve tebb (Dururken)',
      desc: 'Tebbet Sûresi\'nde durulduğunda Be (ب) harfinde kalkale yapılır.'
    },
    {
      rule: 'Kalkale (ج)',
      ar: 'الْبُرُوجِ',
      read: 'El-Bürûc (Dururken)',
      desc: 'Cim (ج) harfi sâkin olduğunda mahrecinde vuruşla okunur.'
    },
    {
      rule: 'Kalkale (د)',
      ar: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      read: 'Lem yelid ve lem yûled',
      desc: 'İhlâs Sûresi\'ndeki cezimli Dal (د) harflerinde net kalkale yapılır.'
    },
    {
      rule: 'Kalkale (ق)',
      ar: 'اقْرَأْ',
      read: 'İkra\'',
      desc: 'Kelime ortasındaki cezimli Kaf (ق) harfinde kalkale-i suğrâ yapılır.'
    }
  ],
  lamtarif: [
    {
      rule: 'İdğâm-ı Şemsiyye',
      ar: 'الرَّحْمَٰنِ الرَّحِيمِ',
      read: 'Er-Rahmânir-Rahîm',
      desc: 'Lâm\'dan sonra şemsî harf olan Râ (ر) geldiği için lâm okunmaz, Râ şeddelenir.'
    },
    {
      rule: 'İdğâm-ı Şemsiyye',
      ar: 'وَالشَّمْسِ وَضُحَاهَا',
      read: 'Veş-şemsi ve duhâhâ',
      desc: 'Şın (ش) şemsî harf olduğu için lâm okunmadan doğrudan Şın\'a geçilir.'
    },
    {
      rule: 'İdğâm-ı Şemsiyye',
      ar: 'وَالتِّينِ وَالزَّيْتُونِ',
      read: 'Vet-tîni vez-zeytûn',
      desc: 'Te (ت) ve Ze (ز) şemsî harf oldukları için her ikisinde de lâm okunmaz.'
    },
    {
      rule: 'İzhâr-ı Kameriyye',
      ar: 'الْحَمْدُ لِلّٰهِ',
      read: 'El-hamdü lillâhi',
      desc: 'Ha (ح) kamerî harf olduğu için lâm cezimli olarak açıkça okunur.'
    },
    {
      rule: 'İzhâr-ı Kameriyye',
      ar: 'الْعَالَمِينَ',
      read: 'El-âlemîn',
      desc: 'Ayn (ع) kamerî harf olduğu için "El" şeklinde lâm açıkça telaffuz edilir.'
    },
    {
      rule: 'İzhâr-ı Kameriyye',
      ar: 'وَالْعَصْرِ',
      read: 'Vel-asr',
      desc: 'Ayn harfinden önce gelen tarif lâmı açıkça okunur.'
    }
  ],
  lafzatullah: [
    {
      rule: 'Kalın Lafzatullah',
      ar: 'هُوَ اللّٰهُ',
      read: 'Hüvallâhü',
      desc: 'Lafzatullah\'tan önceki harf üstünlü olduğu için "Allâh" lâmı kalın okunur.'
    },
    {
      rule: 'Kalın Lafzatullah',
      ar: 'نَصْرُ اللّٰهِ',
      read: 'Nasrullâhi',
      desc: 'Lafzatullah\'tan önceki harf ötreli olduğu için lâm kalın ve tok okunur.'
    },
    {
      rule: 'İnce Lafzatullah',
      ar: 'بِسْمِ اللّٰهِ',
      read: 'Bismillâhi',
      desc: 'Lafzatullah\'tan önceki Mîm esreli olduğu için lâm ince ("l" sesiyle) okunur.'
    },
    {
      rule: 'İnce Lafzatullah',
      ar: 'الْحَمْدُ لِلّٰهِ',
      read: 'Elhamdü lillâhi',
      desc: 'Başındaki esreli lâm sebebiyle Lafzatullah ince okunur.'
    }
  ],
  ra: [
    {
      rule: 'Kalın Râ (Üstünlü)',
      ar: 'رَبَّنَا',
      read: 'Rabbenâ',
      desc: 'Râ harfi üstün harekeli olduğu için kalın okunur.'
    },
    {
      rule: 'Kalın Râ (Ötreli)',
      ar: 'رُزِقْنَا',
      read: 'Ruziknâ',
      desc: 'Râ harfi ötre harekeli olduğu için kalın okunur.'
    },
    {
      rule: 'İnce Râ (Esreli)',
      ar: 'رِزْقًا',
      read: 'Rizkan',
      desc: 'Râ harfi esre harekeli olduğu için ince okunur.'
    },
    {
      rule: 'Kalın Sâkin Râ',
      ar: 'الْقُرْآنُ',
      read: 'El-Kur\'ân',
      desc: 'Râ cezimli ve kendinden önceki harf ötreli olduğu için kalın okunur.'
    },
    {
      rule: 'Kalın Sâkin Râ',
      ar: 'וَالْعَصْرِ -> مَرْيَمَ',
      read: 'Meryeme',
      desc: 'Râ cezimli ve öncesi üstünlü olduğu için kalın okunur.'
    },
    {
      rule: 'İnce Sâkin Râ',
      ar: 'فِرْعَوْنُ',
      read: 'Fir\'avnü',
      desc: 'Râ cezimli ve öncesi esreli olduğu için ince okunur.'
    }
  ],
  vakif: [
    {
      rule: 'Sükûn üzere Vakıf',
      ar: 'الْعَالَمِينَ ۝',
      read: 'El-âlemîn',
      desc: 'Son harfin harekesi düşürülerek cezimli gibi durulur.'
    },
    {
      rule: 'İki Üstünde Vakıf (Medd-i İvaz)',
      ar: 'عَلِيمًا حَكِيمًا ۝',
      read: 'Alîmen Hakîmâ',
      desc: 'Sonu iki üstünlü (ـًا) kelimede durulduğunda tenvin 1 elif uzatmaya (â) dönüşür.'
    },
    {
      rule: 'Yuvarlak Te (ة) Üzerinde Vakıf',
      ar: 'رَحْمَةٌ ۝',
      read: 'Rahmeh',
      desc: 'Kelime sonundaki yuvarlak Te (ة) üzerinde durulduğunda sâkin He (هْ) olarak okunur.'
    },
    {
      rule: 'Kalkaleli Vakıf',
      ar: 'الْفَلَقِ ۝',
      read: 'El-Felak',
      desc: 'Son harf kalkale harfi olduğu için durulduğunda sâkinleşir ve kalkale yapılır.'
    }
  ]
};

export const SEMSI_LETTERS: { ar: string; name: string; sample: string }[] = [
  { ar: 'ت', name: 'Te', sample: 'التَّوَّابُ' },
  { ar: 'ث', name: 'Se', sample: 'الثَّوَابُ' },
  { ar: 'د', name: 'Dal', sample: 'الدِّينُ' },
  { ar: 'ذ', name: 'Zel', sample: 'الذِّكْرُ' },
  { ar: 'ر', name: 'Ra', sample: 'الرَّحْمَٰنُ' },
  { ar: 'ز', name: 'Ze', sample: 'الزَّيْتُونُ' },
  { ar: 'س', name: 'Sin', sample: 'السَّلَامُ' },
  { ar: 'ش', name: 'Şın', sample: 'الشَّمْسُ' },
  { ar: 'ص', name: 'Sad', sample: 'الصِّرَاطُ' },
  { ar: 'ض', name: 'Dad', sample: 'الضَّالِّينَ' },
  { ar: 'ط', name: 'Tı', sample: 'الطَّارِقُ' },
  { ar: 'ظ', name: 'Zı', sample: 'الظَّالِمِينَ' },
  { ar: 'ل', name: 'Lam', sample: 'اللَّيْلُ' },
  { ar: 'ن', name: 'Nun', sample: 'النَّاسُ' }
];

export const KAMERI_LETTERS: { ar: string; name: string; sample: string }[] = [
  { ar: 'ا', name: 'Elif / Hemze', sample: 'الْأَرْضُ' },
  { ar: 'ب', name: 'Be', sample: 'الْبَيْتُ' },
  { ar: 'ج', name: 'Cim', sample: 'الْجَنَّةُ' },
  { ar: 'ح', name: 'Ha', sample: 'الْحَمْدُ' },
  { ar: 'خ', name: 'Hı', sample: 'الْخَبِيرُ' },
  { ar: 'ع', name: 'Ayn', sample: 'الْعَالَمِينَ' },
  { ar: 'غ', name: 'Gayn', sample: 'الْغَفُورُ' },
  { ar: 'ف', name: 'Fe', sample: 'الْفَلَقُ' },
  { ar: 'ق', name: 'Kaf', sample: 'الْقَمَرُ' },
  { ar: 'ك', name: 'Kef', sample: 'الْكَوْثَرُ' },
  { ar: 'م', name: 'Mim', sample: 'الْمُلْكُ' },
  { ar: 'و', name: 'Vav', sample: 'الْوَدُودُ' },
  { ar: 'هـ', name: 'He', sample: 'الْهُدَى' },
  { ar: 'ي', name: 'Ye', sample: 'الْيَوْمُ' }
];

export const MIXED_TECVID_WORDS: MixedTecvidWord[] = [
  // KOLAY
  { ar: 'الْحَمْدُ', read: 'El-hamdü', rule: 'İzhâr-ı Kameriyye', desc: 'Lâm-ı tariften sonra kamerî Ha (ح) harfi gelmiştir.', level: 'kolay' },
  { ar: 'الرَّحْمَٰنِ', read: 'Er-Rahmâni', rule: 'İdğâm-ı Şemsiyye', desc: 'Lâm-ı tariften sonra şemsî Râ (ر) harfi gelmiştir.', level: 'kolay' },
  { ar: 'أَنْعَمْتَ', read: 'En\'amte', rule: 'İzhâr-ı Halkî', desc: 'Sâkin nûn\'dan sonra boğaz harfi Ayn (ع) gelmiştir.', level: 'kolay' },
  { ar: 'لَمْ يَلِدْ', read: 'Lem yelid', rule: 'Kalkale', desc: 'Sâkin Dal (د) harfinde kalkale yapılır.', level: 'kolay' },
  { ar: 'إِنَّا', read: 'İnnâ', rule: 'Gunne & Medd-i Tabîî', desc: 'Şeddeli nûn\'da gunne, sonunda 1 elif medd-i tabîî vardır.', level: 'kolay' },
  { ar: 'بِسْمِ اللّٰهِ', read: 'Bismillâhi', rule: 'İnce Lafzatullah', desc: 'Öncesi esreli olduğu için Lafzatullah ince okunur.', level: 'kolay' },
  { ar: 'قُلْ أَعُوذُ', read: 'Kul eûzü', rule: 'Medd-i Tabîî', desc: 'Ötreden sonra sâkin Vav geldiği için 1 elif uzatılır.', level: 'kolay' },
  { ar: 'مِنْ شَرِّ', read: 'Min-şerri', rule: 'İhfâ', desc: 'Sâkin nûn\'dan sonra Şın (ش) geldiği için ihfâ yapılır.', level: 'kolay' },

  // ORTA
  { ar: 'مِنْ بَعْدِ', read: 'Mim-ba\'di', rule: 'İklâb', desc: 'Sâkin nûn\'dan sonra Be (ب) geldiği için mîm\'e çevrilir.', level: 'orta' },
  { ar: 'فَمَنْ يَعْمَلْ', read: 'Femey-ya\'mel', rule: 'İdğâm-ı Meal-Gunne', desc: 'Sâkin nûn\'dan sonra Ye (ي) geldiği için gunneli idğâm olur.', level: 'orta' },
  { ar: 'مِنْ رَبِّهِمْ', read: 'Mir-rabbihim', rule: 'İdğâm-ı Bilâ-Gunne', desc: 'Sâkin nûn\'dan sonra Râ (ر) geldiği için gunnesiz idğâm olur.', level: 'orta' },
  { ar: 'تَرْمِيهِمْ بِحِجَارَةٍ', read: 'Termîhim-bihicâratin', rule: 'İhfâ-ı Şefevî', desc: 'Sâkin mîm\'den sonra Be (ب) geldiği için dudak ihfâsı olur.', level: 'orta' },
  { ar: 'إِذَا جَاءَ', read: 'İzâ câ\'e', rule: 'Medd-i Muttasıl', desc: 'Harf-i med ile hemze aynı kelimede olduğu için 4 elif uzatılır.', level: 'orta' },
  { ar: 'نَصْرُ اللّٰهِ', read: 'Nasrullâhi', rule: 'Kalın Lafzatullah', desc: 'Öncesi ötreli olduğu için Lafzatullah kalın okunur.', level: 'orta' },

  // ZOR
  { ar: 'وَلَا الضَّالِّينَ', read: 'Ve led-dâllîn', rule: 'Medd-i Lâzım', desc: 'Harf-i medden sonra şeddeli lâm (lâzımî sükûn) geldiği için 4 elif uzatılır.', level: 'zor' },
  { ar: 'أَطْعَمَهُمْ مِنْ جُوعٍ', read: 'Et\'amehüm-min cû\'in', rule: 'İdğâm-ı Misleyn & İhfâ', desc: 'Sâkin mîm + mîm idğâm-ı misleyn; sâkin nûn + cim ise ihfâdır.', level: 'zor' },
  { ar: 'سَمِيعٌ بَصِيرٌ', read: 'Semî\'um-Basîr', rule: 'İklâb', desc: 'Tenvinden sonra Be (ب) geldiği için iklâb yapılır.', level: 'zor' },
  { ar: 'لَيُنْبَذَنَّ فِي الْحُطَمَةِ', read: 'Leyümbezenne fil-hutameh', rule: 'İklâb & Gunne', desc: 'نْ + ب iklâb, şeddeli nûn ise gunne ile okunur.', level: 'zor' }
];

export const TECVID_QUIZ_QUESTIONS: TecvidQuizQuestion[] = [
  {
    question: 'Aşağıdaki ibarede sâkin nûn\'dan sonra Ayn (ع) harfi gelmiştir. Hangi tecvid kuralı uygulanır?',
    ar: 'مِنْ عِلْمٍ',
    options: ['İzhâr-ı Halkî', 'İhfâ', 'İklâb', 'İdğâm-ı Meal-Gunne'],
    correctRule: 'İzhâr-ı Halkî',
    explanation: 'Ayn (ع) harfi 6 boğaz (izhâr) harfinden biridir; bu sebeple nûn sesi gunnesiz ve açıkça okunur.'
  },
  {
    question: 'Bu kelimede sâkin nûn\'dan sonra Be (ب) harfi gelmiştir. Hangi tecvid kuralı oluşur?',
    ar: 'مِنْ بَعْدِ',
    options: ['İklâb', 'İzhâr-ı Şefevî', 'İdğâm-ı Bilâ-Gunne', 'Kalkale'],
    correctRule: 'İklâb',
    explanation: 'Sâkin nûn veya tenvinden sonra Be (ب) harfi geldiğinde nûn sesi mîm\'e çevrilerek gunneli okunur (İklâb).'
  },
  {
    question: 'Altı çizili kelimede aynı kelime içinde med harfinden sonra hemze (ء) gelmiştir. Bu med hangisidir?',
    ar: 'إِذَا جَاءَ',
    options: ['Medd-i Muttasıl', 'Medd-i Munfasıl', 'Medd-i Tabîî', 'Medd-i Lâzım'],
    correctRule: 'Medd-i Muttasıl',
    explanation: 'Harf-i med ile sebebi med olan hemze aynı kelime içerisinde yan yana geldiğinde Medd-i Muttasıl olur.'
  },
  {
    question: 'İhlâs Sûresi\'ndeki bu ibarede cezimli Dal (د) harfinde hangi tecvid hükmü uygulanır?',
    ar: 'لَمْ يَلِدْ',
    options: ['Kalkale', 'İhfâ', 'İdğâm-ı Misleyn', 'Medd-i Ârız'],
    correctRule: 'Kalkale',
    explanation: 'Dal (د) harfi "Kutbu Ced" (ق ط ب ج د) kalkale harflerindendir; sâkin olduğunda mahrecinde yankılanarak okunur.'
  },
  {
    question: 'Sâkin nûn\'dan sonra Râ (ر) harfi geldiğinde oluşan gunnesiz birleştirme kuralı hangisidir?',
    ar: 'مِنْ رَبِّهِمْ',
    options: ['İdğâm-ı Bilâ-Gunne', 'İdğâm-ı Meal-Gunne', 'İzhâr-ı Halkî', 'İhfâ'],
    correctRule: 'İdğâm-ı Bilâ-Gunne',
    explanation: 'Sâkin nûn veya tenvinden sonra Lâm (ل) veya Râ (ر) geldiğinde gunne yapılmaksızın tam birleştirme (İdğâm-ı Bilâ-Gunne) yapılır.'
  },
  {
    question: 'Elif-Lâm (ال) takısından sonra Şın (ش) harfi geldiğinde lâm okunmayıp Şın şeddeli okunur. Bu kural nedir?',
    ar: 'الشَّمْسُ',
    options: ['İdğâm-ı Şemsiyye', 'İzhâr-ı Kameriyye', 'İhfâ-ı Şefevî', 'Medd-i Lâzım'],
    correctRule: 'İdğâm-ı Şemsiyye',
    explanation: 'Şın (ش) harfi 14 şemsî harften biridir; lâm-ı tarif okunmaz ve Şın harfi şeddeli olarak okunur.'
  }
];
