import React, { useState, useEffect } from 'react';
import { X, Sliders, Volume2, VolumeX, Upload, RotateCcw, Check, Play, Square, Music } from 'lucide-react';
import { TemkinSettings, AsrMethod } from '../types/prayer';
import { DEFAULT_TEMKIN } from '../utils/astronomy';
import { soundManager, SoundMode } from '../utils/soundManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  temkin: TemkinSettings;
  onSaveTemkin: (temkin: TemkinSettings) => void;
  asrMethod: AsrMethod;
  onSaveAsrMethod: (method: AsrMethod) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  temkin,
  onSaveTemkin,
  asrMethod,
  onSaveAsrMethod
}) => {
  const [localTemkin, setLocalTemkin] = useState<TemkinSettings>(temkin);
  const [localAsr, setLocalAsr] = useState<AsrMethod>(asrMethod);

  // Ses Durumu
  const [soundMode, setSoundMode] = useState<SoundMode>(soundManager.getSoundMode());
  const [isPlaying, setIsPlaying] = useState<boolean>(soundManager.getIsPlaying());
  const [soundName, setSoundName] = useState<string>(soundManager.getState().activeSoundName);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    setLocalTemkin(temkin);
    setLocalAsr(asrMethod);
  }, [temkin, asrMethod, isOpen]);

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((st) => {
      setSoundMode(st.soundMode);
      setIsPlaying(st.isPlaying);
      setSoundName(st.activeSoundName);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleTemkinChange = (key: keyof TemkinSettings, val: number) => {
    setLocalTemkin((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSaveTemkin(localTemkin);
    onSaveAsrMethod(localAsr);
    onClose();
  };

  const handleResetTemkin = () => {
    setLocalTemkin(DEFAULT_TEMKIN);
    setLocalAsr(1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Yükleniyor...');
      const name = await soundManager.loadUserAudioFile(file);
      setUploadStatus(`Yüklendi: ${name}`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch {
      setUploadStatus('Hata: Ses dosyası kaydedilemedi.');
    }
  };

  const handleToggleSoundMode = (mode: SoundMode) => {
    soundManager.setSoundMode(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Hesaplama & Ses Ayarları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Temkin süreleri, ikindi fıkhı ve ezan bildirimleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Ses ve Ezan Ayarları */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              <span>Vakit Ezanı & Bildirim Sesi</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggleSoundMode('ezan')}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  soundMode === 'ezan'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className={`w-4 h-4 ${soundMode === 'ezan' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Ezan Sesi</span>
                    <span className="text-[10px] text-slate-400">Vakit girince ezan oku</span>
                  </div>
                </div>
                {soundMode === 'ezan' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={() => handleToggleSoundMode('off')}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  soundMode === 'off'
                    ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 ring-1 ring-rose-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <VolumeX className={`w-4 h-4 ${soundMode === 'off' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Sessiz (Kapalı)</span>
                    <span className="text-[10px] text-slate-400">Sesli ikaz çalma</span>
                  </div>
                </div>
                {soundMode === 'off' && <Check className="w-4 h-4 text-rose-600" />}
              </button>
            </div>

            {/* Ses Dinleme ve Özel Dosya Yükleme Paneli */}
            {soundMode === 'ezan' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        Aktif Ses: {soundName}
                      </span>
                      <span className="text-[10px] text-slate-400">Vakit geldiğinde çalınacak ses</span>
                    </div>
                  </div>

                  <button
                    onClick={() => soundManager.togglePlay()}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isPlaying
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Durdur</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Dinle</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Kendi Ezan Dosyanı Seç (.m4a, .mp3)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => soundManager.resetToDefault()}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Varsayılana Dön
                  </button>
                </div>

                {uploadStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center font-medium">
                    {uploadStatus}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 2. İkindi Vakti Hesabı (Mezhep Tercihi) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              İkindi Vakti Hesabı (Mezhep Görüşü)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalAsr(1)}
                className={`p-3 rounded-2xl border text-left transition ${
                  localAsr === 1
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  Asr-ı Evvel (Gölge 1 Kat)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  İmameyn (Ebu Yusuf, İmam Muhammed), Şâfiî, Mâlikî, Hanbelî ve Türkiye takvimleri cumhuru.
                </span>
              </button>

              <button
                onClick={() => setLocalAsr(2)}
                className={`p-3 rounded-2xl border text-left transition ${
                  localAsr === 2
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  Asr-ı Sânî (Gölge 2 Kat)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  İmam-ı Âzam Ebû Hanîfe Hazretlerinin asıl kavli (Daha geç ikindi).
                </span>
              </button>
            </div>
          </div>

          {/* 3. Temkin Süreleri (Dakika) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Temkin Süreleri (Dakika)
              </h3>
              <button
                onClick={handleResetTemkin}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Varsayılana Sıfırla</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ehl-i Sünnet astronomi ölçülerinde ufuk ve güneş irtifalarındaki şüpheyi gidermek için uygulanan güvenlik payları:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'fajr', label: 'İmsak Temkini', val: localTemkin.fajr, desc: 'Astronomik fecr-i sâdık' },
                { key: 'sunrise', label: 'Güneş Temkini', val: localTemkin.sunrise, desc: 'Doğuş payı' },
                { key: 'dhuhr', label: 'Öğle Temkini', val: localTemkin.dhuhr, desc: 'Zeval sonrası' },
                { key: 'asr', label: 'İkindi Temkini', val: localTemkin.asr, desc: 'Gölge emniyeti' },
                { key: 'maghrib', label: 'Akşam Temkini', val: localTemkin.maghrib, desc: 'Gurub emniyeti' },
                { key: 'isha', label: 'Yatsı Temkini', val: localTemkin.isha, desc: 'Şafak-ı ahmer' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1"
                >
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {item.label}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={item.val}
                      onChange={(e) => handleTemkinChange(item.key as keyof TemkinSettings, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center"
                    />
                    <span className="text-[10px] text-slate-400">dk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kaydet Barı */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
