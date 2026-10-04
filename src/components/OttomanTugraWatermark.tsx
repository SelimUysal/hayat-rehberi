import React from 'react';

interface OttomanTugraWatermarkProps {
  className?: string;
}

export const OttomanTugraWatermark: React.FC<OttomanTugraWatermarkProps> = ({
  className = 'w-full h-full'
}) => {
  return (
    <svg
      viewBox="60 55 105 100"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="Osmanlı Tuğrası Filigranı"
    >
      <g>
        {/* Tuğra Sol Beyze Helezon Kıvrımları */}
        <path
          d="M 96 117 C 81 118, 72 110, 73 101 C 74 93, 84 91, 95 96"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 92 111 C 83 111, 78 106, 79 101 C 80 97, 86 96, 90 100 C 92 102, 89 106, 85 105"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* DIŞ BEYZE ve ALT HANÇER KOLU */}
        <path
          d="M 118 122 C 101 129, 68 123, 67 104 C 66 86, 88 82, 109 95 C 124 104, 138 97, 152 89"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* İÇ BEYZE ve ÜST HANÇER KOLU */}
        <path
          d="M 115 117 C 100 122, 76 117, 75 103 C 74 90, 90 87, 109 98 C 123 106, 136 101, 149 95"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* ÜÇ TUĞ (Sol, Orta, Sağ Elif Sütunları) */}
        <path
          d="M 101 114 L 101 70 M 109 115 L 109 66 M 117 114 L 117 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Tuğ Tepe Tırnakları */}
        <path
          d="M 98.5 72.5 L 101 68.5 L 103 71.5 M 106.5 68.5 L 109 64.5 L 111 67.5 M 114.5 72.5 L 117 68.5 L 119 71.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ÜÇ ZÜLFE (Tuğra Flamaları) */}
        <path
          d="M 101 73 C 107 71, 108 78, 104 83 C 101 86, 103 90, 106 91"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 109 69 C 115 67, 116 74, 112 79 C 109 82, 111 86, 114 87"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 117 73 C 123 71, 124 78, 120 83 C 117 86, 119 90, 122 91"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* SERE / KÜRSÜ */}
        <path
          d="M 95 120 C 96 108, 104 102, 112 103 C 120 104, 125 112, 122 121 C 118 127, 102 127, 95 120 Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M 98 117 C 104 109, 113 109, 120 116 M 101 121 C 107 115, 114 115, 118 121 M 105 107 L 105 123 M 113 107 L 113 123"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Lale & Yaprak Süslemesi */}
        <path
          d="M 110 148 C 103 148, 96 143, 94 136 C 99 138, 105 141, 110 145"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 110 148 C 117 148, 124 143, 126 136 C 121 138, 115 141, 110 145"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 110 146 C 105 142, 104 135, 106 129 C 108 133, 109 135, 110 127 C 111 135, 112 133, 114 129 C 116 135, 115 142, 110 146 Z"
          fill="currentColor"
          fillOpacity="0.4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
};
