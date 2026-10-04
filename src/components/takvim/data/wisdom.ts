import { CalendarWisdom } from '../types/prayer';

const DAILY_WISDOMS: CalendarWisdom[] = [
  {
    id: 'wisdom-1',
    dateKey: '01-01',
    verse: {
      text: 'Şüphesiz namaz, müminlere belirli vakitlere bağlı olarak farz kılınmıştır.',
      source: 'Nisâ Sûresi, 103. Âyet'
    },
    hadith: {
      text: 'Amellerin Allah\'a en sevimli olanı, az da olsa devamlı yapılanıdır.',
      source: 'Buhârî, Rikâk, 18'
    },
    saying: 'Vakit nakitten kıymetlidir; geçen bir nefesi geri getirmeye dünya hazineleri yetmez.',
    history: 'Mekke-i Mükerreme\'nin Fethi ve İslâm kardeşliğinin tezahürü.',
    article: {
      title: 'Beş Vakit Namazın Hikmeti ve Huzuru',
      content:
        'Günün akışı içerisinde beş kez Rabbimizin huzuruna durmak, kalbi dünyevî telaşlardan arındırır ve kulun Yaratıcısı ile olan bağını daima canlı tutar. Her vakit, ömrün bir safhasını hatırlatan ilâhî bir davettir.'
    }
  },
  {
    id: 'wisdom-2',
    dateKey: '01-02',
    verse: {
      text: 'Kalpler ancak Allah\'ı zikretmekle huzur bulur.',
      source: 'Ra\'d Sûresi, 28. Âyet'
    },
    hadith: {
      text: 'Sizin en hayırlınız, Kur\'ân\'ı öğrenen ve öğreteninizdir.',
      source: 'Buhârî, Fedâilü\'l-Kur\'ân, 21'
    },
    saying: 'İlim, amel edilmek içindir; ihlas ise amelin ruhudur.',
    history: 'Kur\'ân-ı Kerîm\'in Mushaf hâline getirilmesi ve muhafazası.',
    article: {
      title: 'Kur\'ân-ı Kerîm ile Hemhâl Olmak',
      content:
        'Kur\'ân-ı Kerîm, müminin hayat rehberi ve gönüllerin şifasıdır. Her gün az da olsa Kur\'ân okumak, tilavetini dinlemek ve ayetlerin manasını tefekkür etmek haneye bereket ve sekînet indirir.'
    }
  },
  {
    id: 'wisdom-3',
    dateKey: '01-03',
    verse: {
      text: 'Rabbiniz şöyle buyurdu: Bana dua edin, duanıza icabet edeyim.',
      source: 'Mü\'min Sûresi, 60. Âyet'
    },
    hadith: {
      text: 'Dua, ibadetin özüdür.',
      source: 'Tirmizî, Deavât, 1'
    },
    saying: 'Sabır, ferahlığın ve kurtuluşun anahtarıdır.',
    history: 'Medine-i Münevvere\'de Mescid-i Nebevî\'nin inşası ve Suffe Mektebi.',
    article: {
      title: 'Seher Vaktinin Bereketi ve Dua',
      content:
        'Gecenin son üçte birlik kısmı ve imsak vakti, duaların kabulüne en yakın olan müstesna zaman dilimleridir. Güne seher vaktinde uyanık ve dua ile başlamak, rızkın ve ömrün bereketlenmesine vesiledir.'
    }
  },
  {
    id: 'wisdom-4',
    dateKey: '01-04',
    verse: {
      text: 'Kim Allah\'tan korkup sakınırsa, Allah ona bir çıkış yolu ihsan eder ve onu ummadığı yerden rızıklandırır.',
      source: 'Talâk Sûresi, 2-3. Âyetler'
    },
    hadith: {
      text: 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
      source: 'Buhârî, İlim, 11'
    },
    saying: 'Güzel ahlâk, dinin yarısı ve müminin en güzel ziynetidir.',
    history: 'Veda Haccı ve Peygamber Efendimiz\'in (s.a.v.) Veda Hutbesi.',
    article: {
      title: 'Müminin Güzel Ahlâkı ve Merhameti',
      content:
        'İslâm, hem Yaratıcı\'ya karşı tazim hem de yaratılanlara karşı şefkat ve merhamet dinidir. Güler yüz göstermek, anne-babaya hürmet etmek ve komşu hakkını gözetmek salih amellerin başında gelir.'
    }
  }
];

export function getWisdomForDate(date: Date): CalendarWisdom {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_WISDOMS[Math.abs(dayOfYear) % DAILY_WISDOMS.length];
}
