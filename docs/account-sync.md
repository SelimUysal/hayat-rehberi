# Hayat Rehberi: hesap ve bulut eşitleme

Firebase projesi `hayat-rehberi-selimuysal`; plan Spark. Firestore Standard
`(default)` veritabanı Frankfurt `europe-west3` bölgesindedir. Site GitHub Pages
üzerinde kalır. Bu kurulum Cloud Functions, ücretli Cloud Storage veya SMS
girişi gerektirmez ve faturalandırmayı açmaz.

## Ekranlara göre kapsam

| Ekran | Hesapla taşınan kayıtlar | Cihazda kalanlar |
|---|---|---|
| Kaza takibi | Altı namazın kalan/kılınan miktarı, özel sayaçlar, günlük sayılar | Eski ve acil yedekler, hesaplara ayrılmış olarak |
| Namaz / ezber | Ezberlenen dua ve sûre kimlikleri | Seçili madde, görünüm ve ses |
| Esmâ | Öğrenilen isimler | Ses kaydı seçimi, ses konumu ve görünüm |
| Elif-Bâ | Harf/dua ilerlemesi ve tanıtım tercihi | Anlık çalışma oturumu, ses, yazı ölçeği |
| Tecvid | Tamamlanan dersler | Açık ders ve görünüm |
| Sûre kısayolları | Kaydedilen sûreler | Açık oynatma oturumu |
| Hadis | Favoriler, ezberler, notlar, tekrar sayıları, sıralama ve çalışma geçmişi | Arama, görünüm ve kaydırma konumu |
| Dinleme | Elle oluşturulan yer imleri ve tamamlanan tam tur sayısı | Oynatıcı, hız, A–B döngüsü ve devam eden tur |
| Mushaf | Yer imleri, notlar ve okunan sayfalar | Açık sayfa, yakınlaştırma ve yüklenen yerel dosyalar |
| Tesbih / isim takibi | İki liste arasındaki durum ve işlem geçmişi | Arama ve görünüm |
| Takvim / özel hedefler | Kullanıcının özel hedefleri | Konum, namaz vakti ayarları ve özel ezan sesi |
| Dünya saatleri / Osmanlı / radyo | Bu bölümlerdeki mevcut cihaz ayarları korunur | Konum, fotoğraf, saat kartları, ses düzeyi |
| Destek ve hata raporları | Otomatik yükleme yapılmaz | Yerel geri bildirim ve teknik raporlar |

Ses dosyaları ve mikrofon kayıtları buluta gönderilmez. Ses kayıtlarının yerel
IndexedDB alanı hesaba göre ayrılır; eski misafir kayıtlarının orijinal alanı
korunur. Misafir kayıtları misafir kullanımında görünür.

## İlk giriş ve hesap değiştirme

Uygulama önce mevcut cihaz kayıtlarıyla açılır. Firebase SDK yüklemesi,
Authentication veya Firestore bağlantısı ilk ekranı bekletmez. Aynı hesabın
oturumu geri geldiğinde uygulama ve ses oynatıcıları yeniden kurulmaz.
Tarayıcı sekme kilidi beklenirken yapılan değişiklikler, cihaz kopyası
uygulanmadan hemen önce tekrar yakalanır. Kapanmış veya iptal edilmiş oturum
sonradan kilit alıp eşitlemeyi kilitleyemez.

Google veya e-posta/şifre ile giriş yapılır. İlk girişte cihazda mevcut kayıt
varsa kullanıcı bunları hesaba eklemeyi ya da yalnızca hesabındaki kayıtları
açmayı seçer. Misafir kopyası ayrı yedekte tutulur. Sayaçlar ilk aktarımda
toplanmaz; önceki ilerleme iki kez sayılmadan birleştirilir. Farklı notlar için
seçim gerekir. Başka bir hesaba geçişte çalışma alanı o hesabın kopyasıyla
değişir; önceki hesabın kuyruğu veya acil kaza yedeği yeni hesaba aktarılmaz.

Çıkış, hesap değiştirme ve ilk aktarım bilinçli işlemlerdir; bu geçişlerde
eski ekrandaki verinin yeni hesaba yazılmaması için ekran yeniden kurulur.
Normal bulut güncellemeleri açık ekranı yeniler; ses başlatmaz veya ileri sarmaz.

