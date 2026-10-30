import React, { useState, useMemo, useEffect, useRef } from 'react';
import { resolveLocationTimezone } from '../utils/locationTimezone';
import { Coordinates } from '../types/prayer';
import { CITIES_DATA } from '../data/cities';
import { reverseGeocode, searchLocations, getApproximateLocationByIP, GeocodedAddress } from '../utils/geocoding';
import { X, Search, MapPin, LocateFixed, Loader2, Sparkles, Copy, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: Coordinates;
  onSelectCity: (city: Coordinates) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onSelectCity
}) => {
  const [search, setSearch] = useState('');
  const [activeMode, setActiveMode] = useState<'preset' | 'custom'>('preset');

  // Hızlı Google Maps Koordinat Yapıştırma Alanı (örn: "41.008238, 28.978359")
  const [rawPastedCoords, setRawPastedCoords] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Özel koordinat formu state'leri (6 basamak hassasiyetli)
  const [customLat, setCustomLat] = useState(() => Number(currentCity.lat).toFixed(6));
  const [customLng, setCustomLng] = useState(() => Number(currentCity.lng).toFixed(6));
  const [customTz, setCustomTz] = useState(currentCity.timezone.toString());
  const [customName, setCustomName] = useState('');
  const [detectedAddress, setDetectedAddress] = useState<GeocodedAddress | null>(null);
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);

  // Canlı konum ve online arama state'leri
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [onlineSearchResults, setOnlineSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Modal her açıldığında koordinatları ve isim alanını 6 hane hassasiyetle yükle
  useEffect(() => {
    if (isOpen) {
      setCustomLat(Number(currentCity.lat).toFixed(6));
      setCustomLng(Number(currentCity.lng).toFixed(6));
      setCustomTz(currentCity.timezone.toString());
      setCustomName(currentCity.district ? `${currentCity.district}, ${currentCity.city}` : currentCity.city);
      setRawPastedCoords('');
      setPasteSuccess(false);
      setGeoError(null);
    }
  }, [isOpen, currentCity]);

  // Google Maps koordinatını (örn: "41.008238, 28.978359" veya "41,008238 28,978359") otomatik ayrıştırma
  const parseAndApplyCoordinates = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;

    // Koordinatları virgül, boşluk veya noktalı virgülle ayır
    // Örnek: "41.008238, 28.978359" veya "41.008238 28.978359" veya "41,008238, 28,978359"
    // Önce Türkçe virgülleri noktalara çevirirken birden fazla virgülü doğru ayır
    const cleaned = trimmed.replace(/\s+/g, ' ');
    
    // Regex ile iki adet ondalıklı sayıyı yakala (enlem [-90, 90] ve boylam [-180, 180])
    const match = cleaned.match(/([+-]?\d+[.,]?\d*)[,\s/|;]+([+-]?\d+[.,]?\d*)/);
    if (match && match[1] && match[2]) {
      const latNum = parseFloat(match[1].replace(',', '.'));
      const lngNum = parseFloat(match[2].replace(',', '.'));

      if (!isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
        setCustomLat(latNum.toFixed(6));
        setCustomLng(lngNum.toFixed(6));
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 3000);
        return true;
      }
    }
    return false;
  };

  // Yerel hazır şehir listesi filtresi
  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CITIES_DATA;
    return CITIES_DATA.filter(
      (c) => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [search]);

  // Canlı internet araması (İlçe, mahalle veya köy arandığında)
  useEffect(() => {
    const query = search.trim();
    if (query.length < 3) {
      setOnlineSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      const results = await searchLocations(query);
      setOnlineSearchResults(results);
      setIsSearchingOnline(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const buttons = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!buttons.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Koordinattan adresi otomatik çöz
  const handleDetectAddressFromCoords = async () => {
    const lat = parseFloat(customLat.replace(',', '.'));
    const lng = parseFloat(customLng.replace(',', '.'));
    if (isNaN(lat) || isNaN(lng)) {
      alert('Lütfen önce geçerli bir enlem ve boylam giriniz.');
      return;
    }

    setIsDetectingAddress(true);
    const addr = await reverseGeocode(lat, lng);
    setIsDetectingAddress(false);

    if (addr) {
      setDetectedAddress(addr);
      setCustomName(addr.shortLocationName);
    }
  };

  // Özel koordinat formunu onaylama (ANINDA VAKİTLERİ YENİLER VE MODALI KAPATIR)
  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanLatStr = customLat.trim().replace(',', '.');
    const cleanLngStr = customLng.trim().replace(',', '.');
    const cleanTzStr = customTz.trim().replace(',', '.');

    const lat = parseFloat(cleanLatStr);
    const lng = parseFloat(cleanLngStr);
    const timezone = cleanTzStr === '' ? currentCity.timezone : Number(cleanTzStr);
    if (!Number.isFinite(timezone) || timezone < -12 || timezone > 14) { alert('Geçerli bir UTC saat dilimi girin (-12 ile +14).'); return; }

    if (isNaN(lat) || isNaN(lng)) {
      alert('Lütfen geçerli sayısal koordinat değerleri giriniz (örn: 41.008238, 28.978359).');
      return;
    }

    if (lat < -90 || lat > 90) {
      alert('Enlem değeri -90 ile +90 derece arasında olmalıdır.');
      return;
    }
    if (lng < -180 || lng > 180) {
      alert('Boylam değeri -180 ile +180 derece arasında olmalıdır.');
      return;
    }

    // Google Maps standart 6 basamak hassasiyet (yaklaşık 10 cm hassasiyet)
    const exactLat = Number(lat.toFixed(6));
    const exactLng = Number(lng.toFixed(6));

    let finalName = customName.trim();
    const district = detectedAddress?.district;
    const neighborhood = detectedAddress?.neighborhood;
    const detailedAddress = detectedAddress?.displayName;
    const country = detectedAddress?.country || 'Özel Konum';

    if (!finalName) {
      finalName = `Özel Konum (${exactLat.toFixed(6)}°, ${exactLng.toFixed(6)}°)`;
    }

    // 1. ANINDA seçilen şehri ve koordinatları bildir (hiçbir ağ isteği bekletilmez)
    onSelectCity({
      city: finalName,
      country,
      district,
      neighborhood,
      detailedAddress,
      lat: exactLat,
      lng: exactLng,
      timezone
    });

    // 2. Modalı hemen kapat
    onClose();

    // 3. Arka planda adres çözümlenmemişse ve kullanıcı isim yazmamışsa zenginleştir
    if (!detectedAddress && (!customName.trim() || customName.trim() === currentCity.city)) {
      reverseGeocode(exactLat, exactLng).then((addr) => {
        if (addr) {
          onSelectCity({
            city: addr.shortLocationName,
            country: addr.country,
            district: addr.district,
            neighborhood: addr.neighborhood,
            detailedAddress: addr.displayName,
            lat: exactLat,
            lng: exactLng,
            timezone
          });
        }
      }).catch(() => {});
    }
  };

  // GPS ile Cihaz Konumunu Bul (6 basamak hassasiyetle)
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tarayıcınız coğrafi konum servisini desteklemiyor.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Tam 6 basamak hassasiyet
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const timezone = -new Date().getTimezoneOffset() / 60; // Temporary device offset; resolved for the GPS coordinates by PrayerApp.

        setGeoLoading(false);

        // Anında uygula
        onSelectCity({
          city: `GPS Konumu (${lat.toFixed(6)}°, ${lng.toFixed(6)}°)`,
          country: 'GPS Tespiti',
          lat,
          lng,
          timezone
        });
        onClose();

        // Arka planda mahalle ve ilçe ismini zenginleştir
        try {
          const addr = await reverseGeocode(lat, lng);
          if (addr) {
            onSelectCity({
              city: addr.shortLocationName,
              country: addr.country,
              district: addr.district,
              neighborhood: addr.neighborhood,
              detailedAddress: addr.displayName,
              lat,
              lng,
              timezone
            });
          }
        } catch {}
      },
      async (err) => {
        setGeoLoading(false);
        const isPermissionPolicy = err.message?.toLowerCase().includes('permissions policy') || 
                                   err.message?.toLowerCase().includes('disabled in this document');
        
        if (isPermissionPolicy) {
          // İframe içinde engellendiğinde otomatik olarak IP ile yaklaşık şehri bulmayı dene
          try {
            const ipLoc = await getApproximateLocationByIP();
            if (ipLoc) {
              setGeoError('IFRAME_POLICY_IP_FALLBACK');
              return;
            }
          } catch {}
          setGeoError('IFRAME_POLICY');
        } else if (err.code === 1) { // PERMISSION_DENIED
          setGeoError('Tarayıcı konum izni reddedildi. Lütfen tarayıcı adres çubuğundaki kilit/izin simgesinden konuma izin verin.');
        } else {
          setGeoError('Konum alınamadı: ' + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-5 sm:pt-12 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="city-selector-title" className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[84vh]" onClick={e => e.stopPropagation()}>
        
        {/* Modal Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 id="city-selector-title" className="text-lg font-bold text-slate-900">Konum ve Şehir Seçimi</h3>
              <p className="text-xs text-slate-500">Koordinata göre vakitler · konum doğruluğu cihazınıza bağlıdır</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Konum penceresini kapat"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mod Değiştirme Butonları */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveMode('preset')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeMode === 'preset'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Şehir & İlçe / Mahalle Ara
          </button>
          <button
            onClick={() => setActiveMode('custom')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'custom'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>Özel Koordinat Gir (Google Maps)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">6 Hane</span>
          </button>
        </div>

        {activeMode === 'preset' ? (
          <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* GPS ile Bul Butonu */}
            <button
              onClick={handleFindMyLocation}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
              <span>{geoLoading ? 'Mahalle & İlçe Adresiniz Taranıyor...' : 'GPS Konumumu & Mahallemi Otomatik Bul (6 Hane Hassas)'}</span>
            </button>

            {geoError && (
              <div className="text-xs rounded-xl p-3.5 border transition-all animate-fadeIn space-y-2 bg-amber-50/90 border-amber-300 text-amber-950">
                {geoError === 'IFRAME_POLICY' || geoError === 'IFRAME_POLICY_IP_FALLBACK' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="block font-bold text-amber-900">
                          Önizleme Penceresi (iFrame) Kısıtlaması
                        </strong>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Şu an yapay zeka önizleme çerçevesi içinde çalıştığınız için tarayıcı güvenlik politikası gereği doğrudan GPS çipine erişim kısıtlanmaktadır.
                        </p>
                        <p className="text-[11px] text-emerald-900 font-semibold bg-emerald-100/70 p-2 rounded-lg border border-emerald-200">
                          📱 <strong>Telefon ve gerçek yayın:</strong> GPS kullanılabilirliği cihaz desteğine, konum iznine ve bağlantıya bağlıdır. Koordinatın altı basamakla gösterilmesi GPS ölçümünün bu hassasiyette kesin olduğu anlamına gelmez.
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 flex flex-wrap gap-2">
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Yeni Sekmede Aç (GPS Aktif)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setGeoError(null);
                          setActiveMode('custom');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
                      >
                        Haritadan Koordinat Gir
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-rose-700 font-medium">{geoError}</p>
                )}
              </div>
            )}

            {/* Arama Kutusu */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İl, ilçe veya mahalle yazın (örn: Kadıköy, Meram, Çankaya)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              {isSearchingOnline && (
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Sonuçlar Listesi */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
              
              {/* Çevrimiçi İlçe / Mahalle Sonuçları */}
              {onlineSearchResults.length > 0 && (
                <div className="pb-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider px-2 py-1 bg-emerald-50/80 rounded-md mb-1 flex items-center justify-between">
                    <span>Detaylı Harita Sonuçları (İlçe / Mahalle / Bölge)</span>
                    <span className="font-mono text-[9px] text-emerald-700">6 Haneli</span>
                  </div>
                  {onlineSearchResults.map((addr, idx) => (
                    <button
                      key={`online-${idx}`}
                      onClick={() => {
                        onSelectCity({
                          city: addr.shortLocationName,
                          country: addr.country,
                          district: addr.district,
                          neighborhood: addr.neighborhood,
                          detailedAddress: addr.displayName,
                          lat: Number(addr.lat.toFixed(6)),
                          lng: Number(addr.lng.toFixed(6)),
                          timezone: currentCity.timezone
                        });
                        onClose();
                      }}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left text-xs transition-colors cursor-pointer hover:bg-emerald-50 text-slate-800"
                    >
                      <div className="pr-2">
                        <span className="block font-semibold text-emerald-950">{addr.shortLocationName}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{addr.displayName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">
                        {addr.lat.toFixed(6)}°, {addr.lng.toFixed(6)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Standart Şehirler */}
              <div className="pt-1">
                {onlineSearchResults.length > 0 && (
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1 mb-1">
                    Kayıtlı Merkezler
                  </div>
                )}
                {filteredCities.map((c) => {
                  const isSelected = c.city === currentCity.city && c.country === currentCity.country;
                  return (
                    <button
                      key={`${c.city}-${c.country}`}
                      onClick={() => {
                        onSelectCity({
                          ...c,
                          lat: Number(c.lat.toFixed(6)),
                          lng: Number(c.lng.toFixed(6)),
                          timezone: Number(c.timezone)
                        });
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block font-semibold text-slate-900">{c.city}</span>
                        <span className="text-[11px] text-slate-400">{c.country} • UTC+{c.timezone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.lat.toFixed(4)}° K, {c.lng.toFixed(4)}° D
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        ) : (
          /* ÖZEL KOORDİNAT GİRİŞ FORMU (GOOGLE MAPS 6 HANELİ TAM HASSASİYET) */
          <form onSubmit={handleApplyCustom} className="p-6 space-y-4 overflow-y-auto">
            
            {/* Google Maps Hızlı Yapıştır Kutusu */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3.5 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Google Maps Koordinatını Hızlı Yapıştır:</span>
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-900 font-semibold">
                  . dan sonra 6 hane destekli
                </span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rawPastedCoords}
                  onChange={(e) => {
                    setRawPastedCoords(e.target.value);
                    parseAndApplyCoordinates(e.target.value);
                  }}
                  placeholder="Örn: 41.008238, 28.978359"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => parseAndApplyCoordinates(rawPastedCoords)}
                  className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Ayrıştır
                </button>
              </div>

              {pasteSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Maps koordinatı başarıyla 6 hane hassasiyetle yerleştirildi!</span>
                </div>
              )}
              
              <p className="text-[10px] text-slate-500 leading-tight">
                Google Haritalar'da istediğiniz noktaya sağ tıklayıp koordinatları kopyalayarak buraya yapıştırabilirsiniz. Nokta veya virgül otomatik tanınır.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Enlem (Latitude):</label>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">6 Ondalık</span>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customLat}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      // Eğer kullanıcı tek kutuya her iki koordinatı yapıştırırsa akıllıca çöz
                      if (val.includes(' ') || val.includes(',')) {
                        if (parseAndApplyCoordinates(e.target.value)) return;
                      }
                      setCustomLat(val);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    placeholder="Örn: 41.008238"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Boylam (Longitude):</label>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">6 Ondalık</span>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customLng}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      setCustomLng(val);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    placeholder="Örn: 28.978359"
                    required
                  />
                </div>
              </div>

              {/* Hassasiyet Bilgi Rozeti */}
              <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Hassas Hesap Koordinatı:</span>
                <span className="font-mono font-bold text-emerald-900">
                  {parseFloat(customLat.replace(',', '.')) ? parseFloat(customLat.replace(',', '.')).toFixed(6) : '0.000000'}°,{' '}
                  {parseFloat(customLng.replace(',', '.')) ? parseFloat(customLng.replace(',', '.')).toFixed(6) : '0.000000'}°
                </span>
              </div>

              {/* Otomatik Adres Bulma Düğmesi (İsteğe bağlı) */}
              <button
                type="button"
                onClick={handleDetectAddressFromCoords}
                disabled={isDetectingAddress}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              >
                {isDetectingAddress ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>{isDetectingAddress ? 'Adres tespit ediliyor...' : 'Bu Koordinatın Mahalle/İlçe Adını Otomatik Bul'}</span>
              </button>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konum / Şehir / Mahalle İsmi:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  placeholder="Örn: Fikirtepe, Kadıköy veya Özel Noktam"
                />
                {detectedAddress?.displayName && (
                  <p className="text-[10px] text-emerald-700 mt-1 line-clamp-2 bg-emerald-50/60 p-1.5 rounded-md border border-emerald-100">
                    Tespit Edilen: {detectedAddress.displayName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Saat Dilimi (UTC Offset):</label>
                <input
                  type="number"
                  step="any"
                  value={customTz}
                  onChange={(e) => setCustomTz(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Türkiye için UTC+3 kullanılır</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Bu Koordinatı Kaydet ve Vakitleri Anında Yenile</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
