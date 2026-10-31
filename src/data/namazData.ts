import { NamazItem } from '../types';
import { INTERMEDIATE_NAMAZ_SURAHS } from './intermediateNamazSurahs';

export const NAMAZ_ITEMS: NamazItem[] = [
  // ======================== DUALAR ========================
  {
    id: 'subhaneke',
    title: 'Sübhâneke Duası',
    category: 'dua',
    placeInPrayer: 'Her namazın ilk rekâtında İftitah tekbirinden sonra, İkindi ve Yatsı namazlarının ilk sünnetlerinin 3. rekât başında ve Cenaze namazında 1. tekbirden sonra ("ve celle senâük" ilavesiyle) okunur.',
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ (وَجَلَّ ثَنَاؤُكَ) وَلَا إِلَهَ غَيْرُكَ',
    turkishReading: 'Sübhânekellâhümme ve bi hamdik ve tebârakesmük ve teâlâ ceddük (ve celle senâük) ve lâ ilâhe ğayrük.',
    meaning: 'Allah\'ım! Sen eksik sıfatlardan pak ve uzaksın. Seni daima böyle tenzih eder ve överim. Senin adın mübarektir. Varlığın her şeyden üstündür. (Senin övgün yücedir.) Senden başka ilah yoktur.',
    audioUrl: '/audio/dualar/subhaneke.mp3',
    sentences: [
      {
        arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ',
        reading: 'Sübhânekellâhümme ve bi hamdik',
        meaning: 'Allah\'ım! Seni tenzih ve hamdinle tesbih ederim.',
        audioUrl: '/audio/dualar/subhaneke_1.mp3'
      },
      {
        arabic: 'وَتَبَارَكَ اسْمُكَ',
        reading: 've tebârakesmük',
        meaning: 'Senin ismin mübarek ve pek yücedir.',
        audioUrl: '/audio/dualar/subhaneke_2.mp3'
      },
      {
        arabic: 'وَتَعَالَى جَدُّكَ (وَجَلَّ ثَنَاؤُكَ)',
        reading: 've teâlâ ceddük (ve celle senâük)',
        meaning: 'Azametin ve şanın her şeyden üstündür. (Cenaze namazında: Ve Sen\'in senân yücedir.)',
        audioUrl: '/audio/dualar/subhaneke_3.mp3'
      },
      {
        arabic: 'وَلَا إِلَهَ غَيْرُكَ',
        reading: 've lâ ilâhe ğayrük.',
        meaning: 'Senden başka hiçbir ilâh yoktur.',
        audioUrl: '/audio/dualar/subhaneke_4.mp3'
      }
    ]
  },
  {
    id: 'tahiyyat',
    title: 'Ettehiyyâtü (Tahiyyat) Duası',
    category: 'dua',
    placeInPrayer: 'Bütün namazların her oturuşunda (ka\'de-i ûlâ ve ka\'de-i âhirede) ilk olarak okunur.',
    arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ❁ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ❁ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ ❁ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    turkishReading: 'Ettehiyyâtü lillâhi vessalevâtü vettayyibât. Esselâmü aleyke eyyühen-nebiyyü ve rahmetullâhi ve berakâtüh. Esselâmü aleynâ ve alâ ibâdillâhis-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
    meaning: 'Dil ile, beden ve mal ile yapılan bütün ibadetler Allah\'a dır. Ey Peygamber! Allah\'ın selamı, rahmet ve bereketleri senin üzerine olsun. Selam bizim üzerimize ve Allah\'ın bütün iyi kulları üzerine olsun. Şahitlik ederim ki, Allah\'tan başka ilah yoktur. Yine şahitlik ederim ki, Muhammed, O\'nun kulu ve Peygamberidir.',
    audioUrl: '/audio/dualar/tahiyyat.mp3',
    sentences: [
      {
        arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
        reading: 'Ettehiyyâtü lillâhi vessalevâtü vettayyibât.',
        meaning: 'Sözlü, bedenî ve malî bütün ibadetler Allah\'a mahsustur.',
        audioUrl: '/audio/dualar/tahiyyat_1.mp3'
      },
      {
        arabic: 'السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
        reading: 'Esselâmü aleyke eyyühen-nebiyyü ve rahmetullâhi ve berakâtüh.',
        meaning: 'Ey Nebî! Allah\'ın selâmı, rahmeti ve bereketleri senin üzerine olsun.',
        audioUrl: '/audio/dualar/tahiyyat_2.mp3'
      },
      {
        arabic: 'السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ',
        reading: 'Esselâmü aleynâ ve alâ ibâdillâhis-sâlihîn.',
        meaning: 'Selâm bizim ve Allah\'ın salih kullarının üzerine olsun.',
        audioUrl: '/audio/dualar/tahiyyat_3.mp3'
      },
      {
        arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        reading: 'Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
        meaning: 'Şehadet ederim ki Allah\'tan başka ilâh yoktur ve yine şehadet ederim ki Hz. Muhammed O\'nun kulu ve Resûlüdür.',
        audioUrl: '/audio/dualar/tahiyyat_4.mp3'
      }
    ]
  },
  {
    id: 'salli',
    title: 'Allahümme Salli Duası',
    category: 'dua',
    placeInPrayer: 'Namazların son oturuşlarında Ettehiyyâtü\'den sonra, İkindi ve Yatsı namazlarının ilk sünnetlerinin ilk oturuşunda ve Cenaze namazında 2. tekbirden sonra okunur.',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    turkishReading: 'Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
    meaning: 'Allah\'ım! Muhammed\'e ve Muhammed\'in ümmetine rahmet eyle; şerefini yücelt. İbrahim\'e ve İbrahim\'in ümmetine rahmet ettiğin gibi. Şüphesiz övülmeye layık yalnız Sensin, şan ve şeref sahibi de Sensin.',
    audioUrl: '/audio/dualar/salli.mp3',
    sentences: [
      {
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
        reading: 'Allâhümme salli alâ Muhammedin ve alâ âli Muhammed.',
        meaning: 'Allah\'ım! Hz. Muhammed\'e ve âline rahmet eyle.',
        audioUrl: '/audio/dualar/salli_1.mp3'
      },
      {
        arabic: 'كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ',
        reading: 'Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm.',
        meaning: 'Hz. İbrahim\'e ve âline rahmet ettiğin gibi.',
        audioUrl: '/audio/dualar/salli_2.mp3'
      },
      {
        arabic: 'إِنَّكَ حَمِيدٌ مَجِيدٌ',
        reading: 'İnneke hamîdün mecîd.',
        meaning: 'Şüphesiz Sen her türlü hamde lâyık ve şanı yüce olansın.',
        audioUrl: '/audio/dualar/salli_3.mp3'
      }
    ]
  },
  {
    id: 'barik',
    title: 'Allahümme Bârik Duası',
    category: 'dua',
    placeInPrayer: 'Namazlarda Allahümme Salli duasından hemen sonra okunur.',
    arabic: 'اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    turkishReading: 'Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârakte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
    meaning: 'Allah\'ım! Muhammed\'e ve Muhammed\'in ümmetine hayır ve bereket ver. İbrahim\'e ve İbrahim\'in ümmetine verdiğin gibi. Şüphesiz övülmeye layık yalnız Sensin, şan ve şeref sahibi de Sensin.',
    audioUrl: '/audio/dualar/barik.mp3',
    sentences: [
      {
        arabic: 'اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
        reading: 'Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed.',
        meaning: 'Allah\'ım! Hz. Muhammed\'i ve âlini mübarek kıl.',
        audioUrl: '/audio/dualar/barik_1.mp3'
      },
      {
        arabic: 'كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ',
        reading: 'Kemâ bârakte alâ İbrâhîme ve alâ âli İbrâhîm.',
        meaning: 'Hz. İbrahim\'i ve âlini mübarek kıldığın gibi.',
        audioUrl: '/audio/dualar/barik_2.mp3'
      },
      {
        arabic: 'إِنَّكَ حَمِيدٌ مَجِيدٌ',
        reading: 'İnneke hamîdün mecîd.',
        meaning: 'Şüphesiz Sen Hamîd ve Mecîd\'sin.',
        audioUrl: '/audio/dualar/barik_3.mp3'
      }
    ]
  },
  {
    id: 'rabbena_atina',
    title: 'Rabbenâ Âtinâ Duası',
    category: 'dua',
    placeInPrayer: 'Namazların son oturuşunda Allahümme Bârik\'ten sonra selam vermeden önce okunur.',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    turkishReading: 'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhirati haseneten ve kınâ azâben-nâr.',
    meaning: 'Ey Rabbimiz! Bize dünyada da iyilik ve güzellik ver, ahirette de iyilik ve güzellik ver. Bizi cehennem ateşinin azabından koru.',
    audioUrl: '/audio/dualar/rabbena_atina.mp3',
    sentences: [
      {
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
        reading: 'Rabbenâ âtinâ fid-dünyâ haseneten',
        meaning: 'Rabbimiz! Bize dünyada iyilik ve güzellik ihsan eyle,',
        audioUrl: '/audio/dualar/rabbena_atina_1.mp3'
      },
      {
        arabic: 'وَفِي الْآخِرَةِ حَسَنَةً',
        reading: 've fil-âhirati haseneten',
        meaning: 'ahirette de iyilik ve güzellik ihsan eyle,',
        audioUrl: '/audio/dualar/rabbena_atina_2.mp3'
      },
      {
        arabic: 'وَقِنَا عَذَابَ النَّارِ',
        reading: 've kınâ azâben-nâr.',
        meaning: 've bizi ateşin azabından muhafaza eyle.',
        audioUrl: '/audio/dualar/rabbena_atina_3.mp3'
      }
    ]
  },
  {
    id: 'rabbena_gfirli',
    title: 'Rabbenağfirlî Duası',
    category: 'dua',
    placeInPrayer: 'Namazların son oturuşunda Rabbenâ Âtinâ duasının ardından selamdan hemen önce okunur.',
    arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    turkishReading: 'Rabbenağfirlî ve li-vâlideyye ve lil-mü\'minîne yevme yekûmül-hisâb.',
    meaning: 'Ey Rabbimiz! Hesap görülecek günde beni, anamı-babamı ve bütün müminleri bağışla.',
    audioUrl: '/audio/dualar/rabbena_gfirli.mp3',
    sentences: [
      {
        arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ',
        reading: 'Rabbenağfirlî ve li-vâlideyye',
        meaning: 'Rabbimiz! Beni, annemi ve babamı bağışla,',
        audioUrl: '/audio/dualar/rabbena_gfirli_1.mp3'
      },
      {
        arabic: 'وَلِلْمُؤْمِنِينَ',
        reading: 've lil-mü\'minîne',
        meaning: 've bütün müminleri bağışla,',
        audioUrl: '/audio/dualar/rabbena_gfirli_2.mp3'
      },
      {
        arabic: 'يَوْمَ يَقُومُ الْحِسَابُ',
        reading: 'yevme yekûmül-hisâb.',
        meaning: 'hesabın kurulacağı kıyamet gününde.',
        audioUrl: '/audio/dualar/rabbena_gfirli_3.mp3'
      }
    ]
  },
  {
    id: 'kunut1',
    title: 'Kunut Duası 1 (Allâhümme İnnâ Nesteînük)',
    category: 'dua',
    placeInPrayer: 'Vitir namazının 3. rekâtında Fâtiha ve sûreden sonra tekbir alınıp eller bağlandığında okunur.',
    arabic: 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ وَنُؤْمِنُ بِكَ وَنَتُوبُ إِلَيْكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ نَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ',
    turkishReading: 'Allâhümme innâ nesteînüke ve nestağfirüke ve nestehdîk. Ve nü\'minü bike ve netûbü ileyk. Ve netevekkelü aleyke ve nüsnî aleykel-hayra küllehû neşkürüke ve lâ nekfürük. Ve nahleu ve netrükü men yefcürük.',
    meaning: 'Allah\'ım! Senden yardım isteriz, günahlarımızı bağışlamanı isteriz, razı olduğun şeylere hidayet etmeni isteriz. Sana inanırız, Sana tövbe ederiz. Sana güveniriz. Bize verdiğin bütün nimetleri bilerek Seni hayır ile överiz. Sana şükrederiz. Hiçbir nimetini inkâr etmez ve onları başkasından bilmeyiz. Nimetlerini inkâr eden ve Sana karşı geleni bırakırız.',
    audioUrl: '/audio/dualar/kunut1.mp3',
    sentences: [
      {
        arabic: 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ',
        reading: 'Allâhümme innâ nesteînüke ve nestağfirüke ve nestehdîk.',
        meaning: 'Allah\'ım! Senden yardım, mağfiret ve hidayet dileriz.',
        audioUrl: '/audio/dualar/kunut1_1.mp3'
      },
      {
        arabic: 'وَنُؤْمِنُ بِكَ وَنَتُوبُ إِلَيْكَ وَنَتَوَكَّلُ عَلَيْكَ',
        reading: 'Ve nü\'minü bike ve netûbü ileyke ve netevekkelü aleyk.',
        meaning: 'Sana iman eder, Sana tövbe eder ve Sana tevekkül ederiz.',
        audioUrl: '/audio/dualar/kunut1_2.mp3'
      },
      {
        arabic: 'وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ نَشْكُرُكَ وَلَا نَكْفُرُكَ',
        reading: 'Ve nüsnî aleykel-hayra küllehû neşkürüke ve lâ nekfürük.',
        meaning: 'Seni bütün hayırlarla över, Sana şükreder ve nankörlük etmeyiz.',
        audioUrl: '/audio/dualar/kunut1_3.mp3'
      },
      {
        arabic: 'وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ',
        reading: 'Ve nahleu ve netrükü men yefcürük.',
        meaning: 'Sana isyan edenleri terk eder ve onlardan uzaklaşırız.',
        audioUrl: '/audio/dualar/kunut1_4.mp3'
      }
    ]
  },
  {
    id: 'kunut2',
    title: 'Kunut Duası 2 (Allâhümme İyyâke Na\'büdü)',
    category: 'dua',
    placeInPrayer: 'Vitir namazının 3. rekâtında 1. Kunut duasının hemen ardından okunur.',
    arabic: 'اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَى وَنَحْفِدُ نَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
    turkishReading: 'Allâhümme iyyâke na\'büdü ve leke nüsallî ve nescüd. Ve ileyke nes\'â ve nahfid. Nercû rahmeteke ve nahşâ azâbek. İnne azâbeke bil-küffâri mülhık.',
    meaning: 'Allah\'ım! Biz yalnız Sana kulluk ederiz. Namazı yalnız Senin için kılarız, ancak Sana secde ederiz. Yalnız Sana koşar ve Sana yaklaştıracak şeyleri kazanmaya çalışırız. İbadetlerini sevinçle yaparız. Rahmetinin devamını ve çoğalmasını dileriz. Azabından korkarız, şüphesiz Senin azabın kâfirlere ve inançsızlara ulaşır.',
    audioUrl: '/audio/dualar/kunut2.mp3',
    sentences: [
      {
        arabic: 'اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ',
        reading: 'Allâhümme iyyâke na\'büdü ve leke nüsallî ve nescüd.',
        meaning: 'Allah\'ım! Yalnız Sana ibadet eder, Senin için namaz kılar ve secde ederiz.',
        audioUrl: '/audio/dualar/kunut2_1.mp3'
      },
      {
        arabic: 'وَإِلَيْكَ نَسْعَى وَنَحْفِدُ',
        reading: 'Ve ileyke nes\'â ve nahfid.',
        meaning: 'Sana kavuşmak için koşar ve gayret ederiz.',
        audioUrl: '/audio/dualar/kunut2_2.mp3'
      },
      {
        arabic: 'نَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ',
        reading: 'Nercû rahmeteke ve nahşâ azâbek.',
        meaning: 'Senin rahmetini umar ve azabından korkarız.',
        audioUrl: '/audio/dualar/kunut2_3.mp3'
      },
      {
        arabic: 'إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
        reading: 'İnne azâbeke bil-küffâri mülhık.',
        meaning: 'Şüphesiz Senin azabın kâfirlere erişicidir.',
        audioUrl: '/audio/dualar/kunut2_4.mp3'
      }
    ]
  },
  {
    id: 'ayetel_kursi',
    title: 'Âyetel Kürsî (Bakara 255)',
    category: 'dua',
    surahNumber: 2,
    placeInPrayer: 'Beş vakit namazın ardından tesbihattan hemen önce okunur; şifa, koruma ve sekînet ayetidir.',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    turkishReading: 'Allâhü lâ ilâhe illâ hüvel-hayyül-kayyûm. Lâ te\'huzühû sinetün ve lâ nevm. Lehû mâ fis-semâvâti ve mâ fil-ard. Men zel-lezî yeşfeu indehû illâ bi-iznih. Ya\'lemü mâ beyne eydîhim ve mâ halfehüm ve lâ yühîtûne bi-şey\'in min ilmihî illâ bimâ şâ\'. Vesia kürsiyyühüs-semâvâti vel-ard. Ve lâ yeûdühû hıfzuhümâ ve hüvel-aliyyül-azîm.',
    meaning: 'Allah\'tan başka hiçbir İlah yoktur. O, daima yaşayan, bütün varlığın idaresini yürüten (Hayy ve Kayyum)dur. O\'nu ne uyuklama tutar, ne de uyku. Göklerde ve yerde ne varsa hepsi O\'nundur. İzni olmadan huzurunda şefaat edecek olan kimdir? O, kullarının önlerinde ve arkalarında ne varsa hepsini bilir. Onlar ise, O\'nun dilediği kadarından başka ilminden hiçbir şey kavrayamazlar. O\'nun Kürsî\'si bütün gökleri ve yeri kaplayıp kuşatmıştır. Onları koruyup gözetmek O\'na ağır gelmez. O, pek yücedir, pek büyüktür.',
    audioUrl: '/audio/dualar/ayetel_kursi.mp3',
    sentences: [
      {
        arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        reading: 'Allâhü lâ ilâhe illâ hüvel-hayyül-kayyûm.',
        meaning: 'Allah, O\'ndan başka ilâh yoktur; O Hayy ve Kayyûm\'dur.',
        audioUrl: '/audio/dualar/ayetel_kursi_1.mp3'
      },
      {
        arabic: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
        reading: 'Lâ te\'huzühû sinetün ve lâ nevm.',
        meaning: 'O\'nu ne bir uyuklama tutar ne de bir uyku.',
        audioUrl: '/audio/dualar/ayetel_kursi_2.mp3'
      },
      {
        arabic: 'لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
        reading: 'Lehû mâ fis-semâvâti ve mâ fil-ard.',
        meaning: 'Göklerde ve yerde ne varsa hepsi O\'nundur.',
        audioUrl: '/audio/dualar/ayetel_kursi_3.mp3'
      },
      {
        arabic: 'مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ',
        reading: 'Men zel-lezî yeşfeu indehû illâ bi-iznih.',
        meaning: 'O\'nun izni olmaksızın katında şefaat edebilecek kimdir?',
        audioUrl: '/audio/dualar/ayetel_kursi_4.mp3'
      },
      {
        arabic: 'يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ',
        reading: 'Ya\'lemü mâ beyne eydîhim ve mâ halfehüm',
        meaning: 'Onların önlerinde ve arkalarında olanları bilir.',
        audioUrl: '/audio/dualar/ayetel_kursi_5.mp3'
      },
      {
        arabic: 'وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ',
        reading: 've lâ yühîtûne bi-şey\'in min ilmihî illâ bimâ şâ\'.',
        meaning: 'O\'nun dilediği dışında ilminden hiçbir şeyi kavrayamazlar.',
        audioUrl: '/audio/dualar/ayetel_kursi_6.mp3'
      },
      {
        arabic: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا',
        reading: 'Vesia kürsiyyühüs-semâvâti vel-ard, ve lâ yeûdühû hıfzuhümâ',
        meaning: 'Kürsî\'si gökleri ve yeri kuşatmıştır; ikisini korumak O\'na ağır gelmez.',
        audioUrl: '/audio/dualar/ayetel_kursi_7.mp3'
      },
      {
        arabic: 'وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        reading: 've hüvel-aliyyül-azîm.',
        meaning: 'O, pek yücedir, pek büyüktür.',
        audioUrl: '/audio/dualar/ayetel_kursi_8.mp3'
      }
    ]
  },
  {
    id: 'cenaze_duasi',
    title: 'Cenaze Namazı Duası',
    category: 'dua',
    placeInPrayer: 'Cenaze namazında 3. tekbirden sonra vefat eden müminin mağfireti için okunur.',
    arabic: 'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَكَبِيرِنَا وَصَغِيرِنَا وَذَكَرِنَا وَأُنْثَانَا ❁ اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ',
    turkishReading: 'Allâhümmağfir li-hayyinâ ve meyyitinâ ve şâhidinâ ve ğâibinâ ve kebîrinâ ve sağîrinâ ve zekerinâ ve ünsânâ. Allâhümme men ahyeytehû minnâ fe-ahyihî alel-İslâm, ve men teveffeytehû minnâ fe-teveffehû alel-îmân.',
    meaning: 'Allah\'ım! Dirimizi ve ölümüzü, burada bulunanımızı ve bulunmayanımızı, büyüğümüzü ve küçüğümüzü, erkeğimizi ve kadınımızı bağışla. Allah\'ım! Bizden yaşattıklarını İslâm üzere yaşat, bizden vefat ettirdiklerini de iman üzere vefat ettir.',
    audioUrl: '/audio/dualar/cenaze_duasi.mp3',
    sentences: [
      {
        arabic: 'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا',
        reading: 'Allâhümmağfir li-hayyinâ ve meyyitinâ ve şâhidinâ ve ğâibinâ',
        meaning: 'Allah\'ım! Dirimizi, ölümüzü, hazır olanımızı ve غائب olanımızı bağışla.',
        audioUrl: '/audio/dualar/cenaze_duasi_1.mp3'
      },
      {
        arabic: 'وَكَبِيرِنَا وَصَغِيرِنَا وَذَكَرِنَا وَأُنْثَانَا',
        reading: 've kebîrinâ ve sağîrinâ ve zekerinâ ve ünsânâ.',
        meaning: 'Büyüğümüzü, küçüğümüzü, erkeğimizi ve kadınımızı mağfiret eyle.',
        audioUrl: '/audio/dualar/cenaze_duasi_2.mp3'
      },
      {
        arabic: 'اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ',
        reading: 'Allâhümme men ahyeytehû minnâ fe-ahyihî alel-İslâm',
        meaning: 'Allah\'ım! Bizden yaşattıklarını İslâm üzere yaşat,',
        audioUrl: '/audio/dualar/cenaze_duasi_3.mp3'
      },
      {
        arabic: 'وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ',
        reading: 've men teveffeytehû minnâ fe-teveffehû alel-îmân.',
        meaning: 'bizden vefat ettirdiklerini de iman üzere vefat ettir.',
        audioUrl: '/audio/dualar/cenaze_duasi_4.mp3'
      }
    ]
  },

  // ======================== NAMAZ SURELERİ ========================
  {
    id: 'fatiha',
    title: 'Fâtiha Sûresi',
    category: 'sure',
    surahNumber: 1,
    placeInPrayer: 'Bütün farz, vacip ve sünnet namazların her rekâtında kıyamda okunur.',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ❁ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ❁ الرَّحْمَٰنِ الرَّحِيمِ ❁ مَالِكِ يَوْمِ الدِّينِ ❁ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ❁ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ❁ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    turkishReading: 'Bismillâhirrahmânirrahîm. Elhamdü lillâhi rabbil-âlemîn. Errahmânirrahîm. Mâliki yevmid-dîn. İyyâke na\'büdü ve iyyâke nesteîn. İhdinas-sırâtal-müstekîm. Sırâtallezîne en\'amte aleyhim ğayril-mağdûbi aleyhim ve led-dâllîn. (Âmîn)',
    meaning: 'Rahman ve Rahim olan Allah\'ın adıyla. Hamd, Âlemlerin Rabbi, Rahman, Rahim ve Din (Hesap) Gününün maliki olan Allah\'a mahsustur. Yalnız Sana ibadet eder ve yalnız Senden yardım dileriz. Bizi doğru yola, kendilerine nimet verdiklerinin yoluna ilet; gazaba uğrayanların ve sapıtanların yoluna değil.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    sentences: [
      {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        reading: 'Bismillâhirrahmânirrahîm.',
        meaning: 'Rahmân ve Rahîm olan Allah\'ın adıyla.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        reading: 'Elhamdü lillâhi rabbil-âlemîn.',
        meaning: 'Hamd, âlemlerin Rabbi Allah\'a mahsustur.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3'
      },
      {
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        reading: 'Errahmânirrahîm.',
        meaning: 'O, Rahmân ve Rahîm\'dir.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3'
      },
      {
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        reading: 'Mâliki yevmid-dîn.',
        meaning: 'Hesap ve ceza gününün malikidir.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3'
      },
      {
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        reading: 'İyyâke na\'büdü ve iyyâke nesteîn.',
        meaning: 'Ancak Sana kulluk eder ve yalnız Senden yardım dileriz.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3'
      },
      {
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        reading: 'İhdinas-sırâtal-müstekîm.',
        meaning: 'Bizi dosdoğru yola (Sırat-ı Müstakim\'e) ilet.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3'
      },
      {
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        reading: 'Sırâtallezîne en\'amte aleyhim ğayril-mağdûbi aleyhim ve led-dâllîn.',
        meaning: 'Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıtanların yoluna değil.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3'
      }
    ]
  },
  {
    id: 'asr',
    title: 'Asr Sûresi',
    category: 'sure',
    surahNumber: 103,
    placeInPrayer: 'Namazlarda Fâtiha Sûresi\'nden sonra zamm-ı sûre olarak okunur.',
    arabic: 'وَالْعَصْرِ ❁ إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ ❁ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
    turkishReading: 'Vel-asr. İnnel-insâne lefî husr. İllellezîne âmenû ve amilüs-sâlihâti ve tevâsav bil-hakkı ve tevâsav bis-sabr.',
    meaning: 'Asra yemin olsun ki, insan gerçekten ziyan içindedir. Bundan ancak iman edip salih ameller işleyenler, birbirlerine hakkı tavsiye edenler ve sabrı tavsiye edenler müstesnadır.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6177.mp3',
    sentences: [
      {
        arabic: 'وَالْعَصْرِ',
        reading: 'Vel-asr.',
        meaning: 'Andolsun asra (zamana) ki,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6177.mp3'
      },
      {
        arabic: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
        reading: 'İnnel-insâne lefî husr.',
        meaning: 'Şüphesiz insan büyük bir hüsran (ziyan) içindedir.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6178.mp3'
      },
      {
        arabic: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
        reading: 'İllellezîne âmenû ve amilüs-sâlihâti ve tevâsav bil-hakkı ve tevâsav bis-sabr.',
        meaning: 'Ancak iman edip salih amel işleyenler ve birbirlerine hakkı ve sabrı tavsiye edenler müstesna.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6179.mp3'
      }
    ]
  },
  {
    id: 'fil',
    title: 'Fîl Sûresi',
    category: 'sure',
    surahNumber: 105,
    placeInPrayer: 'Namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur.',
    arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ ❁ أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ ❁ وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ ❁ تَرْمِيهِمْ بِحِجَارَةٍ مِنْ سِجِّيلٍ ❁ فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ',
    turkishReading: 'Elem tera keyfe feale rabbüke bi-ashâbil-fîl. Elem yec\'al keydehüm fî tadlîl. Ve ersele aleyhim tayran ebâbîl. Termîhim bi-hicâratin min siccîl. Fecealehüm keasfin me\'kûl.',
    meaning: 'Rabbinin fil sahiplerine ne yaptığını görmedin mi? Onların tuzaklarını boşa çıkarmadı mı? Üzerlerine sürü sürü kuşlar gönderdi. Onlara çamurdan sertleşmiş taşlar atıyorlardı. Nihayet onları yenilmiş ekin yaprağı gibi yaptı.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6189.mp3',
    sentences: [
      {
        arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
        reading: 'Elem tera keyfe feale rabbüke bi-ashâbil-fîl.',
        meaning: 'Rabbinin fil sahiplerine ne yaptığını görmedin mi?',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6189.mp3'
      },
      {
        arabic: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ',
        reading: 'Elem yec\'al keydehüm fî tadlîl.',
        meaning: 'Onların tuzaklarını boşa çıkarmadı mı?',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6190.mp3'
      },
      {
        arabic: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ',
        reading: 'Ve ersele aleyhim tayran ebâbîl.',
        meaning: 'Üzerlerine sürü sürü (ebâbil) kuşlar gönderdi.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6191.mp3'
      },
      {
        arabic: 'تَرْمِيهِمْ بِحِجَارَةٍ مِنْ سِجِّيلٍ',
        reading: 'Termîhim bi-hicâratin min siccîl.',
        meaning: 'Onlara pişkin tuğladan taşlar atıyorlardı.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6192.mp3'
      },
      {
        arabic: 'فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ',
        reading: 'Fecealehüm keasfin me\'kûl.',
        meaning: 'Böylece onları yenilmiş ekin yaprağı gibi kıldı.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6193.mp3'
      }
    ]
  },
  {
    id: 'kureys',
    title: 'Kureyş Sûresi',
    category: 'sure',
    surahNumber: 106,
    placeInPrayer: 'Namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur.',
    arabic: 'لِإِيلَافِ قُرَيْشٍ ❁ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ ❁ فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ ❁ الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ',
    turkishReading: 'Li-îlâfi Kurayş. Îlâfihim rıhleteş-şitâi ves-sayf. Felya\'büdû rabbe hâzel-beyt. Ellezî et\'amehüm min cûin ve âmenehüm min havf.',
    meaning: 'Kureyş\'e kolaylaştırıldığı, kış ve yaz seyahatleri onlara kolaylaştırıldığı için, onlar da kendilerini açlıktan doyuran ve korkudan emin kılan bu Ev\'in (Kâbe\'nin) Rabbine kulluk etsinler.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6194.mp3',
    sentences: [
      {
        arabic: 'لِإِيلَافِ قُرَيْشٍ',
        reading: 'Li-îlâfi Kurayş.',
        meaning: 'Kureyş\'in emniyet ve ülfeti için,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6194.mp3'
      },
      {
        arabic: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ',
        reading: 'Îlâfihim rıhleteş-şitâi ves-sayf.',
        meaning: 'Kış ve yaz yolculuklarında onları güvene kavuşturduğu için,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6195.mp3'
      },
      {
        arabic: 'فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ',
        reading: 'Felya\'büdû rabbe hâzel-beyt.',
        meaning: 'Artık bu Beyt\'in (Kâbe\'nin) Rabbine kulluk etsinler.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6196.mp3'
      },
      {
        arabic: 'الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ',
        reading: 'Ellezî et\'amehüm min cûin ve âmenehüm min havf.',
        meaning: 'O ki, onları açlıktan doyurdu ve korkudan emin kıldı.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6197.mp3'
      }
    ]
  },
  {
    id: 'maun',
    title: 'Mâûn Sûresi',
    category: 'sure',
    surahNumber: 107,
    placeInPrayer: 'Namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur.',
    arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ ❁ فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ ❁ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ ❁ فَوَيْلٌ لِلْمُصَلِّينَ ❁ الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ ❁ الَّذِينَ هُمْ يُرَاءُونَ ❁ وَيَمْنَعُونَ الْمَاعُونَ',
    turkishReading: 'Eraeytellezî yükezzibü bid-dîn. Fezâlikellezî yedü\'ul-yetîm. Ve lâ yehuddu alâ taâmil-miskîn. Feveylün lil-müsallîn. Ellezîne hüm an salâtihim sâhûn. Ellezîne hüm yürâûn. Ve yemneûnel-mâûn.',
    meaning: 'Dini (hesap gününü) yalanlayanı gördün mü? İşte o, yetimi itip kakar; yoksulu doyurmaya teşvik etmez. Yazıklar olsun o namaz kılanlara ki, onlar namazlarını ciddiye almazlar (gaflet içindedirler). Onlar gösteriş yaparlar ve ufak bir yardımı (zekâtı) dahi esirgerler.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6198.mp3',
    sentences: [
      {
        arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ',
        reading: 'Eraeytellezî yükezzibü bid-dîn.',
        meaning: 'Dini (ahiret cezasını) yalanlayanı gördün mü?',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6198.mp3'
      },
      {
        arabic: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ',
        reading: 'Fezâlikellezî yedü\'ul-yetîm.',
        meaning: 'İşte o, yetimi itip kakan kimsenin ta kendisidir.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6199.mp3'
      },
      {
        arabic: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ',
        reading: 'Ve lâ yehuddu alâ taâmil-miskîn.',
        meaning: 'Yoksulu doyurmaya da teşvik etmez.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6200.mp3'
      },
      {
        arabic: 'فَوَيْلٌ لِلْمُصَلِّينَ',
        reading: 'Feveylün lil-müsallîn.',
        meaning: 'Vay haline o namaz kılanların ki,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6201.mp3'
      },
      {
        arabic: 'الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ',
        reading: 'Ellezîne hüm an salâtihim sâhûn.',
        meaning: 'Onlar namazlarından gafildirler.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6202.mp3'
      },
      {
        arabic: 'الَّذِينَ هُمْ يُرَاءُونَ',
        reading: 'Ellezîne hüm yürâûn.',
        meaning: 'Onlar gösteriş (riyâ) yaparlar.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6203.mp3'
      },
      {
        arabic: 'وَيَمْنَعُونَ الْمَاعُونَ',
        reading: 'Ve yemneûnel-mâûn.',
        meaning: 'Ve en küçük bir yardımı (zekâtı) bile esirgerler.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6204.mp3'
      }
    ]
  },
  {
    id: 'kevser',
    title: 'Kevser Sûresi',
    category: 'sure',
    surahNumber: 108,
    placeInPrayer: 'Namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur.',
    arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ❁ فَصَلِّ لِرَبِّكَ وَانْحَرْ ❁ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
    turkishReading: 'İnnâ a\'taynâkel-kevser. Fesalli li-rabbike venhar. İnne şânieke hüvel-ebter.',
    meaning: 'Şüphesiz biz sana Kevser\'i (bol nimeti ve Kevser havuzunu) verdik. O halde Rabbin için namaz kıl ve kurban kes. Doğrusu sana buğzeden, soyu kesik olanın ta kendisidir.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6205.mp3',
    sentences: [
      {
        arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        reading: 'İnnâ a\'taynâkel-kevser.',
        meaning: 'Şüphesiz Biz sana Kevser\'i verdik.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6205.mp3'
      },
      {
        arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
        reading: 'Fesalli li-rabbike venhar.',
        meaning: 'Öyleyse Rabbin için namaz kıl ve kurban kes.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6206.mp3'
      },
      {
        arabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
        reading: 'İnne şânieke hüvel-ebter.',
        meaning: 'Doğrusu sana kin besleyendir soyu kesik olan.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6207.mp3'
      }
    ]
  },
  {
    id: 'kafirun',
    title: 'Kâfirûn Sûresi',
    category: 'sure',
    surahNumber: 109,
    placeInPrayer: 'Sabah ve akşam namazlarının sünnetlerinde ve diğer namazlarda zamm-ı sûre olarak okunur.',
    arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ ❁ لَا أَعْبُدُ مَا تَعْبُدُونَ ❁ وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ ❁ وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ ❁ وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ ❁ لَكُمْ دِينُكُمْ وَلِيَ دِينِ',
    turkishReading: 'Kul yâ eyyühel-kâfirûn. Lâ a\'büdü mâ ta\'büdûn. Ve lâ entüm âbidûne mâ a\'büd. Ve lâ ene âbidün mâ abedtüm. Ve lâ entüm âbidûne mâ a\'büd. Leküm dînüküm ve liye dîn.',
    meaning: 'De ki: Ey kâfirler! Ben sizin tapmakta olduklarınıza tapmam. Siz de benim kulluk ettiğime kullukacak değilsiniz. Ben de sizin taptıklarınıza tapacak değilim. Siz de benim kulluk ettiğime kulluk edecek değilsiniz. Sizin dininiz size, benim dinim banadır.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6208.mp3',
    sentences: [
      {
        arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ',
        reading: 'Kul yâ eyyühel-kâfirûn.',
        meaning: 'De ki: Ey kâfirler!',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6208.mp3'
      },
      {
        arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ',
        reading: 'Lâ a\'büdü mâ ta\'büdûn.',
        meaning: 'Ben sizin taptıklarınıza tapmam.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6209.mp3'
      },
      {
        arabic: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ',
        reading: 'Ve lâ entüm âbidûne mâ a\'büd.',
        meaning: 'Siz de benim ibadet ettiğime ibadet ediciler değilsiniz.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6210.mp3'
      },
      {
        arabic: 'وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ',
        reading: 'Ve lâ ene âbidün mâ abedtüm.',
        meaning: 'Ben asla sizin taptıklarınıza tapıcı değilim.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6211.mp3'
      },
      {
        arabic: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ',
        reading: 'Ve lâ entüm âbidûne mâ a\'büd.',
        meaning: 'Siz de benim kulluk ettiğime kulluk ediciler değilsiniz.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6212.mp3'
      },
      {
        arabic: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ',
        reading: 'Leküm dînüküm ve liye dîn.',
        meaning: 'Sizin dininiz size, benim dinim banadır.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6213.mp3'
      }
    ]
  },
  {
    id: 'nasr',
    title: 'Nasr Sûresi',
    category: 'sure',
    surahNumber: 110,
    placeInPrayer: 'Namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur.',
    arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ❁ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ❁ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا',
    turkishReading: 'İzâ câe nasrullâhi vel-feth. Ve raeyten-nâse yedhulûne fî dînillâhi efvâcâ. Fesebbih bi-hamdi rabbike vestağfirh. İnnehû kâne tevvâbâ.',
    meaning: 'Allah\'ın yardımı ve fetih geldiği ve insanların bölük bölük Allah\'ın dinine girdiğini gördüğün zaman, Rabbine hamd ederek tespihte bulun ve O\'ndan bağışlama dile. Çünkü O, tövbeleri çok kabul edendir.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6214.mp3',
    sentences: [
      {
        arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',
        reading: 'İzâ câe nasrullâhi vel-feth.',
        meaning: 'Allah\'ın yardımı ve fetih geldiğinde,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6214.mp3'
      },
      {
        arabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',
        reading: 'Ve raeyten-nâse yedhulûne fî dînillâhi efvâcâ.',
        meaning: 'Ve insanların dalga dalga Allah\'ın dinine girdiklerini gördüğünde,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6215.mp3'
      },
      {
        arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا',
        reading: 'Fesebbih bi-hamdi rabbike vestağfirh. İnnehû kâne tevvâbâ.',
        meaning: 'Rabbini hamd ile tesbih et ve O\'ndan mağfiret dile; şüphesiz O, tövbeleri çokça kabul edendir.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6216.mp3'
      }
    ]
  },
  {
    id: 'tebbet',
    title: 'Tebbet (Mesed) Sûresi',
    category: 'sure',
    surahNumber: 111,
    placeInPrayer: 'Namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur.',
    arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ ❁ مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ ❁ سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ ❁ وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ ❁ فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ',
    turkishReading: 'Tebbet yedâ ebî lehebin ve tebb. Mâ ağnâ anhü mâlühû ve mâ keseb. Seyaslâ nâran zâte leheb. Vemraetühû hammâletel-hatab. Fî cîdihâ hablün min mesed.',
    meaning: 'Ebû Leheb\'in iki eli kurusun! Kurudu da. Malı ve kazandıkları ona fayda vermedi. O, alevli bir ateşe girecektir. Odun taşıyıcı olarak karısı da, boynunda hurma lifinden bükülmüş bir ip olduğu halde (ateşe girecektir).',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6217.mp3',
    sentences: [
      {
        arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
        reading: 'Tebbet yedâ ebî lehebin ve tebb.',
        meaning: 'Ebû Leheb\'in iki eli kurusun, kurudu da!',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6217.mp3'
      },
      {
        arabic: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ',
        reading: 'Mâ ağnâ anhü mâlühû ve mâ keseb.',
        meaning: 'Malı da kazandıkları da kendisine bir fayda vermedi.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6218.mp3'
      },
      {
        arabic: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ',
        reading: 'Seyaslâ nâran zâte leheb.',
        meaning: 'O, alevli bir ateşe yaslanacaktır.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6219.mp3'
      },
      {
        arabic: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ',
        reading: 'Vemraetühû hammâletel-hatab.',
        meaning: 'Dedikodu odunu taşıyan karısı da;',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6220.mp3'
      },
      {
        arabic: 'فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ',
        reading: 'Fî cîdihâ hablün min mesed.',
        meaning: 'Boynunda bükülmüş hurma lifinden bir ip olduğu halde.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6221.mp3'
      }
    ]
  },
  {
    id: 'ihlas',
    title: 'İhlâs Sûresi',
    category: 'sure',
    surahNumber: 112,
    placeInPrayer: 'Bütün namazlarda Fâtiha\'dan sonra zamm-ı sûre olarak okunur; Kur\'ân\'ın üçte birine denktir.',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ❁ اللَّهُ الصَّمَدُ ❁ لَمْ يَلِدْ وَلَمْ يُولَدْ ❁ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    turkishReading: 'Kul hüvallâhü ehad. Allâhüs-samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.',
    meaning: 'De ki: O Allah birdir. Allah Samed\'dir (Her şey O\'na muhtaçtır, O hiçbir şeye muhtaç değildir). O doğurmamıştır ve doğurulmamıştır. Hiçbir şey O\'na denk ve benzer değildir.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3',
    sentences: [
      {
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        reading: 'Kul hüvallâhü ehad.',
        meaning: 'De ki: O Allah tektir (Ehad\'dir).',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3'
      },
      {
        arabic: 'اللَّهُ الصَّمَدُ',
        reading: 'Allâhüs-samed.',
        meaning: 'Allah Samed\'dir (her şey O\'na muhtaç, O hiçbir şeye muhtaç değildir).',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3'
      },
      {
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        reading: 'Lem yelid ve lem yûled.',
        meaning: 'Doğurmamıştır ve doğurulmamıştır.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3'
      },
      {
        arabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
        reading: 'Ve lem yekün lehû küfüven ehad.',
        meaning: 'Ve hiçbir şey O\'nun dengi değildir.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3'
      }
    ]
  },
  {
    id: 'felak',
    title: 'Felak Sûresi',
    category: 'sure',
    surahNumber: 113,
    placeInPrayer: 'Namazlarda zamm-ı sûre olarak ve namaz sonrasında Muavvizeteyn (koruyucu sûreler) olarak okunur.',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ❁ مِنْ شَرِّ مَا خَلَقَ ❁ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ❁ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ❁ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    turkishReading: 'Kul eûzü bi-rabbil-felak. Min şerri mâ halak. Ve min şerri ğâsikın izâ vekab. Ve min şerrin-neffâsâti fil-ukad. Ve min şerri hâsidin izâ hased.',
    meaning: 'De ki: Yarattığı şeylerin şerrinden, karanlığı çöktüğü zaman gecenin şerrinden, düğümlere üfleyen büyücülerin şerrinden ve haset ettiği zaman hasetçinin şerrinden sabahın Rabbine sığınırım.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
    sentences: [
      {
        arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        reading: 'Kul eûzü bi-rabbil-felak.',
        meaning: 'De ki: Sabahın Rabbine sığınırım,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3'
      },
      {
        arabic: 'مِنْ شَرِّ مَا خَلَقَ',
        reading: 'Min şerri mâ halak.',
        meaning: 'Yarattığı şeylerin şerrinden,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6227.mp3'
      },
      {
        arabic: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        reading: 'Ve min şerri ğâsikın izâ vekab.',
        meaning: 'Karanlığı çöktüğü zaman gecenin şerrinden,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6228.mp3'
      },
      {
        arabic: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        reading: 'Ve min şerrin-neffâsâti fil-ukad.',
        meaning: 'Düğümlere üfleyenlerin şerrinden,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6229.mp3'
      },
      {
        arabic: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        reading: 'Ve min şerri hâsidin izâ hased.',
        meaning: 'Ve haset ettiği zaman hasetçinin şerrinden.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6230.mp3'
      }
    ]
  },
  {
    id: 'nas',
    title: 'Nâs Sûresi',
    category: 'sure',
    surahNumber: 114,
    placeInPrayer: 'Kur\'ân-ı Kerîm\'in son sûresidir; namazlarda zamm-ı sûre olarak ve korunma duası olarak okunur.',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ❁ مَلِكِ النَّاسِ ❁ إِلَٰهِ النَّاسِ ❁ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ❁ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ❁ مِنَ الْجِنَّةِ وَالنَّاسِ',
    turkishReading: 'Kul eûzü bi-rabbin-nâs. Melikin-nâs. İlâhin-nâs. Min şerril-vesvâsil-hannâs. Ellezî yüvesvisü fî sudûrin-nâs. Minel-cinneti ven-nâs.',
    meaning: 'De ki: İnsanların kalplerine vesvese sokan, (Allah anıldığında) pusuya çekilen cin ve insan şeytanının şerrinden, insanların Rabbine, insanların Melikine (Hükümdarına) ve insanların İlahına sığınırım.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3',
    sentences: [
      {
        arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        reading: 'Kul eûzü bi-rabbin-nâs.',
        meaning: 'De ki: İnsanların Rabbine sığınırım,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3'
      },
      {
        arabic: 'مَلِكِ النَّاسِ',
        reading: 'Melikin-nâs.',
        meaning: 'İnsanların Melikine (Hükümdarına),',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3'
      },
      {
        arabic: 'إِلَٰهِ النَّاسِ',
        reading: 'İlâhin-nâs.',
        meaning: 'İnsanların İlâhına,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6233.mp3'
      },
      {
        arabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        reading: 'Min şerril-vesvâsil-hannâs.',
        meaning: 'Sinsi vesvesecinin şerrinden,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6234.mp3'
      },
      {
        arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        reading: 'Ellezî yüvesvisü fî sudûrin-nâs.',
        meaning: 'O ki, insanların göğüslerine (kalplerine) vesvese verir,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6235.mp3'
      },
      {
        arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        reading: 'Minel-cinneti ven-nâs.',
        meaning: 'Gerek cinlerden, gerek insanlardan.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3'
      }
    ]
  },
  ...INTERMEDIATE_NAMAZ_SURAHS
];

