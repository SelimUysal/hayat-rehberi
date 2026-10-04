import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertCircle,
  CheckCircle2,
  X,
  Hourglass,
  FileText,
  RotateCcw
} from 'lucide-react';
import {
  SpecialGoalItem,
  loadSpecialGoalsFromStorage,
  saveSpecialGoalsToStorage,
  calculateGoalCountdown,
  parseLocalDateTimeToTimestamp,
  getNearestSpecialGoal,
  SPECIAL_GOALS_UPDATED_EVENT
} from '../utils/specialGoalsStorage';

interface SpecialGoalsAndCountdownProps {
  systemNow?: Date;
}

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
];

const TURKISH_WEEKDAYS_SHORT = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

const QUICK_GOAL_SUGGESTIONS = [
  { title: 'Sınav', desc: 'Sınav günü ve saati için hazırlık hedefi' },
  { title: 'Önemli Bir Buluşma', desc: 'Toplantı veya aile/dost buluşması' },
  { title: 'Proje Teslimi', desc: 'Son teslim tarihi ve saat hatırlatıcısı' },
  { title: 'Hatim & İbadet Hedefi', desc: 'Manevi çalışma ve tamamlanma vakti' },
  { title: 'Uçuş / Seyahat', desc: 'Yolculuk hareket saati' },
  { title: 'Önemli Randevu', desc: 'Resmi işlem veya sağlık randevusu' }
];

const QUICK_TIME_PRESETS = ['08:00', '09:00', '10:00', '12:00', '14:00', '17:00', '20:00', '23:59'];

function formatDateToYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatReadableTurkishDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate();
  const month = TURKISH_MONTHS[d.getMonth()] || '';
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString('tr-TR', { weekday: 'long' });
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${weekday} · Saat ${hours}:${mins}`;
}

export const SpecialGoalsAndCountdown: React.FC<SpecialGoalsAndCountdownProps> = ({
  systemNow
}) => {
  // Canlı Sistem Saati ("Canlı Saat Rozeti" ile tam senkronize)
  const [internalNow, setInternalNow] = useState<Date>(() => systemNow || new Date());
  const now = systemNow || internalNow;

  useEffect(() => {
    if (systemNow) return;
    const timer = setInterval(() => {
      setInternalNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [systemNow]);

  // Hedef Listesi (LocalStorage'dan yüklenir ve 5 günü aşanlar otomatik temizlenir)
  const [goals, setGoals] = useState<SpecialGoalItem[]>(() =>
    loadSpecialGoalsFromStorage((systemNow || new Date()).getTime())
  );

  // Periyodik olarak ve sekme odaklandığında 5 günü aşmış hedefleri otomatik temizle
  useEffect(() => {
    const syncAndPurge = () => {
      const updated = loadSpecialGoalsFromStorage(Date.now());
      setGoals(updated);
    };

    const cleanupInterval = setInterval(syncAndPurge, 15000);
    window.addEventListener(SPECIAL_GOALS_UPDATED_EVENT, syncAndPurge);
    window.addEventListener('storage', syncAndPurge);

    return () => {
      clearInterval(cleanupInterval);
      window.removeEventListener(SPECIAL_GOALS_UPDATED_EVENT, syncAndPurge);
      window.removeEventListener('storage', syncAndPurge);
    };
  }, []);

  // Yeni Hedef / Düzenleme Formu Durumları
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');

  // Varsayılan tarih: Yarın, Saat: 09:00
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToYYYYMMDD(tomorrow);
  });
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  // Görsel Takvim Ay / Yıl Gezintisi
  const [calendarViewYear, setCalendarViewYear] = useState<number>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getFullYear();
  });
  const [calendarViewMonth, setCalendarViewMonth] = useState<number>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getMonth(); // 0..11
  });

  const [formFeedback, setFormFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'expired'>('all');

  const selectedTimeStr = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

  // Seçilen tarih değiştiğinde takvim görünümünü o aya hizala
  const handleSelectDateString = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const [y, m] = dateStr.split('-').map((n) => parseInt(n, 10));
    if (!isNaN(y) && !isNaN(m)) {
      setCalendarViewYear(y);
      setCalendarViewMonth(m - 1);
    }
  };

  // Hızlı Tarih Kısayolu Uygula
  const handleApplyQuickDateOffset = (daysToAdd: number, monthsToAdd = 0) => {
    const target = new Date(now);
    if (daysToAdd !== 0) {
      target.setDate(target.getDate() + daysToAdd);
    }
    if (monthsToAdd !== 0) {
      target.setMonth(target.getMonth() + monthsToAdd);
    }
    handleSelectDateString(formatDateToYYYYMMDD(target));
  };

  // Görsel Takvim Gün Hücrelerini Oluştur
  const calendarDaysGrid = useMemo(() => {
    const firstDayOfMonth = new Date(calendarViewYear, calendarViewMonth, 1);
    // Pazartesi = 0 ... Pazar = 6
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateStr: string }> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ day: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr: ds });
    }
    return cells;
  }, [calendarViewYear, calendarViewMonth]);

  // Formdaki hedef tarihin canlı önizleme geri sayımı
  const liveFormPreview = useMemo(() => {
    const ts = parseLocalDateTimeToTimestamp(selectedDateStr, selectedTimeStr);
    if (isNaN(ts)) return null;
    const tempGoal: SpecialGoalItem = {
      id: 'preview',
      title: titleInput.trim() || 'Yeni Hedef',
      description: descInput.trim(),
      targetISO: `${selectedDateStr}T${selectedTimeStr}`,
      targetTimestamp: ts,
      createdAt: now.getTime()
    };
    return calculateGoalCountdown(tempGoal, now);
  }, [selectedDateStr, selectedTimeStr, titleInput, descInput, now]);

  // Hedef Ekle veya Güncelle
  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle) {
      setFormFeedback({
        type: 'error',
        message: 'Lütfen hedefiniz için bir başlık giriniz (Örn: Sınav, Önemli Bir Buluşma, Proje Teslimi).'
      });
      return;
    }

    const targetTimestamp = parseLocalDateTimeToTimestamp(selectedDateStr, selectedTimeStr);
    if (isNaN(targetTimestamp)) {
      setFormFeedback({
        type: 'error',
        message: 'Lütfen geçerli bir hedef tarih ve saat seçiniz.'
      });
      return;
    }

    // 5 günü geçmiş bir geçmiş tarih girilmesini engelle
    if (now.getTime() - targetTimestamp >= 5 * 24 * 60 * 60 * 1000) {
      setFormFeedback({
        type: 'error',
        message: 'Seçilen tarih 5 günden daha eski olduğu için otomatik silinme sınırındadır. Lütfen ileri bir tarih seçiniz.'
      });
      return;
    }

    const currentList = loadSpecialGoalsFromStorage(now.getTime());

    if (editingGoalId) {
      const updatedList = currentList.map((g) =>
        g.id === editingGoalId
          ? {
              ...g,
              title: trimmedTitle,
              description: descInput.trim(),
              targetISO: `${selectedDateStr}T${selectedTimeStr}`,
              targetTimestamp
            }
          : g
      );
      const saved = saveSpecialGoalsToStorage(updatedList, now.getTime());
      setGoals(saved);
      setEditingGoalId(null);
      setFormFeedback({
        type: 'success',
        message: `"${trimmedTitle}" hedefi güncellendi ve geri sayım senkronize edildi.`
      });
    } else {
      const newGoal: SpecialGoalItem = {
        id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: trimmedTitle,
        description: descInput.trim(),
        targetISO: `${selectedDateStr}T${selectedTimeStr}`,
        targetTimestamp,
        createdAt: now.getTime()
      };
      const saved = saveSpecialGoalsToStorage([...currentList, newGoal], now.getTime());
      setGoals(saved);
      setFormFeedback({
        type: 'success',
        message: `"${trimmedTitle}" hedefi cihaz hafızasına kaydedildi.`
      });
    }

    setTitleInput('');
    setDescInput('');
    setTimeout(() => setFormFeedback(null), 4000);
  };

  // Hedef Düzenleme Moduna Geç
  const handleStartEdit = (goal: SpecialGoalItem) => {
    setEditingGoalId(goal.id);
    setTitleInput(goal.title);
    setDescInput(goal.description || '');
    const d = new Date(goal.targetTimestamp);
    const ds = formatDateToYYYYMMDD(d);
    handleSelectDateString(ds);
    setSelectedHour(d.getHours());
    setSelectedMinute(d.getMinutes());
    setFormFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setTitleInput('');
    setDescInput('');
    setFormFeedback(null);
  };

  // Hedef Silme
  const handleDeleteGoal = (id: string) => {
    const currentList = loadSpecialGoalsFromStorage(now.getTime());
    const filtered = currentList.filter((g) => g.id !== id);
    const saved = saveSpecialGoalsToStorage(filtered, now.getTime());
    setGoals(saved);
    if (editingGoalId === id) {
      handleCancelEdit();
    }
  };

  // En yakın hedef (Sağ üst sistem saati yanında gösterilen hedef)
  const nearestGoal = useMemo(
    () => getNearestSpecialGoal(goals, now.getTime()),
    [goals, now]
  );

  const activeGoalsCount = useMemo(
    () => goals.filter((g) => g.targetTimestamp > now.getTime()).length,
    [goals, now]
  );

  const expiredInRetentionCount = useMemo(
    () => goals.filter((g) => g.targetTimestamp <= now.getTime()).length,
    [goals, now]
  );

  const filteredGoals = useMemo(() => {
    const nowMs = now.getTime();
    if (filterMode === 'active') {
      return goals.filter((g) => g.targetTimestamp > nowMs);
    }
    if (filterMode === 'expired') {
      return goals.filter((g) => g.targetTimestamp <= nowMs);
    }
    return goals;
  }, [goals, filterMode, now]);

  const todayStr = formatDateToYYYYMMDD(now);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6">
      {/* 1. ÜST BAŞLIK */}
      <div className="border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
                <Target className="w-5 h-5" />
              </span>
              <span>Özel Hedefler & Geri Sayım</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              · Yerel Hafıza & 5 Gün Otomatik Saklama
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Sınav, önemli buluşma, proje teslimi veya özel günleriniz için tarih ve saat belirleyin; geri sayım anlık sistem saatine göre otomatik hesaplansın.
          </p>
        </div>
      </div>

      {/* 2. ANA İÇERİK İKİ SÜTUNLU YAPI: SOL (KOLAY TARİH/SAAT SEÇİCİ FORM) & SAĞ (HEDEF LİSTESİ VE CANLI SAYAÇLAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL PANEL: YENİ HEDEF EKLEME & MODERN TARİH/ZAMAN SEÇİCİ (5 Sütun) */}
        <form
          onSubmit={handleSubmitGoal}
          className="lg:col-span-5 bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              {editingGoalId ? (
                <>
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span>Hedefi Düzenle</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Yeni Özel Hedef Ekle</span>
                </>
              )}
            </h3>
            {editingGoalId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
            )}
          </div>

          {/* A. Hızlı Başlık Önerileri + Başlık ve Açıklama Girişi */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                1. Hedef Başlığı ve Kısa Açıklama
              </label>

              {/* Hızlı Hazır Şablon Butonları */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {QUICK_GOAL_SUGGESTIONS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setTitleInput(item.title);
                      if (!descInput.trim()) {
                        setDescInput(item.desc);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border whitespace-nowrap ${
                      titleInput === item.title
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200/90'
                    }`}
                  >
                    + {item.title}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Hedef Başlığı (Örn: YKS Sınavı, Proje Teslimi, Önemli Buluşma)"
                maxLength={80}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Küçük açıklama veya not (İsteğe bağlı — Örn: A Blok Salon 3)"
                  maxLength={140}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:border-emerald-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* B. KOLAY VE MODERN GÖRSEL TAKVİM SEÇİCİ */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>2. Hedef Tarihi Seçin</span>
              </label>
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => {
                  if (e.target.value) handleSelectDateString(e.target.value);
                }}
                className="px-2 py-1 text-[11px] font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-700 focus:outline-hidden cursor-pointer"
                title="Doğrudan Tarih Seç"
              />
            </div>

            {/* Hızlı Tarih Kısayolları */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {[
                { label: 'Bugün', days: 0, months: 0 },
                { label: 'Yarın', days: 1, months: 0 },
                { label: '+3 Gün', days: 3, months: 0 },
                { label: '+1 Hafta', days: 7, months: 0 },
                { label: '+1 Ay', days: 0, months: 1 },
                { label: '+3 Ay', days: 0, months: 3 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyQuickDateOffset(preset.days, preset.months)}
                  className="px-2 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Etkileşimli Mini Takvim */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 space-y-2.5">
              {/* Ay ve Yıl Başlığı */}
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarViewMonth === 0) {
                      setCalendarViewMonth(11);
                      setCalendarViewYear((y) => y - 1);
                    } else {
                      setCalendarViewMonth((m) => m - 1);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Önceki Ay"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={calendarViewMonth}
                    onChange={(e) => setCalendarViewMonth(parseInt(e.target.value, 10))}
                    className="px-2 py-1 text-xs font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer focus:outline-hidden"
                  >
                    {TURKISH_MONTHS.map((mName, idx) => (
                      <option key={mName} value={idx}>
                        {mName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={calendarViewYear}
                    onChange={(e) => setCalendarViewYear(parseInt(e.target.value, 10))}
                    className="px-2 py-1 text-xs font-extrabold font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer focus:outline-hidden"
                  >
                    {Array.from({ length: 15 }, (_, i) => now.getFullYear() - 1 + i).map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (calendarViewMonth === 11) {
                      setCalendarViewMonth(0);
                      setCalendarViewYear((y) => y + 1);
                    } else {
                      setCalendarViewMonth((m) => m + 1);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Sonraki Ay"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Haftanın Günleri */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {TURKISH_WEEKDAYS_SHORT.map((wd) => (
                  <span key={wd} className="text-[10px] font-bold text-slate-400 py-0.5">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Gün Hücreleri */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDaysGrid.map((cell, idx) => {
                  if (cell.day === null) {
                    return <div key={`empty-${idx}`} className="h-8" />;
                  }
                  const isSelected = cell.dateStr === selectedDateStr;
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-emerald-700 text-white font-black shadow-xs'
                          : isToday
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-400 font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* C. PRATİK SAAT VE DAKİKA SEÇİCİ */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Hedef Saati Seçin</span>
              </label>
              <span className="font-mono text-xs font-black text-emerald-800 tabular-nums">
                {selectedTimeStr}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Saat (00 - 23)</span>
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-black text-slate-900 cursor-pointer focus:border-emerald-700 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }, (_, h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Dakika (00 - 59)</span>
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-black text-slate-900 cursor-pointer focus:border-emerald-700 focus:outline-hidden"
                  >
                    {Array.from({ length: 60 }, (_, m) => (
                      <option key={m} value={m}>
                        :{String(m).padStart(2, '0')} dk
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hızlı Saat Seçim Butonları */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Hızlı Saat Seçimi:</span>
                <div className="grid grid-cols-4 gap-1">
                  {QUICK_TIME_PRESETS.map((tPreset) => {
                    const isActiveTime = selectedTimeStr === tPreset;
                    return (
                      <button
                        key={tPreset}
                        type="button"
                        onClick={() => {
                          const [h, m] = tPreset.split(':').map((n) => parseInt(n, 10));
                          setSelectedHour(h);
                          setSelectedMinute(m);
                        }}
                        className={`py-1 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer border ${
                          isActiveTime
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {tPreset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* D. ANLIK GERİ SAYIM ÖNİZLEMESİ */}
          {liveFormPreview && (
            <div
              className={`rounded-2xl p-3 border text-xs space-y-1 ${
                liveFormPreview.isExpired
                  ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-600">
                  Hedef Zaman Önizlemesi:
                </span>
                <span className="font-mono font-extrabold text-[11px] tabular-nums">
                  {selectedDateStr.split('-').reverse().join('.')} · {selectedTimeStr}
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] font-semibold">Hesaplanan Süre:</span>
                {liveFormPreview.isExpired ? (
                  <span className="font-mono font-black text-amber-800 tabular-nums">
                    Geçmiş Vakit ({liveFormPreview.autoDeleteRemainingDays}g {liveFormPreview.autoDeleteRemainingHours}s saklanır)
                  </span>
                ) : (
                  <span className="font-mono font-black text-emerald-800 text-sm tabular-nums">
                    {liveFormPreview.days} Gün {liveFormPreview.hours} Saat {liveFormPreview.minutes} Dakika
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bildirim / Hata Mesajı */}
          {formFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                formFeedback.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              {formFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{formFeedback.message}</span>
            </div>
          )}

          {/* Kaydet Butonu */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-99"
          >
            <Check className="w-4 h-4 text-amber-300" />
            <span>{editingGoalId ? 'Hedef Değişikliklerini Kaydet' : 'Hedefi Kaydet ve Geri Sayımı Başlat'}</span>
          </button>
        </form>

        {/* SAĞ PANEL: KAYITLI HEDEFLER & DİNAMİK GERİ SAYIM LİSTESİ (7 Sütun) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Üst Filtre ve Bilgi Barı */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tümü ({goals.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === 'active'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aktif Sayım ({activeGoalsCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('expired')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === 'expired'
                    ? 'bg-white text-amber-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Süresi Dolanlar ({expiredInRetentionCount})
              </button>
            </div>

            <div className="text-[11px] font-medium text-slate-500">
              Süresi dolan hedefler 5 gün saklanır, ardından otomatik silinir.
            </div>
          </div>

          {/* Hedef Kartları */}
          {filteredGoals.length === 0 ? (
            <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                <Hourglass className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm sm:text-base font-black text-slate-800">
                  {filterMode === 'all'
                    ? 'Henüz Özel Bir Hedef Eklenmedi'
                    : filterMode === 'active'
                    ? 'Aktif Geri Sayım Hedefi Bulunmuyor'
                    : 'Süresi Dolmuş Hedef Bulunmuyor'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sol taraftaki takvim ve saat seçiciyi kullanarak sınav, buluşma, proje teslimi veya önemli bir gününüzü ekleyin. En yakın hedefiniz sağ üstte sistem saatinin yanında otomatik olarak gösterilir.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredGoals.map((goal) => {
                const countdown = calculateGoalCountdown(goal, now);
                const isNearestFeatured = nearestGoal?.id === goal.id && !countdown.isExpired;

                return (
                  <div
                    key={goal.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      countdown.isExpired
                        ? 'bg-amber-50/40 border-amber-200/90'
                        : isNearestFeatured
                        ? 'bg-emerald-50/40 border-emerald-600/50 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Sol: Başlık, Açıklama ve Tarih Bilgisi */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {isNearestFeatured && (
                            <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                              <span>En Yakın Hedef · Sağ Üst Saatte Gösteriliyor</span>
                            </span>
                          )}
                          {countdown.isExpired && (
                            <span className="font-extrabold text-amber-800 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>
                                Hedef Vakti Geldi · {countdown.autoDeleteRemainingDays} gün{' '}
                                {countdown.autoDeleteRemainingHours} saat{' '}
                                {countdown.autoDeleteRemainingMinutes} dk sonra otomatik silinecek
                              </span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 break-words">
                          {goal.title}
                        </h4>

                        {goal.description && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                            {goal.description}
                          </p>
                        )}

                        <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
                          <span>Hedef: {formatReadableTurkishDateTime(goal.targetTimestamp)}</span>
                        </div>
                      </div>

                      {/* Sağ: Gün / Saat / Dakika Dinamik Sayaç Kutuları */}
                      <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                        {!countdown.isExpired ? (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="bg-slate-900 text-white rounded-xl px-3 py-2 min-w-[60px] text-center">
                              <span className="font-mono text-lg sm:text-xl font-black block leading-none tabular-nums">
                                {countdown.days}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-300 block mt-1">
                                Gün
                              </span>
                            </div>

                            <span className="font-mono font-black text-slate-400">:</span>

                            <div className="bg-slate-900 text-white rounded-xl px-3 py-2 min-w-[60px] text-center">
                              <span className="font-mono text-lg sm:text-xl font-black block leading-none tabular-nums">
                                {String(countdown.hours).padStart(2, '0')}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-300 block mt-1">
                                Saat
                              </span>
                            </div>

                            <span className="font-mono font-black text-slate-400">:</span>

                            <div className="bg-slate-900 text-white rounded-xl px-3 py-2 min-w-[60px] text-center">
                              <span className="font-mono text-lg sm:text-xl font-black block leading-none tabular-nums">
                                {String(countdown.minutes).padStart(2, '0')}
                              </span>
                              <span className="text-[10px] font-bold text-amber-300 block mt-1">
                                Dakika
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-100/80 border border-amber-300 text-amber-950 rounded-xl px-3.5 py-2 text-right">
                            <span className="text-xs font-black block">Süre Tamamlandı</span>
                            <span className="font-mono text-[11px] font-bold text-amber-800 tabular-nums block">
                              {countdown.days > 0 ? `${countdown.days} gün ` : ''}
                              {countdown.hours} saat {countdown.minutes} dk önce doldu
                            </span>
                          </div>
                        )}

                        {/* Düzenle ve Sil Butonları */}
                        <div className="flex items-center gap-1.5 self-end">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(goal)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Hedefi Düzenle veya Tarihini Güncelle"
                          >
                            {countdown.isExpired ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Yeniden Kur</span>
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Düzenle</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Hedefi Kalıcı Olarak Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
