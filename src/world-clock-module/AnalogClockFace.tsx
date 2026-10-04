import React, { useEffect, useState } from 'react';
import {
  CardUITheme,
  CustomCardinalLabels,
  DialDatePosition,
  HandStyle,
  NumeralStyle,
  SecondHandMotion
} from './types';
import { getTimePartsInTimezone } from './worldCitiesData';

interface AnalogClockFaceProps {
  clockId: string;
  timezone: string;
  timeTravelMinutes: number;
  numeralStyle: NumeralStyle;
  customCardinals: CustomCardinalLabels;
  secondMotion: SecondHandMotion;
  handStyle?: HandStyle;
  uiTheme: CardUITheme;
  numeralColor: string;
  bezelColor?: string | null;
  dialBgColor?: string | null;
  tickColor?: string | null;
  hourHandColor?: string | null;
  minuteHandColor?: string | null;
  showDialDate?: boolean;
  dialDatePosition?: DialDatePosition;
  centerPhotoDataUrl?: string | null;
  /**
   * 0.02 (nokta kadar) ile 1.00 (kadranın tam iç çerçevesini dolduracak maksimum çap) arası
   */
  centerPhotoScale?: number;
  sizePx?: number;
}

const TURKISH_NUMERALS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const ROMAN_NUMERALS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const ARABIC_NUMERALS = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];

export interface DialPalette {
  dialBgStart: string;
  dialBgEnd: string;
  outerRing: string;
  innerRing: string;
  majorTick: string;
  minorTick: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  centerCap: string;
}

export function getDialPalette(uiTheme: CardUITheme): DialPalette {
  switch (uiTheme) {
    case 'royal-obsidian':
      return {
        dialBgStart: '#1c1917',
        dialBgEnd: '#090706',
        outerRing: '#f59e0b',
        innerRing: 'rgba(245, 158, 11, 0.35)',
        majorTick: '#fbbf24',
        minorTick: 'rgba(251, 191, 36, 0.45)',
        hourHand: '#fef3c7',
        minuteHand: '#fbbf24',
        secondHand: '#ef4444',
        centerCap: '#f59e0b'
      };
    case 'ottoman-emerald':
      return {
        dialBgStart: '#064e3b',
        dialBgEnd: '#022c22',
        outerRing: '#34d399',
        innerRing: 'rgba(52, 211, 153, 0.32)',
        majorTick: '#a7f3d0',
        minorTick: 'rgba(167, 243, 208, 0.45)',
        hourHand: '#ecfdf5',
        minuteHand: '#6ee7b7',
        secondHand: '#fbbf24',
        centerCap: '#10b981'
      };
    case 'midnight-sapphire':
      return {
        dialBgStart: '#172554',
        dialBgEnd: '#090d16',
        outerRing: '#60a5fa',
        innerRing: 'rgba(96, 165, 250, 0.32)',
        majorTick: '#bfdbfe',
        minorTick: 'rgba(191, 219, 254, 0.45)',
        hourHand: '#eff6ff',
        minuteHand: '#93c5fd',
        secondHand: '#38bdf8',
        centerCap: '#3b82f6'
      };
    case 'nordic-alabaster':
      return {
        dialBgStart: '#fffdf9',
        dialBgEnd: '#f5f0e6',
        outerRing: '#a8a29e',
        innerRing: 'rgba(120, 113, 108, 0.28)',
        majorTick: '#292524',
        minorTick: 'rgba(41, 37, 36, 0.4)',
        hourHand: '#1c1917',
        minuteHand: '#44403c',
        secondHand: '#dc2626',
        centerCap: '#292524'
      };
    case 'ottoman-iznik':
      // 6. Mod (Osmanlı): Kullanıcının Seçtiği 6 Osmanlı Rengi (Krem/Çini Zemin, Koyu Kobalt, Firuze/Turkuaz, Derin Hünkâr Bordosu, Lale Mercanı, Yaprak Yeşili)
      return {
        dialBgStart: '#FAF4E6', // Krem / Çini Zemin (Parlak İznik Sırı)
        dialBgEnd: '#EADBC0',   // Krem / Çini Zemin (Sıcak Kenar Gölgesi)
        outerRing: '#142952',   // Koyu Kobalt
        innerRing: '#1CA39C',   // Firuze / Turkuaz
        majorTick: '#5C101E',   // Derin Hünkâr Bordosu
        minorTick: '#2D6A4F',   // Yaprak Yeşili
        hourHand: '#5C101E',    // Derin Hünkâr Bordosu (Akrep)
        minuteHand: '#142952',  // Koyu Kobalt (Yelkovan)
        secondHand: '#D94126',  // Lale Mercanı (Saniye)
        centerCap: '#1CA39C'    // Firuze / Turkuaz (Orta Göbek)
      };
    case 'crystal-glass':
    default:
      return {
        dialBgStart: '#1e293b',
        dialBgEnd: '#0f172a',
        outerRing: '#94a3b8',
        innerRing: 'rgba(148, 163, 184, 0.28)',
        majorTick: '#e2e8f0',
        minorTick: 'rgba(148, 163, 184, 0.5)',
        hourHand: '#f8fafc',
        minuteHand: '#cbd5e1',
        secondHand: '#10b981',
        centerCap: '#10b981'
      };
  }
}

