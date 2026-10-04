import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Compass, Navigation, MapPin, RefreshCw } from 'lucide-react';
import { calculateQiblaAngle, calculateDistanceToKaaba } from '../utils/astronomy';

interface QiblaCompassProps {
  lat: number;
  lng: number;
  cityName: string;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ lat, lng, cityName }) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [continuousHeading, setContinuousHeading] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const hasAbsoluteSensorRef = useRef<boolean>(false);
  const continuousHeadingRef = useRef<number | null>(null);

  const qiblaAngle = Math.round(calculateQiblaAngle(lat, lng) * 10) / 10;
  const distanceKm = calculateDistanceToKaaba(lat, lng);

  const getScreenOrientationAngle = (): number => {
    if (typeof window === 'undefined') return 0;
    if (window.screen?.orientation && typeof window.screen.orientation.angle === 'number') {
      return window.screen.orientation.angle;
    }
    const legacy = (window as unknown as { orientation?: number }).orientation;
    return typeof legacy === 'number' ? legacy : 0;
  };

  const updateSmoothedHeading = useCallback((rawHeading: number, instantSnap: boolean = false) => {
    const normalized = ((rawHeading % 360) + 360) % 360;
    if (continuousHeadingRef.current === null || instantSnap) {
      continuousHeadingRef.current = normalized;
    } else {
      const prev = continuousHeadingRef.current;
      const prevMod = ((prev % 360) + 360) % 360;
      let delta = normalized - prevMod;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      continuousHeadingRef.current = prev + delta * 0.32;
    }
    const currentCont = continuousHeadingRef.current;
    setContinuousHeading(currentCont);
    setDeviceHeading(Math.round(((currentCont % 360) + 360) % 360) % 360);
  }, []);

  const handleAbsoluteOrientation = useCallback(
    (e: Event) => {
      const ev = e as DeviceOrientationEvent;
      if (ev.alpha !== null && typeof ev.alpha === 'number' && !isNaN(ev.alpha)) {
        const isFirst = !hasAbsoluteSensorRef.current;
        hasAbsoluteSensorRef.current = true;
        const screenAngle = getScreenOrientationAngle();
        const heading = (360 - ev.alpha + screenAngle + 360) % 360;
        updateSmoothedHeading(heading, isFirst);
      }
    },
    [updateSmoothedHeading]
  );

  const handleStandardOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      const evAny = e as unknown as { webkitCompassHeading?: number; absolute?: boolean };
      if (typeof evAny.webkitCompassHeading === 'number' && !isNaN(evAny.webkitCompassHeading)) {
        const isFirst = !hasAbsoluteSensorRef.current;
        hasAbsoluteSensorRef.current = true;
        const screenAngle = getScreenOrientationAngle();
        const heading = (evAny.webkitCompassHeading + screenAngle + 360) % 360;
        updateSmoothedHeading(heading, isFirst);
        return;
      }
      if (hasAbsoluteSensorRef.current && evAny.absolute !== true) return;
      if (e.alpha !== null && typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        const screenAngle = getScreenOrientationAngle();
        const heading = (360 - e.alpha + screenAngle + 360) % 360;
        updateSmoothedHeading(heading);
      }
    },
    [updateSmoothedHeading]
  );

  const attachListeners = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    window.removeEventListener('deviceorientation', handleStandardOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    window.addEventListener('deviceorientation', handleStandardOrientation, true);
  }, [handleAbsoluteOrientation, handleStandardOrientation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('DeviceOrientationEvent' in window)) {
      setIsSupported(false);
      return;
    }
    const hasRequestPerm =
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission ===
      'function';
    if (!hasRequestPerm) {
      attachListeners();
    }
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
      window.removeEventListener('deviceorientation', handleStandardOrientation, true);
    };
  }, [attachListeners, handleAbsoluteOrientation, handleStandardOrientation]);

  const requestOrientationPermission = async () => {
    setPermissionError(null);
    try {
      const DevOrientAny = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof DevOrientAny.requestPermission === 'function') {
        const response = await DevOrientAny.requestPermission();
        if (response === 'granted') {
          hasAbsoluteSensorRef.current = false;
          continuousHeadingRef.current = null;
          attachListeners();
        } else {
          setPermissionError('Pusula sensör izni reddedildi.');
        }
      } else {
        hasAbsoluteSensorRef.current = false;
        continuousHeadingRef.current = null;
        attachListeners();
      }
    } catch {
      setPermissionError('Pusula sensörü başlatılamadı.');
    }
  };

  const isSensorActive = deviceHeading !== null;
  const dialRotation = isSensorActive ? -continuousHeading : 0;
  const remaining = isSensorActive ? Math.round((qiblaAngle - deviceHeading + 360) % 360) : Math.round(qiblaAngle);
  const angleDiff = isSensorActive ? Math.min(Math.abs(remaining), Math.abs(360 - remaining)) : null;
  const isAligned = angleDiff !== null && angleDiff <= 5;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 dark:border-emerald-950/40 shadow-sm flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Kıble Pusulası & Açısı</h3>
        </div>
        {isSensorActive && (
          <button
            type="button"
            onClick={requestOrientationPermission}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 cursor-pointer"
            title="Sensörü Yenile"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Pusula Gövdesi */}
      <div
        onClick={!isSensorActive ? requestOrientationPermission : undefined}
        className="relative w-56 h-56 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-950 shadow-inner my-2 select-none"
      >
        <div
          className="w-full h-full rounded-full relative flex items-center justify-center will-change-transform"
          style={{ transform: `rotate(${dialRotation}deg)` }}
        >
          <span className="absolute top-2 text-xs font-bold text-rose-500">K (N)</span>
          <span className="absolute bottom-2 text-xs font-semibold text-slate-400">G (S)</span>
          <span className="absolute right-3 text-xs font-semibold text-slate-400">D (E)</span>
          <span className="absolute left-3 text-xs font-semibold text-slate-400">B (W)</span>

          <div className="absolute inset-4 rounded-full border border-dashed border-slate-300 dark:border-slate-700 pointer-events-none" />

          {/* Kıble İğnesi */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${qiblaAngle}deg)` }}
          >
            <div className="relative flex flex-col items-center h-full justify-between py-5">
              <div className="flex flex-col items-center">
                <div
                  className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent ${
                    isAligned ? 'border-b-[28px] border-b-emerald-500 scale-110' : 'border-b-[24px] border-b-emerald-600'
                  } transition-all`}
                />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded shadow-xs">
                  KÂBE
                </span>
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-700 dark:bg-slate-300 border-2 border-white dark:border-slate-900 shadow-md" />
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[20px] border-t-slate-400 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Bilgilendirme ve Koordinat Detayı */}
      <div className="mt-4 text-center space-y-1.5 w-full">
        <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{cityName} için Kıble Açısı:</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{qiblaAngle}°</span>
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Kuzeyden saat yönünde • Kâbe Mesafesi:{' '}
          <span className="font-bold text-slate-700 dark:text-slate-300">{distanceKm.toLocaleString('tr-TR')} km</span>
        </p>

        {isAligned && (
          <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 px-3 rounded-full inline-block animate-pulse">
            ✓ Cihazınız tam Kâbe yönüne çevrilmiştir
          </div>
        )}

        {!isSensorActive && isSupported && (
          <button
            type="button"
            onClick={requestOrientationPermission}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-300" />
            Canlı Pusula Sensörünü Başlat
          </button>
        )}

        {permissionError && <p className="text-xs font-bold text-rose-600 mt-1">{permissionError}</p>}
      </div>
    </div>
  );
};
