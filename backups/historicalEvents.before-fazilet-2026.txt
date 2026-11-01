export interface HistoricalEvent {
  year?: number | string;
  text: string;
  category: string;
}

export const HISTORICAL_EVENTS_MAP: Record<string, HistoricalEvent[]> = {
   '01-01': [
    { year: 697, text: 'Câbir b. Abdullah ın vefatı', category: 'islam' },
    { year: 713, text: 'Saîd b. el-Müseyyeb vefatı', category: 'islam' },
    { year: 803, text: 'Fudayl bin İyâz hazretleri vefatı', category: 'islam' },
    { year: 1033, text: 'Ebu’l-Hasan Harkâni (K.S.) nın vefatı', category: 'islam' },
    { year: 1284, text: 'Hüsameddin Çelebi Hazretleri vefatı', category: 'islam' },
    { year: 1447, text: 'Hâce Ubeydullah Ahrâr (K.S.) nın vefatı', category: 'islam' },
    { year: 1543, text: 'Ahmed el-Mücâhid in vefatı', category: 'islam' },
    { year: 1577, text: 'Osmanlı Devleti ile Avusturya arasındaki mevcut barış antlaşmasının sekiz yıl daha uzatılması.', category: 'osmanli' },
    { year: 1603, text: 'Hâce Muhammed Bakîbillah (K.S.) nın vefatı', category: 'islam' },
    { year: 1804, text: 'Haiti Bağımsızlığını İlan Etti', category: 'dunya' },
    { year: 1956, text: 'Sudan Bağımsızlığını Kazandı', category: 'dunya' },
    { year: 1993, text: 'Çekoslovakya Dağıldı (Çekya ve Slovakya)', category: 'dunya' },
  ],
  '01-02': [
    { year: 1496, text: 'Fahreddin-i Acemi r.a. vefatı', category: 'islam' },
    { year: 1596, text: 'Eger Kalesi\'nin fethi', category: 'islam' },
    { year: 1824, text: 'Abdullah-ı Dehlevi (K.S.) nın vefatı', category: 'islam' },
    { year: 1991, text: 'Gönenli Mehmet Efendi hazretleri vefatı', category: 'islam' },
    { year: 2020, text: 'Türkiye Büyük Millet Meclisi\'nde kabul edilen tezkere ile Libya\'ya askerî eğitim, yardım ve danışmanlık desteği resmileşti ve sahada aktif koordineye başlandı.', category: 'türkiye-libya' },
    { year: 2024, text: 'Salih el-Aruri İsrail tarafından şehit edildi', category: 'dunya' },
  ],
  '01-03': [
    { year: 2026, text: 'Quadrantid (Quadrant) Meteor Yağmuru zirve yaptı; saat başına düşen meteor sayısı en yüksek seviyeye ulaştı.', category: 'dunya' },
  ],
  '01-04': [
    { year: 630, text: 'İslâm ordusu, Mekke-i Mükerreme\'nin fethi için Medine-i Münevvere\'den yola çıktı.', category: 'islam' },
    { year: 1610, text: 'Sultan Ahmed Camii\'nin temeli İstanbul Atmeydanı\'nda düzenlenen büyük bir merasimle atıldı.', category: 'osmanli' },
    { year: 2026, text: 'Quadrantid Meteor Yağmuru\'nun kısa süren zirve noktası devam ediyor.', category: 'dunya' },
  ],
  '01-05': [
    { year: 1458, text: 'Alaeddin-i Ali Semerkandi r.a. vefatı', category: 'islam' },
    { year: 1514, text: 'Çaldıran Seferi\'ne hareket', category: 'islam' },
    { year: 1996, text: 'Yahya Ayyaş İsrail tarafından şehit edildi', category: 'dunya' },
  ],
  '01-08': [
    { year: 1685, text: 'Seyfeddin-i Faruki hazretleri vefatı', category: 'islam' },
    { year: 1943, text: 'Hafız Mehmet Bey vefatı', category: 'islam' },
  ],
  '01-10': [
    { year: 1037, text: 'Abdülkāhir el-Bağdâdî vefatı', category: 'islam' },
    { year: 1910, text: 'Ali Hafız r.a. vefatı', category: 'islam' },
    { year: 1919, text: 'Medine-i Münevvere, yaklaşık iki yıl yedi ay süren Osmanlı savunmasının ardından teslim edildi.', category: 'islam' },
    { year: 2027, text: 'Zemheri Fırtınası (Sert kış fırtınası)', category: 'turkiye' },
  ],
  '01-11': [
    { year: 630, text: 'Mekke-i Mükerreme fethedildi; Kâbe-i Muazzama putlardan temizlendi ve Mekke İslâm hâkimiyetine girdi.', category: 'islam' },
    { year: 1480, text: 'Molla Hüsrev in vefatı', category: 'islam' },
    { year: 1755, text: 'Haliç şiddetli soğuklar nedeniyle tamamen dondu; insanlar buz üzerinden karşı kıyıya geçebildi.', category: 'osmanli' },
  ],
  '01-12': [
    { year: 1185, text: 'Hayât b. Kays el-Harrânî vefatı', category: 'islam' },
    { year: 1834, text: 'Ebu Said Faruki hazretleri vefatı', category: 'islam' },
    { year: 1920, text: 'Son Osmanlı Meclis-i Mebusanı İstanbul\'da yeniden toplandı.', category: 'osmanli' },
  ],
  '01-13': [
    { year: 1556, text: 'Derviş Mehmed (K.S.) in vefatı', category: 'islam' },
    { year: 2004, text: 'Tom Hurndall (israil tarfından bilerek/istiyerek kafasına ateş edilerek öldürülmüştür/şehit İngiliz aktivist)', category: 'aktivist' },
    { year: 2026, text: 'Karakış Bitişi', category: 'turkiye' },
    { year: 2027, text: 'Şiddet-i Şita (Çok şiddetli kış soğukları)', category: 'turkiye' },
  ],
  '01-14': [
    { year: 1780, text: 'Erzurumlu İbrahim Hakkı Hazretleri vefatı', category: 'islam' },
    { year: 1934, text: 'Hoca Şükrü Efendi vefatı', category: 'islam' },
    { year: 2027, text: 'Zemheri Başlangıcı (Kışın en soğuk dönemi / Ocak-Şubat ağır kış soğukları)', category: 'turkiye' },
  ],
  '01-15': [
    { year: 653, text: 'Kâ‘b el-Ahbâr hazretleri vefatı', category: 'islam' },
    { year: 723, text: 'Mücâhid b. Cebr in vefatı', category: 'islam' },
    { year: 774, text: 'İmam-ı Evzai r.a. vefatı', category: 'islam' },
    { year: 1459, text: 'Fatih Sultan Mehmed\'in hocası, âlim ve mutasavvıf Akşemseddin Hazretleri Göynük\'te vefat etti.', category: 'islam' },
    { year: 1719, text: 'Molla Osman Efendi vefatı', category: 'islam' },
    { year: 1749, text: 'Muhammed Nurü\'l-Bedvâni (K.S.) nın vefatı', category: 'islam' },
  ],
  '01-16': [
    { year: 1595, text: 'Sultan III. Murad\'ın vefatının ardından Sultan III. Mehmed Osmanlı tahtına çıktı.', category: 'osmanli' },
  ],
  '01-17': [
    { year: 1595, text: 'III. Murad vefatı', category: 'osmanli' },
    { year: 1875, text: 'İstanbul\'da Galata ile Beyoğlu\'nu birbirine bağlayan Tünel hizmete açıldı.', category: 'osmanli' },
  ],
  '01-19': [
    { year: 870, text: 'Buhari hazretleri vefatı', category: 'islam' },
    { year: 1910, text: 'Çırağan Sarayı büyük bir yangın sonucu ağır şekilde tahrip oldu.', category: 'osmanli' },
  ],
  '01-20': [
    { year: 820, text: 'İmâm Şâfiî vefatı', category: 'islam' },
    { year: 1639, text: 'I. Mustafa vefatı', category: 'osmanli' },
    { year: 1895, text: 'İstanbul\'da Darülaceze hizmete açılarak kimsesiz, yaşlı ve muhtaçların barınmasına yönelik önemli bir sosyal kurum oluşturuldu.', category: 'osmanli' },
    { year: 2018, text: 'Suriye\'Afrin bölgesine yönelik Zeytin Dalı Harekâtı.', category: 'turkiye' },
  ],
  '01-22': [
    { year: 1517, text: 'Yavuz Sultan Selim komutasındaki Osmanlı ordusu Ridâniye Savaşı\'nda Memlük kuvvetlerini mağlup etti.', category: 'osmanli' },
    { year: 1899, text: 'Muhammed Sıbgatullah Faruki hazretleri vefatı', category: 'islam' },
  ],
  '01-23': [
    { year: 1913, text: 'Bâbıâli Baskını gerçekleşti ve Osmanlı hükümetinde önemli bir siyasi değişim meydana geldi.', category: 'osmanli' },
  ],
  '01-24': [
    { year: 1957, text: 'Abdurrahman b. Nâsır es-Sa‘dî vefatı', category: 'islam' },
    { year: 1980, text: 'Türkiye\'de serbest piyasa dunyasine geçişin miladı olan 24 Ocak Kararları açıklandı.', category: 'dunya' },
    { year: 2020, text: 'Elazığ Depremi', category: 'turkiye' },
  ],
  '01-25': [
    { year: 750, text: 'Büyük Zâb Savaşı ve Abbâsî İktidarı: Son Emevî halifesi II. Mervân kumandasındaki ordu, Büyük Zâb Suyu kıyısında Abbâsî kuvvetlerine mağlup oldu; böylece Emevî Devleti yıkıldı ve Abbâsî hilâfeti resmen başladı.', category: 'islam' },
  ],
  '01-26': [
    { year: 1699, text: 'Osmanlı Devleti ile Avusturya, Lehistan ve Venedik arasında Karlofça Antlaşması imzalandı.', category: 'osmanli' },
    { year: 2027, text: 'Ayandon Fırtınası', category: 'turkiye' },
  ],
  '01-27': [
    { year: 1880, text: 'Pratik Elektrik Ampulünün Patenti - Thomas Edison', category: 'dunya' },
    { year: 1950, text: 'Abdurrahman Kâmil Efendi vefatı', category: 'islam' },
  ],
  '01-28': [
    { year: 661, text: 'Hz. Aliyyül Razıyyüs Sahi (r.a.)\'nın vefatı', category: 'islam' },
    { year: 733, text: 'İmam-ı Muhammed Bakır r.a. vefatı', category: 'islam' },
    { year: 748, text: 'Malik b. Dinar hz vefatı', category: 'islam' },
    { year: 1622, text: 'Genç Osman (II. Osman) vefatı', category: 'osmanli' },
    { year: 1920, text: 'Son Osmanlı Meclis-i Mebusanı tarafından Mîsâk-ı Millî kabul edildi.', category: 'osmanli' },
  ],
  '01-29': [
    { year: 1932, text: 'Türkçe ezân ilk defa Fâtih Câmii\'nde okutturuldu', category: 'islam' },
  ],
  '01-31': [
    { year: 1729, text: 'İbrahim Müteferrika Matbaası\'nda Vankulu Lügati basıldı; Osmanlı Devleti\'nde Türkçe eser basımının önemli dönüm noktalarından biri gerçekleşti.', category: 'osmanli' },
    { year: 2027, text: 'Erbain Bitişi', category: 'turkiye' },
  ],
  '02-01': [
    { year: 934, text: 'Ukayl el-Münbecî vefatı', category: 'islam' },
    { year: 1553, text: 'Osmanlı Devleti ile Fransa arasındaki ilişkilerde Fransızların Osmanlılara denizcilik alanında yardım sağlamasını öngören düzenlemeler yapıldı.', category: 'osmanli' },
    { year: 1935, text: 'Ayasofya Câmii\'nin müzeye çevrilmesi', category: 'turkiye' },
    { year: 1944, text: 'Bolu-Gerede Depremi', category: 'turkiye' },
    { year: 2027, text: 'Hamsin Başlangıcı ("Elli gün" süren dönem)', category: 'turkiye' },
  ],
  '02-02': [
    { year: 1864, text: 'SSCB’de Çerkes sürgünü ve etnik temizlik olayları başladı; yüz binlerce Çerkes köylerinden sürüldü veya kaçmaya zorlandı.', category: 'islam' },
    { year: 1943, text: 'SSCB’de Karaçay Özerk Oblastı kaldırıldı ve Karaçay halkının sürgün süreci başlatıldı.', category: 'islam' },
    { year: 2000, text: 'Rusya’da Novye Aldi ve Chernorechye operasyonları sırasında en az 60 sivil, aralarında çocuklar ve yaşlıların da bulunduğu kişiler, yargısız infazlarla öldürüldü.', category: 'islam' },
  ],
  '02-03': [
    { year: 1451, text: 'Osmanlı Padişahı II. Murad vefat etti.', category: 'osmanli' },
  ],
  '02-04': [
    { year: 1871, text: 'Şeyh Şâmil in vefatı', category: 'islam' },
    { year: 1926, text: 'İskilipli Atıf Hoca idam edildi.', category: 'islam' },
  ],
  '02-05': [
    { year: 1534, text: 'İbrahim Gülşeni Hazretleri vefatı', category: 'islam' },
    { year: 1866, text: 'SSCB’de Rus yönetimine karşı ayaklanmaların ardından Müslüman Abhazların sürgünü başladı; binlerce kişi Osmanlı topraklarına göç etmek zorunda kaldı.', category: 'islam' },
    { year: 1943, text: 'SSCB’de Karaçay halkının kitlesel sürgünü gerçekleştirildi; insanlar Kazakistan ve Kırgızistan’a gönderildi.', category: 'islam' },
    { year: 1994, text: 'Birinci Markale Pazar Yeri Katliamı Gerçekleşti', category: 'dunya' },
    { year: 1997, text: 'Çin devletinde Ghulja (Yining) olayları oldu.', category: 'islam' },
  ],
  '02-06': [
    { year: 1521, text: 'Osmanlı kuvvetleri, Şam Valisi Canbirdi Gazâlî isyanını bastırdı.', category: 'osmanli' },
    { year: 1695, text: 'Sultan II. Ahmed vefat etti ve II. Mustafa Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1921, text: 'Antep’e Türkiye Büyük Millet Meclisi tarafından “Gazi” unvanı verildi.', category: 'turkiye' },
    { year: 2023, text: 'Kahramanmaraş (Pazarcık ve Elbistan) Depremleri', category: 'turkiye' },
  ],
  '02-07': [
    { year: 1695, text: 'Sultan II. Mustafa Osmanlı tahtına çıktı.', category: 'osmanli' },
  ],
  '02-08': [
    { year: 1640, text: 'Sultan IV. Murad vefat etti; Sultan İbrahim Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1877, text: 'SSCB’de Rus yönetimine karşı ayaklanmaların ardından yaklaşık 30.000–50.000 Müslüman Abhaz Osmanlı topraklarına göç etmek zorunda kaldı.', category: 'islam' },
    { year: 1921, text: 'Antep’e Türkiye Büyük Millet Meclisi tarafından “Gazi” unvanı verildi.', category: 'turkiye' },
  ],
  '02-09': [
    { year: 1588, text: 'Osmanlı İstanbul’unda cami minarelerinde ilk defa kandil yakılması uygulaması başladı.', category: 'osmanli' },
    { year: 1695, text: 'Koyun Adaları Deniz Muharebesi’nde Osmanlı Donanması Venedik Donanması’nı mağlup etti.', category: 'osmanli' },
    { year: 1788, text: 'Avusturya, Osmanlı Devleti’ne savaş ilan ederek 1787-1792 Osmanlı-Rus Savaşı’na katıldı.', category: 'osmanli' },
    { year: 1920, text: 'Kuvâ-yi Milliye birlikleri Urfa’ya girdi.', category: 'turkiye' },
  ],
  '02-10': [
    { year: 720, text: 'Ömer bin Abdülaziz hazretleri vefatı', category: 'islam' },
    { year: 1918, text: 'Sultan II. Abdülhamid Han vefat etti.', category: 'osmanli' },
    { year: 'MÖ 4. yüzyıl', text: 'Üzeyr aleyhisselâmın vefatı', category: 'islam' },
  ],
  '02-11': [
    { year: 1878, text: 'Midhat Paşa görevinden azledilerek Taif’e sürgüne gönderildi.', category: 'osmanli' },
    { year: 1920, text: 'SSCB’de Orta Asya’daki Basmacı hareketine karşı askerî operasyonlar başladı; Sovyet karşıtı direnişler zorla bastırıldı.', category: 'islam' },
  ],
  '02-12': [
    { year: 1546, text: 'Osmanlı kuvvetleri Yemen’de Taiz’i fethetti.', category: 'osmanli' },
    { year: 1920, text: 'Kahramanmaraş, Fransız işgalinden kurtuldu.', category: 'turkiye' },
    { year: 1928, text: 'Şeyh Ata Efendi vefatı', category: 'islam' },
    { year: 1949, text: 'Hasan el-Benna\'nın vefatı', category: 'islam' },
  ],
  '02-13': [
    { year: 1430, text: 'Hacı Bayram-ı Velî vefatı', category: 'islam' },
    { year: 1918, text: 'Erzincan, Rus işgalinden kurtarıldı.', category: 'turkiye' },
    { year: 1918, text: 'Görele, işgalden kurtarıldı.', category: 'turkiye' },
    { year: 2027, text: 'Zemheri Bitişi', category: 'turkiye' },
  ],
  '02-14': [
    { year: 1738, text: 'Mehmet Emin Tokadi Hazretleri vefatı', category: 'islam' },
    { year: 1876, text: 'Sırp ayaklanması Osmanlı Devleti açısından yeni bir Balkan krizinin başlangıçlarından biri oldu.', category: 'osmanli' },
    { year: 1891, text: 'Hacı Abdullah Efendi r.a. vefatı', category: 'islam' },
    { year: 1918, text: 'Vakfıkebir, işgalden kurtarıldı.', category: 'turkiye' },
    { year: 1928, text: 'SSCB’de Müslümanların hac ibadetine yönelik kısıtlamalar uygulandı; Tacikistan’da hac ziyareti yasaklandı.', category: 'islam' },
  ],
  '02-15': [
    { year: 779, text: 'İbrâhim b. Edhem vefatı', category: 'islam' },
    { year: 801, text: 'Rabia-i Adviyye Hazretleri vefatı', category: 'islam' },
    { year: 1517, text: 'Yavuz Sultan Selim’in Mısır Seferi sonrasında hilafet makamının Osmanlılara geçiş süreci başladı.', category: 'islam' },
    { year: 1920, text: 'Londra Konferansı’nda İstanbul’un Osmanlı Devleti’nde bırakılması yönünde karar alındı.', category: 'turkiye' },
    { year: 1921, text: 'Gümüşhane, işgalden kurtarıldı.', category: 'turkiye' },
  ],
  '02-16': [
    { year: 1459, text: 'Akşemseddin Hazretleri vefat etti.', category: 'islam' },
    { year: 1916, text: 'Erzurum, Rus ordusu tarafından işgal edildi.', category: 'turkiye' },
  ],
  '02-17': [
    { year: 1920, text: 'Son Osmanlı Mebusan Meclisi, Misak-ı Millî kararlarının basında yayımlanmasını ve yabancı parlamentolara bildirilmesini kararlaştırdı.', category: 'turkiye' },
    { year: 1929, text: 'SSCB’de özellikle Orta Asya’da binlerce cami kapatıldı, yıkıldı veya başka amaçlarla kullanılmaya başlandı.', category: 'islam' },
    { year: 2008, text: 'Kosova Bağımsızlığını İlan Etti', category: 'dunya' },
  ],
  '02-18': [
    { year: 817, text: 'Zeynelabidin Kayserani vefatı', category: 'islam' },
    { year: 1451, text: 'Fatih Sultan Mehmed, ikinci kez Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1695, text: 'Sakız Adası Osmanlı kuvvetleri tarafından Venediklilerden geri alındı.', category: 'osmanli' },
    { year: 1856, text: 'Islahat Fermanı ilan edildi.', category: 'osmanli' },
    { year: 1920, text: 'Misak-ı Millî, İstanbul’daki Son Osmanlı Mebusan Meclisi tarafından kamuoyuna duyuruldu.', category: 'turkiye' },
  ],
  '02-19': [
    { year: 779, text: 'İbrahim bin Edhem Hazretleri vefat etti.', category: 'islam' },
    { year: 1915, text: 'Çanakkale Savaşı’nın deniz harekâtı başladı.', category: 'turkiye' },
    { year: 2027, text: '1. Cemre – Havaya', category: 'turkiye' },
  ],
  '02-20': [
    { year: 1622, text: 'Sultan II. Osman (Genç Osman) öldürüldü.', category: 'osmanli' },
    { year: 1929, text: 'SSCB’de binlerce Müslüman din adamı tutuklandı, çalışma kamplarına gönderildi ve önemli bir kısmı öldürüldü veya idam edildi.', category: 'islam' },
  ],
  '02-21': [
    { year: 1166, text: 'Abdülkādir Geylânî vefatı', category: 'islam' },
    { year: 1754, text: 'I. Mahmud vefatı', category: 'osmanli' },
    { year: 1918, text: 'Bayburt, Rus işgalinden kurtarıldı.', category: 'turkiye' },
    { year: 1918, text: 'Ahlat, Rus işgalinden kurtarıldı.', category: 'turkiye' },
    { year: 2008, text: 'Kuzey Irak\'taki terör kamplarına yönelik kapsamlı Güneş Harekâtı.', category: 'turkiye' },
  ],
  '02-22': [
    { year: 1090, text: 'İmâm Serahsî hz vefatı', category: 'islam' },
    { year: 1406, text: 'İbn Haldun vefat etti.', category: 'islam' },
    { year: 2015, text: 'Suriye topraklarındaki şüheda türbesini nakletmek amacıyla düzenlenen Şah Fırat Operasyonu.', category: 'turkiye' },
    { year: 2023, text: 'Çin devletinde Ningxia ve Gansu’daki cami “konsolidasyonu” belgelendi.', category: 'islam' },
  ],
  '02-23': [
    { year: 632, text: 'Hz. Muhammed’in (s.a.v.) Veda Haccı sırasında Veda Hutbesi’ni irad ettiği kabul edilen dönem.', category: 'islam' },
    { year: 1878, text: 'Bulgaristan Prensliği Kuruldu', category: 'dunya' },
    { year: 1918, text: 'Ardahan, Posof ve Çıldır Rus işgalinden kurtarıldı.', category: 'turkiye' },
    { year: 1921, text: 'Ardahan, Çıldır ve Göle Türk ordusu tarafından işgalden kurtarıldı.', category: 'turkiye' },
    { year: 1944, text: 'SSCB’de Stalin yönetimi Çeçen ve İnguş nüfusunun kitlesel sürgününü başlattı; halk Orta Asya’ya gönderildi.', category: 'islam' },
    { year: 2017, text: 'Çin devletinde 1 milyondan fazla Müslümanın gözaltına alındığı yönünde ciddi uluslararası raporlar yayımlandı.', category: 'islam' },
  ],
  '02-24': [
    { year: 1368, text: 'Seyyah İbn Battûta vefat etti.', category: 'islam' },
    { year: 1793, text: 'Osmanlı Devleti’nde Nizam-ı Cedid askerî teşkilatının kuruluş süreci başlatıldı.', category: 'osmanli' },
    { year: 1918, text: 'Trabzon, Rus işgalinden kurtarıldı.', category: 'turkiye' },
  ],
  '02-25': [
    { year: 1495, text: 'Cem Sultan vefat etti.', category: 'osmanli' },
    { year: 1711, text: 'Rusya, Osmanlı Devleti’ne karşı savaş ilan etti.', category: 'osmanli' },
    { year: 1715, text: 'Muhammed Sıddık hazretleri vefatı', category: 'islam' },
    { year: 1918, text: 'Araklı, Sürmene ve İspir işgalden kurtarıldı.', category: 'turkiye' },
    { year: 1994, text: 'Harem-i İbrahim Camii Katliamı: Aşırı sağcı bir Yahudi yerleşimci, El-Halil\'de camide namaz kılan Müslümanların üzerine ateş açarak 29 kişiyi şehit etti.', category: 'filistin' },
  ],
  '02-26': [
    { year: 1618, text: 'Sultan I. Mustafa tahttan indirildi ve II. Osman (Genç Osman) Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1944, text: 'SSCB’de Haybah katliamı gerçekleşti; NKVD tarafından çok sayıda Çeçen sivil öldürüldü.', category: 'islam' },
    { year: 1992, text: 'Hocalı’da Azerbaycan Türklerine yönelik katliam gerçekleştirildi.', category: 'islam' },
    { year: 2027, text: '2. Cemre – Suya', category: 'turkiye' },
  ],
  '02-27': [
    { year: 1644, text: 'Osmanlı şeyhülislamlarından Yahya Efendi vefat etti.', category: 'islam' },
    { year: 1918, text: 'Çaykara işgalden kurtarıldı.', category: 'turkiye' },
    { year: 2020, text: 'Suriye\'İdlib bölgesinde rejim unsurlarına karşı Bahar Kalkanı Harekâtı.', category: 'turkiye' },
  ],
  '02-28': [
    { year: 1424, text: 'Molla Fenârî, Osmanlı Devleti’nin ilk şeyhülislamı olarak göreve başladı.', category: 'islam' },
    { year: 1528, text: 'Macar Kralı János Szapolyai ile Osmanlı Devleti arasında Osmanlı himayesini düzenleyen anlaşma yapıldı.', category: 'osmanli' },
    { year: 1856, text: 'Islahat Fermanı ilan edildi.', category: 'osmanli' },
  ],
  '02-29': [
    { year: 1944, text: 'SSCB’de Ahıska Türklerinin kitlesel sürgünü gerçekleştirildi; yüz binlerce Müslüman Ahıska Türkü Orta Asya’ya gönderildi.', category: 'islam' },
  ],
  '03-01': [
    { year: 680, text: 'Hz. Yezid’in vefatı', category: 'islam' },
    { year: 827, text: 'Ma‘rûf-i Kerhî vefatı', category: 'islam' },
    { year: 1921, text: 'Türk-Afgan Dostluk Antlaşması Moskova’da imzalandı. Afganistan, TBMM Hükûmeti’ni tanıyan ilk Müslüman devlet oldu.', category: 'turkiye' },
  ],
  '03-02': [
    { year: 641, text: 'Bilal-i Habeşi r.a. vefatı', category: 'islam' },
    { year: 1354, text: 'Gelibolu\'nun alınması', category: 'islam' },
    { year: 1400, text: 'Hâce Alaaddin-i Attâr (K.S.) nın vefatı', category: 'islam' },
  ],
  '03-03': [
    { year: 373, text: 'Ebü\'l-Leys es-Semerkandî hazretleri vefatı', category: 'islam' },
    { year: 625, text: 'Amr b. el-Cemûş r.a. ve Abdullah b. Amr b. Harâm r.a. vefatı (Uhud)', category: 'islam' },
    { year: 1573, text: 'Hasan Hüsameddin Uşaki r.a. vefatı', category: 'islam' },
    { year: 1878, text: 'Osmanlı Devleti ile Rusya arasında Ayastefanos Antlaşması imzalandı. Antlaşma, 93 Harbi’nin ardından Osmanlı Devleti açısından ağır hükümler içeriyordu.', category: 'osmanli' },
    { year: 1918, text: 'Finlandiya Cumhuriyeti Kuruldu', category: 'dunya' },
  ],
  '03-04': [
    { year: 1659, text: 'Cahidi Ahmed Efendi vefatı', category: 'islam' },
  ],
  '03-05': [
    { year: 1207, text: 'Antalya\'nın fethi', category: 'islam' },
    { year: 1326, text: 'Şeyh Edebali vefatı', category: 'osmanli' },
    { year: 1481, text: 'Fatih Sultan Mehmet Hanın vefatı', category: 'islam' },
    { year: 1944, text: 'SSCB’de Stalin yönetimi Balkar halkının sürgün edilmesine karar verdi.', category: 'islam' },
    { year: 1960, text: 'Said Nursî vefatı', category: 'islam' },
    { year: 2027, text: '3. Cemre – Toprağa', category: 'turkiye' },
  ],
  '03-07': [
    { year: 1941, text: 'Mehmet Rifat Börekçi vefatı', category: 'islam' },
  ],
  '03-08': [
    { year: 1220, text: 'Anadolu Selçuklu Devleti ile Venedik arasında dostluk ve ticaret anlaşması yapıldı. Anlaşma, Selçuklu topraklarındaki Venedikli tüccarların hukukî durumunu düzenledi.', category: 'osmanli' },
    { year: 1451, text: 'II. Murad vefatı', category: 'osmanli' },
    { year: 1944, text: 'SSCB’de Balkarların sürgünü tamamlandı ve Kabardino-Balkar Özerk SSCB’sinin adı değiştirildi.', category: 'islam' },
  ],
  '03-09': [
    { year: 1807, text: 'III. Selim vefatı', category: 'osmanli' },
  ],
  '03-10': [
    { year: 1917, text: 'Irak Cephesi’nde İngiliz kuvvetlerinin Bağdat yönündeki ilerleyişi sırasında Türk birlikleri Dicle hattında geri çekilmeye başladı.', category: 'osmanli' },
  ],
  '03-11': [
    { year: 1179, text: 'Abdu\'l-Hâlık Gucdüvani (K.S.) nın vefatı', category: 'islam' },
  ],
  '03-12': [
    { year: 1709, text: 'Hasan Sezai Hazretleri vefatı', category: 'islam' },
    { year: 1853, text: 'İsmail Siraceddin Şirvani r.a. vefatı', category: 'islam' },
    { year: 1918, text: 'Erzurum, Rus işgali ve Ermeni çetelerinin hâkimiyetinden kurtarıldı.', category: 'turkiye' },
    { year: 1921, text: 'Mehmed Âkif Ersoy’un kaleme aldığı İstiklâl Marşı, TBMM’de Millî Marş olarak kabul edildi.', category: 'turkiye' },
  ],
  '03-13': [
    { year: 1430, text: 'Osmanlı Sultanı II. Murad döneminde Selanik fethedildi ve şehir Osmanlı hâkimiyetine girdi.', category: 'osmanli' },
    { year: 1992, text: 'Erzincan Depremi', category: 'turkiye' },
  ],
  '03-14': [
    { year: 1908, text: 'Türkiye\'nin ilk spor kulüplerinden biri olan Galatasaray Spor Kulübü\'nün futbol şubesi ve kurumsal yapısı güçlendirildi; Beşiktaş Jimnastik Kulübü tescil edildi.', category: 'turkiye' },
  ],
  '03-15': [
    { year: 712, text: 'Sind bölgesinin fethi', category: 'islam' },
    { year: 933, text: 'Ebû Yezîd el-Bistâmî vefatı', category: 'islam' },
    { year: 1650, text: 'Mir Muhammed Numan hazretleri vefatı', category: 'islam' },
    { year: 1848, text: 'Ahmed Kuddusi vefatı', category: 'islam' },
    { year: 1890, text: 'Alman cerrah Emil von Behring ve Kitasato Shibasaburō, difteri ve tetanoz antitoksinlerini keşfetti.', category: 'dunya' },
    { year: 1917, text: 'Rus Çarlığı Yıkıldı', category: 'dunya' },
    { year: 1921, text: 'Osmanlı Devleti’nin son döneminde sadrazamlık yapan Mehmed Talat Paşa, Berlin’de uğradığı suikast sonucu hayatını kaybetti.', category: 'osmanli' },
    { year: 2025, text: 'Kuşatma ve Aç Bırakma Politikaları: İsrail\'in Gazze\'nin kuzeyi başta olmak üzere tüm bölgeye insani yardımların girişini tamamen keserek sistematik açlık ve ölüm politikalarını derinleştirmesi.', category: 'filistin' },
    { year: 2026, text: 'İlkbahar göçü başladı; leylekler ve ötücü kuşlar kışlaklarından kuzeydeki üreme alanlarına doğru hareket ediyor.', category: 'doga' },
  ],
  '03-16': [
    { year: 1166, text: 'Ahmed Yesevi r.a. vefatı', category: 'islam' },
    { year: 2003, text: 'Rachel Corrie (israil tarfından bilerek/istiyerek İsrail buldozeri tarafından ezilerek öldürülmüştür/şehit ABD li aktivist)', category: 'aktivist' },
  ],
  '03-18': [
    { year: 1915, text: 'Çanakkale Deniz Zaferi: İtilaf Devletleri donanmasının Çanakkale Boğazı’nı denizden geçme girişimi başarısızlığa uğratıldı.', category: 'osmanli' },
    { year: 2022, text: '1915 Çanakkale Köprüsü açıldı; dünyanın en uzun orta açıklıklı asma köprüsü unvanını alarak Asya ile Avrupa\'yı Çanakkale Boğazı\'nda birleştirdi.', category: 'ulasim-altyapi' },
  ],
  '03-19': [
    { year: 1877, text: 'Osmanlı Devleti’nin ilk Meclis-i Mebusanı, II. Abdülhamid’in katıldığı törenle İstanbul’da açıldı.', category: 'osmanli' },
  ],
  '03-20': [
    { year: 677, text: 'Ebû Hüreyre r.a. hazretleri vefatı', category: 'islam' },
    { year: 739, text: 'Berberî İsyanı ve Kuzey Afrika\'daki mücadeleler', category: 'islam' },
    { year: 936, text: 'İbn Mücâhid in vefatı', category: 'islam' },
    { year: 1513, text: 'Osmanlı şehzadelerinden Korkut Çelebi Kütahya’da vefat etti.', category: 'osmanli' },
    { year: 2026, text: 'İlkbahar Ekinoksu (Gece ve gündüz eşitliği)', category: 'turkiye' },
  ],
  '03-21': [
    { year: 1389, text: 'Muhammed Bahauddin Nakşibend (K.S.) nın vefatı', category: 'islam' },
    { year: 1779, text: 'Osmanlı Devleti ile Rusya arasında Aynalıkavak Tenkihnamesi imzalandı. Antlaşma, Küçük Kaynarca Antlaşması’nın bazı hükümlerini açıklığa kavuşturdu.', category: 'osmanli' },
    { year: 1995, text: 'Kuzey Irak\'a yönelik 35 bin personelin katılımıyla düzenlenen en kapsamlı kara operasyonlarından biri olan Çelik Harekâtı.', category: 'turkiye' },
    { year: 2026, text: 'İlkbahar Ekinoksu / Gece ve gündüzün eşit olduğu dönem', category: 'turkiye' },
    { year: 2027, text: 'Hamsin Bitişi', category: 'turkiye' },
  ],
  '03-22': [
    { year: 1447, text: 'Yakub Çerhî (K.S.) nın vefatı', category: 'islam' },
    { year: 2004, text: 'Şeyh Ahmed Yasin İsrail tarafından şehit edildi', category: 'dunya' },
    { year: 2026, text: 'Mart Dokuzu', category: 'turkiye' },
    { year: 2026, text: 'Koz Kavuran Fırtınası', category: 'turkiye' },
  ],
  '03-23': [
    { year: 1481, text: 'Osmanlı tarihçisi Âşıkpaşazâde İstanbul’da vefat etti. Osmanlı tarihinin erken dönemlerini anlatan Tevârîh-i Âl-i Osmân adlı eseriyle tanındı.', category: 'osmanli' },
    { year: 1960, text: 'İslam âlimi ve mütefekkir Bediüzzaman Said Nursî Hazretleri Şanlıurfa\'da vefat etti.', category: 'tarih' },
    { year: 2026, text: 'Sonbahar Ekinoksu / Genel kabul gören tarih', category: 'turkiye' },
  ],
  '03-24': [
    { year: 809, text: 'Hârûnürreşîd vefatı', category: 'islam' },
    { year: 1603, text: 'I. Ahmed vefatı', category: 'osmanli' },
    { year: 1927, text: 'Taşkesenli İbrahim Efendi Hazretleri vefatı', category: 'islam' },
  ],
  '03-25': [
    { year: 1354, text: 'Muhammed Baba Semâsi (K.S.) nın vefatı', category: 'islam' },
    { year: 1726, text: 'Muhammed Kumul vefatı', category: 'islam' },
    { year: 1821, text: 'Yunanistan Bağımsızlığını İlan Etti', category: 'dunya' },
  ],
  '03-26': [
    { year: 2017, text: 'Çin devletinde Sincan’da kitlesel gözaltı sistemi büyük ölçekte kuruldu.', category: 'islam' },
    { year: 2026, text: 'Çaylak Fırtınası', category: 'turkiye' },
  ],
  '03-27': [
    { year: 1896, text: 'Alman fizikçi Wilhelm Conrad Röntgen, X-ışınlarını (Röntgen ışınları) keşfettiğini duyurdu.', category: 'dunya' },
  ],
  '03-28': [
    { year: 1920, text: 'Antep Savunması’nın önemli isimlerinden Şahin Bey, Elmalı Köprüsü civarında Fransız kuvvetleriyle yapılan çarpışmada şehit oldu.', category: 'turkiye' },
    { year: 1970, text: 'Gediz Depremi', category: 'turkiye' },
    { year: 2026, text: 'Ebreke Soğukları (28 - 30 Mart): Mart ayının son günlerinde yaşanan ve genellikle arkasından ani bir ısınma getiren son sert soğuklardandır.', category: 'turkiye' },
  ],
  '03-29': [
    { year: 2017, text: 'Çin devletinde tutuklulara işkence ve fiziksel/psikolojik kötü muamele uygulandığı yönündeki iddialar belgelendi.', category: 'islam' },
  ],
  '03-30': [
    { year: 1326, text: 'Osman Gazi vefatı', category: 'osmanli' },
    { year: 1432, text: 'Fâtih Sultan Mehmed, Edirne’de dünyaya geldi.', category: 'osmanli' },
    { year: 1856, text: 'Kırım Savaşı’nı sona erdiren Paris Antlaşması imzalandı. Osmanlı Devleti’nin Avrupa devletler hukukundan yararlanacağı kabul edildi.', category: 'osmanli' },
    { year: 2018, text: 'Büyük Dönüş Yürüyüşü: Gazze sınırında barışçıl eylem yapan sivil göstericilere keskin nişancılarla ateş açılması sonucu 170\'ten fazla kişi katledildi.', category: 'filistin' },
  ],
  '03-31': [
    { year: 656, text: 'Selmân-i Fârisi (r.a.) nın vefatı', category: 'islam' },
    { year: 1889, text: 'Eyfel Kulesi (Paris), Fransız Devrimi\'nin 100. yıl kutlamaları için tamamlanarak açılışı yapıldı.', category: 'dunya' },
  ],
  '04-01': [
    { year: 674, text: 'İstanbul\'un ilk büyük kuşatması', category: 'islam' },
    { year: 2002, text: 'Cenin Mülteci Kampı Saldırısı: İsrail ordusunun Cenin\'e düzenlediği yıkıcı ve kanlı askerî operasyonda çok sayıda sivil hayatını kaybetti.', category: 'filistin' },
    { year: 2017, text: 'Doğu Türkistan / Sincan: Çin yönetimi sözde \'Aşırılıkla Mücadele Yönetmeliği\'ni (De-extremification) yürürlüğe koyarak Uygur Türklerine dönük toplama kamplarını, zorunlu çalıştırmayı, kültürel-dinî baskıları ve zorlayıcı doğum kontrol politikalarını kurumsallaştırdı.', category: 'islam' },
  ],
  '04-03': [
    { year: 1325, text: 'Nizameddin Evliya hazretleri vefatı', category: 'islam' },
    { year: 1596, text: 'Osmanlı sadrazamlarından Koca Sinan Paşa vefat etti.', category: 'osmanli' },
    { year: 1939, text: 'Hafız İbrahim Demiralay vefatı', category: 'islam' },
  ],
  '04-04': [
    { year: 1900, text: 'Plevne savunmasının kahramanı Gazi Osman Paşa vefat etti.', category: 'osmanli' },
  ],
  '04-05': [
    { year: 1510, text: 'Şeyh Kerameddin r.a. vefatı', category: 'islam' },
    { year: 1925, text: 'Maraş\'a Türkiye Büyük Millet Meclisi tarafından İstiklâl Madalyası verildi.', category: 'turkiye' },
    { year: 1985, text: 'İstanbul\'un Tarihi Alanları, turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 1985, text: 'Göreme Milli Parkı ve Kapadokya, turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '04-06': [
    { year: 1453, text: 'İstanbul\'un kuşatmasının başlaması', category: 'islam' },
    { year: 1815, text: 'Terzi Baba Hazretleri vefatı', category: 'islam' },
    { year: 1985, text: 'Divriği Ulu Camii ve Darüşşifası (Sivas), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '04-07': [
    { year: 1762, text: 'Osmanlı sadrazamı ve şair Koca Ragıp Paşa vefat etti.', category: 'osmanli' },
    { year: 1789, text: 'I. Abdülhamid vefatı', category: 'osmanli' },
    { year: 1994, text: 'Ruanda Soykırımı Başladı', category: 'dunya' },
    { year: 2026, text: 'Kırlangıç Fırtınası', category: 'turkiye' },
  ],
  '04-08': [
    { year: 1986, text: 'Hattuşa: Hitit Başkenti (Çorum), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '04-09': [
    { year: 1588, text: 'Osmanlı mimarisinin en büyük isimlerinden Mimar Sinan vefat etti.', category: 'osmanli' },
    { year: 1948, text: 'Deir Yassin Katliamı: Siyonist milisler Kudüs yakınlarındaki köyde yüzlerce sivil Filistinliyi katletti.', category: 'dunya' },
  ],
  '04-10': [
    { year: 687, text: 'İbn Abbas r.a. hazretleri vefatı', category: 'islam' },
    { year: 1640, text: 'Ahmed Cüzeyri vefatı', category: 'islam' },
    { year: 1712, text: 'Osmanlı divan edebiyatının önemli şairlerinden Nâbî vefat etti.', category: 'osmanli' },
  ],
  '04-11': [
    { year: 624, text: 'Hz. Hasan bin Ali\'nin doğumu.', category: 'islam' },
    { year: 1987, text: 'Nemrut Dağı (Adıyaman), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2026, text: 'Leylek Fırtınası', category: 'turkiye' },
  ],
  '04-12': [
    { year: 687, text: 'Rebî‘ b. Huseym vefatı', category: 'islam' },
    { year: 1902, text: 'Ahmed Zühdü Paşa vefatı', category: 'osmanli' },
    { year: 1961, text: 'Uzaya Giden İlk İnsan (Yuri Gagarin) - SSCB', category: 'dunya' },
  ],
  '04-13': [
    { year: 1517, text: 'Yavuz Sultan Selim döneminde Mısır\'ın Osmanlı hâkimiyetine geçiş sürecinin önemli aşamalarından biri gerçekleşti.', category: 'islam' },
    { year: 1521, text: 'Kanuni Sultan Süleyman döneminde Belgrad\'ın fethi için Osmanlı ordusunun seferi başladı.', category: 'osmanli' },
    { year: 1919, text: 'Jallianwala Bagh Katliamı (Hindistan / İngiltere)', category: 'dunya' },
  ],
  '04-14': [
    { year: 1988, text: 'Hierapolis-Pamukkale (Denizli) ve Xanthos-Letoon (Antalya/Muğla), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '04-15': [
    { year: 1398, text: 'Alaeddin-i Sabir r.a. vefatı', category: 'islam' },
    { year: 1470, text: 'Fatih Camii ve Külliyesi\'nin inşası tamamlanarak İstanbul\'un önemli ilim ve kültür merkezlerinden biri hâline geldi.', category: 'osmanli' },
    { year: 1994, text: 'Safranbolu Şehri (Karabük), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2026, text: 'Denizlerde Genel Balık Av Yasağı Başlangıcı (Gırgır ve Trol)', category: 'turkiye' },
  ],
  '04-16': [
    { year: 1534, text: 'Osmanlı âlimi ve şeyhülislâmı Kemalpaşazâde Ahmed Şemseddin Efendi vefat etti.', category: 'osmanli' },
    { year: 1993, text: 'Ahmići Katliamı Gerçekleşti', category: 'dunya' },
  ],
  '04-17': [
    { year: 1757, text: 'III. Osman vefatı', category: 'osmanli' },
    { year: 2004, text: 'Abdülaziz er-Rantisi İsrail tarafından şehit edildi', category: 'dunya' },
    { year: 2026, text: 'Kocakarı Soğukları / Berdelacuz (Yaklaşık)', category: 'turkiye' },
    { year: 2026, text: 'Kuğu Fırtınası', category: 'turkiye' },
  ],
  '04-18': [
    { year: 1573, text: 'İmam-ı Birgivi Hazretleri vefatı', category: 'islam' },
    { year: 1897, text: 'Osmanlı-Yunan Savaşı başladı.', category: 'osmanli' },
    { year: 1998, text: 'Troya Antik Kenti (Çanakkale), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2022, text: 'Kuzey Irak\'ın Zap, Avaşin ve Metina bölgelerine yönelik başlatılan kapsamlı Pençe-Kilit Harekâtı.', category: 'turkiye' },
    { year: 2026, text: 'Abrulun Beşi ("Kork Abrul\'un beşinden, öküzü ayırır eşinden.")', category: 'turkiye' },
  ],
  '04-19': [
    { year: 792, text: 'Salih Merî hz vefatı', category: 'islam' },
    { year: 1945, text: 'Hafız Nuri vefatı', category: 'islam' },
  ],
  '04-20': [
    { year: 674, text: 'Hasan bin Sabit r.a. vefatı', category: 'islam' },
    { year: 1514, text: 'Yavuz Sultan Selim, Safevî Devleti üzerine düzenlenen İran Seferi\'ne çıktı.', category: 'osmanli' },
    { year: 2026, text: 'Sitte-i Sevr (Başlangıcı)', category: 'turkiye' },
    { year: 'MÖ 6. yüzyıl', text: 'Dâniyâl aleyhisselâmın vefatı', category: 'islam' },
  ],
  '04-21': [
    { year: 1037, text: 'Büyük İslam âlimi, hekim ve filozof İbn Sînâ vefat etti.', category: 'islam' },
  ],
  '04-22': [
    { year: 1453, text: 'Fatih Sultan Mehmed\'in emriyle Osmanlı donanmasına ait gemiler karadan yürütülerek Haliç\'e indirildi.', category: 'osmanli' },
  ],
  '04-23': [
    { year: 1521, text: 'Kanuni Sultan Süleyman\'ın Belgrad Seferi\'ne çıkışı', category: 'islam' },
  ],
  '04-25': [
    { year: 1928, text: 'Abdurrahim Arvasi r.a. vefatı', category: 'islam' },
    { year: 2011, text: 'Edirne Selimiye Camii ve Külliyesi, turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2012, text: 'Çatalhöyük Neolitik Kenti (Konya), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2026, text: 'Sitte-i Sevr (Bitişi)', category: 'turkiye' },
  ],
  '04-26': [
    { year: 1762, text: 'Şah Veliyyullah hazretleri vefatı', category: 'islam' },
    { year: 2014, text: 'Bursa ve Cumalıkızık ile Bergama Çok Katmanlı Kültürel Peyzaj Alanı, turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '04-27': [
    { year: 1909, text: 'II. Abdülhamid\'in tahttan indirilmesinin ardından V. Mehmed Reşad Osmanlı padişahı oldu.', category: 'osmanli' },
  ],
  '04-28': [
    { year: 1915, text: 'Çanakkale Cephesi\'nde Birinci Kirte Muharebesi başladı.', category: 'osmanli' },
    { year: 1992, text: 'Afganistan\'da Sovyet işgaline karşı mücadele eden mücahitler Kabil\'e girerek yönetimi ele geçirdi.', category: 'islam' },
    { year: 2015, text: 'Diyarbakır Kalesi ve Hevsel Bahçeleri ile Efes Antik Kenti (İzmir), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2016, text: 'Ani Arkeolojik Alanı (Kars), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '04-30': [
    { year: 711, text: 'Tarık bin Ziyad’ın Cebelitarık’ı geçerek İber Yarımadası’na ayak basmasıyla Endülüs’ün fethi resmen başladı.', category: 'islam' },
    { year: 1030, text: 'Gazneli Sultan Mahmud vefat etti.', category: 'islam' },
    { year: 1918, text: 'Muş, Osmanlı kuvvetleri tarafından Rus işgalinden kurtarıldı.', category: 'osmanli' },
  ],
  '05-01': [
    { year: 669, text: 'İstanbul seferi', category: 'islam' },
    { year: 677, text: 'Ebû Hüreyre vefatı', category: 'islam' },
    { year: 1147, text: '2. Haçlı Saldırılarının - Orduların yola çıkışı', category: 'islam' },
    { year: 1157, text: 'Büyük Selçuklu Devleti\'nin sona ermesi', category: 'islam' },
    { year: 1390, text: 'Yıldırım Bayezid Han tarafından Manisa fethedildi ve şehir Osmanlı hâkimiyetine girdi.', category: 'osmanli' },
    { year: 1890, text: 'Muhammed El Hazin hazretleri vefatı', category: 'islam' },
    { year: 2003, text: 'Bingöl Depremi', category: 'turkiye' },
  ],
  '05-02': [
    { year: 637, text: 'Kudüs, Hz. Ömer döneminde İslâm hâkimiyetine girdi. Şehrin teslimi barış yoluyla gerçekleşti ve Kudüs halkına din ve can güvenliği sağlayan bir ahidnâme verildi.', category: 'islam' },
    { year: 1205, text: 'İbrahim-i Havvas Hazretleri vefatı', category: 'islam' },
    { year: 1261, text: 'Ahi Evran vefatı', category: 'islam' },
    { year: 1978, text: 'Myanmar devletinde Operation Nagamin (Dragon King) adı verilen vatandaşlık ve kimlik kontrol operasyonu sırasında ordu ve güvenlik güçleri tarafından tutuklama, şiddet, tecavüz ve köylerden zorla çıkarma uygulamaları gerçekleştirildi.', category: 'islam' },
    { year: 2017, text: 'Aphrodisias Antik Kenti (Aydın), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2018, text: 'Göbeklitepe Arkeolojik Alanı (Şanlıurfa), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2026, text: 'Çiçek Fırtınası', category: 'turkiye' },
  ],
  '05-03': [
    { year: 1174, text: 'Nureddin Zengi’vefatı', category: 'islam' },
    { year: 1320, text: 'Seyyid Harun Veli hazretleri vefatı', category: 'islam' },
    { year: 1481, text: 'Fatih Sultan Mehmed Han, çıktığı sefer sırasında Gebze yakınlarında vefat etti.', category: 'osmanli' },
    { year: 1876, text: 'Abdülaziz vefatı', category: 'osmanli' },
    { year: 2016, text: 'Çin devletinde dinlerin “Çinlileştirilmesi” politikası güçlendirildi.', category: 'islam' },
  ],
  '05-04': [
    { year: 669, text: 'Hz. Peygamber\'in Medine\'ye hicretinden sonra kendisini evinde misafir eden Ebû Eyyûb el-Ensârî, İstanbul kuşatması sırasında vefat etti ve İstanbul civarına defnedildi.', category: 'islam' },
    { year: 1421, text: 'Osmanlı padişahı Çelebi Mehmed Han vefat etti; yerine oğlu II. Murad Han geçti.', category: 'osmanli' },
    { year: 1569, text: 'Şeyh Şaban-ı Veli hazretleri vefatı', category: 'islam' },
    { year: 2018, text: 'Çin devletinde Sincan’daki gözaltı sisteminin işgücü programlarıyla bağlantısı raporlandı.', category: 'islam' },
  ],
  '05-05': [
    { year: 728, text: 'Hasan-ı Basrî hazretleri vefatı', category: 'islam' },
    { year: 1361, text: 'Edirne\'nin Fethi', category: 'islam' },
    { year: 1601, text: 'Hoca Sadeddin Efendi vefatı', category: 'osmanli' },
    { year: 1978, text: 'Myanmar devletinde yaşanan operasyon ve baskıların sonucunda yaklaşık 200.000–250.000 Rohingyalı Müslüman Bangladeş’e sığındı.', category: 'islam' },
    { year: 2019, text: 'Tarihçi ve yazar Kadir Mısıroğlu İstanbul\'da vefat etti.', category: 'turkiye' },
    { year: 2021, text: 'Arslantepe Höyüğü (Malatya), turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
    { year: 2023, text: 'Gordion Antik Kenti (Ankara) ve Anadolu\'nun Orta Çağ Ahşap Hipostil Camileri, turkiye Dünya Mirası Listesi\'ne dahil edildi.', category: 'turkiye' },
  ],
  '05-06': [
    { year: 657, text: 'Veysel Karani Hazretleri vefatı', category: 'islam' },
    { year: 767, text: 'Hanefî mezhebinin imamı ve İslâm hukukunun büyük müctehidlerinden İmam-ı Âzam Ebû Hanîfe vefat etti.', category: 'islam' },
    { year: 1994, text: 'Manş Tüneli (Chunnel) resmi olarak açıldı; İngiltere ve Fransa\'yı deniz altından demiryoluyla birleştirdi.', category: 'dunya' },
    { year: 2026, text: 'Hıdırellez', category: 'turkiye' },
  ],
  '05-07': [
    { year: 1799, text: 'Cezzar Ahmed Paşa kumandasındaki Osmanlı kuvvetleri, Akka\'yı kuşatan Napolyon Bonapart\'ın Fransız ordusunun saldırılarını püskürttü.', category: 'osmanli' },
  ],
  '05-08': [
    { year: 1902, text: 'Fransız bilim insanları Charles Richet ve Paul Portier, anafilaksi (alerjik şok) olgusunu keşfetti.', category: 'dunya' },
    { year: 1982, text: 'Myanmar devletinde Vatandaşlık Yasası çıkarıldı. Rohingyalı Müslümanlar, vatandaşlık hakkına sahip olduğu kabul edilen etnik gruplar listesine alınmadı; bu durum Rohingyalı Müslümanların büyük bölümünü fiilen vatansız bıraktı.', category: 'islam' },
  ],
  '05-09': [
    { year: 1258, text: 'Osmanlı Devleti\'nin kurucusu Osman Gazi\'nin doğum yılı olarak geleneksel kronolojilerde 1258 yılı kaydedilir.', category: 'osmanli' },
  ],
  '05-10': [
    { year: 680, text: 'Âiz b. Amr ın vefatı', category: 'islam' },
    { year: 1485, text: 'Abapuş-i Veli hazretleri vefatı', category: 'islam' },
    { year: 1900, text: 'Hafız Ebu Said Sahib (K.S.) nın vefatı', category: 'islam' },
    { year: 1928, text: 'Hacı Tevfik Rıfkı r.a. vefatı', category: 'islam' },
    { year: 2021, text: 'Şeyh Cerrah ve Gazze Saldırıları: Kudüs\'teki evlerin gasp edilmesine karşı çıkan Filistinlilere ve Gazze\'ye yönelik büyük çaplı hava saldırıları düzenlendi.', category: 'filistin' },
  ],
  '05-11': [
    { year: 1944, text: 'SSCB’de Stalin yönetimi Kırım Tatarlarının tamamının Kırım’dan sürülmesine karar verdi.', category: 'islam' },
    { year: 1983, text: 'Myanmar devletinde yapılan nüfus sayımında Rohingyalı Müslümanlar vatandaş olarak sayılmadı ve vatandaşlık dışlanması kurumsallaştı.', category: 'islam' },
  ],
  '05-12': [
    { year: 1564, text: 'Abdülmecid Şirvani vefatı', category: 'islam' },
  ],
  '05-13': [
    { year: 1893, text: 'Nakşibendî-Hâlidî geleneğinin önemli isimlerinden Ahmed Ziyâeddin Gümüşhânevî vefat etti.', category: 'islam' },
  ],
  '05-14': [
    { year: 1235, text: 'Kutbüddin-i Bahtiyar Kaki hazretleri vefatı', category: 'islam' },
    { year: 1236, text: 'Muînüddîn-i Çeştî hz vefatı', category: 'islam' },
    { year: 2012, text: 'Myanmar devletinde Rakhine bölgesinde Rakhine Budistleri ile Rohingyalı Müslümanlar arasında büyük çaplı şiddet başladı. Köyler yakıldı, insanlar öldürüldü ve yaklaşık 140.000 kişi yerinden edildi.', category: 'islam' },
  ],
  '05-15': [
    { year: 714, text: 'Emevîlerin Orta Asya ve İberya\'daki ilerleyişi', category: 'islam' },
    { year: 718, text: 'Ebü\'t-Tufeyl hazretleri vefatı', category: 'islam' },
    { year: 756, text: 'Endülüs\'te bağımsız Emevîler kuruldu', category: 'islam' },
    { year: 1450, text: 'Seyyid Vakkas r.a. vefatı', category: 'islam' },
    { year: 1530, text: 'Hâce Muhammed Zâhid (K.S.) nın vefatı', category: 'islam' },
    { year: 1948, text: 'Nekbe (Büyük Felaket): İsrail\'in kuruluşuyla birlikte yüz binlerce Filistinli topraklarından sürgün edildi ve büyük katliamlar yaşandı.', category: 'filistin' },
    { year: 1997, text: 'Kuzey Irak\'ta PKK kamplarına yönelik başlatılan Çekiç Harekâtı.', category: 'turkiye' },
  ],
  '05-16': [
    { year: 1556, text: 'Sultan Divani hazretleri vefatı', category: 'islam' },
    { year: 1926, text: 'Son Osmanlı padişahı VI. Mehmed Vahdeddin Han San Remo\'da vefat etti.', category: 'osmanli' },
    { year: 1966, text: 'Çin devletinde Kültür Devrimi başladı.', category: 'islam' },
  ],
  '05-17': [
    { year: 804, text: 'Hanefî mezhebinin önde gelen fakihlerinden Muhammed eş-Şeybânî\'nin vefat yılı olarak 804 kaydedilir.', category: 'islam' },
    { year: 2000, text: 'Galatasaray, UEFA Kupası finalinde İngiliz ekibi Arsenal\'i penaltılarla yenerek kupayı kazanan ilk Türk futbol kulübü oldu.', category: 'turkiye' },
    { year: 2012, text: 'Myanmar devletinde 2012 yılının ikinci yarısında Rohingyalı Müslümanlar ve diğer Müslümanlar kamplara zorla yerleştirildi.', category: 'islam' },
  ],
  '05-18': [
    { year: 736, text: 'Katâde b. Diâme vefatı', category: 'islam' },
    { year: 1048, text: 'Pasinler Savaşı', category: 'islam' },
    { year: 1475, text: 'İbn-i Melek Hazretleri vefatı', category: 'islam' },
    { year: 1939, text: 'Şeyh Sadeddin Efendi vefatı', category: 'islam' },
    { year: 2001, text: 'Seyyid Muhammed Hafid Arvasi hazretleri vefatı', category: 'islam' },
  ],
  '05-20': [
    { year: 910, text: 'Cüneyd-i Bağdâdî vefatı', category: 'islam' },
    { year: 1481, text: 'Fatih Sultan Mehmed Han\'ın vefatının ardından II. Bayezid Han Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1902, text: 'Küba Cumhuriyeti Kuruldu', category: 'dunya' },
    { year: 1944, text: 'SSCB’de Kırım Tatarlarının kitlesel sürgünü gerçekleştirildi; halk Orta Asya’ya gönderildi.', category: 'islam' },
    { year: 2017, text: 'Myanmar devletinde güvenlik güçleri tarafından sivillerin öldürülmesi, köylerin yakılması, toplu tutuklamalar ve kadınlara yönelik cinsel şiddet gerçekleştirildiğine dair raporlar yayımlandı.', category: 'islam' },
  ],
  '05-21': [
    { year: 1421, text: 'Çelebi Mehmed (I. Mehmed) vefatı', category: 'osmanli' },
    { year: 1864, text: 'SSCB’de Çerkes sürgünü ve etnik temizlik olayları sona erdi; Çerkeslerin büyük bölümü Osmanlı topraklarına sürgün edildi.', category: 'islam' },
    { year: 2006, text: 'Karadağ Bağımsızlığını İlan Etti', category: 'dunya' },
  ],
  '05-22': [
    { year: 1766, text: 'İstanbul\'da büyük bir deprem meydana geldi; şehirde çok sayıda yapı zarar gördü ve Osmanlı döneminin en büyük İstanbul depremlerinden biri olarak kayda geçti.', category: 'osmanli' },
  ],
  '05-23': [
    { year: 1040, text: 'Dandanakan Savaşı', category: 'islam' },
    { year: 2014, text: 'Çin devletinde “Strike Hard” kampanyası başladı.', category: 'islam' },
  ],
  '05-24': [
    { year: 1040, text: 'Dandanakan Zaferi kazanıldı. Selçuklular Gazneliler karşısında büyük bir zafer elde ederek Horasan\'da güçlü bir devlet hâline geldi ve Büyük Selçuklu Devleti\'nin kuruluş süreci başladı.', category: 'selcuklu' },
    { year: 1992, text: 'Prijedor Katliamı ve Toplama Kampları Süreci Başladı', category: 'dunya' },
  ],
  '05-25': [
    { year: 1895, text: 'Osmanlı ilim, hukuk ve tarih geleneğinin önemli isimlerinden Ahmed Cevdet Paşa vefat etti.', category: 'osmanli' },
    { year: 1946, text: 'Ürdün Haşimi Krallığı Kuruldu', category: 'dunya' },
    { year: 1983, text: 'TSK tarafından Kuzey Irak\'a gerçekleştirilen ilk sınır ötesi sıcak takip ve tarama operasyonu.', category: 'turkiye' },
  ],
  '05-26': [
    { year: 1512, text: 'II. Bayezid Han vefat etti; Yavuz Sultan Selim Han Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1883, text: 'Abdülkadir-i Cezayiri r.a. vefatı', category: 'islam' },
    { year: 2024, text: 'Myanmar devletinde Hoyyar Siri köyünde Arakan Army’nin ilerleyişi sırasında kaçmaya çalışan Rohingyalı Müslüman sivillerin toplu olarak öldürüldüğüne dair kanıtlar ortaya çıktı.', category: 'islam' },
  ],
  '05-27': [
    { year: 1578, text: 'Beşiktaşlı Yahya Efendi Hazretleri vefatı', category: 'islam' },
    { year: 1937, text: 'San Francisco\'nun simgesi olan ve dönemin mühendislik harikası Golden Gate Köprüsü yaya trafiğine açıldı.', category: 'dunya' },
    { year: 1942, text: 'Kur\'an-ı Kerîm\'in Türkçe tefsir ve meal çalışmasıyla tanınan Elmalılı Muhammed Hamdi Yazır vefat etti.', category: 'islam' },
  ],
  '05-28': [
    { year: 1348, text: 'Osmanlılar Rumeli\'ye geçti ve Osmanlı Devleti\'nin Balkanlar\'daki kalıcı hâkimiyetinin temellerinden biri atıldı.', category: 'osmanli' },
    { year: 1812, text: 'Osmanlı Devleti ile Rusya arasındaki savaşı sona erdiren Bükreş Antlaşması imzalandı.', category: 'osmanli' },
    { year: 1918, text: 'Azerbaycan Demokratik Cumhuriyeti bağımsızlığını ilân etti; Kafkas İslâm Ordusu Azerbaycan\'ın savunulması için bölgeye yöneldi.', category: 'islam' },
    { year: 2019, text: 'Kuzey Irak\'ta terör yuvalarına karşı Pençe Operasyonları serisi başlatıldı.', category: 'turkiye' },
  ],
  '05-29': [
    { year: 1453, text: 'İstanbul\'un Fethi: Sultan II. Mehmed (Fatih) kumandasındaki Osmanlı ordusu 53 günlük kuşatmanın ardından Konstantinopolis\'i fethetti; Doğu Roma (Bizans) İmparatorluğu tarihe karıştı, Orta Çağ kapanıp Yeni Çağ başladı ve fethin sembolü olan Ayasofya camiye dönüştürülerek cuma namazı kılındı.', category: 'osmanli' },
    { year: 1774, text: 'III. Mustafa vefatı', category: 'osmanli' },
    { year: 1953, text: 'Sir Edmund Hillary ve Tenzing Norgay, Everest Dağı\'nın zirvesine ulaşan ilk insanlar oldu.', category: 'dunya' },
    { year: 2016, text: 'Yavuz Sultan Selim Köprüsü (3. Boğaz Köprüsü) tamamlanarak ulaşıma açıldı.', category: 'dunya' },
    { year: 2024, text: 'Myanmar devletinde Maungdaw yakınlarında çatışmalardan kaçan Rohingyalı Müslümanların üzerine drone saldırıları ve topçu ateşi yapıldığı, yaklaşık 200 kişinin öldüğü bildirildi.', category: 'islam' },
  ],
  '05-30': [
    { year: 1453, text: 'İstanbul\'un fethinden sonra şehrin Osmanlı idaresine geçirilmesi ve yeniden imarı süreci başladı.', category: 'osmanli' },
    { year: 1876, text: 'Sultan Abdülaziz Han tahttan indirildi ve V. Murad Osmanlı padişahı oldu.', category: 'osmanli' },
  ],
  '05-31': [
    { year: 1237, text: 'Anadolu Selçuklu Sultanı I. Alâeddin Keykubad vefat etti.', category: 'selcuklu' },
    { year: 1481, text: 'Fatih Sultan Mehmed vefatı', category: 'osmanli' },
    { year: 1664, text: 'Osmanlı kuvvetleri Kanije bölgesindeki mücadelelerde önemli bir askerî başarı elde etti.', category: 'osmanli' },
    { year: 1946, text: 'Varto-Hınıs Depremi', category: 'turkiye' },
    { year: 2010, text: 'Mavi Marmara Saldırısı: Gazze\'ye insani yardım götüren gemiye uluslararası sularda düzenlenen baskında 10 Türk vatandaşı katledildi.', category: 'turkiye' },
  ],
  '06-01': [
    { year: 632, text: 'Ridde Savaşları', category: 'islam' },
    { year: 661, text: 'Emevî Devleti\'nin kuruluşu', category: 'islam' },
    { year: 698, text: 'Kartaca\'nın Fethi', category: 'islam' },
    { year: 827, text: 'Sicilya\'nın Müslümanlar tarafından fethi', category: 'islam' },
    { year: 835, text: 'Ebû Îsâ Hallâd b. Hâlid’in vefatı', category: 'islam' },
    { year: 1171, text: 'Eyyûbî Devleti\'nin kuruluşu', category: 'islam' },
    { year: 1466, text: 'Ahmed Bican ın vefatı', category: 'islam' },
    { year: 1533, text: 'Irakeyn Seferi sonrasında Osmanlı-Safevî ilişkilerinde yeni dönem başladı.', category: 'osmanli' },
    { year: 1967, text: 'The Beatles, efsanevi Sgt. Pepper’s Lonely Hearts Club Band albümünü çıkardı.', category: 'dunya' },
  ],
  '06-02': [
    { year: 455, text: 'Vandallar Roma’yı ele geçirerek iki haftalık yağmayı başlattı.', category: 'dunya' },
    { year: 1953, text: 'II. Elizabeth’in taç giyme töreni yapıldı.', category: 'dunya' },
  ],
  '06-03': [
    { year: 633, text: 'Zâtüsselâsil Savaşı', category: 'islam' },
    { year: 1098, text: '1. Haçlı Saldırılarının - Antakya\'nın düşüşü', category: 'islam' },
    { year: 2006, text: 'Sırbistan Devleti Yeniden Yapılandı', category: 'dunya' },
  ],
  '06-04': [
    { year: 1878, text: 'Kıbrıs Sözleşmesi imzalandı; adanın yönetimi İngiltere’ye bırakıldı.', category: 'osmanli' },
  ],
  '06-05': [
    { year: 633, text: 'Müsennâ b. Hârise\'nin Irak seferleri', category: 'islam' },
    { year: 1533, text: 'İbrahim Tennuri r.a. vefatı', category: 'islam' },
    { year: 1824, text: 'Abdulaziz Dehlevi hazretleri vefatı', category: 'islam' },
    { year: 1967, text: 'Altı Gün Savaşı başladı.', category: 'dunya' },
  ],
  '06-06': [
    { year: 1944, text: 'Normandiya Çıkarması başladı.', category: 'dunya' },
  ],
  '06-07': [
    { year: 634, text: 'Ecnâdeyn Savaşı', category: 'islam' },
    { year: 795, text: 'İmâm Mâlik vefatı', category: 'islam' },
    { year: 1099, text: 'Birinci Haçlı Seferi’nde Kudüs kuşatması başladı.', category: 'islam' },
    { year: 1967, text: 'İsrail kuvvetleri Doğu Kudüs’ü ele geçirdi.', category: 'dunya' },
    { year: 2018, text: 'Çin devletinde çok sayıda Uygur çocuğun yatılı okullara yerleştirildiği bildirildi.', category: 'islam' },
  ],
  '06-08': [
    { year: 632, text: 'Hz. Muhammed Medine’de vefat etti.', category: 'islam' },
  ],
  '06-09': [
    { year: 634, text: 'Suriye ve Irak fetihlerinin başlaması', category: 'islam' },
    { year: 1815, text: 'Viyana Kongresi Son Senedi imzalanarak Avrupa haritası yeniden çizildi.', category: 'dunya' },
    { year: 1827, text: 'Mevlana Halid-i Bağdadi hazretleri vefatı', category: 'islam' },
  ],
  '06-10': [
    { year: 1190, text: 'İmparator Friedrich Barbarossa Göksu Nehri’nde boğularak öldü.', category: 'dunya' },
    { year: 1329, text: 'Maltepe/Pelekanon Savaşı', category: 'islam' },
    { year: 1967, text: 'Altı Gün Savaşı sona erdi.', category: 'dunya' },
  ],
  '06-11': [
    { year: 635, text: 'Dımaşk\'ın (Şam) Fethi', category: 'islam' },
    { year: 1395, text: 'Ebu Fakih hz vefatı', category: 'islam' },
    { year: 1967, text: 'BM’nin ateşkes çağrısıyla Altı Gün Savaşı fiilen bitti.', category: 'dunya' },
  ],
  '06-12': [
    { year: 799, text: 'İbnü\'s-Semmâk hazretleri vefatı', category: 'islam' },
    { year: 1629, text: 'Eskici Mehmed Dede r.a. vefatı', category: 'islam' },
    { year: 1665, text: 'Londra Büyük Veba Salgını şiddetlendi.', category: 'dunya' },
    { year: 1925, text: 'Ebü\'l Hayr hazretleri vefatı', category: 'islam' },
  ],
  '06-13': [
    { year: 635, text: 'Fihl Savaşı', category: 'islam' },
    { year: 1327, text: 'Hâce Arif Râmitini (K.S.) nın vefatı', category: 'islam' },
    { year: 1381, text: 'İngiliz Köylü İsyanı’nda isyancılar Londra’ya girdi.', category: 'dunya' },
    { year: 1525, text: 'Martin Luther ile Katharina von Bora evlendi.', category: 'dunya' },
  ],
  '06-14': [
    { year: 1777, text: 'ABD Kongresi, yıldız ve çizgili ulusal bayrağı kabul etti.', category: 'dunya' },
    { year: 1951, text: 'İlk ticari bilgisayarlardan UNIVAC I, ABD Nüfus Bürosu’na teslim edildi.', category: 'dunya' },
  ],
  '06-15': [
    { year: 636, text: 'Yermük Savaşı', category: 'islam' },
    { year: 641, text: 'Alâ b. Hadramî vefatı', category: 'islam' },
    { year: 670, text: 'Abdurrahman b. Semüre r.a. vefatı', category: 'islam' },
    { year: 713, text: 'Mâverâünnehir ve Orta Asya yönündeki fetihler hızlandı', category: 'islam' },
    { year: 1107, text: 'Ebu-l Vefa Hazretleri vefatı', category: 'islam' },
    { year: 1215, text: 'İngiltere Kralı John, Magna Carta’yı kabul etti.', category: 'dunya' },
    { year: 1389, text: 'I. Kosova Savaşı', category: 'islam' },
    { year: 1826, text: 'Vak’a-i Hayriyye gerçekleşti; Yeniçeri Ocağı kaldırıldı.', category: 'osmanli' },
    { year: 2020, text: 'Kuzey Irak\'taki hedeflere yönelik Pençe-Kartal ve Pençe-Şimşek operasyonları.', category: 'turkiye' },
  ],
  '06-16': [
    { year: 661, text: 'Şam, Emevi Devleti\'nin başkenti oldu', category: 'islam' },
    { year: 1201, text: 'Ebü’l-Ferec İbnü’l-Cevzî’vefatı', category: 'islam' },
    { year: 1950, text: '18 yıl süren Türkçe ezan uygulaması son buldu; Ezan-ı Muhammedi öz vatanında aslına döndü.', category: 'tarih' },
    { year: 1963, text: 'Valentina Tereşkova, uzaya çıkan ilk kadın oldu.', category: 'dunya' },
  ],
  '06-17': [
    { year: 638, text: 'Hz. Ömer Devrinde Kudüs\'ün Fethi: Kudüs Patriği Sophronios şehri bizzat Halife Hz. Ömer\'e teslim etti; Hristiyan ahaliye din, vicdan ve mülkiyet güvenliği teminatı veren tarihi \'Kudüs Emânnâmesi\' ilan edildi.', category: 'islam' },
    { year: 656, text: 'Hz. Osman\'uz Zinnureyn (r.a.) in vefatı', category: 'islam' },
    { year: 1579, text: 'Francis Drake Kaliforniya kıyılarına ulaşarak bölgeyi İngiltere adına ilan etti.', category: 'dunya' },
    { year: 1940, text: 'SSCB, Baltık devletlerini işgal etmeye başladı.', category: 'dunya' },
  ],
  '06-18': [
    { year: 1815, text: 'Waterloo Muharebesi’nde Napolyon yenildi; Napolyon Savaşları sona erdi.', category: 'dunya' },
    { year: 1905, text: 'Behrullah Efendi r.a. vefatı', category: 'islam' },
    { year: 1953, text: 'Mısır’da monarşi kaldırılarak cumhuriyet ilan edildi.', category: 'dunya' },
  ],
  '06-19': [
    { year: 640, text: 'Kaysâriye\'nin Fethi', category: 'islam' },
    { year: 1867, text: 'Meksika İmparatoru I. Maximilian idam edildi.', category: 'dunya' },
    { year: 1913, text: 'İkinci Balkan Savaşı dönemindeki çatışmalar başladı.', category: 'dunya' },
  ],
  '06-20': [
    { year: 451, text: 'Attila ile Roma ordusu arasında Katalaunum Muharebesi yapıldı.', category: 'dunya' },
    { year: 1837, text: 'Kraliçe Victoria Britanya tahtına çıktı.', category: 'dunya' },
    { year: 2026, text: 'Yaz Gündönümü: Kuzey Yarımküre\'de yılın en uzun gündüzü (en kısa gecesi), Güney Yarımküre\'de ise yılın en uzun gecesi (en kısa gündüzü) yaşandı.', category: 'dunya' },
  ],
  '06-21': [
    { year: 634, text: 'Köprü Savaşı', category: 'islam' },
    { year: 1521, text: 'Belgrad\'ın kuşatılması', category: 'islam' },
    { year: 1527, text: 'İtalyan düşünür Niccolò Machiavelli hayatını kaybetti.', category: 'dunya' },
    { year: 1937, text: 'Hacı Tevfik Efendi vefatı', category: 'islam' },
    { year: 2026, text: 'En Uzun Gündüz (Yaz Gündönümü)', category: 'turkiye' },
  ],
  '06-22': [
    { year: 1515, text: 'Hacı Abdullah Halife r.a. vefatı', category: 'islam' },
    { year: 1600, text: 'Muhammed Hâcegi Emkengi (K.S.) nın vefatı', category: 'islam' },
    { year: 1691, text: 'II. Süleyman vefatı', category: 'osmanli' },
    { year: 1940, text: 'Fransa, Almanya ile ateşkes imzaladı.', category: 'dunya' },
    { year: 1941, text: 'Almanya’nın SSCB’ye saldırmasıyla Barbarossa Harekâtı başladı.', category: 'dunya' },
    { year: 2002, text: 'A Millî Futbol Takımımız, FIFA Dünya Kupası\'nda Güney Kore\'yi mağlup ederek tarihindeki en büyük derece olan Dünya Üçüncülüğü\'nü elde etti.', category: 'turkiye' },
  ],
  '06-23': [
    { year: 636, text: 'Kādisiye Savaşı', category: 'islam' },
    { year: 930, text: 'İzlanda’da Althing kurularak parlamenter sistemin temeli atıldı.', category: 'dunya' },
    { year: 1314, text: 'İskoçya Bağımsızlık Savaşı’nda Bannockburn Muharebesi başladı.', category: 'dunya' },
  ],
  '06-24': [
    { year: 644, text: 'Hind bint Amr b. Harâm r.a. vefatı', category: 'islam' },
    { year: 1099, text: 'Kudüs Kuşatması’nda Haçlılar surlara yönelik saldırıları yoğunlaştırdı.', category: 'islam' },
    { year: 1864, text: 'Abdülfettah Bağdadi vefatı', category: 'islam' },
    { year: 1932, text: 'Siyam’da anayasal monarşiye geçişi sağlayan devrim gerçekleşti.', category: 'dunya' },
  ],
  '06-25': [
    { year: 637, text: 'Medâin (Ktesifon) Fethi', category: 'islam' },
    { year: 1678, text: 'Kandiye Kuşatması’nda Osmanlı-Venedik mücadelesinin son safhası yaşandı.', category: 'osmanli' },
    { year: 1861, text: 'Sultan Abdülmecid’in vefatı', category: 'islam' },
    { year: 1899, text: 'Fethullah Verkanisi Hazretleri vefatı', category: 'islam' },
    { year: 1950, text: 'Kuzey Kore’nin saldırısıyla Kore Savaşı başladı.', category: 'dunya' },
    { year: 1991, text: 'Hırvatistan Bağımsızlığını İlan Etti', category: 'dunya' },
  ],
  '06-26': [
    { year: 1945, text: 'Birleşmiş Milletler Şartı 50 ülke tarafından imzalandı.', category: 'dunya' },
  ],
  '06-27': [
    { year: 637, text: 'Celûlâ Savaşı', category: 'islam' },
    { year: 711, text: 'Enes b. Mâlik r.a. vefatı', category: 'islam' },
    { year: 1950, text: 'BM, üye ülkelere Güney Kore’ye askeri yardım yapma çağrısı yaptı.', category: 'dunya' },
  ],
  '06-28': [
    { year: 1389, text: 'I. Murad vefatı', category: 'osmanli' },
    { year: 1914, text: 'Franz Ferdinand’ın Saraybosna’da öldürülmesi I. Dünya Savaşı’nı tetikledi.', category: 'dunya' },
    { year: 1919, text: 'I. Dünya Savaşı’nı bitiren Versailles Antlaşması imzalandı.', category: 'dunya' },
  ],
  '06-29': [
    { year: 638, text: 'Sûs\'un Fethi', category: 'islam' },
    { year: 1149, text: 'İkinci Haçlı Seferi başarısız oldu; Kudüs Krallığı dengeleri yeniden şekillendi.', category: 'islam' },
    { year: 1925, text: 'İstiklal Mahkemeleri kararıyla İslam âlimi Şeyh Said ve dava arkadaşları Diyarbakır\'da idam edildi.', category: 'tarih' },
    { year: 1976, text: 'Seyşeller, İngiltere’den bağımsızlığını ilan etti.', category: 'dunya' },
  ],
  '06-30': [
    { year: 1908, text: 'Sibirya’da büyük patlamaya yol açan Tunguska olayı gerçekleşti.', category: 'dunya' },
    { year: 1934, text: 'Almanya’da Nazi yönetiminin siyasi tasfiyesi Uzun Bıçaklar Gecesi başladı.', category: 'dunya' },
  ],
  '07-01': [
    { year: 640, text: 'Hûzistan\'ın Fethi', category: 'islam' },
    { year: 767, text: 'Eimme-i Erbaa nın vefatı', category: 'islam' },
    { year: 1077, text: 'Anadolu Selçuklu Devleti\'nin kuruluş süreci', category: 'islam' },
    { year: 1522, text: 'Kanuni Sultan Süleyman komutasındaki Osmanlı ordusu Rodos Kuşatması\'nı başlattı.', category: 'osmanli' },
    { year: 1736, text: 'III. Ahmed vefatı', category: 'osmanli' },
    { year: 1839, text: 'II. Mahmud vefatı', category: 'osmanli' },
    { year: 1926, text: 'Kabotaj Kanunu yürürlüğe girdi; Türk karasularında yolcu ve yük taşıma hakkı Türk bayraklı gemilere devredildi.', category: 'turkiye' },
    { year: 1944, text: 'Küresel finans mimarisini belirleyen Bretton Woods Konferansı başladı.', category: 'dunya' },
    { year: 2016, text: 'Osmangazi Köprüsü hizmete açıldı.', category: 'ulasim-altyapi' },
  ],
  '07-02': [
    { year: 1243, text: 'Kösedağ Savaşı gerçekleşti; Anadolu Selçuklu Devleti, Moğol (İlhanlı) ordusuna yenilerek ilhak ve gerileme sürecine girdi.', category: 'selcuklu' },
    { year: 2017, text: 'Çin devletinde Uygur ailelerinin evlerine devlet görevlilerinin yerleştirilmesi uygulaması yaygınlaştırıldı.', category: 'islam' },
  ],
  '07-03': [
    { year: 642, text: 'Nihâvend Savaşı', category: 'islam' },
    { year: 1243, text: 'Kösedağ Savaşı', category: 'islam' },
    { year: 1260, text: 'Ayn Calut Savaşı: Memlûk Devleti, Moğol ordusunu tarihte ilk kez büyük bir bozguna uğratarak durdurdu.', category: 'islam' },
    { year: 1918, text: 'V. Mehmed Reşad vefatı', category: 'osmanli' },
  ],
  '07-04': [
    { year: 1187, text: 'Hıttîn Savaşı ve Zaferi: Selâhaddîn-i Eyyûbî kumandasındaki İslâm ordusu, Haçlı ordusunu Hıttîn mevkiinde kesin bir mağlubiyete uğratıp Kudüs Krallığı ordusunu imha etti ve Kudüs\'ün fethinin önünü açtı.', category: 'islam' },
    { year: 1546, text: 'Barbaros Hayreddin Paşa vefatı', category: 'islam' },
    { year: 1776, text: 'Amerikan Bağımsızlık Bildirgesi kabul edildi; Amerika Birleşik Devletleri resmen kuruldu.', category: 'dunya' },
  ],
  '07-05': [
    { year: 639, text: 'Mısır seferinin başlaması', category: 'islam' },
    { year: 1687, text: 'Isaac Newton, evrensel kütle çekim yasasını açıklayan "Philosophiae Naturalis Principia Mathematica" adlı eserini yayımladı.', category: 'dunya' },
    { year: 2009, text: 'Çin devletinde Urumçi olayları başladı.', category: 'islam' },
    { year: 2017, text: 'Çin devletinde 2017–2019 döneminde Uygur ve diğer Müslüman azınlıklardan çok sayıda kişi toplama/gözaltı kamplarında tutuldu.', category: 'islam' },
  ],
  '07-06': [
    { year: 1517, text: 'Kutsal Emanetler, Yavuz Sultan Selim\'in Mısır Seferı sonrası İstanbul\'a ulaştırıldı ve Osmanlı Devleti Hilafet merkezi oldu.', category: 'osmanli' },
  ],
  '07-07': [
    { year: 640, text: 'Helyopolis Savaşı', category: 'islam' },
    { year: 1456, text: 'Fatih Sultan Mehmet komutasındaki Osmanlı ordusu Belgrat Kuşatması\'nı başlattı.', category: 'osmanli' },
    { year: 1566, text: 'Kanuni Sultan Süleyman’ın vefatı', category: 'islam' },
  ],
  '07-08': [
    { year: 1265, text: 'Ferîdüddîn Genc-i Şeker hz vefatı', category: 'islam' },
    { year: 1833, text: 'Osmanlı Devleti ile Rusya arasında karşılıklı yardımlaşma ve boğazlar statüsünü belirleyen Hünkâr İskelesi Antlaşması imzalandı.', category: 'osmanli' },
    { year: 2014, text: 'Koruyucu Hat Operasyonu: Gazze\'ye düzenlenen şiddetli kara ve hava saldırılarında 2.200\'den fazla Filistinli şehit edildi.', category: 'filistin' },
  ],
  '07-09': [
    { year: 641, text: 'Babilon Kalesi\'nin Fethi', category: 'islam' },
    { year: 1711, text: 'Prut Savaşı kazanılarak Rus ordusu kuşatıldı ve Prut Antlaşması ile Azak Kalesi Osmanlı\'ya geri verildi.', category: 'osmanli' },
  ],
  '07-10': [
    { year: 718, text: 'Ebû Osman en-Nehdî vefatı', category: 'islam' },
    { year: 1921, text: 'Kütahya-Eskişehir Muharebeleri başladı; Türk ordusu Yunan saldırılarına karşı savunma hatları oluşturdu.', category: 'turkiye' },
  ],
  '07-11': [
    { year: 641, text: 'İskenderiye\'nin Fethi', category: 'islam' },
    { year: 1492, text: 'Molla Câmî hazretleri vefatı', category: 'islam' },
    { year: 1836, text: 'İbni Abidin r.a. vefatı', category: 'islam' },
    { year: 1895, text: 'Seyyid Ahmed el-Beruki hazretleri vefatı', category: 'islam' },
    { year: 1995, text: 'Srebrenitsa Katliamı: İkinci Dünya Savaşı sonrası Avrupa\'nın en büyük soykırımında binlerce Boşnak Müslüman katledildi.', category: 'dunya' },
    { year: 2021, text: 'Milli sporcumuz Naim Süleymanoğlu\'nun Olimpiyat tarihindeki efsanevi rekorları ve Türk sporunun uluslararası gurur tablosu yinelendi.', category: 'turkiye' },
  ],
  '07-12': [
    { year: 1521, text: 'Osmanlı ordusu Sirem bölgesindeki stratejik Böğürdelen (Šabac) Kalesi\'ni fethetti.', category: 'osmanli' },
  ],
  '07-13': [
    { year: 642, text: 'Mısır\'ın fethinin tamamlanması', category: 'islam' },
    { year: 1259, text: 'Hâce Arif Rivgiri (K.S.) nın vefatı', category: 'islam' },
    { year: 1878, text: 'Berlin Antlaşması: 93 Harbi (1877-1878 Osmanlı-Rus Savaşı) sonrası imzalanan antlaşmayla Sırbistan, Karadağ ve Romanya bağımsızlık kazandı; Bulgaristan Prensliği kuruldu ve Osmanlı Devleti Balkanlar\'da ve Doğu Anadolu\'da (Kars, Ardahan, Batum) ağır toprak kaybına uğradı.', category: 'osmanli' },
    { year: 2024, text: 'Muhammed Deif İsrail tarafından şehit edildi', category: 'dunya' },
  ],
  '07-14': [
    { year: 1789, text: 'Fransız İhtilali\'nin sembolü olan Bastille Hapishanesi halk tarafından basıldı ve yakın çağ dönemi başladı.', category: 'dunya' },
  ],
  '07-15': [
    { year: 647, text: 'Trablusgarp ve İfrîkıye seferleri', category: 'islam' },
    { year: 751, text: 'Talas Savaşı', category: 'islam' },
    { year: 1099, text: 'I. Haçlı Seferi ve Kudüs\'ün İşgali: Haçlı orduları beş haftalık kuşatmanın ardından Kudüs\'ü ve Mescid-i Aksâ\'yı ele geçirdi; şehirde on binlerce sivil Müslüman ve Yahudi katledildi ve Kudüs Krallığı kuruldu.', category: 'islam' },
    { year: 2016, text: '15 Temmuz Demokrasi ve Millî Birlik Günü: Hain darbe girişimine karşı milletin destansı kıyamı.', category: 'turkiye' },
  ],
  '07-16': [
    { year: 622, text: 'İslam takviminin (Hicri Takvim) başlangıcı kabul edilen Hz. Muhammed\'in Mekke\'den Medine\'ye hicreti gerçekleşti.', category: 'islam' },
    { year: 711, text: 'Endülüs İslam Devleti\'nin İber Yarımadası\'nda kurulması/başlangıcı', category: 'islam' },
    { year: 1734, text: 'İsmail Fakirullah Hazretleri vefatı', category: 'islam' },
    { year: 1874, text: 'Ahmed Siyahi vefatı', category: 'islam' },
  ],
  '07-17': [
    { year: 651, text: 'Sâsânî hükümdarı III. Yezdicerd\'in ölümü', category: 'islam' },
    { year: 656, text: 'Zübeyr b. Avvâm vefatı', category: 'islam' },
    { year: 1204, text: 'Dördüncü Haçlı Seferi\'nde Haçlılar Konstantinopolis\'i işgal ederek Latin İmparatorluğu\'nu kurdu ve şehri yağmaladı.', category: 'dunya' },
    { year: 1588, text: 'Mimar Sinan vefatı', category: 'islam' },
  ],
  '07-18': [
    { year: 64, text: 'Büyük Roma Yangını başladı; altı gün süren yangın şehrin büyük bölümünü küle çevirdi.', category: 'dunya' },
    { year: 1597, text: 'Şemseddin Ahmed Sivasi r.a. vefatı', category: 'islam' },
  ],
  '07-19': [
    { year: 650, text: 'Horasan ve İran\'ın doğusunda fetihler', category: 'islam' },
    { year: 711, text: 'Kuzey Afrika Valisi Musa b. Nusayr komutanı Tarık b. Ziyad, Kadiks (Guadalete) Savaşı\'nı kazanarak Endülüs Emevi Devleti\'nin temelini attı.', category: 'islam' },
  ],
  '07-20': [
    { year: 1216, text: 'Aslan Baba r.a. vefatı', category: 'islam' },
    { year: 1402, text: 'Ankara Savaşı: Yıldırım Bayezid ile Timur arasındaki savaşta Osmanlı ordusu mağlup oldu ve Fetret Devri başladı.', category: 'osmanli' },
    { year: 1969, text: 'Apollo 11 uzay aracı Ay\'a ulaştı; Neil Armstrong Ay yüzeyine ayak basan ilk insan oldu.', category: 'dunya' },
    { year: 1974, text: 'Kıbrıs Barış Harekâtı başladı; Türk Silahlı Kuvvetleri adadaki soydaşlarımızın güvenliği için adaya çıktı.', category: 'turkiye' },
  ],
  '07-21': [
    { year: 652, text: 'Zâtü\'s-Savârî Deniz Savaşı', category: 'islam' },
    { year: 1403, text: 'Yıldırım Bayezid vefatı', category: 'osmanli' },
    { year: 1774, text: 'Küçük Kaynarca Antlaşması imzalandı; Osmanlı Devleti Kırım üzerindeki hakimiyetini kaybetti ve Rusya\'ya kapitülasyonlar verdi.', category: 'osmanli' },
  ],
  '07-22': [
    { year: 1521, text: 'Belgrad\'ın fethi', category: 'islam' },
    { year: 1532, text: 'Kanuni Sultan Süleyman komutasındaki Osmanlı ordusu Avusturya üzerine Alman Seferi\'ne çıktı.', category: 'osmanli' },
    { year: 1922, text: 'Mısır Krallığı Bağımsızlığını Kazandı', category: 'dunya' },
  ],
  '07-23': [
    { year: 654, text: 'Kıbrıs seferi', category: 'islam' },
    { year: 1908, text: 'İkinci Meşrutiyet ilan edildi; Kanun-ı Esasi yeniden yürürlüğe sokuldu.', category: 'osmanli' },
  ],
  '07-24': [
    { year: 2020, text: 'Ayasofya-i Kebir Cami-i Şerifi yeniden ibadete açılarak özgürlüğüne kavuştu.', category: 'tarih' },
  ],
  '07-25': [
    { year: 656, text: 'Cemel Vak\'ası', category: 'islam' },
    { year: 1139, text: 'Ourique Savaşı kazanılarak Portekiz Krallığı bağımsızlığını ilan etti.', category: 'dunya' },
    { year: 1978, text: 'Dünyanın ilk tüp bebek (in vitro fertilizasyon) yöntemiyle doğan bebeği Louise Brown dünyaya geldi.', category: 'dunya' },
    { year: 2014, text: 'Ankara-İstanbul Yüksek Hızlı Tren hattı açıldı.', category: 'ulasim-altyapi' },
  ],
  '07-26': [
    { year: 922, text: 'Hallâc-ı Mansûr vefatı', category: 'islam' },
    { year: 1552, text: 'Turgut Reis komutasındaki Osmanlı donanması Ponza Deniz Zaferi\'ni kazanarak İtalyan kıyılarında kontrol sağladı.', category: 'osmanli' },
  ],
  '07-27': [
    { year: 657, text: 'Sıffîn Savaşı', category: 'islam' },
    { year: 1302, text: 'Koyunhisar (Bafeus / Bapheus) Savaşı ve Zaferi: Osman Gazi kumandasındaki Osmanlı kuvvetleri Bizans tekfurlarının birleşik ordusunu mağlup etti; bu zafer Osmanlı Beyliği\'nin bağımsızlığını ve devletleşme sürecini başlatan ilk büyük askerî zafer kabul edilir.', category: 'osmanli' },
  ],
  '07-28': [
    { year: 1148, text: '2. Haçlı Saldırılarının Bitiş - Şam Kuşatması\'nın başarısızlıkla sonuçlanıp kaldırılması', category: 'islam' },
    { year: 1402, text: 'Ankara Savaşı', category: 'islam' },
    { year: 1914, text: 'Avusturya-Macaristan\'ın Sırbistan\'a savaş ilan etmesiyle Birinci Dünya Savaşı resmen başladı.', category: 'dunya' },
  ],
  '07-29': [
    { year: 658, text: 'Nehrevân Savaşı', category: 'islam' },
    { year: 1588, text: 'Gravelines Deniz Savaşı gerçekleşti; İngiliz Donanması İspanyol Yenilmez Armada\'sını bozguna uğrattı.', category: 'dunya' },
  ],
  '07-30': [
    { year: 750, text: 'Bağdat\'ın (Dârü\'s-Selâm) Halife Mansur tarafından kurulması', category: 'islam' },
    { year: 762, text: 'Abbasi Halifesi Ebu Cafer el-Mansur tarafından Bağdat şehri kurularak Abbasi Devleti\'nin yeni başkenti ilan edildi.', category: 'islam' },
  ],
  '07-31': [
    { year: 855, text: 'Ahmed b. Hanbel vefatı', category: 'islam' },
    { year: 1117, text: 'Yusuf Hemedani (K.S.) nın vefatı', category: 'islam' },
    { year: 2024, text: 'İsmail Haniye İsrail tarafından şehit edildi', category: 'dunya' },
    { year: 2026, text: 'Eyyam-ı Bahur (Başlangıç dönemi - Temmuz sonu / Ağustos başı)', category: 'turkiye' },
  ],
  '08-01': [
    { year: 806, text: 'Hârûnürreşîd döneminde Bizans\'a karşı büyük sefer', category: 'islam' },
    { year: 838, text: 'Amûriye Seferi', category: 'islam' },
    { year: 1230, text: 'Yassıçemen Savaşı', category: 'islam' },
    { year: 1571, text: 'Lala Mustafa Paşa kumandasındaki Osmanlı ordusu Mağusa\'yı teslim alarak Kıbrıs\'ın fethini tamamladı.', category: 'osmanli' },
    { year: 1914, text: 'Alman İmparatorluğu, Rusya\'ya savaş ilan etti ve Birinci Dünya Savaşı tüm Avrupa\'ya yayıldı.', category: 'dunya' },
    { year: 1960, text: 'Ali Haydar Efendi vefatı', category: 'islam' },
  ],
  '08-02': [
    { year: 1492, text: 'İspanya\'daki engizisyondan kaçan Yahudiler, Sultan II. Bayezid\'in gönderdiği Osmanlı gemileriyle İstanbul ve Selanik\'e ulaştı.', category: 'osmanli' },
  ],
  '08-03': [
    { year: 1492, text: 'Kristof Kolomb, İspanya\'nın Palos limanından Atlantik Okyanusu\'na açılarak tarihi keşif gezisine başladı.', category: 'dunya' },
  ],
  '08-04': [
    { year: 1578, text: 'Vadisseyl Muharebesi: Osmanlı destekli Saadi güçleri, Portekiz Krallığı\'nı mağlup ederek Portekiz\'in Kuzey Afrika yayılımını sonlandırdı.', category: 'osmanli' },
  ],
  '08-05': [
    { year: 642, text: 'Maserfield Muharebesi gerçekleşti; erken dönem Britanya ve Hristiyanlık tarihinde önemli sonuçlar doğurdu.', category: 'dunya' },
    { year: 1611, text: 'Kuyucu Murad Paşa vefatı', category: 'osmanli' },
    { year: 1716, text: 'Petrovaradin Savaşı', category: 'islam' },
  ],
  '08-06': [
    { year: 1825, text: 'Bolivya Kuruldu', category: 'dunya' },
    { year: 1945, text: 'Amerika Birleşik Devletleri, Japonya\'nın Hiroşima kentine tarihteki ilk atom bombasını (Little Boy) attı.', category: 'dunya' },
  ],
  '08-07': [
    { year: 626, text: 'Avarlar ve Sasaniler tarafından yürütülen geniş çaplı İstanbul Kuşatması, Bizans savunması karşısında başarısızlıkla sona erdi.', category: 'dunya' },
  ],
  '08-08': [
    { year: 1588, text: 'Gravelines Deniz Muharebesi: İngiliz donanması, Yenilmez İspanyol Armada\'sını dağıtarak küresel deniz hakimiyetini ele geçirdi.', category: 'dunya' },
    { year: 2018, text: 'Çin devletinde 2018–2020 döneminde bazı Uygur kadınların evlerinde Çinli erkek devlet görevlilerinin ailelerle birlikte kalmasına ilişkin uygulamalar raporlandı.', category: 'islam' },
  ],
  '08-09': [
    { year: 1945, text: 'Amerika Birleşik Devletleri, Hiroşima\'dan üç gün sonra Japonya\'nın Nagazaki kentine ikinci atom bombasını (Fat Man) attı.', category: 'dunya' },
  ],
  '08-10': [
    { year: 1519, text: 'Ferdinand Magellan, dünyanın etrafını dolaşmak üzere Sevilla\'dan 5 gemilik filosuyla yola çıktı.', category: 'dunya' },
    { year: 1591, text: 'Yakup Halife r.a. vefatı', category: 'islam' },
  ],
  '08-11': [
    { year: 1473, text: 'Otlukbeli Meydan Muharebesi: Fatih Sultan Mehmed, Akkoyunlu Hükümdarı Uzun Hasan\'ı mağlup ederek Doğu Anadolu hakimiyetini kesinleştirdi.', category: 'osmanli' },
    { year: 2026, text: 'Perseid (Kahraman) Meteor Yağmuru en yoğun dönemine girdi; sıcak yaz gecesinde gözlem için ideal gece.', category: 'dunya' },
  ],
  '08-12': [
    { year: 1121, text: 'Didgori Muharebesi: Gürcistan Krallığı ile Büyük Selçuklu müttefik orduları arasında tarihi çatışma gerçekleşti.', category: 'selcuklu' },
    { year: 1574, text: 'Ebussuud Efendi vefatı', category: 'osmanli' },
    { year: 2026, text: 'Yaz aylarının en popüler gök olaylarından Perseid Meteor Yağmuru zirve gecesini tamamlıyor.', category: 'dunya' },
  ],
  '08-13': [
    { year: 612, text: 'Ninova Kuşatması sonrası Asur İmparatorluğu\'nun başkenti Ninova düştü ve kadim imparatorluk yıkılış sürecine girdi.', category: 'dunya' },
    { year: 1935, text: 'Şeyh Muhammed Bedreddin el-Hasenî hz vefatı', category: 'islam' },
  ],
  '08-14': [
    { year: 1860, text: 'Hasan Dede vefatı', category: 'islam' },
    { year: 1930, text: 'Muhammed Mazhar İşʼan Cân-ı Cânan (K.S.) nın vefatı', category: 'islam' },
    { year: 1974, text: 'Kıbrıs İkinci Barış Harekâtı başladı ("Ayşe tatile çıksın" parolasıyla Türk askeri Lefkoşa\'ya girdi).', category: 'turkiye' },
  ],
  '08-15': [
    { year: 717, text: 'İstanbul Kuşatması', category: 'islam' },
    { year: 718, text: 'İkinci Araplar Tarafından İstanbul Kuşatması: Emevi halifesi Süleyman bin Abdülmelik dönemindeki kuşatma sona erdi.', category: 'islam' },
    { year: 838, text: 'Amûriye\'nin Fethi', category: 'islam' },
    { year: 1096, text: '1. Haçlı Saldırılarının - Orduların asıl hareketi', category: 'islam' },
    { year: 1914, text: 'Panama Kanalı tamamlanarak gemi geçişlerine açıldı ve okyanuslar arası ulaşım devrim yarattı.', category: 'dunya' },
    { year: 1947, text: 'Hindistan Bağımsızlığını Kazandı', category: 'dunya' },
    { year: 1971, text: 'ABD Başkanı Nixon, doların altına konvertibilitesini askıya alarak Altın Standardı\'nı sonlandırdı (Nixon Şoku).', category: 'dunya' },
  ],
  '08-16': [
    { year: 1308, text: 'Anadolu Selçuklu Devleti\'nin son sultanı II. Mesud\'un vefatı ile Anadolu Selçuklu Devleti resmen sona erdi.', category: 'selcuklu' },
  ],
  '08-17': [
    { year: 1668, text: 'Muhammed Said Faruki hazretleri vefatı', category: 'islam' },
    { year: 1999, text: 'Marmara Depremi: Saat 03.02’de meydana gelen depremde binlerce vatandaşımız vefat etti.', category: 'turkiye' },
  ],
  '08-18': [
    { year: 642, text: 'Halid bin Velid r.a. vefatı', category: 'islam' },
    { year: 859, text: 'Zünnûn-i Mısrî hazretleri vefatı', category: 'islam' },
    { year: 1227, text: 'Tarihin en büyük kara imparatorluğunu kuran Moğol Hükümdarı Cengiz Han vefat etti.', category: 'dunya' },
  ],
  '08-19': [
    { year: 931, text: 'Ebû Ali Belhî hazretleri vefatı', category: 'islam' },
    { year: 1692, text: 'Salem Cadı Mahkemeleri kapsamında tarihe geçen yargılamalar ve infazlar gerçekleşti.', category: 'dunya' },
    { year: 1966, text: 'Varto Depremi', category: 'turkiye' },
  ],
  '08-20': [
    { year: 636, text: 'Yermük Muharebesi: Hz. Ömer döneminde Halid bin Velid kumandasındaki İslam ordusu, Bizans İmparatorluğu\'nu mağlup ederek Suriye\'nin kapılarını açtı.', category: 'islam' },
    { year: 805, text: 'Behlül-i Dânâ vefatı', category: 'islam' },
  ],
  '08-21': [
    { year: 1911, text: 'Leonardo da Vinci\'nin dünyaca ünlü eseri Mona Lisa tablosu Louvre Müzesi\'nden çalındı.', category: 'dunya' },
  ],
  '08-22': [
    { year: 1520, text: 'Yavuz Sultan Selim Hanın vefatı', category: 'islam' },
    { year: 1645, text: 'Hanya Kalesi\'nin fethi: Osmanlı ordusu Girit Adasındaki ilk büyük stratejik zaferini elde etti.', category: 'osmanli' },
    { year: 1914, text: 'Şeyh Şakir Efendi r.a. vefatı', category: 'islam' },
  ],
  '08-23': [
    { year: 634, text: 'İlk İslam Halifesi Hz. Ebubekir (r.a.) Medine-i Münevvere\'de vefat etti ve Hz. Ömer ikinci halife seçildi.', category: 'islam' },
    { year: 1514, text: 'Çaldıran Zaferi: Yavuz Sultan Selim Han, Safevi Hükümdarı Şah İsmail\'i mağlup ederek Doğu sınırlarını emniyete aldı.', category: 'osmanli' },
  ],
  '08-24': [
    { year: 79, text: 'Vezüv Yanardağı patladı; Pompeii ve Herculaneum şehirleri tamamen kül ve lavlar altında kaldı.', category: 'dunya' },
    { year: 1276, text: 'Ahmed-i Bedevî hz vefatı', category: 'islam' },
    { year: 1516, text: 'Mercidâbık Zaferi: Yavuz Sultan Selim Han kumandasındaki Osmanlı ordusu Memlûkleri mağlup etti.', category: 'osmanli' },
    { year: 2016, text: 'Suriye\'kuzeyindeki DEAŞ ve YPG/PKK unsurlarına karşı Fırat Kalkanı Harekâtı başladı.', category: 'turkiye' },
  ],
  '08-25': [
    { year: 683, text: 'el-Harre Vak\'ası', category: 'islam' },
    { year: 717, text: 'Süleyman b. Abdülmelik vefatı', category: 'islam' },
    { year: 865, text: 'Ebu Turab-ı Nahşebi Hazretleri vefatı', category: 'islam' },
    { year: 1609, text: 'İtalyan bilim insanı Galileo Galilei, gökyüzü gözlemleri için geliştirdiği ilk teleskobunu Venedikli senatörlere tanıttı.', category: 'dunya' },
  ],
  '08-26': [
    { year: 1071, text: 'Malazgirt Zaferi: Büyük Selçuklu Sultanı Alparslan, Bizans İmparatoru Romen Diyojen kumandasındaki sayıca üstün orduyu dâhiyane Turan taktiğiyle mağlup etti; İmparator esir alındı ve Anadolu\'nun kapıları Türk-İslâm medeniyetine kesin olarak açıldı.', category: 'selcuklu' },
    { year: 2016, text: 'Yavuz Sultan Selim Köprüsü hizmete açıldı.', category: 'ulasim-altyapi' },
  ],
  '08-27': [
    { year: 1896, text: 'Tarihin en kısa süren savaşı olan İngiliz-Zanzibar Savaşı gerçekleşti (Savaş 38 dakika sürdü).', category: 'dunya' },
    { year: 1940, text: 'Mehmed Hulusi Efendi vefatı', category: 'islam' },
  ],
  '08-28': [
    { year: 1499, text: 'Sapienza Deniz Muharebesi: Burak Reis ve Osmanlı donanması Venedik donanmasını mağlup ederek Mora kıyılarındaki Osmanlı hakimiyetini pekiştirdi.', category: 'osmanli' },
  ],
  '08-29': [
    { year: 1521, text: 'Belgrad’ın fethi: Kanûnî Sultan Süleyman Hân Avrupa kapısını açtı.', category: 'osmanli' },
    { year: 1526, text: 'Mohaç Zaferi: Kanûnî Sultan Süleyman 2 saatte Macar ordusunu mağlup ederek cihan hâkimiyetini pekiştirdi.', category: 'osmanli' },
    { year: 1904, text: 'V. Murad vefatı', category: 'osmanli' },
  ],
  '08-30': [
    { year: 1483, text: 'Kilia ve Akkerman kalelerinin fethiyle Osmanlı Devleti Karadeniz\'i bir Türk gölü haline getirme yolunda büyük adım attı.', category: 'osmanli' },
    { year: 2026, text: 'Süper Dolunay: Ay, Dünya\'ya en yakın konumunda (yerberi) dolunay evresinde gerçekleşerek gökyüzünde normalden daha büyük ve parlak göründü.', category: 'gokyuzu' },
  ],
  '08-31': [
    { year: 870, text: 'Buhari hazretleri vefatı', category: 'islam' },
    { year: 2022, text: 'Çin devletinde Sincan’daki insan hakları durumuna ilişkin BM değerlendirmesi yayımlandı.', category: 'islam' },
  ],
  '09-01': [
    { year: 861, text: 'Zenc İsyanı', category: 'islam' },
    { year: 870, text: 'İmam-ı Buhari r.a. vefatı', category: 'islam' },
    { year: 1071, text: 'Malazgirt Zaferi sonrası Selçuklu birlikleri Anadolu içlerine doğru ilerleyişini hızlandırdı.', category: 'selcuklu' },
    { year: 1936, text: 'Colorado Nehri üzerinde inşa edilen ve dönemin en büyük barajı olan Hoover Barajı tamamlandı.', category: 'dunya' },
    { year: 1939, text: 'Almanya\'nın Polonya\'yı işgal etmesiyle II. Dünya Savaşı resmen başladı.', category: 'dunya' },
    { year: 2026, text: 'Sonbahar göçü başladı; havaların soğumasıyla birlikte kuşlar güneydeki sıcak bölgelere doğru uzun yolculuklarına çıktı.', category: 'doga' },
    { year: 2026, text: 'Denizlerde Balık Av Sezonu Açılışı / "Vira Bismillah"', category: 'turkiye' },
  ],
  '09-02': [
    { year: 1192, text: '3. Haçlı Saldırılarının Bitiş - Selahaddin Eyyubi ile Aslan Yürekli Richard arasında Yafa Antlaşması', category: 'islam' },
    { year: 1945, text: 'Japonya\'nın teslimiyet belgesini imzalamasıyla II. Dünya Savaşı resmen sona erdi.', category: 'dunya' },
  ],
  '09-03': [
    { year: 1260, text: 'Ayn Calut Muharebesi: Memlük Devleti, Moğol ordusunu mağlup ederek Moğolların Orta Doğu daki ilerleyişini durdurdu.', category: 'islam' },
    { year: 1928, text: 'İskoç bakteriyolog Alexander Fleming, dünyayı değiştiren antibiyotik olan penisilini keşfetti.', category: 'dunya' },
  ],
  '09-04': [
    { year: 476, text: 'Romulus Augustulus\'un tahttan indirilmesiyle Batı Roma İmparatorluğu çöktü ve İlk Çağ sona erdi.', category: 'dunya' },
  ],
  '09-05': [
    { year: 1699, text: 'Büyük Petro, Rusya\'yı batılılaştırma reformları kapsamında sakal vergisi uygulamasını başlattı.', category: 'dunya' },
    { year: 1908, text: 'Bulgaristan Krallığı, Osmanlı Devleti’nden tek taraflı bağımsızlığını ilân etti.', category: 'osmanli' },
  ],
  '09-06': [
    { year: 1566, text: 'Osmanlı İmparatorluğu\'nun 10. Padişahı Kanuni Sultan Süleyman, Zigetvar Kuşatması sırasında vefat etti.', category: 'osmanli' },
    { year: 1975, text: 'Lice Depremi', category: 'turkiye' },
    { year: 2024, text: 'Ayşenur Ezgi Eygi (israil tarfından bilerek/istiyerek kafasına ateş edilerek şehit edilem Türk aktivist)', category: 'aktivist' },
  ],
  '09-07': [
    { year: 669, text: 'Ebû Eyyûb el-Ensârî Hz.vefatı', category: 'islam' },
    { year: 1191, text: 'Arsuf Savaşı', category: 'islam' },
    { year: 1812, text: 'Borodino Muharebesi: Napolyon Bonapart yönetimindeki Fransız ordusu ile Rus ordusu karşı karşıya geldi.', category: 'dunya' },
    { year: 1822, text: 'Brezilya İmparatorluğu Kuruldu', category: 'dunya' },
    { year: 1946, text: 'Cumhuriyet tarihinin ilk büyük devalüasyonu yapılarak Türk lirasının değeri düşürüldü.', category: 'dunya' },
  ],
  '09-08': [
    { year: 1565, text: 'Osmanlı ordusunun Malta Kuşatması sona erdi.', category: 'osmanli' },
    { year: 1991, text: 'Kuzey Makedonya Bağımsızlığını İlan Etti', category: 'dunya' },
  ],
  '09-09': [
    { year: 815, text: 'Ma‘rûf-i Kerhî vefatı', category: 'islam' },
    { year: 1570, text: 'Lefkoşa\'nın fethi: Osmanlı ordusu Kıbrıs\'ın önemli kalelerinden Lefkoşa\'yı ele geçirdi.', category: 'osmanli' },
  ],
  '09-10': [
    { year: 932, text: 'Hakim-i Tirmizi r.a. vefatı', category: 'islam' },
    { year: 1509, text: 'İstanbul\'da "Küçük Kıyamet" olarak adlandırılan büyük deprem meydana geldi.', category: 'osmanli' },
  ],
  '09-11': [
    { year: 1683, text: 'İkinci Viyana Kuşatması sonrası Kahlenberg Meydan Muharebesi vuku buldu.', category: 'osmanli' },
    { year: 2001, text: 'ABD\'de İkiz Kuleler ve Pentagon\'a yönelik 11 Eylül terör saldırıları gerçekleşti.', category: 'dunya' },
  ],
  '09-12': [
    { year: 662, text: 'Kaab Bin Züheyr Hazretleri vefatı', category: 'islam' },
    { year: 752, text: 'Atâ el-Horasânî hazretleri vefatı', category: 'islam' },
    { year: 1683, text: 'Sadrazam Merzifonlu Kara Mustafa Paşa komutasındaki Osmanlı ordusu Viyana önlerinde ricat etmek zorunda kaldı.', category: 'osmanli' },
    { year: 1707, text: 'Ahmed-i Hani r.a. vefatı', category: 'islam' },
    { year: 1915, text: 'Selahüddin İbn-i Mevlâna Siracüddîn (K.S.) nın vefatı', category: 'islam' },
    { year: 1980, text: '12 Eylül Askeri Darbesi gerçekleşti.', category: 'turkiye' },
  ],
  '09-13': [
    { year: 1176, text: 'Miryokefalon Zaferi: Selçuklu Sultanı II. Kılıç Arslan, Bizans ordusunu mağlup ederek Anadolu\'nun Türk yurdu olduğunu kesinleştirdi.', category: 'selcuklu' },
  ],
  '09-14': [
    { year: 1829, text: 'Osmanlı İmparatorluğu ile Rusya arasında Edirne Antlaşması imzalandı.', category: 'osmanli' },
  ],
  '09-15': [
    { year: 1918, text: 'Nuri Killigil Paşa komutasındaki Kafkas İslam Ordusu, Bakü\'yü Ermeni ve Bolşevik işgalinden kurtardı.', category: 'osmanli' },
    { year: 1948, text: 'Hüseyin Bayık Efendi vefatı', category: 'islam' },
    { year: 2008, text: 'Lehman Brothers\'ın iflas etmesiyle 2008 Küresel Finansal Krizi doruk noktasına ulaştı.', category: 'dunya' },
  ],
  '09-16': [
    { year: 1810, text: 'Meksika Bağımsızlığını İlan Etti', category: 'dunya' },
    { year: 1890, text: 'Ertuğrul Fırkateyni, Japonya dönüşü esnasında Tayfun sebebiyle Kushimoto açıklarında kayalıklara çarparak battı.', category: 'osmanli' },
    { year: 1927, text: 'Süleyman Hilmi Tunahan Hazretleri vefatı', category: 'islam' },
    { year: 1982, text: 'Sabra ve Şatilla Katliamı: İsrail ordusunun kuşatması altındaki Lübnan\'ın Beyrut kentindeki mülteci kamplarında binlerce masum katledildi.', category: 'filistin' },
  ],
  '09-17': [
    { year: 1176, text: 'Miryokefalon Savaşı ve Zaferi: Anadolu Selçuklu Sultanı II. Kılıç Arslan, Bizans İmparatoru I. Manuil Komnenos\'un ordusunu pusuya düşürerek hezimete uğrattı; Bizans savunmaya çekildi ve Anadolu\'nun ebedî Türk yurdu olduğu kesinleşti.', category: 'selcuklu' },
    { year: 2024, text: 'Lübnan Elektronik Saldırıları: Lübnan genelinde çağrı cihazları ve telsizlerin eş zamanlı patlatılmasıyla yüzlerce sivil katledildi, binlerce kişi sakat bırakıldı.', category: 'filistin' },
  ],
  '09-18': [
    { year: 1180, text: 'Fransa Kralı II. Philippe tahta çıktı.', category: 'dunya' },
    { year: 2026, text: 'Süper Dolunay serisinin bir sonraki halkası gerçekleşiyor; yılın en parlak dolunaylarından biri gözlemleniyor.', category: 'gokyuzu' },
  ],
  '09-19': [
    { year: 1870, text: 'Fransa-Prusya Savaşı sırasında Paris Kuşatması başladı.', category: 'dunya' },
  ],
  '09-20': [
    { year: 1456, text: 'Alaeddin Ali Semerkandi vefatı', category: 'islam' },
    { year: 1697, text: 'Dokuz Yıl Savaşı\'nı sona erdiren Ryswick Antlaşması imzalandı.', category: 'dunya' },
  ],
  '09-21': [
    { year: 1371, text: 'Çirmen Zaferi: Osmanlı akıncıları Meriç nehri kıyısında Haçlı ordusunu bozguna uğrattı.', category: 'osmanli' },
    { year: 1601, text: 'Kuyucu Murad Paşa (Alternatif kaynak / Örnek)', category: 'osmanli' },
  ],
  '09-22': [
    { year: 622, text: 'Hz. Muhammed (S.A.V.) Medine\'ye hicretini tamamlayarak Kubâ\'ya ulaştı.', category: 'islam' },
    { year: 660, text: 'Hz. Muaviye r.a. vefatı', category: 'islam' },
    { year: 1520, text: 'Yavuz Sultan Selim (I. Selim) Edirne yolculuğu sırasında vefat etti.', category: 'osmanli' },
    { year: 1980, text: 'İran-Irak Savaşı başladı; sekiz yıl süren çatışmalar bölgede derin izler bıraktı.', category: 'islam' },
    { year: 2026, text: 'Sonbahar Ekinoksu (Başlangıç aralığı)', category: 'turkiye' },
  ],
  '09-23': [
    { year: 1846, text: 'Gökbilimci Johann Gottfried Galle, Neptün gezegenini keşfetti.', category: 'dunya' },
    { year: 2026, text: 'Sonbahar Ekinoksu', category: 'turkiye' },
  ],
  '09-24': [
    { year: 622, text: 'Peygamberimiz Hz. Muhammed (s.a.v.)\'in Mekke\'den hicret ederek Medine\'ye girişi', category: 'islam' },
    { year: 1663, text: 'Uyvar Kalesi\'nin fethi', category: 'islam' },
  ],
  '09-25': [
    { year: 1396, text: 'Niğbolu Zaferi ve Savaşı: Sultan I. Bayezid (Yıldırım), Macar Kralı Sigismund önderliğindeki müttefik Haçlı ordusunu Niğbolu Kalesi önlerinde ağır bir hezimete uğrattı; bu şanlı zaferle Osmanlı\'nın Balkanlar\'daki hâkimiyeti perçinlendi ve Sultan Bayezid\'e Abbâsî Halifesi tarafından \'Sultân-ı İklîm-i Rûm\' unvanı verildi.', category: 'osmanli' },
    { year: 1730, text: 'Patrona Halil İsyanı başladı; Lâle Devri sona erdi, Sadrazam Nevşehirli Damat İbrahim Paşa öldürüldü ve Sultan III. Ahmed tahttan indirildi.', category: 'osmanli' },
    { year: 1997, text: 'Kuzey Irak\'taki Zap ve Basyan bölgelerini hedef alan Şafak Harekâtı.', category: 'turkiye' },
  ],
  '09-26': [
    { year: 1087, text: 'İngiltere Kralı I. William\'ın ölümünün ardından II. William tahta çıktı.', category: 'dunya' },
    { year: 1364, text: 'Sırpsındığı Savaşı', category: 'islam' },
    { year: 1371, text: 'Çirmen Savaşı', category: 'islam' },
    { year: 1988, text: 'Halterci Naim Süleymanoğlu, Seul Olimpiyatları\'nda olağanüstü kaldırışlarıyla Türkiye\'ye olimpiyat tarihindeki ilk altın madalyalarından birini kazandırdı.', category: 'turkiye' },
  ],
  '09-27': [
    { year: 1325, text: 'Emir Hüsrev hazretleri vefatı', category: 'islam' },
    { year: 1529, text: 'Kanuni Sultan Süleyman komutasındaki Osmanlı ordusu Birinci Viyana Kuşatması\'nı başlattı.', category: 'osmanli' },
    { year: 2024, text: 'Beyrut Dahiye Bombalamaları: İsrail\'in Lübnan\'ın başkentinde binaları yerle bir eden devasa tonlarca ağırlıktaki bombalı saldırılarıyla yüzlerce sivil katledildi.', category: 'filistin' },
  ],
  '09-28': [
    { year: 1538, text: 'Preveze Deniz Zaferi: Kaptan-ı Derya Barbaros Hayreddin Paşa, Andrea Doria komutasındaki Haçlı Donanması\'nı imha etti.', category: 'osmanli' },
    { year: 1920, text: 'Kâzım Karabekir Paşa komutasındaki Doğu Cephesi Birlikleri Ermenilere karşı Doğu Harekâtı\'nı başlattı.', category: 'turkiye' },
    { year: 1928, text: 'Penisilin Keşfi - Alexander Fleming', category: 'dunya' },
    { year: 2026, text: 'Kestane Karası Fırtınası', category: 'turkiye' },
  ],
  '09-29': [
    { year: 1499, text: 'İnebahtı Kalesi\'nin fethi', category: 'osmanli' },
    { year: 1855, text: 'Kars Zaferi ile şehre ve ahâlisine “Gâzi” unvanı verildi.', category: 'osmanli' },
    { year: 1911, text: 'İtalya\'nın Osmanlı toprağı olan Trablusgarp\'a savaş ilan etmesiyle Trablusgarp Savaşı başladı.', category: 'osmanli' },
    { year: 2000, text: 'İkinci İntifada\'nın Başlangıcı: Ariel Şaron\'un Mescid-i Aksa\'ya provokatif baskını sonrası patlak veren olaylarda binlerce Filistinli hayatını kaybetti.', category: 'filistin' },
  ],
  '09-30': [
    { year: 1520, text: 'Kanuni Sultan Süleyman, babası Yavuz Sultan Selim\'in vefatı üzerine Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 1566, text: 'Sultan II. Selim, babası Kanunî Sultan Süleyman\'ın vefatının ardından İstanbul\'a gelerek resmen Osmanlı tahtına çıktı.', category: 'osmanli' },
    { year: 2026, text: 'Turna Geçimi Fırtınası', category: 'turkiye' },
  ],
  '10-01': [
    { year: 331, text: 'Büyük İskender, Gaugamela Savaşı\'nda Pers İmparatoru III. Darius\'u mağlup etti.', category: 'dunya' },
    { year: 1628, text: 'Aziz Mahmud Hudayi’vefatı', category: 'islam' },
    { year: 1651, text: 'Abdülehad hazretleri vefatı', category: 'islam' },
    { year: 1880, text: 'Thomas Edison, ilk ticari ampul fabrikasını açtı.', category: 'dunya' },
    { year: 1949, text: 'Çin Halk Cumhuriyeti Kuruldu', category: 'dunya' },
  ],
  '10-02': [
    { year: 1187, text: 'Kudüs\'ün Fethi: Selâhaddîn-i Eyyûbî, 88 yıllık Haçlı işgaline son vererek Kudüs\'ü ve Mescid-i Aksâ\'yı sulh ile geri aldı; Hristiyan halka hoşgörü gösterilerek can güvenliği sağlandı ve bu büyük fetih Avrupa\'da III. Haçlı Seferi\'ni tetikledi.', category: 'islam' },
    { year: 1699, text: 'Ubeydullah Serhendi hazretleri vefatı', category: 'islam' },
    { year: 1958, text: 'Gine, Fransa\'dan bağımsızlığını ilan etti.', category: 'dunya' },
    { year: 2017, text: 'Çin devletinde Sincan’da kitlesel gözaltı sistemi büyük ölçekte başladı.', category: 'islam' },
  ],
  '10-03': [
    { year: 1932, text: 'Irak, Birleşik Krallık\'tan bağımsızlığını ilan etti.', category: 'dunya' },
    { year: 1990, text: 'Doğu ve Batı Almanya resmen birleşti.', category: 'dunya' },
  ],
  '10-04': [
    { year: 1571, text: 'İspanyol ve Venedik donanmaları, İnebahtı öncesi Haçlı İttifakı\'nı resmileştirdi.', category: 'osmanli' },
    { year: 1957, text: 'SSCB, uzaya fırlatılan ilk yapay uydu olan Sputnik 1\'i yörüngeye oturttu.', category: 'dunya' },
  ],
  '10-05': [
    { year: 1052, text: 'Ebû Amr ed-Dekkāk hazretleri vefatı', category: 'islam' },
    { year: 1143, text: 'Zamora Antlaşması ile Portekiz Krallığı resmen tanındı.', category: 'dunya' },
    { year: 1400, text: 'Pir İlyas r.a. vefatı', category: 'islam' },
    { year: 1910, text: 'Portekiz\'de cumhuriyet ilan edildi, monarşi son buldu.', category: 'dunya' },
    { year: 2017, text: 'Çin devletinde 2017–2020 döneminde keyfi gözaltılar ve kötü muamele uygulamaları yaşandı.', category: 'islam' },
  ],
  '10-06': [
    { year: 1052, text: 'Selçuklu Beyi Çağrı Bey döneminde Doğu Anadolu\'ya keşif akınları yoğunlaştırıldı.', category: 'selcuklu' },
    { year: 1973, text: 'Arap-İsrail Savaşı (Yom Kippur Savaşı) başladı.', category: 'dunya' },
  ],
  '10-07': [
    { year: 1571, text: 'İnebahtı Deniz Muharebesi gerçekleşti; Osmanlı donanması Haçlı ittifakına karşı büyük kayıp verdi.', category: 'osmanli' },
    { year: 2023, text: 'Gazze Soykırımının Başlangıcı: İsrail, tarihindeki en büyük yıkım, aç bırakma ve soykırım kampanyasını Gazze Şeridi\'nde başlatarak on binlerce sivili katletti.', category: 'filistin' },
  ],
  '10-08': [
    { year: 1600, text: 'San Marino, dünyanın en eski yazılı anayasalarından birini kabul etti.', category: 'dunya' },
    { year: 1912, text: 'Karadağ\'ın Osmanlı Devleti\'ne savaş ilan etmesiyle I. Balkan Savaşı başladı.', category: 'osmanli' },
    { year: 2017, text: 'Çin devletinde 2017–2020 döneminde zorlayıcı doğum kontrolü ve kısırlaştırma uygulamaları yapıldı.', category: 'islam' },
  ],
  '10-09': [
    { year: 1033, text: 'Ebü’l-Hasan el-Harakānî vefatı', category: 'islam' },
    { year: 1238, text: 'Aragon Kralı I. Jaume, Valencia\'yı Müslümanlardan alarak Reconquista sürecini ilerletti.', category: 'dunya' },
    { year: 2006, text: 'Kuzey Kore ilk nükleer denemesini gerçekleştirdi.', category: 'dunya' },
    { year: 2019, text: 'Suriye\'kuzeydoğusunda terör koridorunu engellemek amacıyla Barış Pınarı Harekâtı.', category: 'turkiye' },
  ],
  '10-10': [
    { year: 680, text: 'Kerbelâ Olayı', category: 'islam' },
    { year: 732, text: 'Puvatya (Poitiers / Tours - Belâtüşşühedâ) Savaşı: Abdurrahman el-Gāfıkī kumandasındaki Endülüs Emevî ordusu ile Charles Martel komutasındaki Franklar arasında gerçekleşti; Gāfıkī\'nin şehadetiyle İslâm ordularının Batı Avrupa içlerindeki ilerleyişi durduruldu.', category: 'islam' },
    { year: 1937, text: 'Şeyh Nazmi Efendi vefatı', category: 'islam' },
  ],
  '10-11': [
    { year: 1138, text: 'Tarihin en yıkıcı depremlerinden biri olan Halep Depremi meydana geldi.', category: 'islam' },
    { year: 1579, text: 'Sokollu Mehmed Paşa vefatı', category: 'islam' },
    { year: 1899, text: 'İkinci Boer Savaşı başladı.', category: 'dunya' },
    { year: 2017, text: 'Çin devletinde 2017–2020 döneminde cami ve dini yapıların yıkılması veya dönüştürülmesi gerçekleşti.', category: 'islam' },
  ],
  '10-12': [
    { year: 1492, text: 'Kristof Kolomb, Karayipler\'e ulaşarak Amerika kıtasına ayak bastı.', category: 'dunya' },
    { year: 1683, text: 'II. Viyana Kuşatması sonrası Osmanlı ordusunun Ciğerdelen Muharebesi yenilgisi gerçekleşti.', category: 'osmanli' },
    { year: 1693, text: 'IV. Mehmed vefatı', category: 'osmanli' },
  ],
  '10-13': [
    { year: 1270, text: 'Hacı Bektaş-i Veli r.a. vefatı', category: 'islam' },
    { year: 1307, text: 'Fransa Kralı IV. Philippe\'in emriyle Tapınak Şövalyeleri tutuklandı.', category: 'dunya' },
    { year: 1792, text: 'ABD Başkanlık konutu Beyaz Saray\'ın temeli atıldı.', category: 'dunya' },
    { year: 1971, text: 'Ömer Nasuh Bilmen’in vefatı', category: 'islam' },
  ],
  '10-14': [
    { year: 1066, text: 'Hastings Muharebesi gerçekleşti; Normanlar İngiltere\'yi fethetti.', category: 'dunya' },
    { year: 1806, text: 'Napolyon Bonapart, Jena-Auerstedt Muharebesi\'nde Prusya ordusunu mağlup etti.', category: 'dunya' },
    { year: 1953, text: 'Kibya Katliamı: Ariel Şaron komutasındaki birlikler Batı Şeria\'daki Kibya köyüne saldırarak 69 sivili evleriyle birlikte havaya uçurdu.', category: 'filistin' },
    { year: 2018, text: 'Çin devletinde 2018–2020 döneminde zorla çalıştırma iddiaları ortaya çıktı.', category: 'islam' },
  ],
  '10-15': [
    { year: 1092, text: 'Büyük Selçuklu Devleti Veziri Nizamülmülk, Batıniler tarafından suikast sonucu öldürüldü.', category: 'selcuklu' },
    { year: 1436, text: 'Abdullah-ı Tercüman Hazretleri vefatı', category: 'islam' },
    { year: 1582, text: 'Papa XIII. Gregorius tarafından hazırlatılan Gregoryen Takvim kabul edildi.', category: 'dunya' },
  ],
  '10-16': [
    { year: 1793, text: 'Fransa Kraliçesi Marie Antoinette giyotinle idam edildi.', category: 'dunya' },
    { year: 1846, text: 'Diş hekimi William T.G. Morton, cerrahide ilk kez eter anestezisini başarılı bir şekilde kullandı.', category: 'dunya' },
    { year: 1964, text: 'Çin Halk Cumhuriyeti ilk atom bombası denemesini başarıyla gerçekleştirdi.', category: 'dunya' },
    { year: 2024, text: 'Yahya Sinwar İsrail tarafından şehit edildi', category: 'dunya' },
  ],
  '10-17': [
    { year: 1448, text: 'II. Kosova Meydan Muharebesi başladı; Osmanlı ordusu Haçlı kuvvetlerini mağlup etti.', category: 'islam' },
    { year: 1973, text: 'OPEC, Batılı ülkelere karşı petrol ambargosu uygulayacağını açıkladı.', category: 'dunya' },
    { year: 2018, text: 'Çin devletinde 2018–2020 döneminde Uygur çocuklarının ailelerinden ayrılması ve yatılı okullara yerleştirilmesi uygulandı.', category: 'islam' },
    { year: 2023, text: 'Ayman Nofal İsrail tarafından şehit edildi', category: 'dunya' },
    { year: 2023, text: 'El-Ehli Baptist Hastanesi Katliamı: Gazze\'de binlerce yaralı ve sivilin sığındığı hastaneye yapılan bombalı saldırıda yüzlerce kişi anında hayatını kaybetti.', category: 'filistin' },
    { year: 2026, text: 'Süper Dolunay: Sonbahar dönemindeki dev ve parlak dolunay gökyüzünü süslüyor.', category: 'gokyuzu' },
  ],
  '10-18': [
    { year: 1009, text: 'Fâtımî Halifesi Hâkim bi-Emrillah, Kudüs\'teki Kutsal Kabir Kilisesi\'ni yıktırdı.', category: 'islam' },
    { year: 1505, text: 'Süyûtî vefatı', category: 'islam' },
    { year: 1714, text: 'Şeyh Seyfüddin Ârif (K.S.) nın vefatı', category: 'islam' },
    { year: 1867, text: 'ABD, Alaska\'yı Rus İmparatorluğu\'ndan resmen satın aldı.', category: 'dunya' },
    { year: 2023, text: 'Cemile eş-Şanti İsrail tarafından şehit edildi', category: 'dunya' },
  ],
  '10-19': [
    { year: 1216, text: 'İngiltere Kralı Yurtsuz John öldü; yerine 9 yaşındaki III. Henry geçti.', category: 'dunya' },
    { year: 1397, text: 'Alaeddin Ali Esved Karahisari vefatı', category: 'islam' },
    { year: 1781, text: 'Yorktown Kuşatması sona erdi; İngiliz ordusu Amerikan güçlerine teslim oldu.', category: 'dunya' },
  ],
  '10-20': [
    { year: 1827, text: 'Navarin Deniz Muharebesi gerçekleşti; İngiliz, Fransız ve Rus donanmaları Osmanlı-Mısır donanmasını yaktı.', category: 'osmanli' },
    { year: 1952, text: 'Mau Mau Ayaklanması ve İngiliz Sıkıyönetim Kampı (Kenya / İngiltere)', category: 'dunya' },
    { year: 1973, text: 'Avustralya\'nın ikonik mimari ve mühendislik harikası Sydney Opera Evi resmi olarak açıldı.', category: 'dunya' },
    { year: 2020, text: 'Çin devletinde 2020–2023 döneminde Ningxia ve Gansu’da Hui camileri kapatıldı, birleştirildi ve dönüştürüldü.', category: 'islam' },
  ],
  '10-21': [
    { year: 983, text: 'Ebü\'l-Leys es-Semerkandî hz vefatı', category: 'islam' },
    { year: 1097, text: 'Birinci Haçlı Seferi orduları Antakya Kuşatması\'nı başlattı.', category: 'selcuklu' },
    { year: 1805, text: 'Trafalgar Deniz Muharebesi gerçekleşti; Amiral Nelson yönetimindeki İngiliz donanması Napolyon\'un donanmasını yendi.', category: 'dunya' },
    { year: 2026, text: 'Halley Kuyruklu Yıldızı\'nın kalıntısı olan Orionid Meteor Yağmuru gökyüzünü süslemeye başladı.', category: 'dunya' },
  ],
  '10-22': [
    { year: 794, text: 'Japonya İmparatoru Kanmu, başkenti Heian-kyo\'ya (günümüz Kyoto) taşıdı.', category: 'dunya' },
    { year: 1600, text: 'Kanije Savunması kahramanı Tiryaki Hasan Paşa, Kanije Kalesi\'ni Avusturya kuşatmasına karşı başarıyla savundu.', category: 'osmanli' },
    { year: 2026, text: 'Orionid Meteor Yağmuru aktivitesinin en yoğun günlerinden biri yaşanıyor.', category: 'dunya' },
  ],
  '10-23': [
    { year: 42, text: 'İkinci Triumvirlik güçleri, Sezar\'ın katillerini Philippi Muharebesi\'nde mağlup etti.', category: 'dunya' },
    { year: 683, text: 'Abdullah b. Amr b. Âs r.a. vefatı', category: 'islam' },
    { year: 1911, text: 'İtalyan ordusu, Trablusgarp Savaşı sırasında dünya tarihinde uçakları ilk kez askeri amaçla kullandı.', category: 'osmanli' },
    { year: 2011, text: 'Van Depremi', category: 'turkiye' },
  ],
  '10-24': [
    { year: 1260, text: 'Memlûk Sultanı Seyfettin Kutuz suikasta uğradı; yerine Baybars geçti.', category: 'islam' },
    { year: 1648, text: 'Vestfalya Antlaşması imzalandı; Otuz Yıl Savaşları sona erdi ve modern devletler hukukunun temeli atıldı.', category: 'dunya' },
    { year: 1929, text: 'New York Borsası\'nın çöülmesiyle (Kara Perşembe) Büyük Buhran başladı.', category: 'dunya' },
  ],
  '10-25': [
    { year: 1147, text: 'İkinci Haçlı Seferi kapsamındaki Dorileon (Eskişehir) Muharebesi\'nde Selçuklu Sultanı I. Mesud Haçlıları mağlup etti.', category: 'selcuklu' },
    { year: 1415, text: 'Yüz Yıl Savaşları\'nın dönüm noktası olan Agincourt Muharebesi gerçekleşti.', category: 'dunya' },
  ],
  '10-26': [
    { year: 740, text: 'Bizans İmparatorluğu\'nda büyük İstanbul depremi meydana geldi.', category: 'dunya' },
    { year: 1905, text: 'İsveç-Norveç Birliği feshedildi; Norveç tam bağımsız hale geldi.', category: 'dunya' },
    { year: 1974, text: 'Hüseyin Hilmi Işık r.a. vefatı', category: 'islam' },
  ],
  '10-27': [
    { year: 312, text: 'Milvian Köprüsü Muharebesi gerçekleşti; Büyük Konstantin Vizyon gördüğünü belirterek Hristiyan sembollerini kullandı.', category: 'dunya' },
    { year: 1904, text: 'New York metrosu ilk kez hizmete açıldı.', category: 'dunya' },
    { year: 1953, text: 'Türkmenistan Bağımsızlığını Kazandı', category: 'dunya' },
  ],
  '10-28': [
    { year: 1492, text: 'Kristof Kolomb Küba kıyılarına ulaştı ve adayı İspanya adına talep etti.', category: 'dunya' },
    { year: 1538, text: 'Preveze Deniz Zaferi', category: 'islam' },
    { year: 1636, text: 'ABD\'nin ilk yükseköğretim kurumu olan Harvard Üniversitesi kuruldu.', category: 'dunya' },
    { year: 1852, text: 'Muhammed Kudsi Bozkiri vefatı', category: 'islam' },
  ],
  '10-29': [
    { year: 1187, text: '3. Haçlı Saldırılarının Başlangıç - Papa VIII. Gregorius\'un \'Audita tremendi\' çağrısı', category: 'islam' },
    { year: 1914, text: 'Goben ve Breslau gemilerinin Karadeniz Rus limanlarını bombalamasıyla Osmanlı Devleti resmen I. Dünya Savaşı\'na girdi.', category: 'osmanli' },
    { year: 1923, text: 'Türkiye Futbol Federasyonu (TFF) kuruldu ve aynı yıl FIFA üyesi kabul edilerek uluslararası alanda ilk adımlar atıldı.', category: 'turkiye' },
    { year: 1929, text: 'ABD borsasının çöküşüyle "Büyük Buhran" olarak bilinen küresel dunyak kriz derinleşti.', category: 'dunya' },
    { year: 1956, text: 'Kafr Qasim Katliamı: İsrail sınır polisi, sokağa çıkma yasağından habersiz tarım işçisi köylüleri evlerine dönerken kurşuna dizdi.', category: 'filistin' },
    { year: 1969, text: 'İnternetin Atası ARPANET Üzerinden İlk Mesaj - Leonard Kleinrock Ekibi', category: 'dunya' },
    { year: 2013, text: 'Asya ile Avrupa\'yı İstanbul Boğazı\'nın altından demiryoluyla birleştiren asrın projesi Marmaray hizmete girdi.', category: 'dunya' },
    { year: 2018, text: 'Dünyanın en büyük havacılık projelerinden biri olan İstanbul Havalimanı\'nın ilk etabı görkemli bir törenle açıldı.', category: 'dunya' },
  ],
  '10-30': [
    { year: 1905, text: 'Rus Çarı II. Nikolay, temel haklar veren Ekim Fermanı\'nı yayımladı.', category: 'dunya' },
    { year: 1918, text: 'Mondros Mütarekesi imzalandı; Osmanlı toprakları İtilaf Devletlerince işgale açık hale geldi.', category: 'osmanli' },
    { year: 1983, text: 'Erzurum-Kars Depremi', category: 'turkiye' },
    { year: 2020, text: 'İzmir (Seferihisar) Depremi', category: 'dunya' },
  ],
  '10-31': [
    { year: 1661, text: 'Köprülü Mehmed Paşa vefatı', category: 'islam' },
  ],
  '11-01': [
    { year: 1214, text: 'Sinop\'un fethi', category: 'islam' },
    { year: 1290, text: 'Osman Bey döneminde Karacahisar Fethi sonrası ilk kez kendi adına hutbe okutuldu.', category: 'osmanli' },
    { year: 1520, text: 'Ferdinand Magellan, Güney Amerika\'nın güney ucundaki Magellan Boğazı\'nı geçerek Büyük Okyanus\'a ulaştı.', category: 'dunya' },
    { year: 1898, text: 'Muhammed Küfrevi hazretleri vefatı', category: 'islam' },
    { year: 1954, text: 'Cezayir Bağımsızlık Savaşı (Cezayir / Fransa)', category: 'dunya' },
  ],
  '11-02': [
    { year: 644, text: 'İkinci Halife Hz. Ömer (r.a.), Mescid-i Nebevî\'de bıçaklı saldırıya uğradı.', category: 'islam' },
    { year: 1917, text: 'İngiltere Hükümeti, Filistin\'de bir Yahudi devleti kurulmasını destekleyen Balfour Deklarasyonu\'nu yayımladı.', category: 'dunya' },
  ],
  '11-03': [
    { year: 644, text: 'Hz. Ömer\'ül Faruk (r.a.) ın vefatı', category: 'islam' },
    { year: 1839, text: 'Gülhane Parkı’nda Tanzimat Fermanı (Hatt-ı Hümâyûn) okunarak ilân edildi.', category: 'osmanli' },
    { year: 1956, text: 'Han Yunus Katliamı: İsrail ordusunun Gazze\'deki Han Yunus ve Refah bölgelerinde gerçekleştirdiği baskınlarda yüzlerce Filistinli sivil öldürüldü.', category: 'filistin' },
  ],
  '11-04': [
    { year: 725, text: 'İmâm Tâvûs hz vefatı', category: 'islam' },
    { year: 778, text: 'Süfyân es-Sevrî vefatı', category: 'islam' },
    { year: 1656, text: 'Köprülü Mehmed Paşa\'nın sadarete getirilmesi', category: 'islam' },
    { year: 1922, text: 'İngiliz arkeolog Howard Carter, Mısır\'da Tutankhamun\'un mezarını keşfetti.', category: 'dunya' },
  ],
  '11-05': [
    { year: 1914, text: 'Birinci Dünya Savaşı’nda İngiltere, Osmanlı İmparatorluğu\'na resmen savaş ilan etti ve Kıbrıs\'ı ilhak ettiğini açıkladı.', category: 'osmanli' },
  ],
  '11-06': [
    { year: 1055, text: 'Büyük Selçuklu Hükümdarı Tuğrul Bey, Bağdat\'a girerek Abbasi Halifeliği\'ni Büveyhoğulları baskısından kurtardı.', category: 'selcuklu' },
  ],
  '11-07': [
    { year: 1665, text: 'Dünyanın halen yayın hayatına devam eden en eski gazetesi olan The London Gazette yayımlanmaya başladı.', category: 'dunya' },
  ],
  '11-08': [
    { year: 1519, text: 'İspanyol fatih Hernán Cortés, Tenochtitlan\'a girdi ve Aztek İmparatoru II. Moctezuma ile karşılaştı.', category: 'dunya' },
    { year: 1895, text: 'Alman fizikçi Wilhelm Röntgen, X ışınlarını (Röntgen ışınları) keşfetti.', category: 'dunya' },
  ],
  '11-09': [
    { year: 1989, text: 'Soğuk Savaş\'ın sembolü olan Berlin Duvarı yıkılmaya başladı.', category: 'dunya' },
  ],
  '11-10': [
    { year: 1444, text: 'Sultan II. Murad komutasındaki Osmanlı ordusu, Haçlı ordusunu Varna Muharebesi\'nde mağlup etti.', category: 'islam' },
    { year: 1813, text: 'Abdullah Şemdini vefatı', category: 'islam' },
    { year: 2020, text: 'Çin devletinde Ningxia ve Gansu’da camiler kapatıldı, birleştirildi veya mimari özellikleri kaldırıldı.', category: 'islam' },
  ],
  '11-11': [
    { year: 1606, text: 'Osmanlı İmparatorluğu ile Avusturya Arşidüklüğü arasında Zitvatorok Antlaşması imzalandı.', category: 'osmanli' },
    { year: 1918, text: 'Müttefikler ile Almanya arasında imzalanan mütareke ile Birinci Dünya Savaşı resmen sona erdi.', category: 'dunya' },
  ],
  '11-12': [
    { year: 941, text: 'Mâtürîdî vefatı', category: 'islam' },
    { year: 1420, text: 'Karakoyunlu Devleti hükümdarı Kara Yusuf vefat etti.', category: 'islam' },
    { year: 1920, text: 'Ali Osman Efendi r.a. vefatı', category: 'islam' },
    { year: 1936, text: 'San Francisco ile Oakland\'ı birbirine bağlayan Oakland Körfez Köprüsü (San Francisco-Oakland Bay Bridge) hizmete girdi.', category: 'dunya' },
    { year: 1999, text: 'Düzce Depremi', category: 'turkiye' },
  ],
  '11-13': [
    { year: 1918, text: 'İtilaf Devletleri donanması İstanbul Boğazı\'na girerek şehri fiilen işgal etti.', category: 'osmanli' },
    { year: 1931, text: 'Ahmet Hulusi Efendi vefatı', category: 'islam' },
  ],
  '11-14': [
    { year: 1851, text: 'Herman Melville\'in ünlü romanı Moby Dick ABD\'de yayımlandı.', category: 'dunya' },
    { year: 2012, text: 'Bulut Sütunu Operasyonu: İsrail\'in hava saldırısıyla Hamas askerî kanat komutanı Ahmed el-Câberî suikastla şehit edildi ve Gazze Şeridi\'ne yönelik günlerce süren yoğun hava bombardımanı başlatıldı; çok sayıda sivil hayatını kaybetti.', category: 'filistin' },
  ],
  '11-15': [
    { year: 1084, text: 'Ebu Ali Fârimidi (K.S.) nın vefatı', category: 'islam' },
    { year: 1520, text: 'İdris-i Bitlisi r.a. vefatı', category: 'islam' },
    { year: 1533, text: 'İspanyol fatih Francisco Pizarro, İnka İmparatorluğu\'nun başkenti Cuzco\'ya girdi.', category: 'dunya' },
    { year: 1642, text: 'Abdulhak-ı Dehlevi hazretleri vefatı', category: 'islam' },
  ],
  '11-16': [
    { year: 1240, text: 'Muhyiddin-i Arabi hazretleri vefatı', category: 'islam' },
    { year: 1869, text: 'Akdeniz\'i Kızıldeniz\'e bağlayan Süveyş Kanalı uluslararası törenle açıldı.', category: 'dunya' },
  ],
  '11-17': [
    { year: 1558, text: 'İngiltere\'de I. Elizabeth tahta çıktı ve Tudor dönemi altın çağı başladı.', category: 'dunya' },
    { year: 2020, text: 'Dağlık Karabağ Savaşı sonrasında ateşkesin denetlenmesi için Azerbaycan\'ın Ağdam bölgesinde Türk-Rus Ortak Merkezi\'kurulmasına ve Türk askerigörev yapmasına yönelik tezkereTBMM\'de kabulü.', category: 'türkiye-azerbaycan' },
  ],
  '11-18': [
    { year: 1534, text: 'İbrahim Gülşeni r.a. vefatı', category: 'islam' },
    { year: 1626, text: 'Vatikan\'daki Aziz Petrus Bazilikası inşaatı tamamlanarak kutsandı ve ibadete açıldı.', category: 'dunya' },
  ],
  '11-19': [
    { year: 1863, text: 'ABD Başkanı Abraham Lincoln, Amerikan İç Savaşı sırasında ünlü Gettysburg Nutku\'nu irat etti.', category: 'dunya' },
  ],
  '11-20': [
    { year: 1497, text: 'Portekizli denizci Vasco da Gama, Ümit Burnu\'nu dolaşarak Hindistan deniz yolunu keşfetti.', category: 'dunya' },
    { year: 1555, text: 'Hayreddin Tokadi Hazretleri vefatı', category: 'islam' },
    { year: 1624, text: 'İmam Rabbani hazretleri vefatı', category: 'islam' },
    { year: 1651, text: 'Abdülehad r.a. vefatı', category: 'islam' },
    { year: 1685, text: 'Hâce Muhammed Mâsum (K.S.) nın vefatı', category: 'islam' },
    { year: 1935, text: 'Ali Nutki Baba vefatı', category: 'islam' },
  ],
  '11-21': [
    { year: 1362, text: 'Orhan Gazi vefatı', category: 'osmanli' },
    { year: 1783, text: 'Pilâtre de Rozier ve Marquis d\'Arlandes, Paris\'te sıcak hava balonuyla ilk serbest insanlı uçuşu gerçekleştirdi.', category: 'dunya' },
  ],
  '11-22': [
    { year: 1497, text: 'Vasco da Gama Ümit Burnu’nu dolaştı; Osmanlı baharat yollarını korumak için Kızıldeniz filosu kurdu.', category: 'osmanli' },
    { year: 1943, text: 'Lübnan Bağımsızlığını Kazandı', category: 'dunya' },
  ],
  '11-23': [
    { year: 1248, text: 'Kastilya Kralı III. Fernando, Müslümanların kontrolündeki Sevilla şehrini ele geçirdi.', category: 'islam' },
  ],
  '11-24': [
    { year: 1642, text: 'Hollandalı denizci Abel Tasman, Avustralya\'nın güneyindeki adayı keşfetti (günümüzdeki Tasmanya).', category: 'dunya' },
    { year: 1859, text: 'İngiliz biyolog Charles Darwin, türlerin evrimini açıklayan "Türlerin Kökeni" kitabını yayımladı.', category: 'dunya' },
    { year: 1976, text: 'Çaldıran-Muradiye Depremi', category: 'turkiye' },
  ],
  '11-25': [
    { year: 1071, text: 'Ebû Alî İbn Ebî Hüreyre\'vefatı', category: 'islam' },
    { year: 1177, text: 'Selahaddin Eyyubi komutasındaki Eyyubi ordusu, Remle Muharebesi\'nde Kudüs Krallığı\'na mağlup oldu.', category: 'islam' },
    { year: 1943, text: 'Bosna-Hersek DevletiTemelleri Atıldı', category: 'dunya' },
  ],
  '11-26': [
    { year: 1095, text: 'Papa II. Urbanus, Clermont Konsili\'nde Birinci Haçlı Seferi çağrısını yaptı.', category: 'dunya' },
    { year: 1943, text: 'Tosya-Ladik Depremi', category: 'turkiye' },
  ],
  '11-27': [
    { year: 1095, text: '1. Haçlı Saldırılarının Başlangıç - Papa II. Urbanus\'un Clermont Konsili çağrısı', category: 'islam' },
    { year: 1943, text: 'Abdurrahman Arvasi vefatı', category: 'islam' },
  ],
  '11-28': [
    { year: 1520, text: 'Ferdinand Magellan, Atlas Okyanusu\'nu geçip Pasifik Okyanusu\'na giren ilk Avrupalı oldu.', category: 'dunya' },
    { year: 1912, text: 'Arnavutluk Bağımsızlığını İlan Etti', category: 'dunya' },
  ],
  '11-29': [
    { year: 1360, text: 'Seyyid Emir Kilâl (K.S.) nın vefatı', category: 'islam' },
    { year: 1370, text: 'Nur Muhammed Bedayuni hazretleri vefatı', category: 'islam' },
    { year: 1947, text: 'Birleşmiş Milletler Genel Kurulu, Filistin\'in Arap ve Yahudi devletleri arasında bölünmesini öngören Planı kabul etti.', category: 'dunya' },
  ],
  '11-30': [
    { year: 1853, text: 'Kırım Savaşı sırasında Rus Karadeniz Donanması, Sinop Limanı\'ndaki Osmanlı filosuna aniden saldırdı (Sinop Baskını).', category: 'osmanli' },
  ],
  '12-01': [
    { year: 811, text: 'Davud-i Tai Hazretleri vefatı', category: 'islam' },
    { year: 1145, text: '2. Haçlı Saldırılarının Başlangıç - Papa III. Eugenius\'un \'Quantum praedecessores\' genelgesi', category: 'islam' },
    { year: 1913, text: 'Osmanlı Devleti\'nde Bab-ı Ali Baskını sonrası Sadrazamlığa getirilen Mahmud Şevket Paşa hükümeti vergi reformu adımlarını ilan etti.', category: 'osmanli' },
    { year: 1918, text: 'Yugoslavya Krallığı Kuruldu', category: 'dunya' },
    { year: 1918, text: 'Romanya Krallığı Birlik Günü', category: 'dunya' },
    { year: 1999, text: 'Rusya’da Grozni’nin Staropromyslovski bölgesinde en az 51 sivil Rus askerleri tarafından öldürüldü.', category: 'islam' },
  ],
  '12-02': [
    { year: 1459, text: 'Hızır Çelebi r.a. vefatı', category: 'islam' },
    { year: 1603, text: 'Muhammed Baki Billah hazretleri vefatı', category: 'islam' },
    { year: 1804, text: 'Napoleon Bonaparte, Paris\'teki Notre Dame Katedrali\'nde düzenlenen törenle Fransa İmparatoru olarak taç giydi.', category: 'dunya' },
    { year: 1971, text: 'Birleşik Arap Emirlikleri Kuruldu', category: 'dunya' },
    { year: 2015, text: 'Diyarbakır\'ın Sur ilçesinde hendek ve barikatların kaldırılması, terör unsurlarının etkisiz hale getirilmesi amacıyla geniş çaplı Sur Operasyonları başlatıldı.', category: 'turkiye' },
  ],
  '12-03': [
    { year: 1574, text: 'Osmanlı Devleti döneminde inşa edilen Mimar Sinan\'ın başyapıtı Selimiye Camii ibadete açıldı.', category: 'osmanli' },
    { year: 1967, text: 'Güney Afrikalı cerrah Christiaan Barnard, insanlık tarihindeki ilk başarılı kalp naklini gerçekleştirdi.', category: 'dunya' },
  ],
  '12-04': [
    { year: 765, text: 'Cafer-i Sadık (K.S.) in vefatı', category: 'islam' },
    { year: 1131, text: 'Büyük Selçuklu dönemi matematikçisi, astronomu ve şairi Ömer Hayyam Nişabur\'da vefat etti.', category: 'selcuklu' },
  ],
  '12-05': [
    { year: 1933, text: 'Amerika Birleşik Devletleri\'nde 13 yıl süren içki yasağı (Prohibition) Anayasa değişikliğiyle resmen sona erdi.', category: 'dunya' },
    { year: 1941, text: 'İmam Tevfik Efendi vefatı', category: 'islam' },
  ],
  '12-06': [
    { year: 1240, text: 'Batu Han komutasındaki Moğol ordusu Kiev kentini ele geçirip tahrip etti.', category: 'dunya' },
  ],
  '12-07': [
    { year: 1566, text: 'Kanûnî Sultan Süleyman’ın Zigetvar fethi sonrası vefat haberi payitahta ulaştı.', category: 'osmanli' },
  ],
  '12-08': [
    { year: 1863, text: 'İngiltere\'nin Londra kentinde dünyanın ilk yer altı demiryolu hattı (Metropol Hattı) faaliyete geçti.', category: 'dunya' },
  ],
  '12-09': [
    { year: 1917, text: 'I. Dünya Savaşı sırasında Kudüs, Osmanlı kuvvetlerinin çekilmesinin ardından İngiliz ordusu tarafından işgal edildi.', category: 'osmanli' },
    { year: 1987, text: 'Birinci İntifada\'nın Başlangıcı: Filistin halkının işgale karşı taşlarla başlattığı direnişe İsrail ordusu kurşunlar ve şiddetle karşılık verdi.', category: 'filistin' },
  ],
  '12-10': [
    { year: 730, text: 'Muhammed b. Vâsi‘ vefatı', category: 'islam' },
    { year: 1624, text: 'İmâm-ı Rabbâni Ahmed-i Faruk-i Serhendî (K.S.) nın vefatı', category: 'islam' },
    { year: 1781, text: 'Mazhar-ı Can-ı Canan hazretleri vefatı', category: 'islam' },
    { year: 1850, text: 'Şeyh Hacı Ahmed Yozgadi r.a. vefatı', category: 'islam' },
    { year: 1901, text: 'İsveçli kimyager Alfred Nobel\'in vasiyeti üzerine verilen ilk Nobel Ödülleri dağıtılmaya başlandı.', category: 'dunya' },
    { year: 2015, text: 'Prof. Dr. Aziz Sancar, Stockholm\'de düzenlenen törende Nobel Kimya Ödülü\'nü İsveç Kralı 16. Gustaf\'ın elinden aldı.', category: 'turk' },
  ],
  '12-11': [
    { year: 1241, text: 'Moğol İmparatoru Ögedey Han vefat etti; bu gelişme Avrupa\'ya ilerleyen Moğol ordularının geri çekilmesine yol açtı.', category: 'dunya' },
    { year: 1258, text: 'Bağdat\'ın Moğollar tarafından işgali (Abbâsîlerin yıkılışı)', category: 'islam' },
    { year: 2001, text: 'Çin, Dünya Ticaret Örgütü\'ne (WTO) katılarak küresel ticaret sistemine entegre oldu.', category: 'dunya' },
  ],
  '12-12': [
    { year: 640, text: 'Bilal-i Habeşi vefatı', category: 'islam' },
    { year: 652, text: 'Ebu\'d-Derdâ r.a. hazretleri vefatı', category: 'islam' },
    { year: 1098, text: 'Birinci Haçlı Seferi sırasında Haçlı orduları Ma\'arra şehrini (Ma\'arrat al-Nu\'man) ele geçirdi.', category: 'islam' },
  ],
  '12-13': [
    { year: 1250, text: 'Eyyubiler devletinin çöküşüyle birlikte Mısır merkezli Memlûk Devleti resmen kuruldu.', category: 'islam' },
    { year: 1648, text: 'Sultan İbrahim vefatı', category: 'osmanli' },
    { year: 2026, text: 'Yılın en zengin ve güvenilir gök olaylarından Geminid (İkizler) Meteor Yağmuru zirve yapıyor.', category: 'dunya' },
  ],
  '12-14': [
    { year: 1911, text: 'Norveçli kâşif Roald Amundsen ve ekibi Güney Kutbu\'na ulaşan ilk insanlar oldu.', category: 'dunya' },
    { year: 2026, text: 'Karakış Başlangıcı (Kışın en belirgin dönemi)', category: 'turkiye' },
    { year: 2026, text: 'Geminid Meteor Yağmuru\'nda saatte 100\'den fazla meteor görülebilen en yoğun saatler yaşanıyor.', category: 'dunya' },
  ],
  '12-15': [
    { year: 841, text: 'Bişr-i Hafi hz vefatı', category: 'islam' },
    { year: 1256, text: 'Hülâgû Han komutasındaki Moğol ordusu Alamut Kalesi\'ni ele geçirerek İsmaili devletine son verdi.', category: 'dunya' },
    { year: 1574, text: 'II. Selim vefatı', category: 'osmanli' },
  ],
  '12-16': [
    { year: 1773, text: 'Amerikalı kolonistlerin çay vergisini protesto etmek için İngiliz çay gemilerini basıp yükleri denize döktüğü Boston Çay Partisi gerçekleşti.', category: 'dunya' },
  ],
  '12-17': [
    { year: 1273, text: 'Büyük İslâm âlimi ve mutasavvıfı Mevlânâ Celâleddîn-i Rûmî Hazretleri’nin vuslatı (Şeb-i Arûs).', category: 'islam' },
    { year: 1903, text: 'İlk Motorlu ve Kontrollü Uçak Uçuşu - Wright Kardeşler', category: 'dunya' },
  ],
  '12-18': [
    { year: 1055, text: 'Tuğrul Bey\'in Bağdat\'a girişi', category: 'islam' },
    { year: 1916, text: 'I. Dünya Savaşı\'nın en kanlı çatışmalarından biri olan Verdun Muharebesi Fransız zaferiyle sona erdi.', category: 'dunya' },
  ],
  '12-19': [
    { year: 1111, text: 'İslam düşünce tarihinin en önemli mutasavvıf ve mütefekkiri olan İmam Gazali hazretleri vefat etti.', category: 'islam' },
  ],
  '12-20': [
    { year: 1824, text: 'Abdullah-ı Dehlevi hazretleri vefatı', category: 'islam' },
    { year: 1881, text: 'Osmanlı Devleti\'nin dış borçlarını denetlemek amacıyla Muharrem Kararnamesi ile Düyûn-ı Umûmiye İdaresi kuruldu.', category: 'osmanli' },
    { year: 1942, text: 'Niksar-Erbaa Depremi', category: 'turkiye' },
    { year: 2016, text: 'İstanbul Boğazı\'nı karayoluyla deniz tabanının altından bağlayan ilk çift katlı tünel geçişi olan Avrasya Tüneli açıldı.', category: 'dunya' },
  ],
  '12-21': [
    { year: 1876, text: 'I. Meşrutiyet ilan edildi ve Osmanlı Devleti\'nin ilk anayasası olan Kanun-ı Esasi yürürlüğe girdi.', category: 'osmanli' },
    { year: 2026, text: 'En Kısa Gündüz / En Uzun Gece (Kış Gündönümü)', category: 'turkiye' },
  ],
  '12-22': [
    { year: 1603, text: 'III. Mehmed vefatı', category: 'osmanli' },
    { year: 1914, text: 'Sarıkamış Harekâtı başladı; dondurucu kış şartlarında on binlerce vatan evladı donarak şehit düştü.', category: 'osmanli' },
    { year: 2026, text: 'Erbain Başlangıcı ("Kırk gün" süren sert kış dönemi)', category: 'turkiye' },
  ],
  '12-23': [
    { year: 1876, text: 'Tersane Konferansı (İstanbul Konferansı) Haliç\'te toplanarak Balkan sorunlarını görüşmeye başladı.', category: 'osmanli' },
  ],
  '12-24': [
    { year: 1144, text: '2. Haçlı Saldırılarının - Urfa\'nın kaybı', category: 'islam' },
    { year: 1638, text: 'Osmanlı Padişahı IV. Murad komutasındaki ordu Bağdat\'ı Safevilerden geri alarak fethetti.', category: 'osmanli' },
  ],
  '12-25': [
    { year: 800, text: 'Frank Kralı Şarlman (Charlemagne), Vatikan\'da Papa tarafından Kutsal Roma İmparatoru olarak taçlandırıldı.', category: 'dunya' },
    { year: 1683, text: 'Merzifonlu Kara Mustafa Paşa vefatı', category: 'islam' },
    { year: 1814, text: 'Şemsüddin Habibullah İbn-i Mirza Can (K.S.) nın vefatı', category: 'islam' },
    { year: 1824, text: 'Habibullah Cân-ı Cânan (K.S.) nın vefatı', category: 'islam' },
  ],
  '12-26': [
    { year: 1825, text: 'Rusya\'da Çar I. Nikolay\'a karşı reform talebiyle Dekabristler (Aralıkçılar) Ayaklanması gerçekleşti.', category: 'dunya' },
    { year: 1939, text: 'Büyük Erzincan Depremi', category: 'turkiye' },
  ],
  '12-27': [
    { year: 1660, text: 'Muhammed Sadık hazretleri vefatı', category: 'islam' },
    { year: 1936, text: 'İstiklâl Şairimiz Mehmed Âkif Ersoy Beyoğlu Mısır Apartmanı’nda vefat etti.', category: 'turkiye' },
    { year: 2008, text: 'Dökme Kurşun Operasyonu: İsrail\'in Gazze\'ye düzenlediği 22 günlük yıkıcı savaşta 1400\'den fazla sivil yaşamını yitirdi.', category: 'filistin' },
  ],
  '12-28': [
    { year: 1895, text: 'Lumière Kardeşler, Paris\'te Grand Café\'de tarihin ilk halka açık ticari sinema gösterimini gerçekleştirdi.', category: 'dunya' },
  ],
  '12-29': [
    { year: 1430, text: 'Somuncu Baba vefatı', category: 'islam' },
    { year: 1703, text: 'II. Mustafa vefatı', category: 'osmanli' },
    { year: 1911, text: 'Dış Moğolistan, Çin\'deki Qing Hanedanı\'nın çöküşü sırasında bağımsızlığını ilan etti.', category: 'dunya' },
  ],
  '12-30': [
    { year: 1066, text: 'Endülüs Emevî sonrası dönemde Gırnata\'da meydana gelen büyük toplumsal karışıklıklar ve çatışmalar yaşandı.', category: 'islam' },
  ],
  '12-31': [
    { year: 652, text: 'Abdullah bin Mes\'ûd r.a. hazretleri vefatı', category: 'islam' },
    { year: 728, text: 'Kâsım Bin Muhammed (K.S.) in vefatı', category: 'islam' },
    { year: 874, text: 'Bayezid-i Bestami (K.S.) nın vefatı', category: 'islam' },
    { year: 1300, text: 'Mahmud İncir Fag\'nevi (K.S.) nın vefatı', category: 'islam' },
    { year: 2004, text: 'Dünyanın bir dönem en yüksek gökdeleni olan ve modern mühendisliğin zirvesi Taipei 101 açıldı.', category: 'dunya' },
  ],
};

const DEFAULT_DAILY_EVENTS: HistoricalEvent[][] = [
  [
    { year: 1453, text: 'Fatih Sultan Mehmed Han döneminde ilim ve medrese vakıfları İstanbul\'un dört bir yanında inşa edildi.', category: 'osmanli' },
    { year: 622, text: 'Hicret-i Nebevî ile Medine-i Münevvere\'de İslâm kardeşliği (Muâhât) tesis edildi.', category: 'islam' }
  ],
  [
    { year: 1071, text: 'Büyük Selçuklu Devleti döneminde Nizamiye Medreseleri ilim dünyasına rehberlik etti.', category: 'selcuklu' },
    { year: 1557, text: 'Mimar Sinan\'ın kalfalık eseri Süleymaniye Camii ve Külliyesi dualarla ibadete açıldı.', category: 'osmanli' }
  ],
  [
    { year: 1517, text: 'Yavuz Sultan Selim Han, "Hâdimü\'l-Harameyni\'ş-Şerîfeyn" (Mekke ve Medine\'nin Hizmetkârı) unvanını kabul etti.', category: 'osmanli' },
    { year: 1187, text: 'Selâhaddin Eyyûbî, Kudüs-i Şerif\'te adalet ve eman nizamını tesis etti.', category: 'filistin' }
  ],
  [
    { year: 1299, text: 'Osman Gazi, Şeyh Edebali\'nin "İnsanı yaşat ki devlet yaşasın" düsturuyla Osmanlı Beyliği\'nin temellerini attı.', category: 'osmanli' },
    { year: 630, text: 'Veda Haccı\'nda Peygamber Efendimiz (s.a.v.) insan hakları beyannamesi niteliğindeki Veda Hutbesi\'ni irad buyurdu.', category: 'islam' }
  ]
];

export function getHistoricalEventsForDate(date: Date): HistoricalEvent[] {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const key = `${m}-${d}`;
  if (HISTORICAL_EVENTS_MAP[key] && HISTORICAL_EVENTS_MAP[key].length > 0) {
    return HISTORICAL_EVENTS_MAP[key];
  }
  const dayIndex = (date.getMonth() * 31 + date.getDate()) % DEFAULT_DAILY_EVENTS.length;
  return DEFAULT_DAILY_EVENTS[dayIndex];
}
