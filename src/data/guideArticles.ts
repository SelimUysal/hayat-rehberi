import { TabType } from '../components/Navbar';

export interface GuideArticle {
  id: string;
  title: string;
  category: string;
  badge?: string;
  summary: string;
  content: string[];
  keywords: string[];
  targetTab?: TabType;
  actionLabel?: string;
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: 'bayram-namazi-rehberi',
    title: 'Bayram Namazı Rehberi ve Kılınışı',
    category: 'Fıkıh & İbadet Rehberi',
    badge: '2 Rekât Vâcip',
    summary: 'Ramazan ve Kurban Bayramı namazlarının niyeti, zâid tekbirleri ve adım adım kılınış tarifi.',
    content: [
      'Bayram namazı iki rekâttır ve cemaatle kılınır. Ezan ve kamet getirilmez. Birinci rekâtta Sübhâneke okunduktan sonra eller kulaklara kaldırılarak üç defa zâid tekbir alınır.',
      'Üçüncü tekbirden sonra eller bağlanır, imam gizlice Eûzü-Besmele çekip açıktan Fâtiha ve zamm-ı sûre okur. İkinci rekâtta ise Fâtiha ve sûreden sonra rükûa gitmeden önce yine üç defa zâid tekbir alınır ve dördüncü tekbirle rükûa varılır.'
    ],
    keywords: ['bayram', 'bayram namazı', 'ramazan bayramı', 'kurban bayramı', 'zaid tekbir', 'bayram namazı rehberi'],
    targetTab: 'namaz',
    actionLabel: 'Namaz Dualarına Git'
  },
  {
    id: 'oruc-ve-vakit-hassasiyeti',
    title: 'Oruç, İmsak ve İftar Vakit Hassasiyeti',
    category: 'Astronomi & Fıkıh',
    badge: 'Temkinli Vakitler',
    summary: 'Fecr-i sâdık (imsak) ve gurûb-ı şems (iftar) vakitlerinde temkin müddetinin önemi.',
    content: [
      'İmsak vakti, doğu ufkunda fecr-i sâdık denilen kızıllığın yayılmasıyla başlar; bu vakitle birlikte yeme-içme kesilir ve sabah namazı vakti girer.',
      'İftar vakti ise güneş kursunun batı ufkunda tamamen kaybolmasıyla (akşam ezanıyla) girer. İhtiyat ve temkin dakikalarına riayet etmek ibadetlerin sıhhati için esastır.'
    ],
    keywords: ['oruç', 'imsak', 'iftar', 'temkin', 'sahur', 'vakit hassasiyeti'],
    targetTab: 'takvim',
    actionLabel: 'Vakit Takvimini İncele'
  },
  {
    id: 'kible-tayini-rehberi',
    title: 'Kıble Tayini ve Kâbe Açısı Hesaplama',
    category: 'Kıble & Astronomi',
    badge: 'Küresel Trigonometri',
    summary: 'Bulunduğunuz konumdan Kâbe-i Muazzama yönünün küresel trigonometri ve pusula ile tespiti.',
    content: [
      'Namazın dışındaki farzlardan biri olan İstikbâl-i Kıble, namaz kılarken Kâbe-i Muazzama yönüne dönmektir.',
      'Takvim sayfasındaki Kıble Pusulası, bulunduğunuz şehrin enlem ve boylam koordinatlarından Mekke-i Mükerreme\'ye olan gerçek kuzey açısını hassas olarak hesaplar.'
    ],
    keywords: ['kıble', 'kible', 'pusula', 'kabe açısı', 'istikbali kıble', 'kıble tayini'],
    targetTab: 'takvim',
    actionLabel: 'Kıble Pusulasını Aç'
  },
  {
    id: 'kaza-namazi-hesaplama',
    title: 'Kaza Namazı Hesaplama ve Tertip Usûlü',
    category: 'İbadet & Fıkıh',
    badge: 'Beş Vakit + Vitir',
    summary: 'Vaktinde kılınamayan farz namazlar ile vitir namazının kaza edilmesi ve günlük takip usûlü.',
    content: [
      'Büluğa erdikten sonra vaktinde eda edilemeyen beş vakit farz namaz ile vacip olan vitir namazının kaza edilmesi borçtur.',
      'Her vaktin farz namazından önce veya sonra bir kaza namazı kılınarak düzenli çetele tutulması, borçların kolaylıkla tamamlanmasını sağlar.'
    ],
    keywords: ['kaza', 'kaza namazı', 'namaz borcu', 'vitir kazası', 'ıskat'],
    targetTab: 'kaza',
    actionLabel: 'Kaza Takip Modülüne Git'
  }
];