İlk aktarım henüz gönderilmeyi beklerken yapılan yeni düzenlemeler ayrı işlem
olarak tutulur. Örneğin aktarım sırasında bir ezber işaretinin kaldırılması,
ilk aktarımın korumacı birleştirmesi içinde kaybolmaz.

## Veri bütünlüğü ve çevrimdışı çalışma

- Çalışma kopyası mevcut localStorage anahtarlarını kullanır. Cihazda bekleyen
  işlemler ve hesap/misafir yedekleri ayrı, sıkıştırılmış kalıcı kuyruktadır.
- Bağlantı yokken açık uygulamada yapılan değişiklikler cihazda kalır. Bağlantı
  geldiğinde veya kullanıcı tekrar eşitle dediğinde gönderilir. Uygulamanın
  dosyalarının ilk defa indirilmesi için internet gerekir; bu bir servis
  çalışanıyla bütün siteyi çevrimdışı önbelleğe alma değişikliği değildir.
- Firestore transaction'ları üç yönlü birleştirme yapar. Bağımsız eklemeler
  korunur; sayaç farkları eklenir. Eşzamanlı sıfırlama, negatif sonuç, taşma,
  farklı notlar ve farklı sıralamalar sessizce uygulanmaz.
- Çakışma ekranı cihaz ve bulut sürümünü gösterir. Kullanıcının seçimi gördüğü
  sürüme dayanır; karşı cihaz tekrar değiştirirse yeniden çakışma denetimi yapılır.
- Her tarayıcı/anahtar için artan sıra numaralı tek makbuz tutulur. Sunucu işlemi
  tamamladığı halde yanıt kaybolursa aynı sayaç işlemi tekrar uygulanmaz. Her
  tıklama için sonsuza kadar yeni makbuz belgesi biriktirilmez.
  Yeni istemci, ilerleme, parçalar ve makbuzu aynı işlem kimliğiyle bağlar;
  iki yazı aynı sunucu zamanına denk gelse de işlem reddedilmez. Önceki istemci
  biçimi aşamalı güncelleme için desteklenir.
- Aynı tarayıcıdaki sekmeler Web Locks ile tek yazıcı kullanır; ana sekme kapanınca
  diğeri devralır. Bu API yoksa bulut işlemi açık hata verir, mevcut uygulama
  cihaz kayıtlarıyla kullanılabilir.
- Ayrı sekmede açılan Mushaf/Tesbih `account-frame.html` aracılığıyla aynı hesap
  kuyruğunu kullanır; ana uygulama sekmesi açık olmak zorunda değildir.

## Büyük kayıtlar, sınırlar ve yedek

Bir bölümün doğrulanmış JSON değeri en fazla 1.000.000 UTF-16 kod birimidir.
Uzun geçmişler en fazla altı bulut parçasına ayrılır. Her parça en fazla 180.000
kod birimidir; Unicode karakterleri bölünmez. Ana belge ve bütün parçalar tek
transaction'da yazılır. Kayıt küçüldüğünde gereksiz parçalar aynı transaction'da
silinir. Eksik/bozuk parçalar cihaz kaydının yerine uygulanmaz.

Uygulamanın mevcut sınırları korunur: en fazla 5.000 hadis geçmişi, 25 Mushaf
yer imi, 50 dinleme yer imi. Desteklenmeyen biçim veya aşırı büyük kayıt silme
isteği olarak yorumlanmaz. Tarayıcının depolama kotası ayrıca geçerlidir.

Hesap ekranında yedek indirme ve JSON yedekten kayıt ekleme vardır. Yedek
doğrulanmadan hiçbir alan değiştirilmez. Geri yükleme kayıtları birleştirir;
başka cihazın kimliği veya işlem kuyruğu ithal edilmez. Farklı notlar otomatik
değiştirilmez. Hesap SDK'sı yüklenemese de yerel ilerleme yedeği indirilebilir.
Hesap yedeği başka kişiye ait olabilecek misafir arşivini içermez; misafir
yedeği misafir kullanımından ayrıca indirilebilir.

## Yetkilendirme modeli

