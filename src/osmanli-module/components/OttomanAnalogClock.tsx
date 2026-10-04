import React, { useState } from 'react';
import { AlaturkaTime } from '../types';
import { Clock, Moon, Sun, Sparkles, Compass } from 'lucide-react';

interface OttomanAnalogClockProps {
  alaturkaTime: AlaturkaTime;
  alafrangaTimeStr: string;
  sunsetTimeStr: string;
  cityName: string;
}

export const OttomanAnalogClock: React.FC<OttomanAnalogClockProps> = ({
  alaturkaTime,
  alafrangaTimeStr,
  sunsetTimeStr,
  cityName
}) => {
  const [numeralStyle, setNumeralStyle] = useState<'ottoman' | 'latin'>('ottoman');

  // Akrep açısı: 360 derece / 12 saat = 30 derece/saat + dakika payı
  const hourAngle = ((alaturkaTime.hours12 % 12) * 30) + (alaturkaTime.minutes * 0.5);
  // Yelkovan açısı: 360 derece / 60 dakika = 6 derece/dakika
  const minuteAngle = alaturkaTime.minutes * 6 + (alaturkaTime.seconds * 0.1);
  // Saniye açısı: 360 derece / 60 saniye = 6 derece/saniye
  const secondAngle = alaturkaTime.seconds * 6;

  // 12 Saatlik Kadran Rakamları (12 tepede, 1, 2, ... saat yönünde)
  const clockNumbers = [
    { num: 12, ottoman: '١٢', latin: '12', angle: 0 },
    { num: 1, ottoman: '١', latin: '1', angle: 30 },
    { num: 2, ottoman: '٢', latin: '2', angle: 60 },
    { num: 3, ottoman: '٣', latin: '3', angle: 90 },
    { num: 4, ottoman: '٤', latin: '4', angle: 120 },
    { num: 5, ottoman: '٥', latin: '5', angle: 150 },
    { num: 6, ottoman: '٦', latin: '6', angle: 180 },
    { num: 7, ottoman: '٧', latin: '7', angle: 210 },
    { num: 8, ottoman: '٨', latin: '8', angle: 240 },
    { num: 9, ottoman: '٩', latin: '9', angle: 270 },
    { num: 10, ottoman: '١٠', latin: '10', angle: 300 },
    { num: 11, ottoman: '١١', latin: '11', angle: 330 }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#fbf8f1] via-[#f7f2e7] to-[#efe7d3] border-2 border-[#d4af37] shadow-xl text-stone-900 relative overflow-hidden">
      
      {/* Arka Plan Zarif Hat / Selçuklu Yıldızı Tezhib Silüeti */}
      <div className="absolute inset-0 pointer-events-none opacity-4 flex items-center justify-center">
        <svg className="w-[420px] h-[420px] text-[#8c6b1c]" viewBox="0 0 200 200" fill="currentColor">
          <polygon points="100,0 130,70 200,100 130,130 100,200 70,130 0,100 70,70" />
          <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" />
        </svg>
      </div>

      {/* Üst Başlık Şeridi: Muvakkithâne-i Âmire & Kadran Stili Değiştirici */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[#e2d5bc] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8c6b1c] text-amber-100 flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#4a3b19] tracking-tight">
              Saat-i Ezânîye (Alaturka Kadran)
            </h3>
            <p className="text-[10px] text-[#7d6537] font-serif italic">
              {cityName} Ufkuna Göre Gurûbî Nizam
            </p>
          </div>
        </div>

        {/* Rakam Dili Değiştirici (Osmanlıca / Latin) */}
        <div className="flex items-center gap-1 bg-[#efe7d3] p-1 rounded-xl border border-[#d4af37]/60 text-xs">
          <button
            type="button"
            onClick={() => setNumeralStyle('ottoman')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              numeralStyle === 'ottoman'
                ? 'bg-[#8c6b1c] text-white shadow-2xs'
                : 'text-[#6b5424] hover:text-[#4a3b19]'
            }`}
            title="Osmanlı / Doğu Arap Rakamları"
          >
            ١ ٢ ٣ (Osmanlı)
          </button>
          <button
            type="button"
            onClick={() => setNumeralStyle('latin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              numeralStyle === 'latin'
                ? 'bg-[#8c6b1c] text-white shadow-2xs'
                : 'text-[#6b5424] hover:text-[#4a3b19]'
            }`}
            title="Latin Rakamları"
          >
            1 2 3 (Standart)
          </button>
        </div>
      </div>

      {/* ANA ANALOG SAAT KADRANI */}
      <div className="relative my-6 flex items-center justify-center">
        
        {/* Dış Altın Yaldızlı Pirinç Kasa Halkası */}
        <div className="w-68 h-68 sm:w-80 sm:h-80 rounded-full p-2.5 bg-gradient-to-tr from-[#99792b] via-[#d4af37] to-[#73591c] shadow-2xl flex items-center justify-center">
          
          {/* İç Sedef / Fildişi Emaye Zemin */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#fdfbf7] via-[#faf6ec] to-[#f4ecd8] border-2 border-[#b59230] relative flex items-center justify-center shadow-inner overflow-hidden">
            
            {/* Tezhip / Yıldız Çerçevesi İç Çember */}
            <div className="absolute inset-4 rounded-full border border-[#d4af37]/40 pointer-events-none" />
            <div className="absolute inset-7 rounded-full border border-[#d4af37]/20 pointer-events-none" />

            {/* Muvakkithâne Tuğrası / Osmanlıca Başlık */}
            <div className="absolute top-14 flex flex-col items-center pointer-events-none opacity-80">
              <span className="text-[9px] sm:text-[10px] font-serif font-bold text-[#8c6b1c] tracking-widest uppercase">
                Muvakkithâne
              </span>
              <span className="text-[8px] text-[#a0823c] font-arabic mt-0.5">
                ساعت اذانيه
              </span>
            </div>

            {/* Kadran Rakamları (Trigonometrik Dairesel Yerleşim) */}
            {clockNumbers.map((item) => {
              const rad = (item.angle * Math.PI) / 180;
              // Yarıçap (merkeze olan mesafe px cinsinden)
              const r = 104; // sm ekranda 104px
              const x = Math.sin(rad) * r;
              const y = -Math.cos(rad) * r;

              return (
                <div
                  key={item.num}
                  className="absolute flex items-center justify-center select-none"
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                >
                  <span
                    className={`font-black text-[#3d2f10] leading-none ${
                      numeralStyle === 'ottoman'
                        ? 'text-lg sm:text-xl font-serif'
                        : 'text-sm sm:text-base font-serif'
                    }`}
                  >
                    {numeralStyle === 'ottoman' ? item.ottoman : item.latin}
                  </span>
                </div>
              );
            })}

            {/* 60 Dakika Çizgileri */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              return (
                <div
                  key={i}
                  className="absolute w-full h-full pointer-events-none flex justify-center"
                  style={{ transform: `rotate(${i * 6}deg)` }}
                >
                  <div
                    className={`${
                      isMajor
                        ? 'w-0.5 h-2 bg-[#8c6b1c]'
                        : 'w-px h-1 bg-[#d4af37]/60'
                    } mt-1.5`}
                  />
                </div>
              );
            })}

            {/* AKREP (Saat Kolu) */}
            <div
              className="absolute w-full h-full pointer-events-none flex justify-center items-center transition-transform duration-200"
              style={{ transform: `rotate(${hourAngle}deg)` }}
            >
              <div className="w-1.5 sm:w-2 h-18 sm:h-22 bg-gradient-to-t from-[#2d2208] via-[#5c4716] to-[#8c6b1c] rounded-full -translate-y-8 sm:-translate-y-10 shadow-md flex items-start justify-center relative">
                {/* Akrep ucu lale / ok başlığı */}
                <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border border-[#fbf8f1] bg-[#8c6b1c] -mt-1 shadow-xs" />
              </div>
            </div>

            {/* YELKOVAN (Dakika Kolu) */}
            <div
              className="absolute w-full h-full pointer-events-none flex justify-center items-center transition-transform duration-200"
              style={{ transform: `rotate(${minuteAngle}deg)` }}
            >
              <div className="w-1 sm:w-1.5 h-24 sm:h-29 bg-gradient-to-t from-[#2d2208] via-[#6e5318] to-[#99792b] rounded-full -translate-y-11 sm:-translate-y-13 shadow-md flex items-start justify-center relative">
                {/* Yelkovan ucu kılıç motifi */}
                <div className="w-2.5 h-2.5 rounded-full border border-[#fbf8f1] bg-[#b59230] -mt-1 shadow-xs" />
              </div>
            </div>

            {/* SANİYE KOLU (İnce Yakut / Kırmızı Başlıklı Çubuk) */}
            <div
              className="absolute w-full h-full pointer-events-none flex justify-center items-center transition-transform"
              style={{ transform: `rotate(${secondAngle}deg)` }}
            >
              <div className="w-0.5 h-26 sm:h-32 bg-rose-700 -translate-y-10 sm:-translate-y-12 shadow-xs" />
              <div className="w-1.5 h-1.5 rounded-full bg-rose-700 -translate-y-24 sm:-translate-y-28" />
            </div>

            {/* MERKEZ PİMİ (Altın ve Yakut Göbek) */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#5c4716] via-[#d4af37] to-[#99792b] border-2 border-[#fff] shadow-md z-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-800" />
            </div>

            {/* Alt Bilgi: Gece / Gündüz İndikatörü */}
            <div className="absolute bottom-11 flex items-center gap-1 text-[10px] text-[#7d6537] font-semibold">
              {alaturkaTime.period === 'gece' ? (
                <>
                  <Moon className="w-3 h-3 text-[#5c4716]" />
                  <span>Gece Devresi</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-amber-600" />
                  <span>Gündüz Devresi</span>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* DİJİTAL SAAT EŞLEŞTİRME VE DETAYLAR BÖLÜMÜ */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        
        {/* Sol Kutu: Alaturka (Ezânî) Saat */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-[#d4af37]/60 shadow-xs flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c6b1c]">
            Saat-i Ezânîye (Alaturka)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#3d2f10] tabular-nums">
              {alaturkaTime.formatted12Full}
            </span>
            <span className="text-xs font-serif font-bold text-[#8c6b1c]">
              ({alaturkaTime.arabicNumerals})
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5">
            Akşam ezanından (Gurûb) bu yana geçen süre
          </span>
        </div>

        {/* Sağ Kutu: Standart (Alafranga) Saat */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-300 shadow-xs flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Standart Saat (Alafranga)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-stone-800 tabular-nums">
              {alafrangaTimeStr}
            </span>
            <span className="text-xs font-mono font-semibold text-stone-400">
              TRT
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5">
            Günümüz Güneş Saati (Gece 00:00 Esaslı)
          </span>
        </div>

      </div>

      {/* Ayar Noktası Bilgisi: Gurûb Vakti (Saat 12:00 Sıfırlanması) */}
      <div className="w-full mt-3 p-3 rounded-xl bg-[#ede3cc]/70 border border-[#d4af37]/40 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#52411c]">
        <div className="flex items-center gap-1.5 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#8c6b1c]" />
          <span>Bugünkü Gurûb (Akşam Ezanı): <strong>{sunsetTimeStr}</strong></span>
        </div>
        <div className="text-[11px] font-medium text-[#7d6537]">
          {alaturkaTime.timeUntilNextSunsetMin > 0 ? (
            <span>Bir sonraki 12:00 sıfırlanmasına: <strong>{alaturkaTime.timeUntilNextSunsetMin} dk</strong> kaldı</span>
          ) : (
            <span>Saat şu anda sıfırlandı (12:00)</span>
          )}
        </div>
      </div>

    </div>
  );
};
