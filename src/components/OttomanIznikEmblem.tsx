import React from 'react';

interface OttomanIznikEmblemProps {
  size?: number;
  className?: string;
}

export const OttomanIznikEmblem: React.FC<OttomanIznikEmblemProps> = ({
  size = 140,
  className = ''
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        viewBox="0 0 220 220"
        className="w-full h-full drop-shadow-md overflow-visible"
        role="img"
        aria-label="Osmanlı Tuğrası ve İznik Çini Motifi"
      >
        <defs>
          <radialGradient id="iznik-emblem-grad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FAF4E6" />
            <stop offset="100%" stopColor="#EADBC0" />
          </radialGradient>
        </defs>

        {/* 1. Dış Çerçeve (Koyu Kobalt) */}
        <circle
          cx="110"
          cy="110"
          r="104"
          fill="url(#iznik-emblem-grad)"
          stroke="#142952"
          strokeWidth="4.5"
        />

        {/* 2. Kesik Çizgili Lale Mercanı Çini Suyu Kuşağı */}
        <circle
          cx="110"
          cy="110"
          r="99.5"
          fill="none"
          stroke="#D94126"
          strokeWidth="1.4"
          strokeDasharray="3.5 2.5"
          strokeOpacity="0.85"
        />

        {/* 3. Dairesel İznik Çini Madalyon Zemin Halkası (Firuze & Koyu Kobalt) */}
        <circle
          cx="110"
          cy="110"
          r="53"
          fill="rgba(28, 163, 156, 0.09)"
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

        {/* 4. Madalyon Çevresinde 12 İznik Çini Penç / Gonca Noktası */}
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
              opacity="0.95"
            />
          );
        })}

        {/* 5. OSMANLI PADİŞAH TUĞRASI */}
        <g transform="translate(0, -3)">
          {/* Sol Beyze İçi Helezon Süslemesi (Firuze & Yaprak Yeşili) */}
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
          {/* Beyze İçi Goncalar */}
          <circle cx="84" cy="102" r="1.7" fill="#D94126" />
          <circle cx="77" cy="106" r="1.4" fill="#2D6A4F" />
          <circle cx="85" cy="95" r="1.4" fill="#2D6A4F" />

          {/* Dış Beyze ve Alt Hançer Kolu - Koyu Kobalt */}
          <path
            d="M 118 122 C 101 129, 68 123, 67 104 C 66 86, 88 82, 109 95 C 124 104, 138 97, 152 89"
            fill="none"
            stroke="#142952"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* İç Beyze ve Üst Hançer Kolu - Derin Hünkâr Bordosu */}
          <path
            d="M 115 117 C 100 122, 76 117, 75 103 C 74 90, 90 87, 109 98 C 123 106, 136 101, 149 95"
            fill="none"
            stroke="#5C101E"
            strokeWidth="2.0"
            strokeLinecap="round"
          />

          {/* Üç Tuğ - Koyu Kobalt & Hünkâr Bordosu */}
          <path
            d="M 101 114 L 101 70 M 109 115 L 109 66 M 117 114 L 117 70"
            fill="none"
            stroke="#142952"
            strokeWidth="2.35"
            strokeLinecap="round"
          />
          {/* Tuğ Tırnakları */}
          <path
            d="M 98.5 72.5 L 101 68.5 L 103 71.5 M 106.5 68.5 L 109 64.5 L 111 67.5 M 114.5 72.5 L 117 68.5 L 119 71.5"
            fill="none"
            stroke="#5C101E"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Zülfeler (Flamalar) - Firuze & Lale Mercanı */}
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

          {/* Sere / Kürsü */}
          <path
            d="M 95 120 C 96 108, 104 102, 112 103 C 120 104, 125 112, 122 121 C 118 127, 102 127, 95 120 Z"
            fill="rgba(92, 16, 30, 0.16)"
            stroke="#5C101E"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          {/* Sere İçi Hat Kıvrımları */}
          <path
            d="M 98 117 C 104 109, 113 109, 120 116 M 101 121 C 107 115, 114 115, 118 121 M 105 107 L 105 123 M 113 107 L 113 123"
            fill="none"
            stroke="#142952"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
          <circle cx="93" cy="88" r="1.4" fill="#D94126" />
          <circle cx="127" cy="88" r="1.4" fill="#2D6A4F" />
          <circle cx="133" cy="105" r="1.5" fill="#1CA39C" />
        </g>

        {/* 6. TUĞRA ALTI İZNİK LALESİ VE YAPRAK YEŞİLİ RÛMÎ DALI */}
        <g>
          {/* Sazyolu Yaprakları */}
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
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Lale İçi İnce Beyaz Işık Çizgisi */}
          <path
            d="M 110 143 L 110 131"
            stroke="#FAF4E6"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};
