import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Navigation, Compass, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Coordinates } from '../types/prayer';
import { CITIES_DATA } from '../data/cities';
import { searchLocations, reverseGeocode, getApproximateLocationByIP, GeocodedAddress } from '../utils/geocoding';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: Coordinates;
  onSelectCoords: (coords: Coordinates) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  currentCoords,
  onSelectCoords
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearchResults([]);
      setGpsError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const res = await searchLocations(query);
        setSearchResults(res);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Cihaz GPS ile Konum Bulma
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      setGpsError('Tarayıcınız konum servisini desteklemiyor.');
      fallbackToIP();
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // Adres çözümlemesi
        const addr = await reverseGeocode(lat, lng);
        const resolvedCity = addr?.shortLocationName || addr?.city || 'Mevcut Konumum';

        const newCoords: Coordinates = {
          city: resolvedCity,
          country: addr?.country || 'Türkiye',
          lat,
          lng,
          timezone: 3,
          district: addr?.district,
          neighborhood: addr?.neighborhood
        };

        onSelectCoords(newCoords);
        setGpsLoading(false);
        onClose();
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('GPS izni alınamadı. Yaklaşık internet konumu aranıyor...');
        fallbackToIP();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const fallbackToIP = async () => {
    const ipLoc = await getApproximateLocationByIP();
    if (ipLoc) {
      const newCoords: Coordinates = {
        city: ipLoc.shortLocationName || ipLoc.city,
        country: ipLoc.country,
        lat: ipLoc.lat,
        lng: ipLoc.lng,
        timezone: 3
      };
      onSelectCoords(newCoords);
      setGpsLoading(false);
      onClose();
    } else {
      setGpsLoading(false);
      setGpsError('Otomatik konum tespit edilemedi. Lütfen listeden şehir seçiniz.');
    }
  };

  const filteredPresetCities = CITIES_DATA.filter((c) =>
    c.city.toLowerCase().includes(query.toLowerCase()) ||
    c.country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Şehir & Konum Seçimi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tüm il, ilçe veya mahallenize özel hassas vakit hesabı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Otomatik Bul Butonu */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={handleGPSDetect}
            disabled={gpsLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold transition"
          >
            {gpsLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Konumunuz Belirleniyor...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Mevcut GPS Konumumu Kullan</span>
              </>
            )}
          </button>

          {gpsError && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{gpsError}</span>
            </p>
          )}
        </div>

        {/* Arama Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İl, ilçe veya mahalle adı yazın (örn: Fatih, Kadıköy)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Canlı Çevrimiçi Arama Sonuçları (İlçe, Mahalle) */}
          {searchResults.length > 0 && (
            <div className="mb-3 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider px-2 block">
                Özel Konum / İlçe Sonuçları
              </span>
              {searchResults.map((loc, i) => (
                <button
                  key={`sr-${i}`}
                  onClick={() => {
                    onSelectCoords({
                      city: loc.shortLocationName || loc.city,
                      country: loc.country,
                      lat: loc.lat,
                      lng: loc.lng,
                      timezone: 3,
                      district: loc.district,
                      neighborhood: loc.neighborhood
                    });
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {loc.shortLocationName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{loc.displayName}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-600">Seç</span>
                </button>
              ))}
            </div>
          )}

          {/* Hazır İller Listesi */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              {query ? 'Eşleşen Şehirler' : 'Türkiye İlleri & Dünya Şehirleri'}
            </span>
            {filteredPresetCities.map((c) => {
              const isSelected = currentCoords.city === c.city && currentCoords.country === c.country;
              return (
                <button
                  key={`${c.city}-${c.country}`}
                  onClick={() => {
                    onSelectCoords(c);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 font-bold text-emerald-800 dark:text-emerald-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm">{c.city}</span>
                    <span className="text-[11px] text-slate-400">({c.country})</span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alt Dipnot */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
          Seçtiğiniz konumun enlem ve boylamına göre astronomik namaz vakitleri otomatik hesaplanır.
        </div>
      </div>
    </div>
  );
};
