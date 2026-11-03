# Hayat Rehberi

![Hayat Rehberi](public/icon-512.png)

**Hayat Rehberi**, Kur'an-ı Kerim okuma ve ezberleme, namaz, ibadet takibi ve manevi öğrenme süreçlerini tek bir uygulamada bir araya getiren web uygulamasıdır.

<p align="center">
  <a href="https://selimuysal.github.io/hayat-rehberi/"><strong>🌐 Canlı Uygulamayı Aç</strong></a>
</p>

Uygulama masaüstü ve mobil tarayıcılarda kullanılabilir. Destekleyen tarayıcılarda ana ekrana uygulama olarak da eklenebilir.

---

## Ziyaretçiler için

### Neler yapabilirsiniz?

- **Namaz vakitleri ve takvim:** Konuma göre namaz vakitleri, geri sayım, hicrî takvim ve dinî günler.
- **Namaz rehberi:** Farz ve nafile namazların anlatımları, sûreler, dualar ve ilmihal içerikleri.
- **Kaza takibi:** Kaza namazı ve diğer kişisel takip sayaçları.
- **Kur'an-ı Kerim / Mushaf:** Mushaf sayfaları ve bilgisayar hattı üzerinden okuma, yer imleri ve kaldığınız yeri takip etme.
- **Ezber Asistanı:** Sûre ve ayetleri tekrar ederek çalışma, gizle/göster ve ezber takibi.
- **Kur'an dinleme:** Kârî seçenekleri, sûre geçişleri, tekrar ve dinleme yer imleri.
- **Elif-Bâ ve Tecvid:** Harfleri, harekeleri ve temel tecvid konularını öğrenme.
- **Hadis-i Şerif:** Hadisleri okuma, ezberleme ve çalışma ilerlemesini takip etme.
- **Esmâü'l-Hüsnâ:** Allah'ın güzel isimlerini öğrenme ve zikir sayacı.
- **SadaQuran Radio:** Kur'an-ı Kerim yayını.
- **Osmanlı saati ve dünya saatleri:** Ezânî zaman, tarihî saat yaklaşımı ve farklı şehirlerin saatleri.
- **Evrensel arama:** Uygulama içindeki içeriklere tek noktadan ulaşma.

### Kayıtlarınız ve hesap eşitleme

- Hesap açmadan, misafir olarak uygulamanın temel özelliklerini kullanabilirsiniz.
- İsteğe bağlı hesap girişiyle desteklenen ilerleme ve yer imleri cihazlar arasında eşitlenebilir.
- Uygulama, yerel cihaz kayıtlarını ve bulut eşitlemesini birlikte kullanır.
- Hesap bölümündeki yedekleme ve geri yükleme seçenekleriyle kayıtlarınızı dışa aktarabilir veya geri yükleyebilirsiniz.

**Not:** Eşitleme, desteklenen kayıt türleriyle sınırlıdır. Tarayıcı verilerini silmeden önce önemli kayıtlarınızın yedeğini almanız önerilir.

---

## Geliştiriciler için

### Teknoloji altyapısı

| Alan | Teknoloji |
|---|---|
| Arayüz | React 19, TypeScript |
| Geliştirme ve derleme | Vite |
| Stil | Tailwind CSS v4 |
| İkonlar | Lucide React |
| Hesap ve veri eşitleme | Firebase Authentication, Cloud Firestore |
| Sunucu | Node.js, Express |
| İsteğe bağlı yapay zekâ | Google Gemini API |
| Test | Node.js test runner, Playwright, Firebase Emulator |
| Canlı statik yayın | GitHub Pages, GitHub Actions |

### Gereksinimler

- Node.js 24 (GitHub Actions iş akışında kullanılan sürüm)
- npm
- Firebase Emulator testleri için Java 21
- Uçtan uca testler için Playwright Chromium

### Kurulum

Depoyu klonlayın:

```bash
git clone https://github.com/SelimUysal/hayat-rehberi.git
cd hayat-rehberi
```

Bağımlılıkları yükleyin:

```bash
npm install --legacy-peer-deps
```

Ortam değişkenleri dosyasını oluşturun:

**macOS / Linux**
```bash
cp .env.example .env
```

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde açılır.

### Firebase geliştirme güvenliği

