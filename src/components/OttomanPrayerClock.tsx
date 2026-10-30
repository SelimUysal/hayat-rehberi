import React, { useEffect, useState } from 'react';
import { zoneNowDate } from '../utils/locationTimezone';
import { Clock } from 'lucide-react';

interface OttomanPrayerClockProps {
  prayerName: string;
  prayerTimeStr: string;
  now: Date;
  timezoneId?: string;
  sizePx?: number;
  isNextPrayer?: boolean;
}

const NUMERALS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const ARABIC_NUMERALS = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];

export const OttomanPrayerClock: React.FC<OttomanPrayerClockProps> = ({
  prayerName,
  prayerTimeStr,
  now,
  timezoneId,
  sizePx = 240,
  isNextPrayer = false
}) => {
  const [mode, setMode] = useState<'prayer' | 'live'>('prayer');
  const [liveClockNow, setLiveClockNow] = useState<Date>(() => now);

  // Tick independently on mobile and re-sync when the page returns to foreground.
  useEffect(() => {
    if (mode !== 'live') return;
    const refresh = () => setLiveClockNow(timezoneId ? zoneNowDate(timezoneId) : new Date());
    refresh();
    const timer = window.setInterval(refresh, 1000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [mode, timezoneId]);

  // Vakit Saati (Akrep ve Yelkovan için)
  const [pHour, pMin] = (prayerTimeStr || '12:00').split(':').map(Number);
  const prayerHourAngle = ((pHour % 12) + (pMin || 0) / 60) * 30;
  const prayerMinAngle = (pMin || 0) * 6;

  // Canlı Saat
  const liveHours = liveClockNow.getHours();
  const liveMinutes = liveClockNow.getMinutes();
  const liveSeconds = liveClockNow.getSeconds();
  const liveHourAngle = ((liveHours % 12) + liveMinutes / 60) * 30;
  const liveMinAngle = (liveMinutes + liveSeconds / 60) * 6;
  const liveSecAngle = liveSeconds * 6;

  const currentHourAngle = mode === 'prayer' ? prayerHourAngle : liveHourAngle;
  const currentMinAngle = mode === 'prayer' ? prayerMinAngle : liveMinAngle;
  const showSecondHand = mode === 'live';

  return (
    <div className="flex flex-col items-center gap-2.5 select-none w-full max-w-full">
      {/* Analog Saat Kadranı */}
      <button
        type="button"
        aria-pressed={mode === 'live'}
        aria-label={mode === 'prayer' ? 'Canlı saati göster' : 'Sıradaki namaz saatini göster'}
        className="relative cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-102 active:scale-98 mx-auto touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600"
        style={{ width: `${sizePx}px`, height: `${sizePx}px`, maxWidth: '100%', aspectRatio: '1 / 1', touchAction: 'manipulation' }}
        onClick={() => setMode(m => m === 'prayer' ? 'live' : 'prayer')}
        title={
          mode === 'prayer'
            ? `${isNextPrayer ? 'Sıradaki vakit saati' : 'Vakit saati'} gösteriliyor. Canlı saate geçmek için tıklayın.`
            : 'Canlı saat gösteriliyor. Vakit saatine geçmek için tıklayın.'
        }
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md overflow-visible"
          role="img"
          aria-label="Osmanlı Vakit Saati Kadranı"
        >
          <defs>
            <radialGradient id="ottoman-clock-dial-grad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#FAF4E6" />
              <stop offset="100%" stopColor="#EADBC0" />
            </radialGradient>
          </defs>

          {/* Dış Bezel Çerçevesi (Koyu Kobalt) */}
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="url(#ottoman-clock-dial-grad)"
            stroke="#142952"
            strokeWidth="4"
          />

          {/* Çift Katmanlı Kesik Çizgili Çini Kuşağı (Lale Mercanı) */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="#D94126"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            strokeOpacity="0.8"
          />

          {/* Kadran İçi İnce Çerçeve (Firuze) */}
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="#1CA39C"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />

          {/* 60 Dakika / Saniye Çentikleri */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHourTick = i % 5 === 0;
            const angle = (i * 6 * Math.PI) / 180;
            const rOuter = 89;
            const rInner = isHourTick ? 81 : 85;
            const x1 = 100 + rOuter * Math.sin(angle);
            const y1 = 100 - rOuter * Math.cos(angle);
            const x2 = 100 + rInner * Math.sin(angle);
            const y2 = 100 - rInner * Math.cos(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHourTick ? '#5C101E' : '#2D6A4F'}
                strokeWidth={isHourTick ? 2.2 : 0.9}
                strokeLinecap="round"
                opacity={isHourTick ? 0.9 : 0.45}
              />
            );
          })}

          {/* Kadran İçi Hafif Tuğra & Çini Şemse Filigranı */}
          <g opacity="0.13" transform="translate(45, 45) scale(0.55)">
            {/* Dış Beyze */}
            <path
              d="M 118 122 C 101 129, 68 123, 67 104 C 66 86, 88 82, 109 95 C 124 104, 138 97, 152 89"
              fill="none"
              stroke="#142952"
              strokeWidth="3.5"
            />
            {/* İç Beyze */}
            <path
              d="M 115 117 C 100 122, 76 117, 75 103 C 74 90, 90 87, 109 98 C 123 106, 136 101, 149 95"
              fill="none"
              stroke="#5C101E"
              strokeWidth="2.8"
            />
            {/* Tuğlar */}
            <path
              d="M 101 114 L 101 70 M 109 115 L 109 66 M 117 114 L 117 70"
              fill="none"
              stroke="#142952"
              strokeWidth="3"
            />
            {/* Sere */}
            <path
              d="M 95 120 C 96 108, 104 102, 112 103 C 120 104, 125 112, 122 121 C 118 127, 102 127, 95 120 Z"
              fill="#5C101E"
            />
          </g>

          {/* 12 Saat Rakamları (Osmanlı Koyu Kobalt Rakamlar) */}
          {NUMERALS.map((num, idx) => {
            const angle = ((idx * 30) * Math.PI) / 180;
            const rNum = 68;
            const nx = 100 + rNum * Math.sin(angle);
            const ny = 100 - rNum * Math.cos(angle);

            return (
              <text
                key={num}
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#142952"
                fontSize="12.5"
                fontWeight="900"
                fontFamily="Georgia, serif"
              >
                {num}
              </text>
            );
          })}

          {/* AKREP (Saat İbresi - Derin Hünkâr Bordosu) */}
          <g transform={`rotate(${currentHourAngle} 100 100)`}>
            {/* Gövde ve Klasik Damla/Armut Başlık */}
            <path
              d="M 98 108 L 98.5 60 C 96 57, 96 52, 100 46 C 104 52, 104 57, 101.5 60 L 102 108 Z"
              fill="#5C101E"
              stroke="#FAF4E6"
              strokeWidth="0.6"
            />
            {/* Akrep İçi Damla Boşluğu */}
            <circle cx="100" cy="54" r="2.2" fill="#FAF4E6" />
          </g>

          {/* YELKOVAN (Dakika İbresi - Koyu Kobalt) */}
          <g transform={`rotate(${currentMinAngle} 100 100)`}>
            {/* İnce Uzun Mızrak Gövde */}
            <path
              d="M 98.5 110 L 99 35 C 97.5 32, 97.5 28, 100 22 C 102.5 28, 102.5 32, 101 35 L 101.5 110 Z"
              fill="#142952"
              stroke="#FAF4E6"
              strokeWidth="0.6"
            />
            {/* Yelkovan İçi İnce Çizgi */}
            <line x1="100" y1="36" x2="100" y2="80" stroke="#FAF4E6" strokeWidth="0.8" opacity="0.8" />
          </g>

          {/* SANİYE İBRESİ (Canlı modda ise Lale Mercanı) */}
          {showSecondHand && (
            <g transform={`rotate(${liveSecAngle} 100 100)`}>
              <line x1="100" y1="115" x2="100" y2="20" stroke="#D94126" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="100" cy="115" r="2.5" fill="#D94126" />
            </g>
          )}

          {/* ORTA GÖBEK (Firuze / Turkuaz Başlık) */}
          <circle cx="100" cy="100" r="5" fill="#1CA39C" stroke="#142952" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="2" fill="#FAF4E6" />
        </svg>
      </button>

      {/* Alt Bilgi Rozeti: Vakit Saati ve Canlı Saat Seçeneği */}
      <div className="text-center space-y-1 pt-0.5">
        <button
          type="button"
          onClick={() => setMode(m => m === 'prayer' ? 'live' : 'prayer')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142952] hover:bg-[#1c3870] text-white text-[11px] sm:text-xs font-serif font-bold transition shadow-2xs border border-[#1CA39C] cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-[#1CA39C]" />
          <span>
            {mode === 'prayer'
              ? `${isNextPrayer ? 'Sıradaki Vakit' : 'Vakit'}: ${prayerName} (${prayerTimeStr})`
              : `Canlı Saat: ${liveClockNow.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </span>
        </button>
        <div className="text-[10px] text-[#5C101E] font-serif font-semibold">
          {mode === 'prayer'
            ? `${isNextPrayer ? 'Akrep & yelkovan sıradaki vakti gösteriyor' : 'Vakit saatini gösteriyor'}`
            : 'Canlı saat akışı'}
        </div>
      </div>
    </div>
  );
};
