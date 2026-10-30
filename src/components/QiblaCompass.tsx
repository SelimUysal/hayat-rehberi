import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinates, CalculatedDay } from '../types/prayer';
import {
  Compass as CompassIcon,
  Navigation,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  RotateCw,
  AlertTriangle,
  Crosshair,
  RefreshCw,
  Smartphone,
  SlidersHorizontal
} from 'lucide-react';
import { reverseGeocode } from '../utils/geocoding';

interface QiblaCompassProps {
  currentLocation: Coordinates;
  todayData: CalculatedDay;
  onUpdateLocation?: (newCity: Coordinates) => void;
}

/**
 * 3B Eğim Telafili (Tilt-Compensated) Pusula Açısı Hesaplama
 * Telefon tam düz (beta=0) tutulsa da, elde eğik (beta=30..75°) veya dik (beta=90°) tutulsa da
 * Gimbal-lock (180° ters dönme) hatası olmadan gerçek yatay pusula açısını (0..360°) üretir.
 */
function computeTiltCompensatedHeading(
  alpha: number,
  beta: number | null,
  gamma: number | null,
  screenAngle: number
): number {
  const degToRad = Math.PI / 180;
  const radToDeg = 180 / Math.PI;

  // Eğer eğim (beta/gamma) verisi yoksa veya telefon tamamen düzse doğrudan alpha kullan
  if (beta === null || gamma === null || isNaN(beta) || isNaN(gamma)) {
    return (((360 - alpha + screenAngle) % 360) + 360) % 360;
  }

  const aRad = alpha * degToRad;
  const bRad = beta * degToRad;
  const gRad = gamma * degToRad;

  const cA = Math.cos(aRad);
  const sA = Math.sin(aRad);
  const cB = Math.cos(bRad);
  const sB = Math.sin(bRad);
  const cG = Math.cos(gRad);
  const sG = Math.sin(gRad);

  // Birleşik ileri yön vektörü: düz tutuşta +Y (telefonun üst ucu), dik tutuşta -Z (arka kamera yönü)
  const vxPrime = -sB * sG;
  const vyPrime = cB * cB + sB * sB * cG;

  const east = vxPrime * cA - vyPrime * sA;
  const north = vxPrime * sA + vyPrime * cA;

  if (Math.abs(east) < 1e-6 && Math.abs(north) < 1e-6) {
    return (((360 - alpha + screenAngle) % 360) + 360) % 360;
  }

  const rawHeading = Math.atan2(east, north) * radToDeg;
  return (((rawHeading + screenAngle) % 360) + 360) % 360;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  currentLocation,
  todayData,
  onUpdateLocation
}) => {
  // 0..359 derece arası gösterim açısı
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  // 0/360 geçişinde 360 derece ters dönmeyi önleyen kesintisiz (unwrapped) açı
  const [continuousHeading, setContinuousHeading] = useState<number>(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [compassAccuracy, setCompassAccuracy] = useState<number | null>(null);
  const [sensorSource, setSensorSource] = useState<'ios-webkit' | 'android-absolute' | 'sensor-api' | 'standard' | 'manual' | null>(null);
  const [isPhoneTilted, setIsPhoneTilted] = useState<boolean>(false);
  const [showManualSlider, setShowManualSlider] = useState<boolean>(false);
  const [manualHeadingVal, setManualHeadingVal] = useState<number>(0);
  const [sensorWarning, setSensorWarning] = useState<string | null>(null);
  const sensorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Android'de mutlak sensör (deviceorientationabsolute) aktif olduğunda bağıl sensörün üzerine yazmasını engeller
  const hasAbsoluteSensorRef = useRef<boolean>(false);
  const hasReceivedAnySensorRef = useRef<boolean>(false);
  const continuousHeadingRef = useRef<number | null>(null);
  const wasAlignedRef = useRef<boolean>(false);
  const absSensorInstanceRef = useRef<{ stop?: () => void } | null>(null);

  const qiblaAngle = todayData.qiblaAngle;
  const distanceKm = todayData.qiblaDistanceKm;

  // Ekran döndürme açısını (Portrait / Landscape) hesaba kat
  const getScreenOrientationAngle = (): number => {
    if (typeof window === 'undefined') return 0;
    if (window.screen?.orientation && typeof window.screen.orientation.angle === 'number') {
      return window.screen.orientation.angle;
    }
    const legacyOrientation = (window as unknown as { orientation?: number }).orientation;
    if (typeof legacyOrientation === 'number') {
      return legacyOrientation;
    }
    return 0;
  };

  // Ham pusula açısını yumuşat ve 359° -> 0° geçişinde kesintisiz rotasyon üret
  const updateSmoothedHeading = useCallback(
    (
      rawHeading: number,
      accuracy: number | null = null,
      source: 'ios-webkit' | 'android-absolute' | 'sensor-api' | 'standard' | 'manual' = 'standard',
      instantSnap: boolean = false
    ) => {
      const normalized = ((rawHeading % 360) + 360) % 360;

      if (continuousHeadingRef.current === null || instantSnap) {
        continuousHeadingRef.current = normalized;
      } else {
        const prev = continuousHeadingRef.current;
        const prevMod = ((prev % 360) + 360) % 360;
        let delta = normalized - prevMod;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        // Düşük geçiren filtre (Low-pass filter: 0.32) ile titremeyi önle ve akıcı dönüş sağla
        continuousHeadingRef.current = prev + delta * 0.32;
      }

      const currentCont = continuousHeadingRef.current;
      const displayDeg = Math.round(((currentCont % 360) + 360) % 360) % 360;

      setContinuousHeading(currentCont);
      setDeviceHeading(displayDeg);
      setSensorSource(source);
      setSensorWarning(null);

      if (accuracy !== null && !isNaN(accuracy) && accuracy >= 0) {
        setCompassAccuracy(Math.round(accuracy));
      }
    },
    []
  );

  // Telefonun eğim kontrolü (Yere paralel tutulup tutulmadığını kontrol eder)
  const checkPhoneTilt = useCallback((beta: number | null, gamma: number | null) => {
    if (beta !== null && gamma !== null && !isNaN(beta) && !isNaN(gamma)) {
      const tilted = Math.abs(beta) > 55 || Math.abs(gamma) > 45;
      setIsPhoneTilted(tilted);
    }
  }, []);

  // 1. Android Birincil Mutlak Pusula Dinleyicisi (deviceorientationabsolute)
  const handleAbsoluteOrientation = useCallback(
    (e: Event) => {
      const ev = e as DeviceOrientationEvent;
      if (ev.alpha !== null && typeof ev.alpha === 'number' && !isNaN(ev.alpha)) {
        const isFirstAbsolute = !hasAbsoluteSensorRef.current;
        hasAbsoluteSensorRef.current = true;
        hasReceivedAnySensorRef.current = true;

        checkPhoneTilt(ev.beta, ev.gamma);
        const screenAngle = getScreenOrientationAngle();
        const heading = computeTiltCompensatedHeading(ev.alpha, ev.beta, ev.gamma, screenAngle);
        // İlk mutlak veri geldiğinde önceki bağıl açıyı ezmek için instantSnap=true gönder
        updateSmoothedHeading(heading, null, 'android-absolute', isFirstAbsolute);
      }
    },
    [updateSmoothedHeading, checkPhoneTilt]
  );

  // 2. iOS (webkitCompassHeading) ve Standart Pusula Dinleyicisi (deviceorientation)
  const handleStandardOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      const evAny = e as unknown as {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
        absolute?: boolean;
      };

      checkPhoneTilt(e.beta, e.gamma);

      // A) iOS Safari / WebKit: webkitCompassHeading doğrudan gerçek/manyetik kuzeyi verir (0° = Kuzey)
      if (typeof evAny.webkitCompassHeading === 'number' && !isNaN(evAny.webkitCompassHeading)) {
        // iOS'ta webkitCompassAccuracy < 0 ise henüz kalibre olmamıştır ancak geçerli açı varsa göster
        const isFirst = !hasAbsoluteSensorRef.current;
        hasAbsoluteSensorRef.current = true;
        hasReceivedAnySensorRef.current = true;

        const screenAngle = getScreenOrientationAngle();
        const heading = (evAny.webkitCompassHeading + screenAngle + 360) % 360;
        const acc =
          typeof evAny.webkitCompassAccuracy === 'number' && evAny.webkitCompassAccuracy >= 0
            ? evAny.webkitCompassAccuracy
            : null;
        updateSmoothedHeading(heading, acc, 'ios-webkit', isFirst);
        return;
      }

      // B) Eğer standart event kendi içinde absolute === true olarak geliyorsa (bazı Android tarayıcılar)
      if (evAny.absolute === true && e.alpha !== null && typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        const isFirstAbsolute = !hasAbsoluteSensorRef.current;
        hasAbsoluteSensorRef.current = true;
        hasReceivedAnySensorRef.current = true;

        const screenAngle = getScreenOrientationAngle();
        const heading = computeTiltCompensatedHeading(e.alpha, e.beta, e.gamma, screenAngle);
        updateSmoothedHeading(heading, null, 'android-absolute', isFirstAbsolute);
        return;
      }

      // C) Eğer mutlak sensör (deviceorientationabsolute veya webkitCompassHeading) aktifse bağıl veriyi yoksay!
      if (hasAbsoluteSensorRef.current) {
        return;
      }

      // D) Yalnızca standart deviceorientation destekleyen cihazlar için yedek hesaplama
      if (e.alpha !== null && typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        hasReceivedAnySensorRef.current = true;
        const screenAngle = getScreenOrientationAngle();
        const heading = computeTiltCompensatedHeading(e.alpha, e.beta, e.gamma, screenAngle);
        // Bağıl orientation açısı manyetik kuzeyi garanti etmez; yanlış kıble göstermeyelim.
        setSensorWarning('Tarayıcı yalnızca bağıl yön sensörü gönderiyor. Gerçek kuzeye göre güvenilir kıble ölçümü için mutlak pusula sensörü gereklidir.');
      }
    },
    [updateSmoothedHeading, checkPhoneTilt]
  );

  // 3. W3C AbsoluteOrientationSensor (Generic Sensor API) Yedeği (Modern Android / Chrome WebView için)
  const startGenericAbsoluteSensor = useCallback(() => {
    if (typeof window === 'undefined') return;
    const WinAny = window as unknown as {
      AbsoluteOrientationSensor?: new (options?: { frequency?: number; referenceFrame?: string }) => {
        quaternion?: [number, number, number, number];
        addEventListener: (type: string, listener: () => void) => void;
        start: () => void;
        stop: () => void;
      };
    };

    if (typeof WinAny.AbsoluteOrientationSensor !== 'function') return;

    try {
      if (absSensorInstanceRef.current?.stop) {
        absSensorInstanceRef.current.stop();
      }
      const sensor = new WinAny.AbsoluteOrientationSensor({ frequency: 30, referenceFrame: 'screen' });
      sensor.addEventListener('reading', () => {
        // Eğer event tabanlı mutlak sensör zaten çalışıyorsa çakışmayı önle
        if (hasAbsoluteSensorRef.current) return;
        const q = sensor.quaternion;
        if (!q || q.length < 4) return;
        const [qx, qy, qz, qw] = q;
        // Quaternion'dan Yaw (Kuzey azimut) açısını hesapla
        const yawRad = Math.atan2(2 * (qw * qz + qx * qy), 1 - 2 * (qy * qy + qz * qz));
        const yawDeg = yawRad * (180 / Math.PI);
        const heading = ((360 - yawDeg) % 360 + 360) % 360;
        hasReceivedAnySensorRef.current = true;
        updateSmoothedHeading(heading, null, 'sensor-api');
      });
      sensor.start();
      absSensorInstanceRef.current = sensor;
    } catch {
      // İzin veya donanım kısıtlaması varsa sessizce event dinleyicilerine bırak
    }
  }, [updateSmoothedHeading]);

  // Tüm sensör dinleyicilerini bağlama yardımcı fonksiyonu
  const attachSensorListeners = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    window.removeEventListener('deviceorientation', handleStandardOrientation, true);

    // Koşulsuz olarak her iki event'i de dinle (Android WebView'larda ondeviceorientationabsolute in window false olsa bile event çalışır)
    window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    window.addEventListener('deviceorientation', handleStandardOrientation, true);

    // Ek olarak Generic Sensor API yedeğini başlat
    startGenericAbsoluteSensor();
  }, [handleAbsoluteOrientation, handleStandardOrientation, startGenericAbsoluteSensor]);

  // Sayfa açıldığında izin gerektirmeyen mobil cihazlarda (Android vb.) otomatik başlat
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasOrientationEvent = 'DeviceOrientationEvent' in window;
    const hasGenericSensor = 'AbsoluteOrientationSensor' in window;

    if (!hasOrientationEvent && !hasGenericSensor) {
      setIsSupported(false);
      setSensorWarning('Bu tarayıcı canlı pusula verisi sağlamıyor. Kıble açısını kullanabilir veya pusula destekleyen başka bir tarayıcı deneyebilirsiniz.');
      setShowManualSlider(true);
      return;
    }

    const hasRequestPermission =
      hasOrientationEvent &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function';

    if (!hasRequestPermission) {
      setPermissionState('granted');
      attachSensorListeners();
      sensorTimeoutRef.current = setTimeout(() => {
        if (!hasReceivedAnySensorRef.current) {
          setSensorWarning('Telefon sensöründen yön verisi alınamıyor. Tarayıcı izinlerini kontrol edin veya manuel açı görünümünü kullanın.');
          setShowManualSlider(true);
        }
      }, 4500);
    }

    return () => {
      if (sensorTimeoutRef.current) clearTimeout(sensorTimeoutRef.current);
      window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
      window.removeEventListener('deviceorientation', handleStandardOrientation, true);
      if (absSensorInstanceRef.current?.stop) {
        try {
          absSensorInstanceRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [attachSensorListeners, handleAbsoluteOrientation, handleStandardOrientation]);

  // Kullanıcı Tıklamasıyla Pusulayı Başlatma / İzin İsteme (iOS 13+ Safari ve Tüm Mobil Tarayıcılar)
  const requestOrientationPermission = async () => {
    setPermissionError(null);
    setSensorWarning(null);

    try {
      const DeviceOrientationEventAny =
        typeof DeviceOrientationEvent !== 'undefined'
          ? (DeviceOrientationEvent as unknown as {
              requestPermission?: () => Promise<'granted' | 'denied'>;
            })
          : null;

      // ÖNEMLİ (iOS Safari): requestPermission çağrısı kullanıcı tıklamasının (user gesture) ilk satırında yapılmalıdır!
      if (DeviceOrientationEventAny && typeof DeviceOrientationEventAny.requestPermission === 'function') {
        const response = await DeviceOrientationEventAny.requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          hasAbsoluteSensorRef.current = false;
          hasReceivedAnySensorRef.current = false;
          continuousHeadingRef.current = null;
          attachSensorListeners();
        } else {
          setPermissionState('denied');
          setPermissionError(
            'Pusula sensörü izni reddedildi. iPhone/iPad Safari ayarlarından "Hareket ve Yönelim" erişimine izin verip sayfayı yenileyin.'
          );
          return;
        }
      } else {
        // Android / Standart Mobil Tarayıcılar: Dinleyicileri sıfırla ve yeniden başlat
        setPermissionState('granted');
        hasAbsoluteSensorRef.current = false;
        hasReceivedAnySensorRef.current = false;
        continuousHeadingRef.current = null;
        attachSensorListeners();
      }

      // Sensör yanıt vermezse kullanıcıyı bilgilendir ve manuel aracı aç
      setTimeout(() => {
        if (!hasReceivedAnySensorRef.current) {
          setSensorWarning(
            'Cihazınızdan canlı manyetik pusula verisi alınamadı. Telefonunuzu hafifçe 8 çizecek şekilde hareket ettirin veya aşağıdaki Manuel Pusula Hizalama aracını kullanın.'
          );
          setShowManualSlider(true);
        }
      }, 4500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setPermissionError(
        'Pusula sensörü başlatılamadı (' +
          errorMsg +
          '). Lütfen bağlantınızın güvenli (HTTPS) olduğundan ve telefon sensör izinlerinin açık olduğundan emin olun.'
      );
      setShowManualSlider(true);
    }
  };

  // Manuel Pusula Kaydırıcısı Değişimi (Sensörsüz cihazlar veya test için)
  const handleManualSliderChange = (degVal: number) => {
    setManualHeadingVal(degVal);
    updateSmoothedHeading(degVal, null, 'manual', true);
  };

  // GPS ile Noktasal Konum Güncelleme (Mobilde Kıble Açısını Tam Bulunduğu Noktaya Göre Hesaplar)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg('Cihazınızda GPS konum servisi desteklenmiyor.');
      return;
    }
    setIsLocatingGps(true);
    setGpsStatusMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        try {
          const geoInfo = await reverseGeocode(lat, lng);
          const updated: Coordinates = {
            city: geoInfo?.city || currentLocation.city,
            district: geoInfo?.district || 'GPS Konumu',
            neighborhood: geoInfo?.neighborhood,
            country: geoInfo?.country || 'Türkiye',
            lat,
            lng,
            timezone: currentLocation.timezone
          };
          if (onUpdateLocation) {
            onUpdateLocation(updated);
          }
          setGpsStatusMsg(`GPS konumu güncellendi: ${updated.district ? updated.district + ', ' : ''}${updated.city}`);
        } catch {
          if (onUpdateLocation) {
            onUpdateLocation({
              ...currentLocation,
              district: 'GPS Noktasal Konum',
              lat,
              lng
            });
          }
          setGpsStatusMsg(`GPS koordinatları güncellendi (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        } finally {
          setIsLocatingGps(false);
        }
      },
      () => {
        setIsLocatingGps(false);
        setGpsStatusMsg('GPS konum izni alınamadı. Üstteki konum butonundan şehrinizi seçebilirsiniz.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /*
   * PUSULA VE İBRE HESAPLAMA MANTIĞI:
   * 1. Kadran rotasyonu: Telefon döndükçe pusula diski zıt yöne (-continuousHeading) kesintisiz döner.
   * 2. Kadran üzerindeki sarı KÂBE oku qiblaAngle açısına sabitlenmiştir; böylece kadran döndükçe gerçek Kâbe yönünü gösterir.
   * 3. Telefonun baktığı yön Kıble Açısına (qiblaAngle) geldiğinde, sarı KÂBE ibresi TAM YUKARI (12 yönüne) hizalanır.
   */
  const isSensorActive = deviceHeading !== null;
  const compassDialRotation = isSensorActive ? -continuousHeading : 0;
  const remainingClockwise = isSensorActive
    ? Math.round((qiblaAngle - deviceHeading + 360) % 360)
    : Math.round(qiblaAngle);

  // Kıbleye ne kadar yakın? (±5 derece tolerans ile Kıbleye Tam Hizalandı uyarısı)
  const angleDiff = isSensorActive
    ? Math.min(Math.abs(remainingClockwise), Math.abs(360 - remainingClockwise))
    : null;
  const isAligned = sensorSource !== 'manual' && angleDiff !== null && angleDiff <= 5;

  // Kıbleye tam hizalanınca mobilde hafif titreşim (Haptic Feedback) ver
  useEffect(() => {
    if (isAligned && !wasAlignedRef.current) {
      wasAlignedRef.current = true;
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(45);
        } catch {
          // ignore vibrate restrictions
        }
      }
    } else if (!isAligned) {
      wasAlignedRef.current = false;
    }
  }, [isAligned]);

  // Kullanıcıya sağa mı sola mı döneceğini net söyleyen yardımcı yönlendirme
  const turnDirectionText =
    isSensorActive && !isAligned
      ? remainingClockwise <= 180
        ? `Sağa doğru ${remainingClockwise}° dönün`
        : `Sola doğru ${360 - remainingClockwise}° dönün`
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Üst Başlık ve Kıble Açısı & GPS Rozetleri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CompassIcon className="w-5 h-5 text-emerald-700" />
            <span>Kıble Yönü ve Canlı Pusula</span>
          </h2>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            {currentLocation.district ? `${currentLocation.district}, ` : ''}
            {currentLocation.city} ({Number(currentLocation.lat).toFixed(4)}°K, {Number(currentLocation.lng).toFixed(4)}°D)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onUpdateLocation && (
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocatingGps}
              className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              title="GPS ile bulunduğunuz noktanın tam Kıble açısını hesapla"
            >
              <Crosshair className={`w-3.5 h-3.5 text-emerald-700 ${isLocatingGps ? 'animate-spin' : ''}`} />
              <span>{isLocatingGps ? 'Konum Alınıyor...' : 'GPS Konumumu Bul'}</span>
            </button>
          )}

          <span className="text-xs font-extrabold px-3.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-2xs">
            <CompassIcon className="w-4 h-4 text-emerald-700" />
            <span>
              Kıble Açısı: <strong className="font-mono text-sm font-black">{qiblaAngle}°</strong>
            </span>
          </span>
        </div>
      </div>

      {gpsStatusMsg && (
        <div className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center justify-between">
          <span>📍 {gpsStatusMsg}</span>
          <button
            type="button"
            onClick={() => setGpsStatusMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-black ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* PUSULA KADRANI VE CANLI GÖSTERGE */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          {/* Sensör Henüz Başlamadıysa Üstte Hızlı Başlatma Çağrısı (Özellikle iPhone/iOS İçin) */}
          {!isSensorActive && isSupported && (
            <button
              type="button"
              onClick={requestOrientationPermission}
              className="mb-4 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Canlı Pusulayı Başlatmak İçin Dokunun</span>
            </button>
          )}

          {/* Tam Hizalanma Kutlaması veya Dönüş Yönü */}
          {isAligned ? (
            <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-lg animate-bounce flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>TAM KIBLE İSTİKAMETİNDESİNİZ!</span>
            </div>
          ) : turnDirectionText ? (
            <div className="mb-4 px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-extrabold shadow-2xs flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-700" />
              <span>{turnDirectionText}</span>
            </div>
          ) : null}

          {/* Dış Pusula Kasası (Sensör kapalıysa kadranın kendisine tıklamak da izni tetikler) */}
          <div
            onClick={!isSensorActive ? requestOrientationPermission : undefined}
            role={!isSensorActive ? 'button' : undefined}
            tabIndex={!isSensorActive ? 0 : undefined}
            title={!isSensorActive ? 'Canlı pusulayı başlatmak için dokunun' : undefined}
            className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-3 shadow-2xl transition-colors duration-300 select-none ${
              !isSensorActive ? 'cursor-pointer' : ''
            } ${
              isAligned
                ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 border-4 border-emerald-500 ring-8 ring-emerald-500/25'
                : 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-4 border-amber-600/40'
            }`}
          >
            {/* Telefonun Tepe Yön Göstergesi (Telefonun baktığı istikamet) */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              <div
                className={`w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[13px] ${
                  isAligned ? 'border-t-emerald-400' : 'border-t-amber-400'
                }`}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                  isAligned ? 'bg-emerald-500 text-slate-950' : 'bg-black/90 text-amber-300 border border-amber-500/40'
                }`}
              >
                TELEFONUN ÖNÜ
              </span>
            </div>

            {/* DÖNEN PUSULA DİSKİ (Telefon Döndükçe Kuzeyi Sabit Tutar) */}
            <div
              className="w-full h-full rounded-full border border-slate-700/80 relative flex items-center justify-center will-change-transform"
              style={{ transform: `rotate(${compassDialRotation}deg)` }}
            >
              {/* Kuzey (K / N) - Kırmızı Parlak */}
              <div className="absolute top-2.5 flex flex-col items-center">
                <span className="text-xs font-black text-rose-500">K (0°)</span>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5" />
              </div>

              {/* Güney (G) */}
              <div className="absolute bottom-2.5 flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mb-0.5" />
                <span className="text-xs font-bold text-slate-400">G (180°)</span>
              </div>

              {/* Doğu (D) */}
              <div className="absolute right-3 flex items-center gap-0.5">
                <span className="text-xs font-bold text-slate-400">D (90°)</span>
              </div>

              {/* Batı (B) */}
              <div className="absolute left-3 flex items-center gap-0.5">
                <span className="text-xs font-bold text-slate-400">B (270°)</span>
              </div>

              {/* 30 Derecelik Ara İşaretler */}
              {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-full h-full flex justify-center pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div className="w-0.5 h-2 bg-slate-600/70" />
                </div>
              ))}

              {/* İç Derece Çemberi */}
              <div className="w-52 h-52 rounded-full border border-dashed border-slate-700/60 flex items-center justify-center relative">
                {/* DÖNEN SARI KIBLE İBRESİ (KÂBE OKU) */}
                <div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className="relative w-1.5 h-full flex flex-col justify-between items-center pointer-events-none">
                    {/* Kabe Ok Başı (Pusula üzerinde tam Kıble açısını işaret eder) */}
                    <div className="flex flex-col items-center -mt-2">
                      <div
                        className={`w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[28px] ${
                          isAligned
                            ? 'border-b-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                            : 'border-b-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        }`}
                      />
                      <div
                        className={`px-2 py-0.5 -mt-1 rounded shadow-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          isAligned ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-stone-950'
                        }`}
                      >
                        <span>🕋 KÂBE</span>
                      </div>
                    </div>

                    {/* Zıt Denge Ucu */}
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600 -mb-1" />
                  </div>
                </div>

                {/* Merkez Altın Göbek */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl flex items-center justify-center z-20 border-2 border-slate-900">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-950 shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          {/* Durum Bilgisi ve Canlı İzin / Yenileme Butonu */}
          <div className="mt-4 flex flex-col items-center gap-2.5 text-center w-full max-w-xs">
            {isSensorActive ? (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>
                      Baktığınız Yön:{' '}
                      <strong className="font-mono text-emerald-800 text-sm font-black">{deviceHeading}°</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowManualSlider((prev) => !prev)}
                      className="p-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 transition-colors cursor-pointer"
                      title="Manuel Pusula Hizalama / Test Kaydırıcısı"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={requestOrientationPermission}
                      className="p-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 transition-colors cursor-pointer"
                      title="Pusula Sensörünü Yenile / Kalibre Et"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Telefon Tutuş Eğimi Geri Bildirimi */}
                {sensorSource !== 'manual' && (
                  <div
                    className={`flex items-center justify-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      isPhoneTilted
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isPhoneTilted
                        ? 'Telefon eğik: En yüksek hassasiyet için yere paralel (düz) tutun'
                        : 'Telefon tutuş açısı uygun (3B eğim telafisi aktif)'}
                    </span>
                  </div>
                )}

                {compassAccuracy !== null && compassAccuracy > 25 && (
                  <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    ⚠️ Manyetik sapma algılandı (±{compassAccuracy}°). Telefonunuzu havada birkaç kez "8" çizecek şekilde sallayın.
                  </p>
                )}

                <p className="text-[11px] font-bold text-slate-600">
                  {isAligned
                    ? 'Mükemmel! Şu anda tam Kâbe-i Muazzama yönüne bakıyorsunuz.'
                    : 'Sarı Kâbe oku ekranın tepesindeki "TELEFONUN ÖNÜ" işaretine gelene kadar telefonu çevirin.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 w-full">
                {isSupported && (
                  <button
                    type="button"
                    onClick={requestOrientationPermission}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Navigation className="w-4 h-4 text-amber-300" />
                    <span>Canlı Telefon Pusulasını Başlat</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowManualSlider((prev) => !prev)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>{showManualSlider ? 'Manuel Hizalamayı Gizle' : 'Manuel Pusula Hizalama / Test Aracı'}</span>
                </button>

                <p className="text-[11px] font-bold text-slate-600">
                  {isSupported
                    ? 'Telefonunuzda canlı pusulayı başlatmak için yukarıdaki butona veya pusula kadranına dokunun.'
                    : 'Cihazınızda manyetik pusula sensörü bulunmadığı için Kıble açısı sabit kadran üzerinde gösterilmektedir.'}
                </p>
              </div>
            )}

            {/* Manuel Pusula Hizalama / Simülasyon Kaydırıcısı */}
            {showManualSlider && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-left">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
                  <span>Manuel Yön / Pusula Testi:</span>
                  <span className="font-mono text-emerald-800">{deviceHeading ?? manualHeadingVal}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={deviceHeading ?? manualHeadingVal}
                  onChange={(e) => handleManualSliderChange(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>0° (Kuzey)</span>
                  <button
                    type="button"
                    onClick={() => handleManualSliderChange(Math.round(qiblaAngle))}
                    className="text-emerald-700 hover:underline font-extrabold cursor-pointer"
                  >
                    Kıbleye Hizala ({Math.round(qiblaAngle)}°)
                  </button>
                  <span>359°</span>
                </div>
              </div>
            )}

            {sensorWarning && (
              <div className="flex items-start gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{sensorWarning}</span>
              </div>
            )}

            {permissionError && (
              <div className="flex items-start gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-2.5 rounded-xl border border-rose-200 mt-1 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{permissionError}</span>
              </div>
            )}
          </div>
        </div>

        {/* DETAYLI BİLGİ VE KONTROL KARTLARI */}
        <div className="md:col-span-6 space-y-4">
          {/* Kabe Bilgileri */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4.5">
            <div className="flex items-center justify-between text-emerald-950 font-extrabold text-sm mb-1">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Kâbe-i Muazzama Bilgileri</span>
              </span>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md font-mono font-bold">
                21.4225° N, 39.8262° E
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-slate-600 font-bold block text-[11px]">Kıble Açısı (Azimut)</span>
                <span className="text-xl font-black font-mono text-emerald-950">{qiblaAngle}°</span>
                <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">Gerçek Kuzeyden saat yönünde</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-slate-600 font-bold block text-[11px]">Kâbe'ye Kuş Uçuşu</span>
                <span className="text-xl font-black font-mono text-emerald-950">{distanceKm.toLocaleString('tr-TR')} km</span>
                <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">Mekke-i Mükerreme</span>
              </div>
            </div>
          </div>

          {/* ŞAŞMAZ KIBLE SAATİ KARTI */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-amber-950 font-extrabold text-sm mb-1">
              <span className="flex items-center gap-2">
                <CompassIcon className="w-4 h-4 text-amber-700" />
                <span>Güneş ile Şaşmaz Kıble Saati</span>
              </span>
              <span className="font-mono text-sm px-2.5 py-0.5 bg-amber-200/70 text-amber-950 font-black rounded-lg">
                {todayData.times.kibleSaati}
              </span>
            </div>
            <p className="text-xs font-bold text-amber-900/95 leading-relaxed mt-2">
              Pusula veya telefon kalibrasyonuna gerek kalmaksızın; saat tam{' '}
              <strong className="text-amber-950 font-black font-mono">{todayData.times.kibleSaati}</strong> olduğunda
              yüzünü doğrudan güneşe dönen kimse, tam olarak Kâbe istikametine dönmüş olur. Bu, İslam fıkhında ve
              güneşin gerçekten göründüğü ve belirtilen saat bulunduğunuz konum için geçerli olduğu koşullarda yardımcı bir kıble tayin yöntemidir.
            </p>
          </div>

          {/* Doğru Ölçüm İçin 3 Püf Nokta */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Telefonda %100 Doğru Ölçüm İçin:</span>
            </div>
            <ul className="space-y-1.5 pl-1 text-[11px] font-semibold leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700">1.</span>
                <span>
                  <strong className="text-slate-900">Düz Tutun:</strong> Telefonu yere paralel (avucunuzun içinde düz)
                  tutun, dik tutmayın.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700">2.</span>
                <span>
                  <strong className="text-slate-900">Metalden Uzaklaşın:</strong> Çevrenizdeki mıknatıslı telefon
                  kılıfları, masa ayakları ve demir eşyalar pusulayı saptırabilir.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700">3.</span>
                <span>
                  <strong className="text-slate-900">8 Çizin (Kalibrasyon):</strong> Telefonunuzu havada birkaç kez "8"
                  şeklinde çevirerek pusula sensörünü tazeleyebilirsiniz.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
