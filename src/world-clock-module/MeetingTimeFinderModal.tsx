import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock,
  Copy,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  SlidersHorizontal,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { ModuleThemeMode, WorldClockCardConfig, WorldLocationData } from './types';
import {
  WORLD_LOCATIONS_DATA,
  getTimePartsInTimezone,
  searchWorldLocations
} from './worldCitiesData';

interface MeetingTimeFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: WorldClockCardConfig[];
  baseNow: Date;
  themeMode: ModuleThemeMode;
  onAddLocationToMainCards: (loc: WorldLocationData) => void;
  onRemoveCardFromMain: (cardId: string) => void;
}

export type SlotStatus = 'work' | 'partial' | 'night';

export interface CityHourCell {
  hour24: number;
  minutes: number;
  formattedTime: string;
  endFormattedTime: string;
  relativeDay: 'Bugün' | 'Yarın' | 'Dün';
  status: SlotStatus;
}

export interface ColumnOverlapSummary {
  refHour: number;
  refEndHour: number;
  refFormatted: string;
  refIntervalFormatted: string;
  allWork: boolean;
  noNight: boolean;
  workCount: number;
  partialCount: number;
  nightCount: number;
  score: number; // 0..100
  quality: 'perfect' | 'good' | 'poor';
}

function getSingleHourStatus(hour: number, workStart: number, workEnd: number): SlotStatus {
  const isWork =
    workStart <= workEnd
      ? hour >= workStart && hour <= workEnd
      : hour >= workStart || hour <= workEnd;

  if (isWork) return 'work';

  // Gece yarısı / Uyku saatleri: 23:00 - 06:59
  if (hour >= 23 || hour < 7) {
    return 'night';
  }

  // Sabah erken (07:00-08:00) ve akşamüstü/akşam (19:00-22:00) -> Kısmen uygun
  return 'partial';
}

/**
 * Bir şehirde başlangıç saatinden itibaren meetingDuration (1, 2, 3, 4 saat) boyunca
 * tüm saat dilimlerinin genel uygunluk durumunu hesaplar (en kısıtlayıcı saati baz alır).
 */
function getDurationWindowStatus(
  startHour: number,
  durationHours: number,
  workStart: number,
  workEnd: number
): SlotStatus {
  let hasNight = false;
  let hasPartial = false;

  for (let d = 0; d < durationHours; d++) {
    const h = (startHour + d) % 24;
    const st = getSingleHourStatus(h, workStart, workEnd);
    if (st === 'night') hasNight = true;
    else if (st === 'partial') hasPartial = true;
  }

  if (hasNight) return 'night';
  if (hasPartial) return 'partial';
  return 'work';
}

const WORK_PRESETS = [
  { id: 'early', label: 'Erken', subLabel: '08:00 – 17:00', start: 8, end: 17 },
  { id: 'standard', label: 'Standart', subLabel: '09:00 – 18:00', start: 9, end: 18 },
  { id: 'late', label: 'Geç', subLabel: '10:00 – 19:00', start: 10, end: 19 }
] as const;

const DURATION_OPTIONS = [1, 2, 3, 4] as const;