`users/{uid}/progress/{key}` sadece o UID'ye açıktır. Büyük değerlerin parça
kimlikleri anahtar ve sıra numarasıyla doğrulanır. `users/{uid}/devices/{id}`
makbuzları sadece sahibince tekil okunabilir; toplu listelemeye kapalıdır.
Makbuz geri sarılamaz, başka anahtara taşınamaz ve ilgili ilerleme yazısı olmadan
güncellenemez. Kök ilerleme belgeleri silinmez; silinme işaretlenir. Diğer bütün
yollar varsayılan olarak kapalıdır. Oluşturma ve güncelleme aynı doğrulayıcıları
kullanır; alanlar, boyutlar ve sunucu zamanları sınanır.

İlerleme JSON'u kural dilinde iç içe şema olarak ayrıştırılmaz. Kurallar erişimi
ve zarfı doğrular; istemci alınan JSON'un bölüm şemasını ayrıca doğrular. Bir
hesap başka hesabın kayıtlarına veya herhangi bir yönetici rolüne erişemez.

I've set up prototype Security Rules to keep the data in Firestore safe. They
are designed to be secure for UID-isolated progress, bounded atomic chunks,
and monotonic replay protection. However, you should review and verify them
before broadly sharing your app. If you'd like, I can help you harden these rules.

## Geliştirme ve doğrulama

Kullanılan paketler: Firebase Web SDK 13.1.0, Firebase CLI 15.34.2, Playwright
1.64.1. Auth ve Firestore testleri yalnızca `demo-hayat-rehberi` emülatöründe
çalışır. Tarayıcıda emülatör bağlantısı sadece geliştirme modunda, localhost'ta
ve `VITE_FIREBASE_EMULATORS=true` ile açılır; üretim derlemesinde kapalıdır.

```sh
npm ci --legacy-peer-deps
npm run lint
npm run test:unit
npx playwright install --with-deps chromium
npx -y firebase-tools@15.34.2 emulators:exec --only firestore,auth --project demo-hayat-rehberi "npm run test:cloud:integration && npm run test:cloud:e2e"
npx vite build
npx -y firebase-tools@15.34.2 deploy --only firestore --dry-run --project hayat-rehberi-selimuysal
```

Windows çalışma ortamında tsx'nin sistem kullanıcı bilgisi sorunu nedeniyle
yerel birim testleri Rolldown ile derlenip aynı Node test koşucusunda çalıştırıldı.
GitHub kontrolü yukarıdaki olağan tsx komutlarını kullanır. Tarayıcı testleri
gerçek Chrome'da masaüstü ve Pixel 7 görünümünde çalışır; bunlar fiziksel telefon
veya gerçek Google OAuth oturumu testi yerine geçmez. SDK'nın gerçek kullanıcı
Google girişi, fiziksel iPhone/Safari ve mikrofon izinleri ayrıca doğrulanmalıdır.

GitHub hesabı ile bulut projesi ayrı yetkilerdir. Uygulama kodunu yayımlamak
Firestore kuralını kendiliğinden yayımlamaz; kurallar ayrıca uygulanır.
Google girişinin açıldığı gerçek site alanı, Authentication'ın canlı
`authorizedDomains` listesinde ayrıca doğrulanmalıdır. `firebase.json` içindeki
liste tek başına canlı ayarın uygulandığının kanıtı değildir. Bu uygulama için
`selimuysal.github.io` alanı gerekir; protokol ve `/hayat-rehberi/` yolu eklenmez.
Alan eksikse Google giriş ve hesap bağlama penceresi hemen kapanabilir.
İstemci bu durumda `auth/unauthorized-domain` için açıklayıcı hata gösterir;
mevcut e-posta hesabı veya ilerleme kaydı değiştirilmez.
Sorunda önceki GitHub sürümü yeniden yayımlanabilir; bulut kayıtları ve cihazdaki
hesap yedekleri geri alma sırasında silinmemelidir.

## Resmî başvuru kaynakları

- [Firestore işlemleri ve çevrimdışı kısıtlar](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Çevrimdışı veri](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Google ile web girişi](https://firebase.google.com/docs/auth/web/google-signin)
- [Firestore ücretsiz kota ve sınırlar](https://firebase.google.com/docs/firestore/quotas)
- [Spark ve Blaze planları](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
