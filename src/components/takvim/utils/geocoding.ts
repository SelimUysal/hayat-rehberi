/**
 * Coğrafi Konum & Tersine Adres Çözümleme Servisi (Reverse & Forward Geocoding)
 * OpenStreetMap Nominatim açık API'si kullanarak koordinattan mahalle, ilçe, il ve tam adres tespiti sağlar.
 */

export interface GeocodedAddress {
  city: string;
  district?: string;
  neighborhood?: string;
  country: string;
  displayName: string;
  shortLocationName: string;
  lat: number;
  lng: number;
}

const geocodeCache = new Map<string, GeocodedAddress>();

/**
 * Enlem ve Boylamdan detaylı adres (İl, İlçe, Mahalle, Sokak vb.) tespiti
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress | null> {
  const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NamazTakvimiApp/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address || {};

    const country = addr.country || 'Türkiye';
    const city = addr.city || addr.province || addr.state || addr.region || 'Bilinmeyen İl';
    const district = addr.town || addr.district || addr.county || addr.city_district || addr.municipality || '';
    const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.village || addr.hamlet || '';

    let shortLocationName = '';
    if (neighborhood && district) {
      shortLocationName = `${neighborhood}, ${district}`;
    } else if (district && city) {
      shortLocationName = district !== city ? `${district}, ${city}` : city;
    } else if (city) {
      shortLocationName = city;
    } else {
      shortLocationName = `Konum (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
    }

    const result: GeocodedAddress = {
      city: city,
      district: district || undefined,
      neighborhood: neighborhood || undefined,
      country,
      displayName: data.display_name || shortLocationName,
      shortLocationName,
      lat,
      lng
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch {
    // API gecikmesi veya internet erişimi kısıtlı olduğunda sessizce geri dön
    return null;
  }
}

/**
 * Metin tabanlı konum/ilçe/mahalle araması (örn: "Kadıköy Fikirtepe", "Keçiören")
 */
export async function searchLocations(query: string): Promise<GeocodedAddress[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(trimmed)}&accept-language=tr&addressdetails=1&limit=6`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NamazTakvimiApp/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const list = await response.json();
    if (!Array.isArray(list)) return [];

    return list.map((item: any) => {
      const addr = item.address || {};
      const country = addr.country || 'Türkiye';
      const city = addr.city || addr.province || addr.state || addr.region || '';
      const district = addr.town || addr.district || addr.county || addr.city_district || '';
      const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.village || '';

      let shortName = item.name || '';
      if (neighborhood && district) {
        shortName = `${neighborhood}, ${district} (${city || country})`;
      } else if (district && city) {
        shortName = `${district}, ${city}`;
      } else if (city) {
        shortName = `${city}, ${country}`;
      } else {
        shortName = item.display_name?.split(',').slice(0, 3).join(',') || 'Konum';
      }

      return {
        city: city || district || item.name || 'Özel Konum',
        district: district || undefined,
        neighborhood: neighborhood || undefined,
        country,
        displayName: item.display_name || shortName,
        shortLocationName: shortName,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      };
    });
  } catch {
    return [];
  }
}

/**
 * IP Tabanlı Konum Tespiti (GPS izin verilmeyen veya iframe içinde engellenen durumlar için yedek)
 */
export async function getApproximateLocationByIP(): Promise<GeocodedAddress | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.latitude && data.longitude) {
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      const city = data.city || data.region || 'Tespit Edilen Şehir';
      const country = data.country_name || 'Türkiye';
      return {
        city,
        district: data.region || undefined,
        country,
        displayName: `${city}, ${data.region || ''} (${country}) [IP Konumu]`,
        shortLocationName: `${city}, ${country}`,
        lat,
        lng
      };
    }
  } catch {
    // Fail silently
  }
  return null;
}