export const MeetingTimeFinderModal: React.FC<MeetingTimeFinderModalProps> = ({
  isOpen,
  onClose,
  cards,
  baseNow,
  themeMode,
  onAddLocationToMainCards,
  onRemoveCardFromMain
}) => {
  // Çalışma saat aralığı (Varsayılan: Standart 09:00 - 18:00)
  const [workStartHour, setWorkStartHour] = useState<number>(9);
  const [workEndHour, setWorkEndHour] = useState<number>(18);

  // Toplantı Süresi (Saat cinsinden: 1, 2, 3 veya 4 saat)
  const [meetingDuration, setMeetingDuration] = useState<number>(1);

  // Referans (Baz) Şehir ID'si (24 saatlik üst sütunların baz alındığı şehir)
  const [referenceCardId, setReferenceCardId] = useState<string>(() => {
    const pinned = cards.find((c) => c.isPinned);
    return pinned ? pinned.id : cards[0]?.id || '';
  });

  // Sayfa içi ülke/şehir ekleme arama kutusu
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  // Kullanıcının tabloda üzerine tıkladığı / seçtiği başlangıç saati sütunu (0..23)
  const [selectedRefHour, setSelectedRefHour] = useState<number | null>(null);
  const [copiedSlotHour, setCopiedSlotHour] = useState<number | null>(null);

  // Eğer referans kart silindiyse ilk karta düş
  const activeRefCard = useMemo(() => {
    return (
      cards.find((c) => c.id === referenceCardId) ||
      cards.find((c) => c.isPinned) ||
      cards[0] ||
      null
    );
  }, [cards, referenceCardId]);

  const refLocation: WorldLocationData = useMemo(() => {
    if (activeRefCard) return activeRefCard.location;
    return WORLD_LOCATIONS_DATA[0];
  }, [activeRefCard]);

  // Referans şehrin şu anki saati
  const refNowParts = useMemo(() => {
    return getTimePartsInTimezone(baseNow, refLocation.timezone, 0);
  }, [baseNow, refLocation]);

  // 24 saatlik matris verisi ve sütun bazlı kesişim (overlap) hesaplaması
  const { matrixRows, columnSummaries, bestSlots } = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const rows = cards.map((card) => {
      const cells: CityHourCell[] = hours.map((refHour) => {
        const offsetMinutes =
          (refHour - refNowParts.hours24) * 60 - refNowParts.minutes;
        const targetParts = getTimePartsInTimezone(
          baseNow,
          card.location.timezone,
          offsetMinutes
        );
        const endParts = getTimePartsInTimezone(
          baseNow,
          card.location.timezone,
          offsetMinutes + meetingDuration * 60
        );

        const status = getSingleHourStatus(
          targetParts.hours24,
          workStartHour,
          workEndHour
        );

        return {
          hour24: targetParts.hours24,
          minutes: targetParts.minutes,
          formattedTime: `${String(targetParts.hours24).padStart(2, '0')}:${String(
            targetParts.minutes
          ).padStart(2, '0')}`,
          endFormattedTime: `${String(endParts.hours24).padStart(2, '0')}:${String(
            endParts.minutes
          ).padStart(2, '0')}`,
          relativeDay: targetParts.relativeDayLabel,
          status
        };
      });

      const currentLocal = getTimePartsInTimezone(
        baseNow,
        card.location.timezone,
        0
      );

      return {
        card,
        location: card.location,
        currentFormatted: currentLocal.formattedTime24,
        hourDiffLabel: currentLocal.hourDiffFromLocal,
        cells
      };
    });

    const summaries: ColumnOverlapSummary[] = hours.map((refHour) => {
      let workCount = 0;
      let partialCount = 0;
      let nightCount = 0;

      rows.forEach((row) => {
        const startCell = row.cells[refHour];
        // Toplantı süresi boyunca (1..4 saat) o şehrin genel durumu
        const windowStatus = getDurationWindowStatus(
          startCell.hour24,
          meetingDuration,
          workStartHour,
          workEndHour
        );
        if (windowStatus === 'work') workCount++;
        else if (windowStatus === 'partial') partialCount++;
        else nightCount++;
      });

      const total = Math.max(1, rows.length);
      const allWork = rows.length > 0 && workCount === rows.length;
      const noNight = rows.length > 0 && nightCount === 0;

      // Puanlama: Mesai = 100p, Kısmen Uygun = 55p, Gece = 0p
      const rawScore =
        ((workCount * 100 + partialCount * 55) / (total * 100)) * 100;
      const score = Math.round(rawScore);

      let quality: 'perfect' | 'good' | 'poor' = 'poor';
      if (allWork) quality = 'perfect';
      else if (noNight) quality = 'good';

      const refEndHour = (refHour + meetingDuration) % 24;
      const refFormatted = `${String(refHour).padStart(2, '0')}:00`;
      const refIntervalFormatted = `${String(refHour).padStart(2, '0')}:00 – ${String(
        refEndHour
      ).padStart(2, '0')}:00`;

      return {
        refHour,
        refEndHour,
        refFormatted,
        refIntervalFormatted,
        allWork,
        noNight,
        workCount,
        partialCount,
        nightCount,
        score,
        quality
      };
    });

    // En verimli toplantı saatlerini sırala
    const sortedBest = [...summaries]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aMid = Math.abs(a.refHour - 13);
        const bMid = Math.abs(b.refHour - 13);
        return aMid - bMid;
      })
      .slice(0, 4);

    return {
      matrixRows: rows,
      columnSummaries: summaries,
      bestSlots: sortedBest
    };
  }, [cards, refNowParts, baseNow, workStartHour, workEndHour, meetingDuration]);

  // Seçili saat yoksa varsayılan olarak en iyi kesişim saatini seç
  const activeSelectedHour = useMemo(() => {
    if (selectedRefHour !== null && selectedRefHour >= 0 && selectedRefHour <= 23) {
      return selectedRefHour;
    }
    return bestSlots[0]?.refHour ?? refNowParts.hours24;
  }, [selectedRefHour, bestSlots, refNowParts.hours24]);

  // Seçili toplantı başlangıç saatinden itibaren kapsanan sütun indeksleri (Toplantı Süresi kadar)
  const selectedHourSet = useMemo(() => {
    const set = new Set<number>();
    for (let d = 0; d < meetingDuration; d++) {
      set.add((activeSelectedHour + d) % 24);
    }
    return set;
  }, [activeSelectedHour, meetingDuration]);

  // Arama sonuçları
  const searchResults = useMemo(() => {
    return searchWorldLocations(citySearchQuery);
  }, [citySearchQuery]);

  if (!isOpen) return null;

  const isLight = themeMode === 'light';

  const handleCopyMeetingSlot = (refHour: number) => {
    const colSummary = columnSummaries[refHour];
    const lines = matrixRows.map((r) => {
      const c = r.cells[refHour];
      const windowStatus = getDurationWindowStatus(
        c.hour24,
        meetingDuration,
        workStartHour,
        workEndHour
      );
      const statusText =
        windowStatus === 'work'
          ? 'Mesai İçi (Uygun)'
          : windowStatus === 'partial'
          ? 'Mesai Dışı / Akşamüstü (Kısmen Uygun)'
          : 'Gece / Uyku (Uygun Değil)';
      return `${r.location.flag} ${r.location.city} (${r.location.country}): ${c.formattedTime} – ${c.endFormattedTime} [${statusText}]`;
    });
    const summaryText = `📅 Ortak Toplantı Zamanı (${refLocation.city} Baz Saatiyle ${
      colSummary?.refIntervalFormatted || ''
    } · ${meetingDuration} Saat)\n${lines.join('\n')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText).catch(() => {});
    }
    setCopiedSlotHour(refHour);
    setTimeout(() => setCopiedSlotHour(null), 2000);
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-5 animate-in fade-in duration-200">
      {/* =======================================================================
          1. SAYFA ÜST BAŞLIĞI VE DÜNYA SAATLERİNE DÖNÜŞ BARI
         ======================================================================= */}
      <div
        className={`rounded-3xl border px-4 py-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#181f2e] border-[#2e3a52] text-[#f8fafc]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2
                className={`text-lg sm:text-xl font-black tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Küresel Toplantı Zamanı Bulucu
              </h2>
              <span
                className={`text-xs font-bold ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                · {cards.length} Ülke / Şehir · {meetingDuration} Saatlik Toplantı
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Tablodaki yıldız (★) ikonuna tıklayarak dilediğiniz ülkeyi baz saat yapabilir, ortak mesai saatlerini anında bulabilirsiniz.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 ${
            isLight
              ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              : 'bg-[#253047] border-[#3d4d6e] text-white hover:bg-[#2f3d59]'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Dünya Saatlerine Dön</span>
        </button>
      </div>

      {/* =======================================================================
          2. KULLANICI AYARLARI PANELİ:
             - MESAİ SAATLERİ (Erken 08-17 / Standart 09-18 / Geç 10-19 + Özel)
             - TOPLANTI SÜRESİ (1 Saat / 2 Saat / 3 Saat / 4 Saat)
             - BAZ SAAT SEÇİMİ & YENİ ÜLKE EKLEME
         ======================================================================= */}
      <div
        className={`rounded-3xl border p-4 sm:p-5 space-y-4 shadow-md ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#181f2e] border-[#2e3a52] text-[#f8fafc]'
        }`}
      >
        {/* Üst Satır: Mesai Saatleri Hazır Seçenekler (Standart / Erken / Geç) & Toplantı Süresi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* A) Mesai Saatleri Seçimi (Erken 08-17 / Standart 09-18 / Geç 10-19) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-extrabold shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
              <span>Mesai Saatleri:</span>
            </div>

            {/* Hızlı Hazır Butonlar: Erken (8-17) / Standart (9-18) / Geç (10-19) */}
            <div
              className={`inline-flex p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-300'
                  : 'bg-[#111622] border-[#2e3a52]'
              }`}
            >
              {WORK_PRESETS.map((preset) => {
                const isActive =
                  workStartHour === preset.start && workEndHour === preset.end;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setWorkStartHour(preset.start);
                      setWorkEndHour(preset.end);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span
                      className={`font-mono text-[11px] ${
                        isActive ? 'text-emerald-100' : 'opacity-75'
                      }`}
                    >
                      ({preset.start}–{preset.end})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manuel Başlangıç – Bitiş Saati Seçiciler */}
            <div className="flex items-center gap-1.5">
              <select
                value={workStartHour}
                onChange={(e) => setWorkStartHour(Number(e.target.value))}
                aria-label="Mesai Başlangıç Saati"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#232d42] border-[#3d4d6e] text-white'
                }`}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>

              <span className="text-xs font-bold opacity-70">–</span>

              <select
                value={workEndHour}
                onChange={(e) => setWorkEndHour(Number(e.target.value))}
                aria-label="Mesai Bitiş Saati"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#232d42] border-[#3d4d6e] text-white'
                }`}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* B) Toplantı Süresi Seçimi (1 Saat, 2 Saat, 3 Saat, 4 Saat) */}
          <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold shrink-0">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Toplantı Süresi:</span>
            </div>

            <div
              className={`inline-flex p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-300'
                  : 'bg-[#111622] border-[#2e3a52]'
              }`}
            >
              {DURATION_OPTIONS.map((dur) => {
                const isSelected = meetingDuration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setMeetingDuration(dur)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {dur} Saat
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alt Satır: Baz Saat Seçimi ve Yeni Ülke/Şehir Ekleme Arama Kutusu */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t items-center ${
            isLight ? 'border-slate-200' : 'border-[#28334a]'
          }`}
        >
          {/* Baz Saat Seçimi */}
          <div className="md:col-span-5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-extrabold whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Baz Saat (Referans):</span>
            </span>
            <select
              value={activeRefCard?.id || ''}
              onChange={(e) => setReferenceCardId(e.target.value)}
              aria-label="Referans Şehir Seçimi"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold truncate cursor-pointer focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-[#232d42] border-[#3d4d6e] text-white'
              }`}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.location.flag} {c.location.city} ({c.location.country})
                </option>
              ))}
            </select>
          </div>

          {/* Yeni Ülke / Şehir Ekleme Arama Kutusu */}
          <div className="md:col-span-7 relative">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
                isLight
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-[#232d42] border-[#3d4d6e]'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-500 shrink-0" />
              <input
                type="text"
                value={citySearchQuery}
                onFocus={() => setIsAddDropdownOpen(true)}
                onChange={(e) => {
                  setCitySearchQuery(e.target.value);
                  setIsAddDropdownOpen(true);
                }}
                placeholder="Tabloya yeni ülke veya şehir ekle (Örn: Berlin, New York, Bakü, Dubai, Seul)..."
                className={`w-full bg-transparent text-xs font-semibold focus:outline-none ${
                  isLight
                    ? 'text-slate-900 placeholder:text-slate-500'
                    : 'text-white placeholder:text-slate-400'
                }`}
              />
              {isAddDropdownOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDropdownOpen(false);
                    setCitySearchQuery('');
                  }}
                  className={`text-xs font-bold cursor-pointer px-2 py-0.5 rounded-md ${
                    isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Kapat
                </button>
              )}
            </div>

            {/* Yeni Ülke/Şehir Açılır Listesi */}
            {isAddDropdownOpen && (
              <div
                className={`absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border shadow-2xl max-h-64 overflow-y-auto p-2 space-y-1 ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-[#1a2234] border-[#3d4d6e] text-white'
                }`}
              >
                {searchResults.slice(0, 15).map((loc) => {
                  const isAlreadyInList = cards.some(
                    (c) => c.location.id === loc.id
                  );
                  const preview = getTimePartsInTimezone(
                    baseNow,
                    loc.timezone,
                    0
                  );
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-colors ${
                        isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{loc.flag}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            {loc.city} · {loc.country}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isLight ? 'text-slate-600' : 'text-slate-300'
                            }`}
                          >
                            {loc.utcOffsetLabel} · Şu an: {preview.formattedTime24}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onAddLocationToMainCards(loc);
                          setCitySearchQuery('');
                          setIsAddDropdownOpen(false);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer shrink-0 ${
                          isAlreadyInList
                            ? isLight
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAlreadyInList ? 'Tekrar Ekle' : 'Listeye Ekle'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================================================================
          3. ORTAK EN VERİMLİ TOPLANTI SAATLERİ & RENK LEJANDI
         ======================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* En Verimli Ortak Saatler Hızlı Seçim Barı */}
        <div
          className={`flex-1 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
            isLight
              ? 'bg-emerald-50/90 border-emerald-300 text-slate-900'
              : 'bg-[#182332] border-emerald-500/40 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black">
                Ortak En Verimli Toplantı Saatleri ({refLocation.flag}{' '}
                {refLocation.city} Baz Saatiyle · {meetingDuration} Saat)
              </div>
              <div
                className={`text-[11px] font-medium ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Önerilen saat aralığına tıklayarak tablo üzerinde tüm ülkelerdeki karşılığını inceleyin:
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {bestSlots.map((slot) => {
              const isSelected = activeSelectedHour === slot.refHour;
              return (
                <button
                  key={slot.refHour}
                  type="button"
                  onClick={() => setSelectedRefHour(slot.refHour)}
                  className={`px-3 py-2 rounded-xl font-mono text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md scale-105'
                      : slot.allWork
                      ? isLight
                        ? 'bg-white text-emerald-900 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                      : isLight
                      ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      : 'bg-[#242f42] text-white border-[#3d4b66] hover:bg-[#2d3a52]'
                  }`}
                >
                  <span>{slot.refIntervalFormatted}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : isLight
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white/10 text-emerald-300'
                    }`}
                  >
                    %{slot.score}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Renk Kodları Açıklaması (Lejand) */}
        <div
          className={`p-4 rounded-2xl border flex items-center gap-4 flex-wrap text-xs font-extrabold shadow-sm ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800'
              : 'bg-[#181f2e] border-[#2e3a52] text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-400 inline-block shadow-xs" />
            <span>
              Mesai İçi ({String(workStartHour).padStart(2, '0')}:00–
              {String(workEndHour).padStart(2, '0')}:00) · Uygun
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#2d3748] border border-amber-400/60 inline-block" />
            <span>Mesai Dışı / Akşamüstü · Kısmen Uygun</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#591c27] border border-rose-400/60 inline-block" />
            <span>Gece / Uyku (23:00–06:00) · Uygun Değil</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          4. 24 SAATLİK MATRİS TABLOSU (GLOBAL ZAMAN IZGARASI)
             - Sol tarafta her ülkenin başında tıklanabilir Yıldız (★) ile Baz Saat seçimi
         ======================================================================= */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-xl ${
          isLight
            ? 'bg-white border-slate-300'
            : 'bg-[#161c28] border-[#2e384d]'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left select-none">
            <thead>
              <tr
                className={
                  isLight
                    ? 'bg-slate-100 border-b border-slate-300'
                    : 'bg-[#1d2536] border-b border-[#2e384d]'
                }
              >
                {/* Sol Sabit Sütun Başlığı: Baz Yıldızı + Ülke / Şehir */}
                <th
                  className={`sticky left-0 z-20 min-w-[240px] max-w-[270px] px-3.5 py-3 text-xs font-extrabold border-r ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-[#1d2536] border-[#2e384d] text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span>Ülke / Şehir (★ = Baz Seç)</span>
                    </span>
                    <span className="text-[10px] font-bold opacity-75">
                      Şu An
                    </span>
                  </div>
                </th>

                {/* 00:00 - 23:00 Sütun Başlıkları */}
                {columnSummaries.map((col) => {
                  const isStartCol = activeSelectedHour === col.refHour;
                  const isInMeetingWindow = selectedHourSet.has(col.refHour);
                  const isCurrentHour = refNowParts.hours24 === col.refHour;

                  return (
                    <th
                      key={col.refHour}
                      onClick={() => setSelectedRefHour(col.refHour)}
                      className={`min-w-[46px] px-1 py-2.5 text-center cursor-pointer transition-colors border-r last:border-r-0 ${
                        isStartCol
                          ? 'bg-emerald-600 text-white'
                          : isInMeetingWindow
                          ? 'bg-emerald-500/85 text-white'
                          : col.allWork
                          ? isLight
                            ? 'bg-emerald-100/90 text-emerald-950 hover:bg-emerald-200'
                            : 'bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900/80'
                          : isLight
                          ? 'hover:bg-slate-200 border-slate-200 text-slate-800'
                          : 'hover:bg-white/10 border-[#283142] text-slate-200'
                      }`}
                      title={`${refLocation.city} saatiyle ${col.refIntervalFormatted} (${meetingDuration} Saat) · Uyum: %${col.score}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        {/* Ortak kesişim rozeti */}
                        <span
                          className={`text-[9px] font-extrabold leading-none px-1 py-0.5 rounded ${
                            isInMeetingWindow
                              ? 'bg-black/25 text-white'
                              : col.allWork
                              ? 'bg-emerald-500 text-slate-950'
                              : col.noNight
                              ? isLight
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-amber-500/25 text-amber-300'
                              : 'opacity-50'
                          }`}
                        >
                          {col.allWork
                            ? '★ TAM'
                            : col.noNight
                            ? 'İYİ'
                            : `%${col.score}`}
                        </span>

                        <span className="font-mono text-xs font-black tabular-nums">
                          {String(col.refHour).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-[9px] opacity-75">
                          :00
                        </span>

                        {isCurrentHour && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mt-0.5" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody
              className={`divide-y ${
                isLight ? 'divide-slate-200' : 'divide-[#283142]'
              }`}
            >
              {matrixRows.map((row) => {
                const isReferenceRow = row.card.id === activeRefCard?.id;

                return (
                  <tr
                    key={row.card.id}
                    className={
                      isLight
                        ? 'hover:bg-slate-50/80'
                        : 'hover:bg-white/[0.02]'
                    }
                  >
                    {/* Satır Başlığı: Sol Başta Baz Seçme Yıldızı + Şehir, Ülke, Anlık Saat ve Silme */}
                    <td
                      className={`sticky left-0 z-10 px-3 py-2.5 border-r transition-colors ${
                        isReferenceRow
                          ? isLight
                            ? 'bg-amber-50/95 border-slate-300'
                            : 'bg-[#1f293d] border-[#2e384d]'
                          : isLight
                          ? 'bg-white border-slate-300'
                          : 'bg-[#181f2c] border-[#2e384d]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Ufak Yıldız Butonu: Tıklayınca direkt bu ülkeyi baz saat yapar */}
                          <button
                            type="button"
                            onClick={() => setReferenceCardId(row.card.id)}
                            title={
                              isReferenceRow
                                ? `${row.location.city} şu anda Baz Saat olarak seçili`
                                : `${row.location.city} (${row.location.country}) şehrini Baz Saat yap`
                            }
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                              isReferenceRow
                                ? isLight
                                  ? 'bg-amber-100 border-amber-400 text-amber-600 shadow-xs'
                                  : 'bg-amber-500/20 border-amber-400/60 text-amber-400 shadow-xs'
                                : isLight
                                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300'
                                : 'bg-[#232d42] border-[#364463] text-slate-400 hover:text-amber-400 hover:border-amber-400/50'
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isReferenceRow ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>

                          <span className="text-xl shrink-0">
                            {row.location.flag}
                          </span>

                          <div className="min-w-0">
                            <div
                              className={`text-xs font-extrabold truncate flex items-center gap-1.5 ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              <span className="truncate">{row.location.city}</span>
                              {isReferenceRow && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold shrink-0 ${
                                    isLight
                                      ? 'bg-amber-200 text-amber-900'
                                      : 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
                                  }`}
                                >
                                  Baz
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-[10px] font-medium truncate ${
                                isLight ? 'text-slate-600' : 'text-slate-300'
                              }`}
                            >
                              {row.location.country} · {row.location.utcOffsetLabel}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-mono text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg border ${
                              isLight
                                ? 'bg-slate-100 border-slate-300 text-slate-900'
                                : 'bg-[#253047] border-[#384766] text-emerald-300'
                            }`}
                          >
                            {row.currentFormatted}
                          </span>

                          {cards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onRemoveCardFromMain(row.card.id)}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isLight
                                  ? 'text-rose-600 hover:bg-rose-100'
                                  : 'text-rose-400 hover:bg-rose-500/20 hover:text-rose-200'
                              }`}
                              title={`${row.location.city} şehrini listeden çıkar`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 24 Saatlik Hücreler */}
                    {row.cells.map((cell, colIdx) => {
                      const isInSelectedMeeting = selectedHourSet.has(colIdx);

                      // Renk Kodları:
                      // 1) Çalışma / Mesai saatleri içi -> Yeşil (Uygun)
                      // 2) Mesai dışı / Akşamüstü -> Koyu bir renk (Kısmen Uygun)
                      // 3) Gece yarısı / Uyku saatleri -> Kırmızımsı bir renk (Uygun Değil)
                      let cellStyle = '';
                      if (cell.status === 'work') {
                        cellStyle = isLight
                          ? 'bg-emerald-600 text-white font-extrabold hover:bg-emerald-700'
                          : 'bg-emerald-600/95 text-white font-extrabold hover:bg-emerald-500';
                      } else if (cell.status === 'partial') {
                        cellStyle = isLight
                          ? 'bg-slate-700 text-white font-bold hover:bg-slate-800'
                          : 'bg-[#263042] text-[#f1f5f9] font-bold hover:bg-[#313e54]';
                      } else {
                        cellStyle = isLight
                          ? 'bg-rose-700 text-white font-semibold hover:bg-rose-800'
                          : 'bg-[#4c1d26] text-rose-100 font-semibold hover:bg-[#612430]';
                      }

                      return (
                        <td
                          key={colIdx}
                          onClick={() => setSelectedRefHour(colIdx)}
                          className={`p-1 text-center cursor-pointer transition-all border-r last:border-r-0 ${
                            isLight ? 'border-slate-300/70' : 'border-[#222a3a]'
                          } ${
                            isInSelectedMeeting
                              ? 'ring-2 ring-inset ring-amber-300 z-10 brightness-110 shadow-inner'
                              : ''
                          } ${cellStyle}`}
                          title={`${row.location.city}: ${cell.formattedTime} (${cell.relativeDay})`}
                        >
                          <div className="flex flex-col items-center justify-center py-1.5">
                            <span className="font-mono text-xs tabular-nums leading-none">
                              {String(cell.hour24).padStart(2, '0')}
                            </span>
                            <span className="text-[9px] opacity-90 leading-none mt-0.5">
                              {cell.minutes > 0
                                ? `:${String(cell.minutes).padStart(2, '0')}`
                                : ':00'}
                            </span>
                            {cell.relativeDay !== 'Bugün' && (
                              <span className="text-[8px] font-extrabold leading-none mt-0.5 px-1 rounded bg-black/35 text-amber-200">
                                {cell.relativeDay === 'Yarın' ? '+1g' : '-1g'}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =======================================================================
          5. SEÇİLİ TOPLANTI SAATİ ÖZETİ (YÜKSEK OKUNABİLİRLİKLİ YENİ TASARIM)
         ======================================================================= */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#181f2e] border-[#2e3a52] text-white'
        }`}
      >
        {/* Üst Başlık ve Kopyala Butonu */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
            isLight ? 'border-slate-200' : 'border-[#2c3850]'
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-sm sm:text-base font-black tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Seçili Toplantı Saati Özeti:
            </span>

            <span className="font-mono text-sm sm:text-base font-black px-3.5 py-1 rounded-xl bg-emerald-600 text-white shadow-xs">
              {refLocation.flag} {refLocation.city}{' '}
              {columnSummaries[activeSelectedHour]?.refIntervalFormatted} (
              {meetingDuration} Saat)
            </span>

            <span
              className={`text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl border ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#233044] border-emerald-500/40 text-emerald-300'
              }`}
            >
              Ortak Uyum Skoru: %{columnSummaries[activeSelectedHour]?.score ?? 0}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleCopyMeetingSlot(activeSelectedHour)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
          >
            {copiedSlotHour === activeSelectedHour ? (
              <>
                <Check className="w-4 h-4" />
                <span>Toplantı Saatleri Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Bu Toplantı Saatini Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* Ülkelerin Seçili Saatteki Kartları (Net Kontrast, Temiz Font ve Arka Plan) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {matrixRows.map((r) => {
            const c = r.cells[activeSelectedHour];
            const windowStatus = getDurationWindowStatus(
              c.hour24,
              meetingDuration,
              workStartHour,
              workEndHour
            );

            let cardStyle = '';
            let badgeStyle = '';
            let statusLabel = '';

            if (windowStatus === 'work') {
              cardStyle = isLight
                ? 'bg-emerald-50 border-emerald-300 text-slate-900'
                : 'bg-[#17332b] border-emerald-500/60 text-white';
              badgeStyle = isLight
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 text-slate-950';
              statusLabel = 'Mesai İçi · Uygun';
            } else if (windowStatus === 'partial') {
              cardStyle = isLight
                ? 'bg-amber-50 border-amber-300 text-slate-900'
                : 'bg-[#252f42] border-amber-400/60 text-white';
              badgeStyle = isLight
                ? 'bg-amber-600 text-white'
                : 'bg-amber-400 text-slate-950';
              statusLabel = 'Mesai Dışı · Kısmen Uygun';
            } else {
              cardStyle = isLight
                ? 'bg-rose-50 border-rose-300 text-slate-900'
                : 'bg-[#3b1922] border-rose-500/60 text-white';
              badgeStyle = isLight
                ? 'bg-rose-600 text-white'
                : 'bg-rose-500 text-white';
              statusLabel = 'Gece / Uyku · Uygun Değil';
            }

            return (
              <div
                key={r.card.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 shadow-xs transition-all ${cardStyle}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl shrink-0">{r.location.flag}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-black truncate">
                        {r.location.city}
                      </div>
                      <div
                        className={`text-xs font-semibold truncate ${
                          isLight ? 'text-slate-600' : 'text-slate-200'
                        }`}
                      >
                        {r.location.country}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ${badgeStyle}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between pt-2 border-t ${
                    isLight ? 'border-black/10' : 'border-white/15'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isLight ? 'text-slate-700' : 'text-slate-200'
                    }`}
                  >
                    Yerel Toplantı Saati:
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black tabular-nums">
                    {c.formattedTime} – {c.endFormattedTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
