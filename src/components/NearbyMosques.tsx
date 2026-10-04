import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Coordinates } from '../types/prayer';
import { reverseGeocode } from '../utils/geocoding';
import {
  MapPin,
  Navigation,
  Crosshair,
  SlidersHorizontal,
  Search,
  Star,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Route as RouteIcon,
  RefreshCw,
  Edit3,
  Layers,
  List,
  Map as MapIcon,
  Footprints,
  Car,
  X,
  Sparkles,
  Clock
} from 'lucide-react';

interface NearbyMosquesProps {
  currentLocation: Coordinates;
  onUpdateLocation?: (newCity: Coordinates) => void;
}

export type LocationSourceType = 'gps' | 'fallback' | 'manual';

export interface MosquePlaceItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  rating: number | null;
  userRatingCount: number | null;
  isOpenNow: boolean | null;
  photoUri: string | null;
  googleMapsUri: string | null;
}

const RADIUS_PRESETS_KM = [0.5, 1, 2, 3, 5, 10];
const STEP_RADII_KM = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10, 15, 20];

/**
 * İki koordinat arasındaki kuş uçuşu mesafeyi (metre cinsinden) Haversine formülü ile hesaplar
 */
function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Mesafeyi okunabilir metne dönüştürür (Örn: "350 m" veya "1.4 km")
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2).replace(/\.00$/, '')} km`;
}

/**
 * Yürüyüş süresini yaklaşık hesaplar (Ortalama 4.8 km/saat = 80m/dk)
 */
function estimateWalkingMinutes(meters: number): number {
  return Math.max(1, Math.round((meters * 1.25) / 80));
}

/**
 * Yarıçapa (km) göre uygun harita zoom seviyesini döndürür
 */
function getZoomForRadiusKm(radiusKm: number): number {
  if (radiusKm <= 0.5) return 16;
  if (radiusKm <= 1) return 15;
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 3) return 13.5;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  return 11;
}

/**
 * Google Maps birleşik koordinat metnini ("41.008238, 28.978359") ayrıştırır
 */
function parseCombinedCoordinates(raw: string): { lat: number; lng: number } | null {
  const cleaned = raw.trim().replace(/[()]/g, '');
  const parts = cleaned.split(/[\s,;]+/).filter(Boolean);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0].replace(',', '.'));
    const lng = parseFloat(parts[1].replace(',', '.'));
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      };
    }
  }
  return null;
}

interface InnerMapAndPlacesManagerProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  selectedMosqueId: string | null;
  onSelectMosque: (mosque: MosquePlaceItem | null) => void;
  onMosquesLoaded: (mosques: MosquePlaceItem[], loading: boolean, error: string | null) => void;
  activeRouteTarget: MosquePlaceItem | null;
  routeTravelMode: 'WALKING' | 'DRIVING';
  onRouteComputed: (info: { distanceMeters: number; durationMillis: number } | null, loading: boolean, error: string | null) => void;
  refreshTrigger: number;
  isMapClickManualMode: boolean;
  onMapClickPickCoordinate: (lat: number, lng: number) => void;
}

/**
 * Harita içi Places API (New) tarayıcı, Yarıçap Çemberi, İşaretçiler ve Rota Çizici
 */
const InnerMapAndPlacesManager: React.FC<InnerMapAndPlacesManagerProps> = ({
  center,
  radiusKm,
  selectedMosqueId,
  onSelectMosque,
  onMosquesLoaded,
  activeRouteTarget,
  routeTravelMode,
  onRouteComputed,
  refreshTrigger,
  isMapClickManualMode,
  onMapClickPickCoordinate
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  const [mosques, setMosques] = useState<MosquePlaceItem[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);

  // Harita tıklamasıyla manuel koordinat seçimi
  useEffect(() => {
    if (!map || !isMapClickManualMode) return;
    const listener = map.addListener('click', (ev: google.maps.MapMouseEvent) => {
      if (ev.latLng) {
        onMapClickPickCoordinate(
          Number(ev.latLng.lat().toFixed(6)),
          Number(ev.latLng.lng().toFixed(6))
        );
      }
    });
    return () => {
      listener.remove();
    };
  }, [map, isMapClickManualMode, onMapClickPickCoordinate]);

  // Merkez veya yarıçap değiştiğinde harita kamerasını ve görsel tarama çemberini güncelle
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps?.Circle) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    const radiusMeters = Math.round(radiusKm * 1000);
    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      fillColor: '#059669',
      fillOpacity: 0.09,
      strokeColor: '#047857',
      strokeOpacity: 0.65,
      strokeWeight: 2,
      clickable: false
    });
    circleRef.current = circle;

    if (!activeRouteTarget) {
      map.panTo(center);
      map.setZoom(getZoomForRadiusKm(radiusKm));
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center.lat, center.lng, radiusKm, activeRouteTarget]);

  // Seçili camiye odaklanma
  useEffect(() => {
    if (!map || !selectedMosqueId || activeRouteTarget) return;
    const found = mosques.find((m) => m.id === selectedMosqueId);
    if (found) {
      map.panTo({ lat: found.lat, lng: found.lng });
      const currentZoom = map.getZoom() || 15;
      if (currentZoom < 16) {
        map.setZoom(16);
      }
    }
  }, [map, selectedMosqueId, mosques, activeRouteTarget]);

  // Google Maps Places API (New) ile Yakındaki Camileri Tarama (Place.searchNearby + Place.searchByText birleşik tarama)
  useEffect(() => {
    if (!placesLib || !placesLib.Place) return;

    let isCancelled = false;
    const radiusMeters = Math.min(Math.round(radiusKm * 1000), 50000);

    const fetchMosques = async () => {
      onMosquesLoaded([], true, null);

      try {
        const fields = [
          'id',
          'displayName',
          'location',
          'formattedAddress',
          'shortFormattedAddress',
          'rating',
          'userRatingCount',
          'regularOpeningHours',
          'businessStatus',
          'photos',
          'googleMapsURI'
        ];

        const nearbyReq: google.maps.places.SearchNearbyRequest = {
          fields,
          locationRestriction: {
            center,
            radius: radiusMeters
          },
          includedPrimaryTypes: ['mosque'],
          maxResultCount: 20,
          rankPreference:
            placesLib.SearchNearbyRankPreference?.DISTANCE ??
            ('DISTANCE' as unknown as google.maps.places.SearchNearbyRankPreference),
          language: 'tr',
          region: 'TR',
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio']
        };

        // Paralel olarak hem Place.searchNearby (mosque tipi) hem de Place.searchByText ("Cami") çalıştırıp birleştiriyoruz
        // Böylece küçük mahalle mescitleri ve tüm camiler eksiksiz bulunur.
        const [nearbyRes, textRes] = await Promise.allSettled([
          placesLib.Place.searchNearby(nearbyReq),
          placesLib.Place.searchByText({
            fields,
            textQuery: 'Cami',
            locationBias: {
              center,
              radius: radiusMeters
            },
            maxResultCount: 20,
            language: 'tr',
            region: 'TR',
            internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio']
          } as google.maps.places.SearchByTextRequest)
        ]);

        if (isCancelled) return;

        // Kota aşımı kontrolü (Tier 2 Quota Defense)
        for (const settled of [nearbyRes, textRes]) {
          if (settled.status === 'rejected') {
            const errStr = String(settled.reason?.message || settled.reason || '');
            if (
              errStr.includes('OVER_QUERY_LIMIT') ||
              errStr.includes('RESOURCE_EXHAUSTED') ||
              errStr.includes('429') ||
              errStr.includes('QuotaExceeded')
            ) {
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
            }
          }
        }

        if (nearbyRes.status === 'rejected' && textRes.status === 'rejected') {
          throw nearbyRes.reason || textRes.reason || new Error('Camiler taranırken hata oluştu.');
        }

        const rawPlaces: google.maps.places.Place[] = [];
        if (nearbyRes.status === 'fulfilled' && Array.isArray(nearbyRes.value?.places)) {
          rawPlaces.push(...nearbyRes.value.places);
        }
        if (textRes.status === 'fulfilled' && Array.isArray(textRes.value?.places)) {
          rawPlaces.push(...textRes.value.places);
        }

        const seenIds = new Set<string>();
        const parsedMosques: MosquePlaceItem[] = [];

        for (const p of rawPlaces) {
          const pid = p.id;
          if (!pid || seenIds.has(pid)) continue;
          seenIds.add(pid);

          const loc = p.location;
          if (!loc) continue;
          const lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
          const lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
          if (isNaN(lat) || isNaN(lng)) continue;

          const dist = calculateDistanceMeters(center.lat, center.lng, lat, lng);
          // Yalnızca seçilen yarıçap (radiusMeters) içindeki camileri dahil et
          if (dist > radiusMeters) continue;

          let photoUri: string | null = null;
          if (Array.isArray(p.photos) && p.photos.length > 0 && typeof p.photos[0].getURI === 'function') {
            try {
              photoUri = p.photos[0].getURI({ maxWidth: 400, maxHeight: 300 });
            } catch {
              photoUri = null;
            }
          }

          let isOpenNow: boolean | null = null;
          try {
            const pAny = p as unknown as {
              isOpen?: () => Promise<boolean | undefined>;
              regularOpeningHours?: { openNow?: boolean };
            };
            if (typeof pAny.regularOpeningHours?.openNow === 'boolean') {
              isOpenNow = pAny.regularOpeningHours.openNow;
            }
          } catch {
            isOpenNow = null;
          }

          parsedMosques.push({
            id: pid,
            name: p.displayName || 'Cami / Mescit',
            address: p.shortFormattedAddress || p.formattedAddress || 'Adres bilgisi mevcut değil',
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            distanceMeters: dist,
            rating: typeof p.rating === 'number' ? p.rating : null,
            userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
            isOpenNow,
            photoUri,
            googleMapsUri: p.googleMapsURI || null
          });
        }

        parsedMosques.sort((a, b) => a.distanceMeters - b.distanceMeters);
        setMosques(parsedMosques);
        onMosquesLoaded(parsedMosques, false, null);
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('429') ||
          msg.includes('QuotaExceeded')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onMosquesLoaded([], false, 'Yakındaki camiler taranırken bir bağlantı hatası oluştu.');
      }
    };

    fetchMosques();

    return () => {
      isCancelled = true;
    };
  }, [placesLib, center.lat, center.lng, radiusKm, refreshTrigger, onMosquesLoaded]);

  // Seçilen Camiye Harita İçi Rota Çizimi (Routes API - Route.computeRoutes)
  useEffect(() => {
    routePolylinesRef.current.forEach((poly) => poly.setMap(null));
    routePolylinesRef.current = [];

    if (!routesLib || !map || !activeRouteTarget) {
      onRouteComputed(null, false, null);
      return;
    }

    let isCancelled = false;
    onRouteComputed(null, true, null);

    const routeClass = (routesLib as unknown as { Route?: { computeRoutes?: (req: unknown) => Promise<{ routes?: any[] }> } }).Route;
    if (!routeClass || typeof routeClass.computeRoutes !== 'function') {
      onRouteComputed(null, false, 'Rota servisi yüklenemedi.');
      return;
    }

    const request = {
      origin: { lat: center.lat, lng: center.lng },
      destination: { lat: activeRouteTarget.lat, lng: activeRouteTarget.lng },
      travelMode: routeTravelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport']
    };

    routeClass
      .computeRoutes(request)
      .then(({ routes }) => {
        if (isCancelled) return;
        if (!routes || routes.length === 0) {
          onRouteComputed(null, false, 'Bu cami için uygun yol rotası bulunamadı.');
          return;
        }
        const primaryRoute = routes[0];
        if (typeof primaryRoute.createPolylines === 'function') {
          const polylines: google.maps.Polyline[] = primaryRoute.createPolylines();
          polylines.forEach((polyline) => {
            polyline.setOptions({
              strokeColor: routeTravelMode === 'WALKING' ? '#059669' : '#2563eb',
              strokeWeight: 6,
              strokeOpacity: 0.9
            });
            polyline.setMap(map);
          });
          routePolylinesRef.current = polylines;
        }
        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, 48);
        }
        onRouteComputed(
          {
            distanceMeters: primaryRoute.distanceMeters ?? activeRouteTarget.distanceMeters,
            durationMillis: primaryRoute.durationMillis ?? estimateWalkingMinutes(activeRouteTarget.distanceMeters) * 60000
          },
          false,
          null
        );
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('429') ||
          msg.includes('QuotaExceeded')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onRouteComputed(null, false, 'Rota hesaplanamadı.');
      });

    return () => {
      isCancelled = true;
      routePolylinesRef.current.forEach((poly) => poly.setMap(null));
      routePolylinesRef.current = [];
    };
  }, [routesLib, map, center.lat, center.lng, activeRouteTarget, routeTravelMode, onRouteComputed]);

  const selectedMosqueObj = useMemo(
    () => mosques.find((m) => m.id === selectedMosqueId) || null,
    [mosques, selectedMosqueId]
  );

  return (
    <>
      {/* Kullanıcı Merkez Konum İşaretçisi */}
      <AdvancedMarker
        position={center}
        zIndex={100}
        title="Merkez Konumunuz"
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute w-9 h-9 rounded-full bg-blue-500/35 animate-ping" />
          <div className="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </AdvancedMarker>

      {/* Bulunan Camilerin Harita İşaretçileri (AdvancedMarker) */}
      {mosques.map((mosque, index) => {
        const isSelected = mosque.id === selectedMosqueId;
        return (
          <AdvancedMarker
            key={mosque.id}
            position={{ lat: mosque.lat, lng: mosque.lng }}
            zIndex={isSelected ? 90 : 50 - Math.min(index, 40)}
            onClick={() => onSelectMosque(mosque)}
            title={`${mosque.name} (${formatDistance(mosque.distanceMeters)})`}
          >
            <div
              className={`group flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                isSelected ? 'scale-115' : 'hover:scale-110'
              }`}
            >
              <div
                className={`px-2 py-1 rounded-xl font-extrabold text-[11px] shadow-md border flex items-center gap-1 whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 border-stone-900 ring-4 ring-amber-400/40'
                    : 'bg-emerald-800 text-white border-emerald-950 hover:bg-emerald-700'
                }`}
              >
                <span>🕌</span>
                <span className="max-w-[115px] truncate">{mosque.name.replace(/Camii|Cami/i, '').trim() || 'Cami'}</span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isSelected ? 'bg-stone-900 text-amber-300' : 'bg-black/25 text-emerald-100'
                  }`}
                >
                  {formatDistance(mosque.distanceMeters)}
                </span>
              </div>
              <div
                className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5 ${
                  isSelected ? 'border-t-stone-900' : 'border-t-emerald-950'
                }`}
              />
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Seçili Cami Bilgi Penceresi (InfoWindow) */}
      {selectedMosqueObj && (
        <InfoWindow
          position={{ lat: selectedMosqueObj.lat, lng: selectedMosqueObj.lng }}
          pixelOffset={[0, -34]}
          onCloseClick={() => onSelectMosque(null)}
        >
          <div className="p-1 max-w-[240px] text-slate-800 font-sans space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-black text-xs sm:text-sm text-emerald-950 leading-snug">
                {selectedMosqueObj.name}
              </h4>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-black text-[10px]">
                {formatDistance(selectedMosqueObj.distanceMeters)}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
              {selectedMosqueObj.address}
            </p>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
              <span className="flex items-center gap-1 text-emerald-800">
                <Footprints className="w-3 h-3" />
                ~{estimateWalkingMinutes(selectedMosqueObj.distanceMeters)} dk yürüyüş
              </span>
              {selectedMosqueObj.rating !== null && (
                <span className="flex items-center gap-0.5 text-amber-600 font-extrabold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  {selectedMosqueObj.rating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="pt-1 flex items-center gap-1.5">
              <a
                href={
                  selectedMosqueObj.googleMapsUri ||
                  `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${selectedMosqueObj.lat},${selectedMosqueObj.lng}&destination_place_id=${selectedMosqueObj.id}&travelmode=walking`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-colors"
              >
                <Navigation className="w-3 h-3 text-amber-300" />
                <span>Yol Tarifi Başlat</span>
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const NearbyMosques: React.FC<NearbyMosquesProps> = ({
  currentLocation,
  onUpdateLocation
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // 1. Konum Yönetimi Durumları (Canlı GPS / Kayıtlı Varsayılan / Manuel Koordinat)
  const [locationSource, setLocationSource] = useState<LocationSourceType>('fallback');
  const [activeCenter, setActiveCenter] = useState<{ lat: number; lng: number }>(() => ({
    lat: Number(Number(currentLocation.lat).toFixed(6)),
    lng: Number(Number(currentLocation.lng).toFixed(6))
  }));
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>(() => {
    return `${currentLocation.district ? currentLocation.district + ', ' : ''}${currentLocation.city}`;
  });
  const [gpsStatusWarning, setGpsStatusWarning] = useState<string | null>(null);
  const [isCheckingGps, setIsCheckingGps] = useState<boolean>(true);
  const [liveGpsDetectedToast, setLiveGpsDetectedToast] = useState<boolean>(false);

  // Manuel Koordinat Giriş Paneli Durumları
  const [isManualPanelOpen, setIsManualPanelOpen] = useState<boolean>(false);
  const [manualCombinedInput, setManualCombinedInput] = useState<string>('');
  const [manualLatInput, setManualLatInput] = useState<string>(() => Number(currentLocation.lat).toFixed(6));
  const [manualLngInput, setManualLngInput] = useState<string>(() => Number(currentLocation.lng).toFixed(6));
  const [manualError, setManualError] = useState<string | null>(null);
  const [isMapClickManualMode, setIsMapClickManualMode] = useState<boolean>(false);

  // 2. Dinamik Mesafe ve Filtreleme Durumları (Varsayılan: 1 km)
  const [radiusKm, setRadiusKm] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // 3. Camiler, Seçili Cami, Rota ve Mobil Görünüm Durumları
  const [mosques, setMosques] = useState<MosquePlaceItem[]>([]);
  const [isLoadingMosques, setIsLoadingMosques] = useState<boolean>(true);
  const [mosquesError, setMosquesError] = useState<string | null>(null);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null);

  const [activeRouteTarget, setActiveRouteTarget] = useState<MosquePlaceItem | null>(null);
  const [routeTravelMode, setRouteTravelMode] = useState<'WALKING' | 'DRIVING'>('WALKING');
  const [routeInfo, setRouteInfo] = useState<{ distanceMeters: number; durationMillis: number } | null>(null);
  const [isComputingRoute, setIsComputingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Mobil Görünüm Sekmesi ('split' = Harita + Liste Alt Alta, 'map' = Tam Harita, 'list' = Tam Liste)
  const [mobileViewMode, setMobileViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Referanslar (Reaktif GPS Takibi ve Manuel Mod Kilidi için)
  const locationSourceRef = useRef<LocationSourceType>(locationSource);
  locationSourceRef.current = locationSource;
  const lastGpsCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Uygulama içinden (Şehir Seçici'den) konum değiştirilirse ve kullanıcı GPS veya Manuel modda değilse güncelle
  useEffect(() => {
    if (locationSource === 'fallback') {
      setActiveCenter({
        lat: Number(Number(currentLocation.lat).toFixed(6)),
        lng: Number(Number(currentLocation.lng).toFixed(6))
      });
      setActiveLocationLabel(
        `${currentLocation.district ? currentLocation.district + ', ' : ''}${currentLocation.city}`
      );
    }
  }, [currentLocation.lat, currentLocation.lng, currentLocation.city, currentLocation.district, locationSource]);

  // Canlı GPS Konumunu Uygula ve Tersine Coğrafi Kodlama ile Mahalle/İlçe Adını Bul
  const applyLiveGpsPosition = useCallback(
    async (pos: GeolocationPosition, isReactiveSwitch = false) => {
      // Kullanıcı manuel koordinat girdiyse ve zorunlu GPS tetiklenmediyse manuel modu bozma
      if (locationSourceRef.current === 'manual' && !isReactiveSwitch) {
        return;
      }

      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));

      // Çok küçük GPS titreşimlerinde (< 15 metre) gereksiz API çağrısını önle
      if (
        lastGpsCoordsRef.current &&
        locationSourceRef.current === 'gps' &&
        calculateDistanceMeters(lastGpsCoordsRef.current.lat, lastGpsCoordsRef.current.lng, lat, lng) < 15
      ) {
        setIsCheckingGps(false);
        return;
      }

      const wasFallback = locationSourceRef.current === 'fallback';
      lastGpsCoordsRef.current = { lat, lng };
      setLocationSource('gps');
      setActiveCenter({ lat, lng });
      setGpsStatusWarning(null);
      setIsCheckingGps(false);

      if (wasFallback) {
        setLiveGpsDetectedToast(true);
        setTimeout(() => setLiveGpsDetectedToast(false), 5000);
      }

      try {
        const geo = await reverseGeocode(lat, lng);
        if (geo) {
          const labelParts = [geo.neighborhood, geo.district, geo.city].filter(Boolean);
          setActiveLocationLabel(labelParts.join(', ') || 'Canlı GPS Konumu');
          if (onUpdateLocation) {
            onUpdateLocation({
              city: geo.city || currentLocation.city,
              district: geo.district || 'GPS Konumu',
              neighborhood: geo.neighborhood,
              country: geo.country || 'Türkiye',
              lat,
              lng,
              timezone: currentLocation.timezone
            });
          }
        } else {
          setActiveLocationLabel(`Canlı GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        }
      } catch {
        setActiveLocationLabel(`Canlı GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
      }
    },
    [currentLocation.city, currentLocation.timezone, onUpdateLocation]
  );

  // GPS Kapalı / İzin Yok Durumuna Geçiş
  const handleGpsUnavailable = useCallback(() => {
    setIsCheckingGps(false);
    if (locationSourceRef.current === 'manual') return;

    setLocationSource('fallback');
    setActiveCenter({
      lat: Number(Number(currentLocation.lat).toFixed(6)),
      lng: Number(Number(currentLocation.lng).toFixed(6))
    });
    setActiveLocationLabel(
      `${currentLocation.district ? currentLocation.district + ', ' : ''}${currentLocation.city}`
    );
    setGpsStatusWarning(
      'Konum servisiniz kapalı. En son kaydedilen veya varsayılan konumunuza göre işlem yapılıyor'
    );
  }, [currentLocation.city, currentLocation.district, currentLocation.lat, currentLocation.lng]);

  // Açılışta GPS Kontrolü + Canlı Konum Takibi (watchPosition + Permission onchange + Focus Re-check)
  const startGpsTracking = useCallback(
    (forceExitManual = false) => {
      if (forceExitManual) {
        locationSourceRef.current = 'fallback';
        setLocationSource('fallback');
        setIsMapClickManualMode(false);
      }

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        handleGpsUnavailable();
        return;
      }

      setIsCheckingGps(true);

      // 1. Anlık ilk konumu al
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyLiveGpsPosition(pos, forceExitManual);
        },
        () => {
          handleGpsUnavailable();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );

      // 2. Canlı Konum Takibi (Kullanıcı sonradan GPS'i açarsa veya hareket ederse otomatik algılar)
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (locationSourceRef.current !== 'manual') {
            applyLiveGpsPosition(pos, false);
          }
        },
        () => {
          if (locationSourceRef.current === 'gps') {
            handleGpsUnavailable();
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    },
    [applyLiveGpsPosition, handleGpsUnavailable]
  );

  useEffect(() => {
    startGpsTracking(false);

    // Tarayıcı konum izni durumunu reaktif dinle (Kullanıcı ayarlardan GPS/İzin açtığında anında devreye girer)
    let permStatus: PermissionStatus | null = null;
    const handlePermChange = () => {
      if (permStatus?.state === 'granted' && locationSourceRef.current !== 'manual') {
        startGpsTracking(false);
      } else if (permStatus?.state === 'denied' && locationSourceRef.current !== 'manual') {
        handleGpsUnavailable();
      }
    };

    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          permStatus = status;
          status.addEventListener('change', handlePermChange);
        })
        .catch(() => {});
    }

    // Kullanıcı telefonun üst menüsünden GPS'i açıp uygulamaya geri döndüğünde (focus / visibilitychange) tekrar kontrol et
    const handleWindowFocusOrVisible = () => {
      if (document.visibilityState === 'visible' && locationSourceRef.current === 'fallback') {
        navigator.geolocation?.getCurrentPosition(
          (pos) => applyLiveGpsPosition(pos, false),
          () => {},
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
      }
    };

    window.addEventListener('focus', handleWindowFocusOrVisible);
    document.addEventListener('visibilitychange', handleWindowFocusOrVisible);

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (permStatus) {
        permStatus.removeEventListener('change', handlePermChange);
      }
      window.removeEventListener('focus', handleWindowFocusOrVisible);
      document.removeEventListener('visibilitychange', handleWindowFocusOrVisible);
    };
  }, [startGpsTracking, applyLiveGpsPosition, handleGpsUnavailable]);

  // Manuel Koordinat Uygulama Fonksiyonu
  const handleApplyManualCoordinates = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setManualError(null);

    let latNum: number | null = null;
    let lngNum: number | null = null;

    if (manualCombinedInput.trim()) {
      const parsed = parseCombinedCoordinates(manualCombinedInput);
      if (parsed) {
        latNum = parsed.lat;
        lngNum = parsed.lng;
        setManualLatInput(parsed.lat.toFixed(6));
        setManualLngInput(parsed.lng.toFixed(6));
      } else {
        setManualError(
          'Geçersiz koordinat formatı. Örn: "41.008238, 28.978359" şeklinde virgülden sonra 6 haneli Google Maps koordinatı giriniz.'
        );
        return;
      }
    } else {
      const parsedLat = parseFloat(manualLatInput.trim().replace(',', '.'));
      const parsedLng = parseFloat(manualLngInput.trim().replace(',', '.'));
      if (
        !isNaN(parsedLat) &&
        !isNaN(parsedLng) &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        parsedLng >= -180 &&
        parsedLng <= 180
      ) {
        latNum = Number(parsedLat.toFixed(6));
        lngNum = Number(parsedLng.toFixed(6));
      } else {
        setManualError(
          'Lütfen geçerli bir Enlem (-90..90) ve Boylam (-180..180) değeri giriniz (Örn: 41.008238 ve 28.978359).'
        );
        return;
      }
    }

    locationSourceRef.current = 'manual';
    setLocationSource('manual');
    setGpsStatusWarning(null);
    setActiveRouteTarget(null);
    setSelectedMosqueId(null);
    setActiveCenter({ lat: latNum, lng: lngNum });
    setActiveLocationLabel(`Manuel Konum (${latNum.toFixed(6)}°, ${lngNum.toFixed(6)}°)`);
    setIsManualPanelOpen(false);
    setIsMapClickManualMode(false);

    try {
      const geo = await reverseGeocode(latNum, lngNum);
      if (geo) {
        const labelParts = [geo.neighborhood, geo.district, geo.city].filter(Boolean);
        if (labelParts.length > 0) {
          setActiveLocationLabel(`Manuel: ${labelParts.join(', ')}`);
        }
      }
    } catch {
      // ignore reverse geocode failure
    }
  };

  // Harita üzerinden tıklanarak manuel koordinat seçildiğinde
  const handleMapClickPickCoordinate = useCallback(async (lat: number, lng: number) => {
    setManualLatInput(lat.toFixed(6));
    setManualLngInput(lng.toFixed(6));
    setManualCombinedInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    locationSourceRef.current = 'manual';
    setLocationSource('manual');
    setGpsStatusWarning(null);
    setActiveRouteTarget(null);
    setSelectedMosqueId(null);
    setActiveCenter({ lat, lng });
    setActiveLocationLabel(`Manuel Konum (${lat.toFixed(6)}°, ${lng.toFixed(6)}°)`);
    setIsMapClickManualMode(false);

    try {
      const geo = await reverseGeocode(lat, lng);
      if (geo) {
        const labelParts = [geo.neighborhood, geo.district, geo.city].filter(Boolean);
        if (labelParts.length > 0) {
          setActiveLocationLabel(`Manuel: ${labelParts.join(', ')}`);
        }
      }
    } catch {}
  }, []);

  // Mesafe Artırma / Azaltma (- / +) Kontrolleri
  const handleDecreaseRadius = () => {
    setActiveRouteTarget(null);
    const prevSteps = STEP_RADII_KM.filter((r) => r < radiusKm);
    if (prevSteps.length > 0) {
      setRadiusKm(prevSteps[prevSteps.length - 1]);
    } else {
      setRadiusKm(0.5);
    }
  };

  const handleIncreaseRadius = () => {
    setActiveRouteTarget(null);
    const nextSteps = STEP_RADII_KM.filter((r) => r > radiusKm);
    if (nextSteps.length > 0) {
      setRadiusKm(nextSteps[0]);
    } else {
      setRadiusKm(20);
    }
  };

  const handleMosquesLoaded = useCallback(
    (loadedMosques: MosquePlaceItem[], loading: boolean, error: string | null) => {
      setMosques(loadedMosques);
      setIsLoadingMosques(loading);
      setMosquesError(error);
    },
    []
  );

  const handleRouteComputed = useCallback(
    (info: { distanceMeters: number; durationMillis: number } | null, loading: boolean, error: string | null) => {
      setRouteInfo(info);
      setIsComputingRoute(loading);
      setRouteError(error);
    },
    []
  );

  // Haritadan veya listeden bir cami seçildiğinde
  const handleSelectMosque = useCallback((mosque: MosquePlaceItem | null) => {
    setSelectedMosqueId(mosque ? mosque.id : null);
    if (mosque && cardRefs.current[mosque.id]) {
      cardRefs.current[mosque.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Filtrelenmiş ve Sıralanmış Cami Listesi
  const filteredMosques = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = mosques.filter((m) => {
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q);
    });

    if (sortBy === 'rating') {
      return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.distanceMeters - b.distanceMeters);
    }
    return [...list].sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [mosques, searchQuery, sortBy]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* 1. ÜST BAŞLIK VE AKTİF KONUM YÖNETİM ÇUBUĞU */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
                🕌
              </span>
              <span>Yakındaki Camiler</span>
            </h2>

            {/* Konum Kaynağı Rozeti */}
            {locationSource === 'gps' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Canlı GPS Aktif</span>
              </span>
            )}
            {locationSource === 'manual' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-300 text-xs font-extrabold">
                <Edit3 className="w-3 h-3 text-indigo-700" />
                <span>Manuel Koordinat Modu</span>
              </span>
            )}
            {locationSource === 'fallback' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-extrabold">
                <MapPin className="w-3 h-3 text-amber-700" />
                <span>Kayıtlı / Varsayılan Konum</span>
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Merkez Üssü: <strong className="text-slate-900">{activeLocationLabel}</strong>
            </span>
            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              {activeCenter.lat.toFixed(6)}°, {activeCenter.lng.toFixed(6)}°
            </span>
          </p>
        </div>

        {/* Sağ Kontroller: Canlı GPS Butonu & Manuel Koordinat Giriş Butonu */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => startGpsTracking(true)}
            disabled={isCheckingGps}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
              locationSource === 'gps'
                ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300'
            }`}
            title="Cihazın canlı GPS konumunu merkez üssü yap"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isCheckingGps ? 'animate-spin' : ''}`} />
            <span>
              {isCheckingGps
                ? 'GPS Kontrol Ediliyor...'
                : locationSource === 'gps'
                ? 'GPS Konumunu Yenile'
                : 'Canlı GPS Konumuna Geç'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsManualPanelOpen((prev) => !prev);
              setManualError(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 border ${
              isManualPanelOpen || locationSource === 'manual'
                ? 'bg-indigo-900 text-white border-indigo-950'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Konumu Manuel Gir</span>
          </button>

          <button
            type="button"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            disabled={isLoadingMosques}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Cami Taramasını Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMosques ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* KONUM KAPALI UYARISI (GPS kapalıysa veya izin verilmediyse gösterilir) */}
      {gpsStatusWarning && locationSource === 'fallback' && (
        <div className="bg-amber-50/95 border border-amber-300 text-amber-950 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span>{gpsStatusWarning}.</span>
              <span className="block text-[11px] text-amber-800 font-semibold mt-0.5">
                Telefonunuzun GPS konum servisini açtığınızda ekran otomatik olarak canlı konumunuza güncellenecektir.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => startGpsTracking(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
            >
              Tekrar Dene
            </button>
            <button
              type="button"
              onClick={() => setGpsStatusWarning(null)}
              className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 font-bold text-xs cursor-pointer"
              title="Uyarıyı Gizle"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CANLI GPS OTOMATİK ALGILANDI BİLDİRİMİ */}
      {liveGpsDetectedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-extrabold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Canlı GPS sinyali algılandı! Harita ve yakındaki camiler anlık konumunuza göre güncellendi.</span>
          </div>
          <button
            type="button"
            onClick={() => setLiveGpsDetectedToast(false)}
            className="text-emerald-800 hover:text-emerald-950 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MANUEL KOORDİNAT GİRİŞ PANELİ (Google Maps Hassas 6 Haneli Koordinat Desteği) */}
      {isManualPanelOpen && (
        <form
          onSubmit={handleApplyManualCoordinates}
          className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Manuel Koordinat Girişi (Google Maps Hassas Konum)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsManualPanelOpen(false)}
              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Tek Satırda Google Maps'ten Kopyalanan Koordinatı Yapıştırma */}
            <div className="md:col-span-5">
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Google Maps'ten Kopyalanan Koordinat (Hızlı Yapıştır):
              </label>
              <input
                type="text"
                value={manualCombinedInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setManualCombinedInput(val);
                  const parsed = parseCombinedCoordinates(val);
                  if (parsed) {
                    setManualLatInput(parsed.lat.toFixed(6));
                    setManualLngInput(parsed.lng.toFixed(6));
                    setManualError(null);
                  }
                }}
                placeholder="Örn: 41.008238, 28.978359"
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-900"
              />
            </div>

            {/* Ayrı Enlem (Latitude) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Enlem (Latitude):
              </label>
              <input
                type="text"
                value={manualLatInput}
                onChange={(e) => {
                  setManualLatInput(e.target.value);
                  setManualCombinedInput('');
                }}
                placeholder="41.008238"
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-900"
              />
            </div>

            {/* Ayrı Boylam (Longitude) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Boylam (Longitude):
              </label>
              <input
                type="text"
                value={manualLngInput}
                onChange={(e) => {
                  setManualLngInput(e.target.value);
                  setManualCombinedInput('');
                }}
                placeholder="28.978359"
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-900"
              />
            </div>

            {/* Uygula & Haritadan Seç Butonları */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-black transition-colors cursor-pointer shadow-xs"
              >
                Koordinatı Uygula
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMapClickManualMode((prev) => !prev);
                  setIsManualPanelOpen(false);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isMapClickManualMode
                    ? 'bg-amber-400 text-stone-950 border-amber-500 font-black'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Harita üzerinde istediğiniz noktaya tıklayarak merkez seçin"
              >
                Haritadan Seç
              </button>
            </div>
          </div>

          {manualError && (
            <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              ⚠️ {manualError}
            </p>
          )}

          <p className="text-[11px] font-semibold text-slate-500">
            💡 Google Maps üzerinde istediğiniz noktaya sağ tıklayıp (veya mobilde basılı tutup) kopyaladığınız{' '}
            <strong className="font-mono text-slate-700">41.008238, 28.978359</strong> formatındaki hassas koordinatı
            doğrudan yapıştırabilirsiniz.
          </p>
        </form>
      )}

      {isMapClickManualMode && (
        <div className="bg-indigo-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-extrabold shadow-md">
          <span>🎯 Harita üzerinde camileri taramak istediğiniz merkez noktaya dokunun / tıklayın...</span>
          <button
            type="button"
            onClick={() => setIsMapClickManualMode(false)}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            İptal
          </button>
        </div>
      )}

      {/* 2. DİNAMİK MESAFE KONTROLÜ (1 KM VARSAYILAN, - / + VE HIZLI SEÇİM HAPLARI) & FİLTRE ÇUBUĞU */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        {/* Sol: Dinamik Yarıçap Kontrolü (- / + ve Hızlı Seçim Hapları) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <span>Tarama Yarıçapı:</span>
          </div>

          {/* - / + Artırma Azaltma Kontrolleri */}
          <div className="inline-flex items-center bg-white rounded-xl border border-slate-300 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleDecreaseRadius}
              disabled={radiusKm <= 0.5}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              title="Mesafeyi Azalt"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-mono text-xs sm:text-sm font-black text-emerald-900 min-w-[68px] text-center">
              {radiusKm < 1 ? `${radiusKm * 1000} m` : `${radiusKm} km`}
            </span>
            <button
              type="button"
              onClick={handleIncreaseRadius}
              disabled={radiusKm >= 20}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              title="Mesafeyi Artır"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hızlı Seçim Hapları (500 m, 1 km, 2 km, 3 km, 5 km, 10 km) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {RADIUS_PRESETS_KM.map((preset) => {
              const isSelected = radiusKm === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setActiveRouteTarget(null);
                    setRadiusKm(preset);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {preset < 1 ? `${preset * 1000} m` : `${preset} km`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sağ: Cami Arama, Sıralama ve Mobil Görünüm Seçici */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cami veya mahalle ara..."
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:border-emerald-600 focus:outline-hidden cursor-pointer"
            title="Sıralama Ölçütü"
          >
            <option value="distance">En Yakın Mesafe</option>
            <option value="rating">En Yüksek Puan</option>
          </select>

          {/* Mobil Görünüm Seçici (Sadece küçük/orta ekranlarda görünür) */}
          <div className="flex lg:hidden items-center bg-white border border-slate-300 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setMobileViewMode('split')}
              className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                mobileViewMode === 'split' ? 'bg-emerald-800 text-white' : 'text-slate-600'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Tümü</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('map')}
              className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                mobileViewMode === 'map' ? 'bg-emerald-800 text-white' : 'text-slate-600'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Harita</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('list')}
              className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                mobileViewMode === 'list' ? 'bg-emerald-800 text-white' : 'text-slate-600'
              }`}
            >
              <List className="w-3 h-3" />
              <span>Liste ({filteredMosques.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* AKTİF ROTA BİLGİ ÇUBUĞU (Kullanıcı bir camiye "Haritada Rota Çiz" dediğinde görünür) */}
      {activeRouteTarget && (
        <div className="bg-emerald-950 text-white px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-black">
              <RouteIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                <span>Rota: {activeRouteTarget.name}</span>
              </div>
              {isComputingRoute ? (
                <p className="text-xs text-emerald-200 font-semibold">Yol rotası hesaplanıyor...</p>
              ) : routeError ? (
                <p className="text-xs text-rose-300 font-semibold">{routeError}</p>
              ) : routeInfo ? (
                <p className="text-xs text-emerald-100 font-bold">
                  Yol Mesafesi: <strong className="text-white">{formatDistance(routeInfo.distanceMeters)}</strong> •
                  Tahmini Süre:{' '}
                  <strong className="text-white">{Math.max(1, Math.round(routeInfo.durationMillis / 60000))} dakika</strong>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRouteTravelMode('WALKING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                routeTravelMode === 'WALKING'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Yürüyüş</span>
            </button>
            <button
              type="button"
              onClick={() => setRouteTravelMode('DRIVING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                routeTravelMode === 'DRIVING'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Araç</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRouteTarget(null)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer"
            >
              Rotayı Kapat
            </button>
          </div>
        </div>
      )}

      {/* 3. RESPONSIVE SPLIT / STACK VIEW: HARİTA VE CAMİ LİSTESİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SOL / ÜST: ETKİLEŞİMLİ GOOGLE MAPS HARİTASI */}
        <div
          className={`lg:col-span-7 w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs relative ${
            mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="h-[380px] sm:h-[460px] lg:h-[600px] w-full relative bg-slate-100">
            {apiKey ? (
              <APIProvider apiKey={apiKey} language="tr" region="TR">
                <Map
                  defaultCenter={activeCenter}
                  defaultZoom={getZoomForRadiusKm(radiusKm)}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="greedy"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full"
                >
                  <InnerMapAndPlacesManager
                    center={activeCenter}
                    radiusKm={radiusKm}
                    selectedMosqueId={selectedMosqueId}
                    onSelectMosque={handleSelectMosque}
                    onMosquesLoaded={handleMosquesLoaded}
                    activeRouteTarget={activeRouteTarget}
                    routeTravelMode={routeTravelMode}
                    onRouteComputed={handleRouteComputed}
                    refreshTrigger={refreshTrigger}
                    isMapClickManualMode={isMapClickManualMode}
                    onMapClickPickCoordinate={handleMapClickPickCoordinate}
                  />
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-600">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                <p className="text-sm font-bold text-slate-800">Google Maps API Anahtarı Bekleniyor</p>
                <p className="text-xs mt-1">Harita servisinin yüklenmesi için lütfen sayfayı yenileyin.</p>
              </div>
            )}

            {/* Harita Üstü Bilgi Rozeti */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-wrap items-center gap-1.5">
              <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>
                  {radiusKm < 1 ? `${radiusKm * 1000} m` : `${radiusKm} km`} Çevrede{' '}
                  <strong className="text-emerald-800">{filteredMosques.length}</strong> Cami
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ / ALT: YAKINDAKİ CAMİLER LİSTESİ */}
        <div
          className={`lg:col-span-5 w-full flex flex-col ${
            mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-col h-[480px] lg:h-[600px]">
            {/* Liste Başlığı */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  Bulunan Camiler ({filteredMosques.length})
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Yarıçap: {radiusKm < 1 ? `${radiusKm * 1000} m` : `${radiusKm} km`}
              </span>
            </div>

            {/* Liste İçeriği */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {isLoadingMosques ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      {radiusKm < 1 ? `${radiusKm * 1000} metre` : `${radiusKm} km`} çevredeki camiler taranıyor...
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Google Maps Places verileri alınıyor
                    </p>
                  </div>
                </div>
              ) : mosquesError ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{mosquesError}</p>
                  <button
                    type="button"
                    onClick={() => setRefreshTrigger((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : filteredMosques.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                    🕌
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-800">
                      {radiusKm < 1 ? `${radiusKm * 1000} m` : `${radiusKm} km`} yarıçap içinde cami bulunamadı
                    </p>
                    <p className="text-xs text-slate-500">
                      Arama mesafesini artırarak çevredeki diğer camileri listeleyebilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleIncreaseRadius}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Arama Mesafesini Artır</span>
                  </button>
                </div>
              ) : (
                filteredMosques.map((mosque, idx) => {
                  const isSelected = mosque.id === selectedMosqueId;
                  const isRouteActive = activeRouteTarget?.id === mosque.id;
                  const walkMins = estimateWalkingMinutes(mosque.distanceMeters);

                  return (
                    <div
                      key={mosque.id}
                      ref={(el) => {
                        cardRefs.current[mosque.id] = el;
                      }}
                      onClick={() => handleSelectMosque(mosque)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Sıra / Cami Görseli */}
                        {mosque.photoUri ? (
                          <img
                            src={mosque.photoUri}
                            alt={mosque.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 font-black text-xs border ${
                              isSelected
                                ? 'bg-emerald-800 text-amber-300 border-emerald-950'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            }`}
                          >
                            <span className="text-sm">🕌</span>
                            <span className="text-[9px] font-mono">#{idx + 1}</span>
                          </div>
                        )}

                        {/* Cami Bilgileri */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug truncate">
                              {mosque.name}
                            </h3>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded-full font-mono text-[11px] font-black ${
                                isSelected
                                  ? 'bg-emerald-800 text-white'
                                  : 'bg-emerald-100 text-emerald-950'
                              }`}
                            >
                              {formatDistance(mosque.distanceMeters)}
                            </span>
                          </div>

                          <p className="text-[11px] font-semibold text-slate-600 mt-0.5 line-clamp-2">
                            {mosque.address}
                          </p>

                          {/* Alt Metrikler: Yürüyüş Süresi & Puan */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-bold">
                            <span className="inline-flex items-center gap-1 text-emerald-800">
                              <Clock className="w-3 h-3" />
                              <span>~{walkMins} dk yürüyüş</span>
                            </span>

                            {mosque.rating !== null && (
                              <span className="inline-flex items-center gap-1 text-amber-700">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                <span>{mosque.rating.toFixed(1)}</span>
                                {mosque.userRatingCount !== null && (
                                  <span className="text-slate-400 font-normal">({mosque.userRatingCount})</span>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Aksiyon Butonları: Haritada Rota Çiz & Google Maps Yol Tarifi */}
                          <div
                            className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMosqueId(mosque.id);
                                setActiveRouteTarget(isRouteActive ? null : mosque);
                                if (mobileViewMode === 'list') {
                                  setMobileViewMode('split');
                                }
                              }}
                              className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                isRouteActive
                                  ? 'bg-amber-400 text-stone-950 border border-amber-500'
                                  : 'bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-950'
                              }`}
                            >
                              <RouteIcon className="w-3.5 h-3.5" />
                              <span>{isRouteActive ? 'Rota Gösteriliyor' : 'Haritada Rota Çiz'}</span>
                            </button>

                            <a
                              href={
                                mosque.googleMapsUri ||
                                `https://www.google.com/maps/dir/?api=1&origin=${activeCenter.lat},${activeCenter.lng}&destination=${mosque.lat},${mosque.lng}&destination_place_id=${mosque.id}&travelmode=walking`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Navigation className="w-3 h-3 text-amber-300" />
                              <span>Yol Tarifi Al</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