function getDialDateBadgeText(baseNow: Date, timezone: string, timeTravelMinutes: number): {
  dayNum: string;
  monthShort: string;
} {
  const shiftedMs = baseNow.getTime() + timeTravelMinutes * 60 * 1000;
  const targetDate = new Date(shiftedMs);
  let safeTz = timezone;
  try {
    Intl.DateTimeFormat('tr-TR', { timeZone: safeTz });
  } catch {
    safeTz = 'Europe/Istanbul';
  }

  const dayNum = new Intl.DateTimeFormat('tr-TR', {
    timeZone: safeTz,
    day: '2-digit'
  }).format(targetDate);

  const monthShort = new Intl.DateTimeFormat('tr-TR', {
    timeZone: safeTz,
    month: 'short'
  })
    .format(targetDate)
    .toLocaleUpperCase('tr-TR')
    .replace('.', '');

  return { dayNum, monthShort };
}

export const AnalogClockFace: React.FC<AnalogClockFaceProps> = ({
  clockId,
  timezone,
  timeTravelMinutes,
  numeralStyle,
  customCardinals,
  secondMotion,
  handStyle = 'rect',
  uiTheme,
  numeralColor,
  bezelColor,
  dialBgColor,
  tickColor,
  hourHandColor,
  minuteHandColor,
  showDialDate = true,
  dialDatePosition = 'right',
  centerPhotoDataUrl,
  centerPhotoScale = 0.55,
  sizePx
}) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (secondMotion === 'sweep') {
      let frameId: number;
      const animate = () => {
        setNow(new Date());
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    } else {
      setNow(new Date());
      const interval = setInterval(() => {
        setNow(new Date());
      }, 250);
      return () => clearInterval(interval);
    }
  }, [secondMotion]);

  const timeParts = getTimePartsInTimezone(now, timezone, timeTravelMinutes);
  const dateBadge = getDialDateBadgeText(now, timezone, timeTravelMinutes);
  const basePalette = getDialPalette(uiTheme);

  // Kullanıcının seçtiği özel renkleri temanın üzerine uygula
  const effectiveOuterRing = bezelColor || basePalette.outerRing;
  const effectiveInnerRing = bezelColor ? bezelColor : basePalette.innerRing;
  const effectiveDialBgStart = dialBgColor || basePalette.dialBgStart;
  const effectiveDialBgEnd = dialBgColor || basePalette.dialBgEnd;
  const effectiveMajorTick = tickColor || basePalette.majorTick;
  const effectiveMinorTick = tickColor || basePalette.minorTick;
  const effectiveHourHand = hourHandColor || basePalette.hourHand;
  const effectiveMinuteHand = minuteHandColor || basePalette.minuteHand;

  const isOttomanIznik = uiTheme === 'ottoman-iznik';
  const isOttomanTheme = isOttomanIznik;

  // Krem/Çini veya Fildişi açık kadranlarda varsayılan beyaz rakam rengi kalmışsa Koyu Kobalt / Antrasit yap
  const isDefaultLightNumeral =
    !numeralColor ||
    numeralColor.toLowerCase() === '#f8fafc' ||
    numeralColor.toLowerCase() === '#ecfdf5';
  const effectiveNumeralFill =
    isOttomanIznik && !dialBgColor && isDefaultLightNumeral
      ? '#142952' // Koyu Kobalt
      : uiTheme === 'nordic-alabaster' && !dialBgColor && isDefaultLightNumeral
      ? '#1c1917'
      : numeralColor || effectiveMajorTick;

  // Saniye, yelkovan ve akrep açılarını hesapla
  const exactSeconds =
    secondMotion === 'sweep'
      ? timeParts.seconds + timeParts.milliseconds / 1000
      : timeParts.seconds;

  const secondAngle = exactSeconds * 6; // 360 / 60
  const exactMinutes = timeParts.minutes + exactSeconds / 60;
  const minuteAngle = exactMinutes * 6;
  const exactHours = (timeParts.hours12 % 12) + exactMinutes / 60;
  const hourAngle = exactHours * 30; // 360 / 12

  const clipId = `wc-center-photo-clip-${clockId}`;
  const gradId = `wc-dial-grad-${clockId}`;

  // Nokta kadar (r=2px) ile Kadranın tam iç çerçevesini tamamen dolduracak maksimum çap (r=102.2px) arası esnek ölçek
  const clampedScale = Math.max(0.02, Math.min(1.0, centerPhotoScale));
  const photoRadius = Number((clampedScale * 102.2).toFixed(2));

  const getNumeralLabel = (index: number): string | null => {
    if (numeralStyle === 'custom12369') {
      if (index === 0) return customCardinals.pos12 || '12';
      if (index === 3) return customCardinals.pos3 || '3';
      if (index === 6) return customCardinals.pos6 || '6';
      if (index === 9) return customCardinals.pos9 || '9';
      return null;
    }
    if (numeralStyle === 'roman') return ROMAN_NUMERALS[index];
    if (numeralStyle === 'arabic') return ARABIC_NUMERALS[index];
    return TURKISH_NUMERALS[index];
  };

  // Lüks Saat Tarih Penceresi (Date Complication) Koordinatları
  const dateCoordsMap: Record<DialDatePosition, { x: number; y: number }> = {
    right: { x: 147, y: 110 },  // Orta Sağ (Saat 3 yönü)
    left: { x: 73, y: 110 },    // Orta Sol (Saat 9 yönü)
    top: { x: 110, y: 66 },     // Üst Orta (Saat 12 altı)
    bottom: { x: 110, y: 154 }  // Alt Orta (Saat 6 üstü)
  };
  const datePos = dateCoordsMap[dialDatePosition || 'right'];
  const dateBoxW = 36;
  const dateBoxH = 17;

  return (
    <div
      className="relative flex items-center justify-center select-none transition-all duration-150"
      style={
        sizePx
          ? {
              width: `${sizePx}px`,
              height: `${sizePx}px`,
              maxWidth: '100%',
              aspectRatio: '1 / 1'
            }
          : { width: '100%', height: '100%', aspectRatio: '1 / 1' }
      }
    >
      <svg
        viewBox="0 0 220 220"
        className="w-full h-full drop-shadow-md overflow-visible"
        role="img"
        aria-label="Analog Saat Kadranı"
      >
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={effectiveDialBgStart} />
            <stop offset="100%" stopColor={effectiveDialBgEnd} />
          </radialGradient>
          <clipPath id={clipId}>
            <circle cx="110" cy="110" r={photoRadius} />
          </clipPath>
        </defs>

        {/* 1. Dış Çerçeve (Bezel) ve 2. İç Göbek Arka Planı */}
        <circle
          cx="110"
          cy="110"
          r="104"
          fill={`url(#${gradId})`}
          stroke={effectiveOuterRing}
          strokeWidth={isOttomanTheme ? '4.8' : '4'}
        />

        {/* Osmanlı Moduna Özel Çift Katmanlı Çini Suyu Kuşağı */}
        {isOttomanTheme && !bezelColor && (
          <circle
            cx="110"
            cy="110"
            r="100.2"
            fill="none"
            stroke="#D94126"
            strokeWidth="1.4"
            strokeDasharray="3 2"
            strokeOpacity="0.85"
          />
        )}

        {/* KİŞİYE ÖZEL ORTA GÖBEK FOTOĞRAFI (Akrep, Yelkovan ve Rakamların Arkasında, Daire Maskeli) */}
        {centerPhotoDataUrl ? (
          <g>
            <g clipPath={`url(#${clipId})`}>
              <image
                href={centerPhotoDataUrl}
                x={110 - photoRadius}
                y={110 - photoRadius}
                width={photoRadius * 2}
                height={photoRadius * 2}
                preserveAspectRatio="xMidYMid slice"
              />
              <circle
                cx="110"
                cy="110"
                r={photoRadius}
                fill="rgba(0,0,0,0.16)"
              />
            </g>
            {photoRadius < 100 && (
              <circle
                cx="110"
                cy="110"
                r={photoRadius}
                fill="none"
                stroke={effectiveOuterRing}
                strokeWidth="1.5"
                strokeOpacity="0.85"
              />
            )}
          </g>
        ) : isOttomanTheme ? (
          /* 6. OSMANLI MODUNA ÖZEL: DAİRESEL İZNİK ÇİNİ MADALYONU, PADİŞAH TUĞRASI VE İZNİK LALESİ MOTİFİ */
          <g>
            {/* 1. Dairesel İznik Çini Madalyon Zemin Halkası (Yıldız/Poligon Yok, Saf Dairesel Çini Şemse) */}
            <circle
              cx="110"
              cy="110"
              r="53"
              fill="rgba(28, 163, 156, 0.08)"
              stroke="#1CA39C"
              strokeWidth="1.35"
            />
            <circle
              cx="110"
              cy="110"
              r="49.5"
              fill="rgba(246, 239, 226, 0.55)"
              stroke="#142952"
              strokeWidth="0.95"
              strokeDasharray="2 2.5"
              strokeOpacity="0.75"
            />

            {/* Madalyon Çevresinde 12 İznik Çini Penç / Gonca Noktası (Firuze, Lale Mercanı ve Yaprak Yeşili) */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const a = ((idx * 30 - 90) * Math.PI) / 180;
              const px = 110 + 51.2 * Math.cos(a);
              const py = 110 + 51.2 * Math.sin(a);
              const dotColor =
                idx % 3 === 0 ? '#D94126' : idx % 3 === 1 ? '#2D6A4F' : '#142952';
              return (
                <circle
                  key={idx}
                  cx={px}
                  cy={py}
                  r={idx % 3 === 0 ? '1.8' : '1.3'}
                  fill={dotColor}
                  opacity="0.9"
                />
              );
            })}

            {/* 2. OSMANLI PADİŞAH TUĞRASI (Sere, Çift Beyze, Üç Tuğ, Zülfeler ve Hançer Kolları) */}
            <g transform="translate(0, -3)">
              {/* Sol Beyze İçi Kanuni İznik Helezon Süslemesi (Firuze & Yaprak Yeşili) */}
              <path
                d="M 96 117 C 81 118, 72 110, 73 101 C 74 93, 84 91, 95 96"
                fill="rgba(28, 163, 156, 0.14)"
                stroke="none"
              />
              <path
                d="M 92 111 C 83 111, 78 106, 79 101 C 80 97, 86 96, 90 100 C 92 102, 89 106, 85 105"
                fill="none"
                stroke="#1CA39C"
                strokeWidth="1.15"
                strokeLinecap="round"
              />
              {/* Beyze İçi Küçük Lale Mercanı ve Yaprak Yeşili Goncalar */}
              <circle cx="84" cy="102" r="1.7" fill="#D94126" />
              <circle cx="77" cy="106" r="1.4" fill="#2D6A4F" />
              <circle cx="85" cy="95" r="1.4" fill="#2D6A4F" />

              {/* DIŞ BEYZE (Sol Dış Kavis) ve ALT HANÇER KOLU (Sağa Uzanan Kaligrafik Kol) - Koyu Kobalt */}
              <path
                d="M 118 122 C 101 129, 68 123, 67 104 C 66 86, 88 82, 109 95 C 124 104, 138 97, 152 89"
                fill="none"
                stroke="#142952"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* İÇ BEYZE (Sol İç Kavis) ve ÜST HANÇER KOLU (Sağa Uzanan Paralel Kol) - Derin Hünkâr Bordosu */}
              <path
                d="M 115 117 C 100 122, 76 117, 75 103 C 74 90, 90 87, 109 98 C 123 106, 136 101, 149 95"
                fill="none"
                stroke="#5C101E"
                strokeWidth="2.0"
                strokeLinecap="round"
              />

              {/* ÜÇ TUĞ (Yukarı Yükselen 3 Elif Sütunu - Sol, Orta, Sağ) - Koyu Kobalt & Hünkâr Bordosu */}
              <path
                d="M 101 114 L 101 70 M 109 115 L 109 66 M 117 114 L 117 70"
                fill="none"
                stroke="#142952"
                strokeWidth="2.35"
                strokeLinecap="round"
              />
              {/* Tuğ Tepelerindeki Kaligrafik Tırnaklar (Serifs) */}
              <path
                d="M 98.5 72.5 L 101 68.5 L 103 71.5 M 106.5 68.5 L 109 64.5 L 111 67.5 M 114.5 72.5 L 117 68.5 L 119 71.5"
                fill="none"
                stroke="#5C101E"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* ÜÇ ZÜLFE (Tuğlardan Sağa Doğru Süzülen S-Biçimli Tuğra Flamaları) - Firuze & Lale Mercanı */}
              <path
                d="M 101 73 C 107 71, 108 78, 104 83 C 101 86, 103 90, 106 91"
                fill="none"
                stroke="#1CA39C"
                strokeWidth="1.55"
                strokeLinecap="round"
              />
              <path
                d="M 109 69 C 115 67, 116 74, 112 79 C 109 82, 111 86, 114 87"
                fill="none"
                stroke="#D94126"
                strokeWidth="1.55"
                strokeLinecap="round"
              />
              <path
                d="M 117 73 C 123 71, 124 78, 120 83 C 117 86, 119 90, 122 91"
                fill="none"
                stroke="#1CA39C"
                strokeWidth="1.55"
                strokeLinecap="round"
              />

              {/* SERE / KÜRSÜ (Tuğranın Alt Merkezindeki Padişah İsmi Kaligrafik Kürsüsü) */}
              <path
                d="M 95 120 C 96 108, 104 102, 112 103 C 120 104, 125 112, 122 121 C 118 127, 102 127, 95 120 Z"
                fill="rgba(92, 16, 30, 0.16)"
                stroke="#5C101E"
                strokeWidth="2.1"
                strokeLinejoin="round"
              />
              {/* Sere İçi Hat Kıvrımları ("El-Muzaffer Daima" İstifi) */}
              <path
                d="M 98 117 C 104 109, 113 109, 120 116 M 101 121 C 107 115, 114 115, 118 121 M 105 107 L 105 123 M 113 107 L 113 123"
                fill="none"
                stroke="#142952"
                strokeWidth="1.45"
                strokeLinecap="round"
              />
              {/* Kaligrafik Hareke ve Tezhip Noktaları */}
              <circle cx="93" cy="88" r="1.4" fill="#D94126" />
              <circle cx="127" cy="88" r="1.4" fill="#2D6A4F" />
              <circle cx="133" cy="105" r="1.5" fill="#1CA39C" />
            </g>

            {/* 3. TUĞRA ALTI İZNİK LALESİ VE YAPRAK YEŞİLİ RUMİ DALI (Alt Göbek Süslemesi) */}
            <g>
              {/* Yaprak Yeşili İki Yana Açılan Sazyolu Yaprakları */}
              <path
                d="M 110 148 C 103 148, 96 143, 94 136 C 99 138, 105 141, 110 145"
                fill="rgba(45, 106, 79, 0.25)"
                stroke="#2D6A4F"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 110 148 C 117 148, 124 143, 126 136 C 121 138, 115 141, 110 145"
                fill="rgba(45, 106, 79, 0.25)"
                stroke="#2D6A4F"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Orta İznik Lalesi (Lale Mercanı & Derin Hünkâr Bordosu) */}
              <path
                d="M 110 146 C 105 142, 104 135, 106 129 C 108 133, 109 135, 110 127 C 111 135, 112 133, 114 129 C 116 135, 115 142, 110 146 Z"
                fill="#D94126"
                stroke="#5C101E"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              {/* İki Yanda Firuze Çini Goncaları */}
              <circle cx="91" cy="133" r="1.7" fill="#1CA39C" />
              <circle cx="129" cy="133" r="1.7" fill="#1CA39C" />
            </g>
          </g>
        ) : (
          /* Fotoğraf Yokken Zarif Horoloji İç Göbek Halkası */
          <circle
            cx="110"
            cy="110"
            r="44"
            fill="none"
            stroke={effectiveInnerRing}
            strokeWidth="0.9"
            strokeOpacity="0.45"
            strokeDasharray="2 3"
          />
        )}

        {/* İnce İç Çerçeve Çemberi */}
        <circle
          cx="110"
          cy="110"
          r="97"
          fill="none"
          stroke={effectiveInnerRing}
          strokeWidth={isOttomanTheme ? '1.4' : '1'}
          strokeOpacity={bezelColor ? '0.55' : '1'}
        />

        {/* 3. Dakika ve Saat Çizgileri (60 Adet İndeks Çentiği) */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isMajor = i % 5 === 0;
          const angleDeg = i * 6;
          return (
            <line
              key={i}
              x1="110"
              y1={isMajor ? '17' : '19'}
              x2="110"
              y2={isMajor ? '25.5' : '23'}
              stroke={isMajor ? effectiveMajorTick : effectiveMinorTick}
              strokeWidth={isMajor ? '2.3' : '1.15'}
              strokeOpacity={!isMajor && tickColor ? '0.75' : '1'}
              strokeLinecap="round"
              transform={`rotate(${angleDeg} 110 110)`}
            />
          );
        })}

        {/* Saat Rakamları (Türkçe, Roma, Arapça veya Özel 12-3-6-9) */}
        {Array.from({ length: 12 }).map((_, index) => {
          const label = getNumeralLabel(index);
          const angleRad = ((index * 30 - 90) * Math.PI) / 180;
          const radius = 76;
          const x = 110 + radius * Math.cos(angleRad);
          const y = 110 + radius * Math.sin(angleRad);

          if (!label) {
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2.2"
                fill={effectiveNumeralFill}
                opacity="0.75"
              />
            );
          }

          const isCardinal = index % 3 === 0;
          const fontSize =
            numeralStyle === 'roman'
              ? isCardinal
                ? '13px'
                : '10.5px'
              : numeralStyle === 'arabic'
              ? isCardinal
                ? '16.5px'
                : '14px'
              : numeralStyle === 'custom12369'
              ? '13.5px'
              : isCardinal
              ? '15px'
              : '12.5px';

          return (
            <text
              key={index}
              x={x}
              y={y}
              fill={effectiveNumeralFill}
              fontSize={fontSize}
              fontWeight={isCardinal ? '800' : '600'}
              fontFamily={
                numeralStyle === 'arabic'
                  ? "'Amiri', serif"
                  : numeralStyle === 'roman'
                  ? "Georgia, 'Times New Roman', serif"
                  : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              }
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                letterSpacing: numeralStyle === 'roman' ? '-0.03em' : '0',
                paintOrder: 'stroke',
                stroke: centerPhotoDataUrl ? 'rgba(0,0,0,0.45)' : 'none',
                strokeWidth: centerPhotoDataUrl ? '2.2px' : '0px'
              }}
            >
              {label}
            </text>
          );
        })}

        {/* LÜKS SAAT KADRAN İÇİ GÜNÜN TARİHİ PENCERESİ (Date Complication - Dinamik Aç/Kapat & 4 Konum) */}
        {showDialDate && (
          <g transform={`translate(${datePos.x - dateBoxW / 2}, ${datePos.y - dateBoxH / 2})`}>
            {/* Tarih Penceresi Dış Metalik/Altın Gölgesi ve Çerçevesi */}
            <rect
              x="0"
              y="0"
              width={dateBoxW}
              height={dateBoxH}
              rx="3.5"
              fill={
                isOttomanIznik
                  ? '#142952'
                  : 'rgba(9, 13, 22, 0.88)'
              }
              stroke={isOttomanIznik ? '#1CA39C' : effectiveOuterRing}
              strokeWidth="1.35"
            />
            {/* İç İnce Parıltı Çizgisi */}
            <rect
              x="1.2"
              y="1.2"
              width={dateBoxW - 2.4}
              height={dateBoxH - 2.4}
              rx="2.5"
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="0.5"
            />
            {/* Günün Tarihi Metni (Örn: 01 EKİ) */}
            <text
              x={dateBoxW / 2}
              y={dateBoxH / 2 + 0.5}
              fill={
                isOttomanTheme
                  ? '#F6EFE2'
                  : uiTheme === 'nordic-alabaster'
                  ? '#f8fafc'
                  : numeralColor || '#f8fafc'
              }
              fontSize="7.8px"
              fontWeight="800"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ letterSpacing: '-0.02em' }}
            >
              {dateBadge.dayNum} {dateBadge.monthShort}
            </text>
          </g>
        )}

        {/* AKREP (Saat İbresi) - Dikdörtgen (Klasik) veya Ok Uçlu */}
        <g transform={`rotate(${hourAngle} 110 110)`}>
          {handStyle === 'arrow' ? (
            <>
              <line
                x1="110"
                y1="118"
                x2="110"
                y2="71"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <polygon
                points="110,60 103,73 110,70 117,73"
                fill="rgba(0,0,0,0.4)"
                transform="translate(0, 1)"
              />
              <line
                x1="110"
                y1="118"
                x2="110"
                y2="71"
                stroke={effectiveHourHand}
                strokeWidth="4.6"
                strokeLinecap="round"
              />
              <polygon
                points="110,60 103.5,72.5 110,69.5 116.5,72.5"
                fill={effectiveHourHand}
              />
            </>
          ) : (
            <>
              <line
                x1="110"
                y1="120"
                x2="110"
                y2="60"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="6.5"
                strokeLinecap="butt"
              />
              <line
                x1="110"
                y1="120"
                x2="110"
                y2="60"
                stroke={effectiveHourHand}
                strokeWidth="5"
                strokeLinecap="butt"
              />
            </>
          )}
        </g>

        {/* YELKOVAN (Dakika İbresi) - Dikdörtgen (Klasik) veya Ok Uçlu (Rakamları Kapatmayan Boyut) */}
        <g transform={`rotate(${minuteAngle} 110 110)`}>
          {handStyle === 'arrow' ? (
            <>
              <line
                x1="110"
                y1="122"
                x2="110"
                y2="55"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="4.4"
                strokeLinecap="round"
              />
              <polygon
                points="110,45 104,57 110,54.5 116,57"
                fill="rgba(0,0,0,0.4)"
                transform="translate(0, 1)"
              />
              <line
                x1="110"
                y1="122"
                x2="110"
                y2="55"
                stroke={effectiveMinuteHand}
                strokeWidth="3.1"
                strokeLinecap="round"
              />
              <polygon
                points="110,45 104.5,56.5 110,54 115.5,56.5"
                fill={effectiveMinuteHand}
              />
            </>
          ) : (
            <>
              <line
                x1="110"
                y1="124"
                x2="110"
                y2="38"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="4.5"
                strokeLinecap="butt"
              />
              <line
                x1="110"
                y1="124"
                x2="110"
                y2="38"
                stroke={effectiveMinuteHand}
                strokeWidth="3.2"
                strokeLinecap="butt"
              />
            </>
          )}
        </g>

        {/* SANİYE İBRESİ (Tik-Tak veya Akar Mod) */}
        <g transform={`rotate(${secondAngle} 110 110)`}>
          <line
            x1="110"
            y1="130"
            x2="110"
            y2="30"
            stroke={basePalette.secondHand}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle
            cx="110"
            cy="46"
            r="2.6"
            fill={basePalette.secondHand}
          />
        </g>

        {/* Merkez Göbek Pimi */}
        <circle
          cx="110"
          cy="110"
          r="5.5"
          fill={bezelColor || basePalette.centerCap}
          stroke={effectiveHourHand}
          strokeWidth="1.5"
        />
        <circle cx="110" cy="110" r="2" fill="#0f172a" />
      </svg>
    </div>
  );
};
