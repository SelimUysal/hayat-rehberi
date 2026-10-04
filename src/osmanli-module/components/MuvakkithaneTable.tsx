import React, { useState } from 'react';
import { MuvakkithaneTimeEntry } from '../types';
import { BookOpen, Sparkles, Clock, Sun, Moon, Info, ChevronRight, Check } from 'lucide-react';

interface MuvakkithaneTableProps {
  entries: MuvakkithaneTimeEntry[];
  cityName: string;
}

export const MuvakkithaneTable: React.FC<MuvakkithaneTableProps> = ({
  entries,
  cityName
}) => {
  const [selectedEntry, setSelectedEntry] = useState<MuvakkithaneTimeEntry | null>(null);

  const getCategoryBadge = (cat: MuvakkithaneTimeEntry['category']) => {
    switch (cat) {
      case 'farz':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">Farz Vakti</span>;
      case 'mustahab':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-950 border border-blue-300">Müstehab / Nâfile</span>;
      case 'kerahat':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-950 border border-rose-300">Kerahat Vakti</span>;
      case 'astronomi':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">Şer'i Sınır</span>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-3xl bg-[#fdfbf7] border-2 border-[#d4af37]/60 shadow-lg p-5 sm:p-7 space-y-6 text-stone-900">
      
      {/* Tablo Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5d8be]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8c6b1c] text-amber-100 flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#4a3b19] tracking-tight">
              Tarihi Muvakkithâne Vakit Cetveli
            </h3>
            <p className="text-xs text-[#7d6537]">
              {cityName} Ufkuna Göre Takvim-i Cedîd ve Râgıp Paşa Usûlü Şer'î Vakitler
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4ecd8] text-[#5c4716] text-xs font-bold border border-[#d4af37]/50 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#8c6b1c]" />
          <span>Saat-i Ezânîye & Alafranga Mukayesesi</span>
        </div>
      </div>

      {/* Vakit Cetveli Tablosu */}
      <div className="overflow-x-auto scrollbar-none rounded-2xl border border-[#e5d8be] bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f7f2e7] border-b border-[#e5d8be] text-[11px] font-bold uppercase tracking-wider text-[#6e5318]">
              <th className="py-3 px-3.5 sm:px-4">Vakit & Osmanlıca Adı</th>
              <th className="py-3 px-3.5 sm:px-4">Kategori & Hüküm</th>
              <th className="py-3 px-3.5 sm:px-4 text-center">Standart (Alafranga)</th>
              <th className="py-3 px-3.5 sm:px-4 text-center bg-[#fbf8f1]">Saat-i Ezânîye (Alaturka)</th>
              <th className="py-3 px-3.5 sm:px-4 text-right">Tefekkür & İzah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee4cf] text-xs sm:text-sm">
            {entries.map((entry) => {
              const isCurrent = entry.status === 'current';
              const isSunsetReset = entry.id === 'aksam';

              return (
                <tr
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`transition-colors cursor-pointer group ${
                    isCurrent
                      ? 'bg-amber-50/80 hover:bg-amber-100/70 font-semibold'
                      : isSunsetReset
                      ? 'bg-[#fcf9f2] hover:bg-[#f7f2e7]'
                      : 'hover:bg-[#faf6ec]'
                  }`}
                >
                  {/* 1. Vakit İsmi ve Osmanlıca/Arapça Yazılışı */}
                  <td className="py-3 px-3.5 sm:px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-600 ring-2 ring-emerald-300 animate-pulse'
                            : entry.status === 'past'
                            ? 'bg-stone-300'
                            : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 group-hover:text-[#4a3b19]">
                            {entry.ottomanName}
                          </span>
                          <span className="text-xs text-stone-400">
                            ({entry.name})
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8c6b1c] font-serif font-bold mt-0.5">
                          {entry.arabicName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Kategori Rozeti */}
                  <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                    {getCategoryBadge(entry.category)}
                  </td>

                  {/* 3. Alafranga Saat */}
                  <td className="py-3 px-3.5 sm:px-4 text-center font-mono font-bold text-stone-800 tabular-nums">
                    {entry.alafrangaTime}
                  </td>

                  {/* 4. Alaturka (Ezani) Saat */}
                  <td className="py-3 px-3.5 sm:px-4 text-center bg-[#fbf8f1] group-hover:bg-[#f7f2e7]">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-black text-[#3d2f10] text-sm tabular-nums">
                        {entry.alaturkaTime}
                      </span>
                      <span className="text-[11px] font-serif font-bold text-[#8c6b1c]">
                        ({entry.alaturkaArabic})
                      </span>
                      {isSunsetReset && (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded mt-0.5">
                          Ayar Noktası (12:00)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 5. Açıklama Butonu */}
                  <td className="py-3 px-3.5 sm:px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(entry);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#8c6b1c] hover:text-[#5c4716] group-hover:underline"
                    >
                      <span className="hidden sm:inline">Tafsilât</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Muvakkithâne Notu & Dipnot */}
      <div className="p-4 rounded-2xl bg-[#f7f2e7] border border-[#e2d5bc] text-xs text-[#5c4716] space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-[#4a3b19]">
          <Info className="w-4 h-4 text-[#8c6b1c] shrink-0" />
          <span>Muvakkithâne Usûlü ve Temkinî Emniyet:</span>
        </div>
        <p className="leading-relaxed text-[11.5px] text-[#73591c]">
          Osmanlı camilerinde muvakkitler, usturlap ve rubu tahtasıyla güneş irtifaını ölçerek vakit cetvellerini (Ruznâme) tanzim ederlerdi. 
          Güneş batımıyla birlikte saatler tam 12:00 kabul edilir ve minare kandilleri, iftar topları ve ezanlar bu gurûbî nizamla idare edilirdi.
        </p>
      </div>

      {/* Vakit Tafsilât Modalı (Seçilen Vaktin Derin Fıkhi & Astronomik İzahı) */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl bg-[#fdfbf7] border-2 border-[#d4af37] shadow-2xl p-6 space-y-4 text-stone-900 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5d8be] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c6b1c]">
                  Vakit Tafsilâtı & Şer'î İzahı
                </span>
                <h4 className="text-lg font-bold text-[#3d2f10] mt-0.5">
                  {selectedEntry.ottomanName} ({selectedEntry.name})
                </h4>
                <div className="text-sm font-serif font-bold text-[#8c6b1c]">
                  {selectedEntry.arabicName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-xl bg-[#eee4cf] hover:bg-[#e2d5bc] flex items-center justify-center text-stone-700 font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Saat Mukayese Kutusu */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white border border-[#e5d8be]">
              <div className="text-center">
                <span className="text-[10px] text-stone-500 uppercase block font-bold">Standart (Alafranga)</span>
                <span className="text-xl font-black font-mono text-stone-900 mt-0.5 block">{selectedEntry.alafrangaTime}</span>
              </div>
              <div className="text-center border-l border-[#e5d8be]">
                <span className="text-[10px] text-[#8c6b1c] uppercase block font-bold">Saat-i Ezânîye (Alaturka)</span>
                <span className="text-xl font-black font-mono text-[#3d2f10] mt-0.5 block">{selectedEntry.alaturkaTime}</span>
                <span className="text-xs font-serif text-[#8c6b1c]">({selectedEntry.alaturkaArabic})</span>
              </div>
            </div>

            {/* İzah ve Hikmet Metni */}
            <div className="space-y-2 text-xs leading-relaxed text-[#5c4716]">
              <p className="font-semibold text-stone-800">
                {selectedEntry.meaning}
              </p>
              <p className="text-stone-600 bg-[#f7f2e7] p-3 rounded-xl border border-[#e5d8be]">
                {selectedEntry.detail}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-[#8c6b1c] hover:bg-[#73591c] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
