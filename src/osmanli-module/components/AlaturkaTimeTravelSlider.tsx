import React, { useState } from 'react';
import { alafrangaToAlaturka, alaturkaToAlafranga, minutesToTimeStr, timeStrToMinutes, toOttomanDigits } from '../utils/alaturkaTime';
import { PrayerTimes } from '../../types/prayer';
import { Clock, RotateCcw, ArrowRightLeft, Sparkles, Sun, Moon } from 'lucide-react';

interface AlaturkaTimeTravelSliderProps {
  sunsetTimeStr: string;
  times: PrayerTimes;
  currentNow: Date;
}

export const AlaturkaTimeTravelSlider: React.FC<AlaturkaTimeTravelSliderProps> = ({
  sunsetTimeStr,
  times,
  currentNow
}) => {
  const sunsetMins = timeStrToMinutes(sunsetTimeStr);
  const nowMins = currentNow.getHours() * 60 + currentNow.getMinutes();

  // Slider değeri (0 - 1439 dakika)
  const [sliderMins, setSliderMins] = useState<number>(nowMins);
  const [activeTab, setActiveTab] = useState<'slider' | 'calculator'>('slider');

  // Çevirici Hesaplayıcı State'leri
  const [calcAlafrangaInput, setCalcAlafrangaInput] = useState<string>('12:00');
  const [calcAlaturkaInput, setCalcAlaturkaInput] = useState<string>('06:00');
  const [calcAlaturkaIsDay, setCalcAlaturkaIsDay] = useState<boolean>(true);

  // Slider'daki zamana göre hesaplanan Alaturka zaman
  const currentSliderAlafrangaStr = minutesToTimeStr(sliderMins);
  const currentSliderAlaturkaObj = alafrangaToAlaturka(sliderMins, sunsetMins);

  const prayerKeyPoints = [
    { name: 'İmsak', timeStr: times.imsak, mins: timeStrToMinutes(times.imsak) },
    { name: 'Güneş', timeStr: times.gunes, mins: timeStrToMinutes(times.gunes) },
    { name: 'Öğle', timeStr: times.ogle, mins: timeStrToMinutes(times.ogle) },
    { name: 'İkindi', timeStr: times.ikindi, mins: timeStrToMinutes(times.ikindi) },
    { name: 'Akşam (Gurûb)', timeStr: times.aksam, mins: sunsetMins, highlight: true },
    { name: 'Yatsı', timeStr: times.yatsi, mins: timeStrToMinutes(times.yatsi) }
  ];

  // Hesaplayıcı sonuçları
  const calculatedFromAlafranga = alafrangaToAlaturka(timeStrToMinutes(calcAlafrangaInput), sunsetMins);
  const calculatedFromAlaturka = alaturkaToAlafranga(
    parseInt(calcAlaturkaInput.split(':')[0], 10) || 12,
    parseInt(calcAlaturkaInput.split(':')[1], 10) || 0,
    sunsetMins,
    calcAlaturkaIsDay
  );

  return (
    <div className="rounded-3xl bg-white border-2 border-[#d4af37]/60 shadow-lg p-5 sm:p-7 space-y-6 text-stone-900">
      
      {/* Üst Başlık & Sekmeler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-base font-bold text-[#4a3b19] flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#8c6b1c]" />
            <span>Alaturka ⇄ Alafranga Zaman Dönüştürücü & Seyahat Kaydırıcısı</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Günün herhangi bir saatini anında Alaturka (Ezânî) veya Standart (Alafranga) saate çevirin
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'slider'
                ? 'bg-[#8c6b1c] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            24 Saat Kaydırıcı
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#8c6b1c] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Hızlı Hesaplayıcı
          </button>
        </div>
      </div>

      {/* 1. SEKME: 24 SAAT KAYDIRICI (TIME TRAVEL SLIDER) */}
      {activeTab === 'slider' && (
        <div className="space-y-6">
          
          {/* Canlı Dönüşüm Vitrini */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standart Saat Kutusu */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Standart Saat (Alafranga)
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-stone-900 mt-1 tabular-nums">
                {currentSliderAlafrangaStr}
              </span>
              <span className="text-xs text-stone-400 mt-0.5">
                00:00 gece yarısı esaslı
              </span>
            </div>

            {/* Alaturka Saat Kutusu */}
            <div className="p-4 rounded-2xl bg-[#fdfbf7] border-2 border-[#d4af37] flex flex-col items-center justify-center text-center shadow-xs">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8c6b1c]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6b1c]">
                  Osmanlı Ezânî Saat (Alaturka)
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#3d2f10] tabular-nums">
                  {currentSliderAlaturkaObj.formatted}
                </span>
                <span className="text-base font-serif font-bold text-[#8c6b1c]">
                  ({currentSliderAlaturkaObj.arabicFormatted})
                </span>
              </div>
              <span className="text-xs text-[#7d6537] mt-0.5">
                Akşam batımı (Gurûb: {sunsetTimeStr}) tam 12:00 kabul edilir
              </span>
            </div>
          </div>

          {/* İnteraktif Kaydırıcı Çubuğu */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600">
              <span>00:00 (Geceyarısı)</span>
              <button
                type="button"
                onClick={() => setSliderMins(nowMins)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#efe7d3] text-stone-700 hover:text-[#4a3b19] border border-stone-200 transition-colors text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Şu Anki Saate Dön</span>
              </button>
              <span>23:59</span>
            </div>

            <div className="relative pt-1 pb-1">
              <input
                type="range"
                min="0"
                max="1439"
                step="1"
                value={sliderMins}
                onChange={(e) => setSliderMins(parseInt(e.target.value, 10))}
                className="w-full h-3 bg-gradient-to-r from-slate-900 via-amber-200 to-slate-900 rounded-lg appearance-none cursor-pointer accent-[#8c6b1c]"
              />
            </div>

            {/* Vakitlerin Kaydırıcı Üzerindeki İşaretleri */}
            <div className="flex items-center justify-between flex-wrap gap-1.5 pt-2 border-t border-stone-100">
              {prayerKeyPoints.map((point) => (
                <button
                  key={point.name}
                  type="button"
                  onClick={() => setSliderMins(point.mins)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    point.highlight
                      ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                  title={`${point.name}: ${point.timeStr}`}
                >
                  <span className="block text-[10px] opacity-75">{point.name}</span>
                  <span className="font-mono text-xs">{point.timeStr}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. SEKME: HIZLI ÇİFT YÖNLÜ HESAPLAYICI (CALCULATOR) */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Sol Kolon: Alafranga'dan Alaturka'ya */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Standart (Alafranga) Saat Girin:
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                value={calcAlafrangaInput}
                onChange={(e) => setCalcAlafrangaInput(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-base font-bold bg-white text-stone-900 shadow-2xs focus:border-[#8c6b1c] focus:outline-hidden"
              />
              <span className="text-xs text-stone-500">
                (Örn: Öğle ezanı 12:45)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fdfbf7] border border-[#d4af37] text-center">
              <span className="text-[10px] font-bold text-[#8c6b1c] uppercase block">
                Alaturka Karşılığı:
              </span>
              <div className="text-2xl font-black font-mono text-[#3d2f10] mt-0.5">
                {calculatedFromAlafranga.formatted}{' '}
                <span className="text-sm font-serif text-[#8c6b1c]">
                  ({calculatedFromAlafranga.arabicFormatted})
                </span>
              </div>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                (Güneş batımına göre {calculatedFromAlafranga.hours24} saat sonra)
              </span>
            </div>
          </div>

          {/* Sağ Kolon: Alaturka'dan Alafranga'ya */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#8c6b1c]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Alaturka (Ezânî) Saat Girin:
              </h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={calcAlaturkaInput}
                  onChange={(e) => setCalcAlaturkaInput(e.target.value)}
                  placeholder="06:00"
                  className="w-28 px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-base font-bold bg-white text-stone-900 shadow-2xs focus:border-[#8c6b1c] focus:outline-hidden text-center"
                />
                
                {/* Devre Seçimi: Gece mi Gündüz mü? */}
                <div className="flex items-center gap-1 bg-stone-200 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCalcAlaturkaIsDay(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      !calcAlaturkaIsDay ? 'bg-slate-900 text-white' : 'text-stone-600'
                    }`}
                  >
                    Gece Devresi
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcAlaturkaIsDay(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      calcAlaturkaIsDay ? 'bg-[#8c6b1c] text-white' : 'text-stone-600'
                    }`}
                  >
                    Gündüz Devresi
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-300 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">
                Standart (Alafranga) Karşılığı:
              </span>
              <div className="text-2xl font-black font-mono text-stone-900 mt-0.5">
                {calculatedFromAlaturka.formatted}
              </div>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                (Bugünkü Gurûb {sunsetTimeStr} üzerinden hesaplandı)
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