**Önemli:** Yerel geliştirme ortamı, emülatör seçeneği etkinleştirilmediğinde gerçek Firebase projesine bağlanabilir. Gerçek kullanıcı hesaplarıyla veya verileriyle test yapmayın.

Hesap ve eşitleme özelliklerini güvenli biçimde test etmek için:

1. Firebase Authentication ve Firestore emülatörlerini başlatın:

```bash
npx -y firebase-tools@15.34.2 emulators:start --only auth,firestore --project demo-hayat-rehberi
```

2. İkinci terminalde emülatör değişkenini etkinleştirerek uygulamayı başlatın.

**macOS / Linux**
```bash
VITE_FIREBASE_EMULATORS=true npm run dev
```

**Windows PowerShell**
```powershell
$env:VITE_FIREBASE_EMULATORS="true"
npm run dev
```

Emülatör bağlantısı yalnızca yerel geliştirme ortamında kullanılabilir.

### Test ve kalite kontrolleri

TypeScript kontrolü:

```bash
npm run lint
```

Birim testleri:

```bash
npm run test:unit
```

Bulut eşitleme ve uçtan uca testler Firebase emülatörleri üzerinden çalıştırılmalıdır. Java 21 ve Playwright Chromium kurulumundan sonra:

```bash
npx playwright install chromium
npx -y firebase-tools@15.34.2 emulators:exec --only firestore,auth --project demo-hayat-rehberi "npm run test:cloud:integration && npm run test:cloud:e2e"
```

Bu testler üretim Firebase projesini kullanmak üzere tasarlanmamıştır.

### Derleme ve yayınlama

Tam Node.js sunucu derlemesi:

```bash
npm run build
npm start
```

Bu komutlar Express sunucusunu çalıştırabilen bir Node.js ortamı içindir.

**GitHub Pages hakkında:** Canlı site, GitHub Actions üzerinden statik Vite çıktısı olarak yayımlanır. `.github/workflows/deploy.yml` iş akışı `main` veya `master` dalına yapılan push işlemlerinde kontrolleri çalıştırır, uygulamayı derler ve GitHub Pages'e gönderir.

GitHub Pages bir Node.js sunucusu çalıştırmaz. Bu nedenle `server.ts` içindeki Gemini analizi, geri bildirim, sunucu taraflı Kur'an proxy'si ve Mushaf yükleme gibi Express API uç noktaları, ayrıca bir Express sunucusu barındırılmadıkça GitHub Pages üzerinde kullanılamaz.

### Ortam değişkenleri ve güvenlik

Gerçek değerleri `.env` dosyasında tutun; bu dosyayı GitHub'a yüklemeyin.

- `GEMINI_API_KEY`: Gemini istekleri için sunucu tarafında kullanılır. İstemci tarafına taşımayın ve `VITE_` öneki eklemeyin.
- `VITE_GOOGLE_MAPS_API_KEY`: Tarayıcıya gönderilen istemci değişkenidir; gizli anahtar olarak değerlendirilmemelidir. Google Cloud tarafında HTTP referrer ve API kısıtlamaları uygulayın.
- Firebase web yapılandırması istemci uygulamalarında bulunabilir; erişim güvenliği Authentication ve Firestore Security Rules ile sağlanmalıdır.

---

## Proje yapısı hakkında

- `src/`: React uygulaması ve arayüz bileşenleri
- `src/account/`: Hesap, kimlik doğrulama ve eşitleme kodları
- `public/`: Statik dosyalar, ikonlar ve uygulama verileri
- `tests/`: Birim, entegrasyon ve uçtan uca testler
- `.github/workflows/`: GitHub Actions iş akışları
- `server.ts`: Express sunucusu ve sunucu taraflı API uç noktaları

---

## Lisans ve kullanım

Bu depoda şu anda ayrı bir `LICENSE` dosyası bulunmamaktadır. Bu nedenle kodun yeniden kullanımı, değiştirilmesi ve dağıtımı için açık kaynak lisansı tanımlandığı varsayılmamalıdır. Bir lisans seçildiğinde bu bölüm güncellenecektir.

---

**Canlı uygulama:** https://selimuysal.github.io/hayat-rehberi/  
**Kaynak kod:** https://github.com/SelimUysal/hayat-rehberi
