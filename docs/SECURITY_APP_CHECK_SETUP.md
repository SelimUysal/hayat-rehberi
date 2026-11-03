# Firebase App Check Kurulum Planı

> **Devam noktası:** Bu dosya, Hayat Rehberi Web için Firebase App Check çalışmasına daha sonra kaldığımız yerden devam etmek üzere hazırlanmıştır.

## Mevcut durum (3 Kasım 2026)

- [x] Çalışma için `security/firebase-app-check-setup` dalı açıldı.
- [ ] Google Cloud reCAPTCHA Enterprise Web site key henüz oluşturulmadı.
- [ ] `selimuysal.github.io` domaini henüz reCAPTCHA yapılandırmasına eklenmedi.
- [ ] Firebase App Check'te **Hayat Rehberi Web** henüz kaydedilmedi. Firebase Console durumu: **Not registered**.
- [ ] Uygulama koduna App Check entegrasyonu yapılmadı.
- [ ] App Check metrikleri henüz izlenmedi.
- [ ] Firestore için Enforcement etkinleştirilmedi.

### API anahtarı hakkında mevcut bulgular

Google Cloud Credentials ekranında `Browser key (auto created by Firebase)` adlı anahtar görüldü. Application restrictions değeri `None`; API restrictions altında Firebase ile ilişkili 25 API seçili. Bu, Firebase Web yapılandırmasında kullanılan istemci anahtarının public olabilmesiyle uyumludur; tek başına yönetici/servis hesabı anahtarı değildir.

**Bu anahtarı silme veya döndürme.** Bu çalışmanın parçası olarak mevcut Firebase API key ayarlarını değiştirme. Servis hesabına ait özel JSON/private key dosyalarını asla repoya ekleme.

## Yapılacaklar

### 1. Google Cloud'da reCAPTCHA Enterprise Web anahtarı oluştur
- [ ] Google Cloud Console'da doğru proje olan `hayat-rehberi-selimuysal` seçili olduğunu doğrula.
- [ ] reCAPTCHA Enterprise için web site key oluştur.
- [ ] Anahtar türünü Firebase App Check'in güncel Web sağlayıcı kurulumuyla uyumlu seç.
- [ ] Site key'i gizli bir sunucu anahtarıyla karıştırma; gizli anahtarları repoya koyma.

### 2. Domain'i tanımla
- [ ] İzin verilen domain olarak `selimuysal.github.io` ekle.
- [ ] Uygulamanın gerçek yayın adresini doğrula: `https://selimuysal.github.io/hayat-rehberi/`.
- [ ] Geliştirme/önizleme ortamları gerekiyorsa bunları ayrıca değerlendir; gereksiz domain ekleme.

### 3. Firebase App Check'te Web uygulamasını kaydet
- [ ] Firebase Console > App Check > Apps bölümünde **Hayat Rehberi Web** uygulamasını aç.
- [ ] reCAPTCHA Enterprise sağlayıcısını seçip oluşturulan site key ile kaydet.
- [ ] Uygulamanın App Check durumunun kayıtlı/aktif hale geldiğini doğrula.

### 4. Uygulamaya App Check entegrasyonunu ekle
- [ ] Önce `src/account/firebaseClient.ts` dosyasının ve mevcut Firebase başlatma akışının güncel halini incele.
- [ ] Mevcut Firebase Auth ve Firestore başlatma düzenini bozmadan App Check başlatmasını ekle.
- [ ] Site key'i uygun istemci yapılandırmasıyla kullan; hiçbir gizli anahtarı veya service-account credential'ını commit etme.
- [ ] Gerekirse yerel geliştirme için Firebase App Check debug provider'ını yalnızca geliştirme ortamında ve kontrollü şekilde yapılandır; debug token'ı herkese açık repoya yazma.
- [ ] Uygulama derlemesini ve mevcut kontrolleri çalıştır.

### 5. Test et ve App Check metriklerini izle
- [ ] GitHub Pages üzerinde yayınlanan uygulamayı test et.
- [ ] Google ile giriş, e-posta/şifre girişi, çıkış ve oturumun yeniden yüklenmesini kontrol et.
- [ ] Firestore kullanıcı verisi/progress okuma-yazma ve hesap senkronizasyonunu test et.
- [ ] Tarayıcı konsolunda App Check, Auth veya Firestore hatası olmadığını kontrol et.
- [ ] Firebase App Check metriklerinde geçerli, geçersiz ve doğrulanmamış istekleri izle.
- [ ] Beklenmeyen hata veya kullanıcı etkisi varsa Enforcement açmadan önce sorunu düzelt ya da kod değişikliğini geri al.

### 6. Firestore Enforcement'ı değerlendir
- [ ] Yalnızca entegrasyon ve gerçek kullanım testleri başarılı olduktan, metrikler yeterli süre incelendikten sonra değerlendir.
- [ ] Önce hangi Firebase ürünlerinin App Check Enforcement desteklediğini ve mevcut kullanım etkisini doğrula.
- [ ] Firestore Enforcement'ı ancak geçerli istemci isteklerinin App Check token'ı taşıdığı doğrulandıktan sonra etkinleştir.
- [ ] Etkinleştirme sonrası giriş, veri okuma/yazma ve senkronizasyonu yeniden test et.

## Güvenli çalışma kuralları

- `main` dalına doğrudan commit atma; tüm değişiklikleri bu çalışma dalında yap.
- Her aşamada küçük ve açıklayıcı commit'ler kullan.
- Firebase Auth, Firestore Security Rules, hesap senkronizasyonu veya mevcut kullanıcı deneyimini gereksiz yere değiştirme.
- Enforcement'ı testlerden ve metrik incelemesinden önce açma.
- İş tamamlandığında değişiklikleri gözden geçir; otomatik olarak `main` dalına merge etme.

## Yeniden başlama talimatı

Bu projeye geri dönüldüğünde **ilk olarak bu dosyayı oku ve `security/firebase-app-check-setup` dalına geç**. İlk yapılacak işlem 1. adımdır: Google Cloud'da reCAPTCHA Enterprise Web site key oluşturmak. Yukarıdaki kutucukları tamamlandıkça güncelle.