export const VIRTUAL_NEW_ITEMS: NamazItem[] = [
  {
    id: "musluman-sualleri",
    title: "Müslümanların Bilmesi Gereken Sualler ve Cevaplar",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Her Müslümanın bilmesi gereken temel akâid ve iman sualleri, 32 farz, 54 farz, abdest ve namaz esasları.",
    arabic: "أَسْئِلَةٌ وَأَجْوِبَةٌ إِسْلَامِيَّةٌ",
    turkishReading: "Müslümanların Bilmesi Gereken Sualler ve Cevaplar",
    meaning: "Temel ilmihal, akaid, iman ve ibadet sualleri",
    audioUrl: "",
    sentences: []
  },
  {
    id: "gunluk-dualar",
    title: "Günlük Dualar",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Günlük hayatta okunan sünnet dualar ve zikirler.",
    arabic: "أَدْعِيَةٌ يَوْمِيَّةٌ",
    turkishReading: "Evden Çıkarken, Uyku, Tuvalet, Vasıta, Cami, Çarşı, Hapşırma, Ayna ve Su İçme Duaları",
    meaning: "Peygamber Efendimiz'in günlük hayatta okuduğu me'sûr dualar",
    audioUrl: "",
    sentences: []
  },
  {
    id: "evlilik-duasi",
    title: "Evlilik Duası",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Nikâh akdi, evlilik merasimi ve aile huzuru için okunan mübarek dua.",
    arabic: "دُعَاءُ النِّكَاحِ وَالزَّوَاجِ",
    turkishReading: "Evlilik ve Nikâh Merasimi Duası",
    meaning: "Aile huzuru, nikah akdi ve bereket duaları",
    audioUrl: "",
    sentences: []
  },
  {
    id: "ibadetlerin-sihati-icin",
    title: "İbadetlerin sıhhati icin",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Tahâret, İstibrâ ve Maddi Temizlik Usulleri.",
    arabic: "الطَّهَارَةُ وَالإِسْتِبْرَاءُ",
    turkishReading: "İbadetlerin sıhhati icin Tahâret, İstibrâ ve Temizlik Esasları",
    meaning: "Namazın şartlarından necasette taharet ve istibra rehberi",
    audioUrl: "",
    sentences: []
  },
  {
    id: "pratik-namaz-rehberi",
    title: "Pratik Namaz Rehberi",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Namaza yeni başlayanlara kolay tüyolar, 5 vaktin kılınışı ve adımları.",
    arabic: "الدَّرْسُ الْعَمَلِيُّ",
    turkishReading: "Pratik Namaz Rehberi ve Tüyolar",
    meaning: "Adım adım resimli ve açıklamalı namaz kılınış kılavuzu",
    audioUrl: "",
    sentences: []
  },
  {
    id: "namaz-durus-sekilleri",
    title: "Namazdaki Duruş Şekilleri",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Namaz duruşlarının tasavvufi ve manevi harf karşılıkları.",
    arabic: "ادم / الله",
    turkishReading: "Kıyam (Elif) • Rükû (Dal/Lam) • Secde (Mim/He)",
    meaning: "Kıyam, rükû, secde ve kade duruşlarının manevi sırları",
    audioUrl: "",
    sentences: []
  },
  {
    id: "cemaatle-namaza-yetismek",
    title: "Cemaatle Namaza Yetişmek (Mesbûh)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "İmama sonradan yetişenlerin (mesbûh) uyması gereken fıkhi kurallar.",
    arabic: "مَسْبُوق",
    turkishReading: "Hanefi Mezhebine Göre Cemaat ve Mesbûh Kuralları",
    meaning: "Kaçırılan rekatların nasıl tamamlanacağı rehberi",
    audioUrl: "",
    sentences: []
  },
  {
    id: "cuma-namazi-kilinisi",
    title: "Cuma Namazı Kılınışı, Hutbe Adabı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Cuma namazının ilk sünneti, müezzinlik geçişleri, hutbe adabı, farzı, son sünneti, Zuhr-i Âhir, vaktin son sünneti ve tesbihat.",
    arabic: "صَلَاةُ الْجُمُعَةِ",
    turkishReading: "Cuma Namazı Adım Adım Kılınışı, Müezzinlik Duaları ve Tesbihatı",
    meaning: "Cuma namazı tam kılavuzu ve ezan-kamet usulleri",
    audioUrl: "",
    sentences: []
  },
  {
    id: "bayram-namazi-kilinisi",
    title: "Bayram Namazı Kılınışı (3-3 Kuralı)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "İlave bayram tekbirleri ve adım adım kılınışı.",
    arabic: "عِيد",
    turkishReading: "Ramazan ve Kurban Bayramı Namazı Nasıl Kılınır?",
    meaning: "3 tekbir başta, 3 tekbir sonda kuralı ile bayram namazı kılınışı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "tesbih-namazi-kilinisi",
    title: "Tesbih Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Peygamber Efendimiz'in (s.a.v.) amcası Hz. Abbas'a (r.a.) öğrettiği 4 rekatlık 300 tesbih namazı.",
    arabic: "تَسْبِيح",
    turkishReading: "Tesbih Namazı Nasıl Kılınır? (4 Rekat • 300 Tesbih Formülü)",
    meaning: "Büyük günahların affına vesile olan 300 tesbihli namaz kılınışı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "kusluk-namazi-kilinisi",
    title: "Kuşluk (Duha) Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Güneş doğup kerahat vakti çıktıktan sonra kılınan nafile namaz.",
    arabic: "صَلَاةُ الضُّحَى",
    turkishReading: "Kuşluk (Duha / İşrak) Namazı Adım Adım Kılınışı",
    meaning: "Sadaka sevabı kazandıran kuşluk namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "evvabin-namazi-kilinisi",
    title: "Evvâbîn Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Akşam namazından sonra yatsı vaktine kadar kılınan 6 rekatlık nafile namaz.",
    arabic: "صَلَاةُ الأَوَّابِينَ",
    turkishReading: "Evvâbîn Namazı Nasıl Kılınır? (2 + 2 + 2 Formülü)",
    meaning: "Tevbe edenlerin namazı evvabin",
    audioUrl: "",
    sentences: []
  },
  {
    id: "teheccud-namazi-kilinisi",
    title: "Teheccüd Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Gecenin son üçte birinde uykudan kalkılarak kılınan nafile gece namazı.",
    arabic: "صَلَاةُ التَّهَجُّد",
    turkishReading: "Teheccüd Namazı Nasıl Kılınır ve Faziletleri",
    meaning: "Gece namazı teheccüd kılınış rehberi",
    audioUrl: "",
    sentences: []
  },
  {
    id: "muharrem-ayi-namazi",
    title: "Muharrem Ayı Namazı (1 - 10 Muharrem)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Muharrem ayının 1'i ile 10'u arasında kılınacak 6 rekatlık hacet ve kul hakkı namazı.",
    arabic: "مُحَرَّم",
    turkishReading: "Muharrem Ayının 1'i ile 10'u Arasındaki Namaz",
    meaning: "Hicri yılbaşı ve aşure günleri özel ibadetleri",
    audioUrl: "",
    sentences: []
  },
  {
    id: "mevlid-gecesi-namazi",
    title: "Mevlid Gecesi Namazı (12 Rebîülevvel Tesbih Namazı)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Rebîülevvel ayının 11'ini 12'sine bağlayan Mevlid Gecesi'nde kılınacak tesbih namazı ve özel niyeti.",
    arabic: "المَوْلِد",
    turkishReading: "Mevlid Kandili ve Gecesi İbadetleri",
    meaning: "Peygamber Efendimiz'in dünyayı teşrifi gecesi ibadetleri",
    audioUrl: "",
    sentences: []
  },
  {
    id: "regaip-gecesi-namazi",
    title: "Regaip Gecesi Namazı (12 Rekat & Secde Zikirleri)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Recep ayının ilk Cuma gecesi kılınacak 12 rekatlık namaz ve özel secde duaları.",
    arabic: "رَغَائِب",
    turkishReading: "Regaip Kandili ve Gecesi Namazı",
    meaning: "Üç ayların başlangıcı Regaip kandili namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "recep-1-10-namazi",
    title: "Recep Ayı (1 - 10 Arası Hâcet Namazı)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Receb-i şerîfin 1'i ile 10'u arasında kılınacak 10 rekatlık hâcet namazı.",
    arabic: "رَجَب 1-10",
    turkishReading: "Recep Ayı İlk 10 Gün Namazı",
    meaning: "Recep ayı ilk on günü hacet namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "recep-11-20-namazi",
    title: "Recep Ayı (11 - 20 Arası Hâcet Namazı)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Receb-i şerîfin 11'i ile 20'si arasında kılınacak 10 rekatlık hâcet namazı.",
    arabic: "رَجَب 11-20",
    turkishReading: "Recep Ayı İkinci 10 Gün Namazı",
    meaning: "Recep ayı orta on günü hacet namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "recep-21-30-namazi",
    title: "Recep Ayı (21 - 30 Arası Hâcet Namazı)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Receb-i şerîfin 21'i ile 30'u arasında kılınacak 10 rekatlık hâcet namazı.",
    arabic: "رَجَب 21-30",
    turkishReading: "Recep Ayı Üçüncü 10 Gün Namazı",
    meaning: "Recep ayı son on günü hacet namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "mirac-gecesi-namazi",
    title: "Miraç Gecesi Namazı (27 Receb)",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Receb-i şerîfin 27. gecesi kılınacak 12 rekatlık namaz, zikirler ve gündüz kılınacak 4 rekatlık ibadet.",
    arabic: "المِعْرَاج",
    turkishReading: "Miraç Kandili Gece ve Gündüz İbadetleri",
    meaning: "Miraç kandili özel namazı ve duaları",
    audioUrl: "",
    sentences: []
  },
  {
    id: "saban-1-gecesi-namazi",
    title: "Şaban Ayı 1. Gece Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Şâbân-ı şerîf ayının 1. gecesi akşam namazından sonra kılınacak tesbih namazı.",
    arabic: "شَعْبَان 1",
    turkishReading: "Şaban Ayı 1. Gece Tesbih Namazı",
    meaning: "Şaban ayı girişi tesbih namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "berat-gecesi-namazi",
    title: "Berât Gecesi Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Şâbân-ı şerîfin 15. gecesi kılınacak 100 rekatlık Hayır Namazı ve 14'erli özel tesbihat.",
    arabic: "البَرَاءَة",
    turkishReading: "Berât Kandili İbadetleri ve Hayır Namazı",
    meaning: "Berat gecesi 100 rekatlık hayır namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "saban-27-gecesi-namazi",
    title: "Şaban Ayı 27. Gecesi Namazı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Şâbân-ı şerîf ayının 27. gecesi akşam ile yatsı arasında kılınacak 2 rekatlık teşekkür namazı.",
    arabic: "شَعْبَان 27",
    turkishReading: "Şaban Ayı 27. Gece Teşekkür Namazı ve Zikirleri",
    meaning: "Şaban ayı 27. gece şükür namazı",
    audioUrl: "",
    sentences: []
  },
  {
    id: "kadir-gecesi-namazi",
    title: "Kadir Gecesi Namazı ve Zikirleri",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Bin aydan hayırlı Kadir Gecesi'nde kılınacak 4 rekatlık özel namaz ve 100'erli tesbihat.",
    arabic: "القَدْر",
    turkishReading: "Kadir Gecesi İbadetleri ve Duaları",
    meaning: "Kadir gecesi namazı ve affolunma duaları",
    audioUrl: "",
    sentences: []
  },
  {
    id: "zilhicce-10-gun-ibadetleri",
    title: "Zilhicce Ayı (Leyâlî-i Aşere) İbadetleri ve Tesbihatı",
    category: "yeni" as any,
    surahNumber: 0,
    placeInPrayer: "Zilhicce ayının ilk 10 günü, Arefe ve Bayram ibadetleri ile sabah namazı sonrası zikirleri.",
    arabic: "ذُو الحِجَّة",
    turkishReading: "Zilhicce Ayı İbadetleri ve Sabah Zikirleri",
    meaning: "Hac günleri, arefe ve leyali-i aşere ibadetleri",
    audioUrl: "",
    sentences: []
  }
];

export const ALL_NAMAZ_ITEMS: NamazItem[] = [...NAMAZ_ITEMS, ...VIRTUAL_NEW_ITEMS];
