import React, { useState, useEffect } from 'react';
import {
  Heart,
  CheckCircle2,
  Circle,
  MessageSquare,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  ListChecks,
  Link2
} from 'lucide-react';
import { HadisItem } from '../../services/hadisService';

interface HadisCardItemProps {
  item: HadisItem;
  isDark: boolean;
  arabicScalePercent: number;
  mealScalePercent?: number;
  textSizeLevel?: number; // legacy compatibility
  onToggleFavorite: (id: number) => void;
  onToggleMemorized: (id: number) => void;
  onIncrementReview: (id: number) => void;
  onSaveNote: (id: number, note: string) => void;
  variant?: 'standard' | 'hero' | 'flip' | 'zen' | 'cloze' | 'story';
  maskRatio?: number; // for cloze (0, 0.35, 0.65, 1)
  // Özel Sıralama Sepeti ("Listeye Seç" / "Seçildi (#X)")
  onToggleSelectForList?: (id: number) => void;
  selectedListOrder?: number; // 1-based (#1, #2...)
  // Manuel Sıralama Kontrolleri (Uygulanabilir Bölgeler İçin)
  isReorderMode?: boolean;
  orderNumber?: number; // 1-based (Sıra #X)
  totalCount?: number;
  isDragging?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveToPosition?: (targetPosition: number) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const HadisCardItem: React.FC<HadisCardItemProps> = ({
  item,
  isDark,
  arabicScalePercent,
  mealScalePercent = 100,
  onToggleFavorite,
  onToggleMemorized,
  onIncrementReview,
  onSaveNote,
  variant = 'standard',
  maskRatio = 0.5,
  onToggleSelectForList,
  selectedListOrder,
  isReorderMode = false,
  orderNumber,
  totalCount = 1,
  isDragging = false,
  onMoveUp,
  onMoveDown,
  onMoveToPosition,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragEnd
}) => {
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(Boolean(item.userNote));
  const [noteDraft, setNoteDraft] = useState<string>(item.userNote || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [revealedWords, setRevealedWords] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPositionInputOpen, setIsPositionInputOpen] = useState<boolean>(false);
  const [targetPosDraft, setTargetPosDraft] = useState<string>(
    String(orderNumber || 1)
  );

  useEffect(() => {
    setTargetPosDraft(String(orderNumber || 1));
  }, [orderNumber]);

  // Meal font boyutu yalnızca mealScalePercent kontrolüyle bağımsız olarak ölçeklenir
  const mealFontSizePx = Math.round(16.5 * (mealScalePercent / 100));

  const okunusSizeClass = 'text-sm sm:text-base';

  const handleCopy = () => {
    const text = `${item.arapcaMetin}\n\n"${item.meali}"\n(${item.kaynagi}) — Hayat Rehberi`;
    if (!navigator.clipboard?.writeText) { window.prompt('Metni kopyalayın:', text); return; }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    }).catch(() => window.prompt('Metni kopyalayın:', text));
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#hadis/${item.id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => window.prompt('Hadis bağlantısını kopyalayın:', url));
    } else window.prompt('Hadis bağlantısını kopyalayın:', url);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(item.arapcaMetin);
    utter.lang = 'ar-SA';
    utter.rate = 0.85;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
    onIncrementReview(item.id);
  };

  const handleApplyPositionMove = () => {
    if (!onMoveToPosition) return;
    const parsed = parseInt(targetPosDraft, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalCount) {
      onMoveToPosition(parsed);
      setIsPositionInputOpen(false);
    }
  };

  const cardBg = isDark
    ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] shadow-md'
    : 'bg-white border-slate-200/90 text-slate-800 shadow-xs';

  const dragHighlight = isDragging
    ? 'ring-2 ring-emerald-500 opacity-80 scale-[0.99]'
    : '';

  // Sol üst manuel sıralama kontrolleri (Sıralamayı Düzenle modunda aktifleşir)
  const renderReorderControls = () => {
    if (!isReorderMode) return null;
    const currentOrder = orderNumber || 1;
    return (
      <div className="flex items-center gap-1.5 mr-1">
        {/* Sürükle-Bırak Tutamacı (⋮⋮) */}
        <span
          className={`px-1.5 py-1 rounded-md border text-xs font-extrabold select-none cursor-grab active:cursor-grabbing ${
            isDark
              ? 'bg-[#1b1f27] border-[#384152] text-amber-400 hover:border-amber-400'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400'
          }`}
          title="Kartı tutup sürükleyerek sırasını değiştirin"
        >
          ⋮⋮
        </span>

        {/* Yukarı / Aşağı Oklar (▲ / ▼) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
            disabled={currentOrder <= 1}
            className={`px-1.5 py-1 rounded-md border text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Bir Üst Sıraya Taşı"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.();
            }}
            disabled={currentOrder >= totalCount}
            className={`px-1.5 py-1 rounded-md border text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Bir Alt Sıraya Taşı"
          >
            ▼
          </button>
        </div>

        {/* Satır İçi / Kart İçi Sıra Numarası Yazma (Sıra #X) */}
        {!isPositionInputOpen ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTargetPosDraft(String(currentOrder));
              setIsPositionInputOpen(true);
            }}
            className={`px-2 py-1 rounded-md border text-[11px] font-extrabold cursor-pointer transition-colors ${
              isDark
                ? 'bg-[#1b3a32] border-[#4ade80]/50 text-[#4ade80] hover:bg-[#4ade80] hover:text-slate-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-700 hover:text-white'
            }`}
            title="Sıra numarasını yazarak doğrudan taşımak için tıklayın"
          >
            Sıra #{currentOrder}
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-1 p-0.5 px-1.5 rounded-lg border ${
              isDark ? 'bg-[#1b1f27] border-[#4ade80]' : 'bg-white border-emerald-600'
            }`}
          >
            <input
              type="number"
              min={1}
              max={totalCount}
              value={targetPosDraft}
              onChange={(e) => setTargetPosDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyPositionMove();
                if (e.key === 'Escape') setIsPositionInputOpen(false);
              }}
              autoFocus
              className="w-12 px-1 py-0.5 text-xs font-bold text-center rounded bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyPositionMove}
              className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold cursor-pointer hover:bg-emerald-700"
            >
              Taşı
            </button>
            <button
              type="button"
              onClick={() => setIsPositionInputOpen(false)}
              className="px-1 text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  };

  // Sağ üst "Listeye Seç" / "Seçildi (#X)" butonu
  const renderSelectForListButton = () => {
    if (!onToggleSelectForList) return null;
    const isSelected = Boolean(selectedListOrder && selectedListOrder > 0);
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelectForList(item.id);
        }}
        className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
          isSelected
            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
            : isDark
            ? 'bg-[#1b1f27] border-[#384152] text-[#e2e8f0] hover:border-amber-400 hover:text-amber-300'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-500 hover:text-amber-800'
        }`}
        title={
          isSelected
            ? `Özel sıralama sepetinde #${selectedListOrder}. sırada (Çıkarmak için tıklayın)`
            : 'Özel sıralama ve indirme listesine seç'
        }
      >
        <ListChecks className="w-3.5 h-3.5" />
        <span>{isSelected ? `Seçildi (#${selectedListOrder})` : 'Listeye Seç'}</span>
      </button>
    );
  };

  // 4. Mod: Çevrilebilir Kart (Flip Card) Görünümü
  if (variant === 'flip') {
    return (
      <div
        draggable={isReorderMode}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        className={`rounded-2xl border p-5 sm:p-6 transition-all flex flex-col justify-between min-h-[310px] ${cardBg} ${dragHighlight}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className={`flex items-center flex-wrap gap-1.5 font-bold ${isDark ? 'text-[#4ade80]' : 'text-emerald-700'}`}>
            {renderReorderControls()}
            <span>Hadis #{item.id}</span>
            <span>·</span>
            <span className={isDark ? 'text-[#f3f4f6]' : 'text-slate-800'}>{item.kategori}</span>
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {renderSelectForListButton()}
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                item.isFavorite
                  ? 'text-rose-400 border-rose-500/40 bg-rose-500/15'
                  : isDark
                  ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                  : 'border-slate-200 text-slate-500'
              }`}
              title="Favorilere Ekle/Çıkar"
            >
              <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onToggleMemorized(item.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                item.isMemorized
                  ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15'
                  : isDark
                  ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                  : 'border-slate-200 text-slate-500'
              }`}
              title="Ezber Durumu"
            >
              {item.isMemorized ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {!isFlipped ? (
          <div
            onClick={() => {
              setIsFlipped(true);
              onIncrementReview(item.id);
            }}
            className="my-4 flex-1 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <div
              dir="rtl"
              style={{ zoom: arabicScalePercent / 100 }}
              className={`font-amiri text-2xl sm:text-3xl leading-[2.3] mb-3 ${
                isDark ? 'text-[#6ee7b7]' : 'text-emerald-900'
              }`}
            >
              {item.arapcaMetin}
            </div>
            {item.okunusu && (
              <p className={`${okunusSizeClass} italic ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                {item.okunusu}
              </p>
            )}
            <span className="mt-4 text-[11px] font-bold text-amber-400 group-hover:underline">
              ↻ Meali ve Kaynağı Görmek İçin Karta Tıklayın
            </span>
          </div>
        ) : (
          <div
            onClick={() => setIsFlipped(false)}
            className="my-4 flex-1 flex flex-col justify-center cursor-pointer space-y-2.5"
          >
            <p
              style={{ fontSize: `${mealFontSizePx}px`, lineHeight: 1.65 }}
              className="font-semibold"
            >
              "{item.meali}"
            </p>
            <p className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
              <strong>Kaynak:</strong> {item.kaynagi}
            </p>
            {item.hikmeti && (
              <p className={`text-xs border-l-2 border-emerald-500 pl-2.5 ${isDark ? 'text-[#e2e8f0]' : 'text-slate-700'}`}>
                {item.hikmeti}
              </p>
            )}
            <span className="pt-2 text-[11px] font-bold text-emerald-400">
              ↺ Arapça Metne Dönmek İçin Tıklayın
            </span>
          </div>
        )}

        <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDark ? 'border-[#384152]' : 'border-slate-200'}`}>
          <span className={`truncate max-w-[200px] ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            {item.kaynagi}
          </span>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
              isDark
                ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/30'
                : 'bg-emerald-600/15 text-emerald-700'
            }`}
          >
            {isFlipped ? 'Ön Yüz (Arapça)' : 'Arka Yüz (Meal)'}
          </button>
        </div>
      </div>
    );
  }

  // 5. Mod: Kelime Gizleme (Cloze / Hıfz Stüdyosu)
  const renderClozeText = (text: string, baseIdxOffset: number) => {
    const words = text.split(' ');
    return words.map((word, idx) => {
      const key = baseIdxOffset + idx;
      const hash = (item.id * 17 + idx * 31) % 100;
      const shouldMask = maskRatio > 0 && hash < maskRatio * 100;
      const isRevealed = revealedWords[key];

      if (!shouldMask || isRevealed) {
        return (
          <span
            key={key}
            onClick={() =>
              shouldMask &&
              setRevealedWords((prev) => ({
                ...prev,
                [key]: !prev[key]
              }))
            }
            className={`inline-block mx-0.5 ${
              shouldMask ? 'underline decoration-emerald-500/60 cursor-pointer' : ''
            }`}
          >
            {word}
          </span>
        );
      }

      return (
        <button
          key={key}
          onClick={() => {
            setRevealedWords((prev) => ({ ...prev, [key]: true }));
            onIncrementReview(item.id);
          }}
          className={`inline-block mx-1 px-2.5 py-0.5 rounded-md font-mono text-xs border transition-all cursor-pointer ${
            isDark
              ? 'bg-[#1b3a32] border-[#4ade80]/50 text-[#4ade80] hover:bg-[#4ade80] hover:text-slate-950'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-700 hover:text-white'
          }`}
          title="Kelimeyi açmak için tıklayın"
        >
          {'•'.repeat(Math.min(Math.max(word.length, 3), 6))}
        </button>
      );
    });
  };

  return (
    <article
      id={`hadis-card-${item.id}`}
      draggable={isReorderMode}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`rounded-2xl border transition-all scroll-mt-48 min-w-0 max-w-full ${
        variant === 'hero' || variant === 'story' ? 'p-6 sm:p-8' : 'p-4 sm:p-6'
      } ${cardBg} ${dragHighlight}`}
    >
      {/* Üst Satır: Kategori, Kaynak Metaverisi, Manuel Sıralama ve Aksiyon Butonları */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b ${isDark ? 'border-[#384152]' : 'border-slate-200'}`}>
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs min-w-0 max-w-full">
          {renderReorderControls()}
          <span className={`font-extrabold shrink-0 ${isDark ? 'text-[#4ade80]' : 'text-emerald-800'}`}>
            #{item.id}
          </span>
          <span aria-hidden="true" className="opacity-50 shrink-0">·</span>
          <span className={`font-semibold shrink-0 ${isDark ? 'text-[#f8fafc]' : 'text-slate-800'}`}>
            {item.kategori}
          </span>
          <span aria-hidden="true" className="opacity-50 shrink-0">·</span>
          <span
            className={`truncate max-w-[110px] xs:max-w-[160px] sm:max-w-md min-w-0 ${
              isDark ? 'text-[#cbd5e1]' : 'text-slate-500'
            }`}
            title={item.kaynagi}
          >
            {item.kaynagi}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {/* Sağ Üst "Listeye Seç" / "Seçildi (#X)" Butonu */}
          {renderSelectForListButton()}

          <button type="button" onClick={handleCopyLink} aria-label={`Hadis ${item.id} bağlantısını kopyala`}
            title="Bu hadisin doğrudan bağlantısını kopyala"
            className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1]' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <Link2 className="w-3.5 h-3.5" />
          </button>
          {/* Sesli Arapça Dinle */}
          <button
            aria-label="Arapça hadisi seslendir"
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Arapça Metni Sesli Dinle"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Tekrar Sayacı Artır */}
          <button
            onClick={() => onIncrementReview(item.id)}
            className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer tabular-nums ${
              isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#e2e8f0] hover:border-[#4ade80]'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500'
            }`}
            title="Tekrar sayısını artır"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>{item.reviewCount || 0}</span>
          </button>

          {/* Favori */}
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              item.isFavorite
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-rose-400'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-600'
            }`}
            title={item.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Ezberlendi Durumu */}
          <button
            onClick={() => onToggleMemorized(item.id)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              item.isMemorized
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
            title="Ezberlendi olarak işaretle"
          >
            {item.isMemorized ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
            <span>{item.isMemorized ? 'Ezberlendi' : 'Ezberle'}</span>
          </button>

          {/* Kopyala */}
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Hadisi Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Not Aç/Kapat */}
          {variant !== 'zen' && (
            <button
              onClick={() => setIsNoteOpen(!isNoteOpen)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                item.userNote
                  ? 'border-amber-500/50 text-amber-400 bg-amber-500/15'
                  : isDark
                  ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Kişisel Not Ekle / Düzenle"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Arapça Metin (Sadece Arapça boyut kontrolü ile büyür/küçülür) */}
      <div
        dir="rtl"
        style={{ zoom: arabicScalePercent / 100 }}
        className={`my-4 p-4 sm:p-5 rounded-xl border max-w-full break-words [overflow-wrap:anywhere] font-amiri text-right text-2xl sm:text-3xl md:text-4xl leading-[2.35] ${
          isDark
            ? 'bg-[#1b1f27] border-[#384152] text-[#6ee7b7]'
            : 'bg-[#FBF9F5] border-emerald-900/10 text-emerald-950'
        }`}
      >
        {variant === 'cloze' ? renderClozeText(item.arapcaMetin, 1000) : item.arapcaMetin}
      </div>

      {/* Türkçe Okunuşu */}
      {item.okunusu && (
        <div className={`mb-2.5 ${okunusSizeClass} italic ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
          <strong className={`not-italic font-bold ${isDark ? 'text-[#e2e8f0]' : 'text-slate-800'}`}>
            Okunuşu:{' '}
          </strong>
          {variant === 'cloze' ? renderClozeText(item.okunusu, 2000) : item.okunusu}
        </div>
      )}

      {/* Türkçe Meal (Sadece Meal boyut kontrolü ile bağımsız büyür/küçülür) */}
      <div
        style={{ fontSize: `${mealFontSizePx}px`, lineHeight: 1.65 }}
        className="font-medium transition-all duration-150"
      >
        <strong className={isDark ? 'text-[#4ade80]' : 'text-emerald-800'}>Meali: </strong>
        {variant === 'cloze' ? renderClozeText(item.meali, 3000) : `"${item.meali}"`}
      </div>

      {/* Hikmeti */}
      {item.hikmeti && variant !== 'zen' && (
        <div
          className={`mt-3 pt-2.5 border-t text-xs leading-relaxed ${
            isDark ? 'border-[#384152] text-[#cbd5e1]' : 'border-slate-100 text-slate-600'
          }`}
        >
          <strong className={isDark ? 'text-amber-400' : 'text-amber-800'}>Hikmet & Şerh: </strong>
          {item.hikmeti}
        </div>
      )}

      {variant === 'cloze' && Object.keys(revealedWords).length > 0 && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setRevealedWords({})}
            className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
          >
            Açılan Kelimeleri Tekrar Gizle
          </button>
        </div>
      )}

      {/* Kişisel Not Alanı */}
      {isNoteOpen && variant !== 'zen' && (
        <div
          className={`mt-4 p-3.5 rounded-xl border space-y-2 ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <label className="block text-xs font-bold text-amber-400">
            Kişisel Ezber & Tefekkür Notum:
          </label>
          <textarea
            rows={2}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Bu hadis-i şerif ile ilgili kişisel notunuzu, ezber ipucunuzu veya tefekkürünüzü yazın..."
            className={`w-full rounded-lg border p-2.5 text-xs focus:outline-none ${
              isDark
                ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] placeholder-[#94a3b8]'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                onSaveNote(item.id, noteDraft.trim());
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
            >
              Notu Kaydet
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
