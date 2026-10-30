import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  X,
  EyeOff,
  Eye,
  Repeat,
  Pin,
  Volume2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { recordEzberEvent as logEzber, ezberErrorName } from '../utils/ezberDiagnostics';

export interface VoiceRecordingItem {
  id: string;
  surahId: number;
  surahName: string;
  verseInfo?: string;
  createdAt: number;
  durationSec: number;
  blob: Blob;
  url: string;
  pinned?: boolean;
}

interface EzberVoiceRecorderProps {
  surahId: number;
  surahName: string;
  selectedVerseInfo?: string;
  theme?: 'dark' | 'light';
  onRecordingStateChange?: (isRecording: boolean, blindModeActive: boolean) => void;
  onStopExternalAudio?: () => void;
}

const MAX_RECORDINGS = 5;
const DB_NAME = 'hayat_rehberi_ezber_recordings_db';
const STORE_NAME = 'recordings_store';

// IndexedDB Yardımcıları (Son 5 kaydı sayfa yenilense bile korumak için)
function openRecordingsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB desteklenmiyor'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadSavedRecordingsFromDB(): Promise<VoiceRecordingItem[]> {
  try {
    const db = await openRecordingsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const rawList = Array.isArray(req.result) ? req.result : [];
        const items: VoiceRecordingItem[] = rawList
          .filter((r) => r && r.blob instanceof Blob)
          .map((r) => ({
            id: String(r.id),
            surahId: Number(r.surahId) || 1,
            surahName: String(r.surahName || 'Sure'),
            verseInfo: r.verseInfo ? String(r.verseInfo) : undefined,
            createdAt: Number(r.createdAt) || Date.now(),
            durationSec: Number(r.durationSec) || 1,
            blob: r.blob as Blob,
            url: URL.createObjectURL(r.blob as Blob),
            pinned: Boolean(r.pinned)
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, MAX_RECORDINGS);
        resolve(items);
      };
      req.onerror = () => {
        logEzber('RECORD_DB_READ_FAILED','error',{detail:{stage:'read',name:ezberErrorName(req.error)}});
        resolve([]);
      };
    });
  } catch (err) {
    logEzber('RECORD_DB_READ_FAILED','error',{detail:{stage:'open',name:ezberErrorName(err)}});
    return [];
  }
}

async function syncRecordingsToDB(items: VoiceRecordingItem[]): Promise<void> {
  try {
    const db = await openRecordingsDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await new Promise<void>((resolve,reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Transaction error'));
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    items.forEach((item) => {
      store.put({
        id: item.id,
        surahId: item.surahId,
        surahName: item.surahName,
        verseInfo: item.verseInfo,
        createdAt: item.createdAt,
        durationSec: item.durationSec,
        blob: item.blob,
        pinned: Boolean(item.pinned)
      });
    });
    });
  } catch (err) {
    logEzber('RECORD_DB_WRITE_FAILED','error',{detail:{stage:'sync',name:ezberErrorName(err)}});
  }
}

export const EzberVoiceRecorder: React.FC<EzberVoiceRecorderProps> = ({
  surahId,
  surahName,
  selectedVerseInfo,
  theme = 'dark',
  onRecordingStateChange,
  onStopExternalAudio
}) => {
  const isDark = theme === 'dark';

  const [recordings, setRecordings] = useState<VoiceRecordingItem[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ekstra Ezber Özellikleri
  const [blindModeOnRecord, setBlindModeOnRecord] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ezber_blind_on_record') === 'true';
    } catch {
      return false;
    }
  });
  const [autoPlayAfterRecord, setAutoPlayAfterRecord] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ezber_autoplay_after_record') === 'true';
    } catch {
      return false;
    }
  });
  const [loopPlayback, setLoopPlayback] = useState<boolean>(false);

  // Referanslar
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);
  const levelAnimFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const recordingsRef = useRef<VoiceRecordingItem[]>([]);
  recordingsRef.current = recordings;

  const autoPlayAfterRecordRef = useRef<boolean>(autoPlayAfterRecord);
  autoPlayAfterRecordRef.current = autoPlayAfterRecord;

  const loopPlaybackRef = useRef<boolean>(loopPlayback);
  loopPlaybackRef.current = loopPlayback;

  // İlk yüklemede IndexedDB'den son 5 kaydı getir
  useEffect(() => {
    let mounted = true;
    loadSavedRecordingsFromDB().then((loaded) => {
      if (mounted && loaded.length > 0) {
        setRecordings(loaded);
      }
    });
    return () => {
      mounted = false;
      stopRecordingCleanup();
      stopPlayback();
      recordingsRef.current.forEach((r) => {
        try {
          URL.revokeObjectURL(r.url);
        } catch {}
      });
    };
  }, []);

  // Kayıt durumu veya Bakmadan Oku modu değiştiğinde üst bileşene bildir
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording, blindModeOnRecord);
    }
  }, [isRecording, blindModeOnRecord, onRecordingStateChange]);

  const toggleBlindMode = () => {
    setBlindModeOnRecord((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ezber_blind_on_record', String(next));
      } catch (err) {logEzber('PREFERENCE_SAVE_FAILED','warning',{detail:{stage:'blind',name:ezberErrorName(err)}});}
      return next;
    });
  };

  const toggleAutoPlay = () => {
    setAutoPlayAfterRecord((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ezber_autoplay_after_record', String(next));
      } catch (err) {logEzber('PREFERENCE_SAVE_FAILED','warning',{detail:{stage:'autoplay',name:ezberErrorName(err)}});}
      return next;
    });
  };

  const formatDuration = (sec: number): string => {
    const s = Math.max(0, Math.round(sec));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (levelAnimFrameRef.current) {
      cancelAnimationFrame(levelAnimFrameRef.current);
      levelAnimFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Ses Kaydını Başlat
  const startRecording = async () => {
    setErrorMsg(null);
    stopPlayback();
    if (onStopExternalAudio) {
      onStopExternalAudio();
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      logEzber('MIC_UNSUPPORTED','warning',{surah:surahId});
      setErrorMsg('Tarayıcınız mikrofonla ses kaydını desteklemiyor.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Canlı ses seviyesi göstergesi için Web Audio API Analyser
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            levelAnimFrameRef.current = requestAnimationFrame(updateLevel);
          };
          levelAnimFrameRef.current = requestAnimationFrame(updateLevel);
        }
      } catch {
        // Web Audio analyser opsiyoneldir
      }

      // Desteklenen mimeType seçimi
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      let selectedMimeType = '';
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        for (const mt of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mt)) {
            selectedMimeType = mt;
            break;
          }
        }
      }

      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      recordStartTimeRef.current = Date.now();
      setRecordingSeconds(0);
      setIsRecording(true);

      recorder.onerror = () => {
        logEzber('RECORD_ERROR','error',{surah:surahId,detail:{stage:'recorder'}});
        setErrorMsg('Ses kaydı beklenmedik şekilde durdu. Tekrar deneyin.');
        stopRecordingCleanup();
        setIsRecording(false);
      };

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const durationSec = Math.max(1, Math.round((Date.now() - recordStartTimeRef.current) / 1000));
        const blobType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        stopRecordingCleanup();
        setIsRecording(false);

        if (audioBlob.size === 0) {
          logEzber('RECORD_EMPTY','warning',{surah:surahId});
          setErrorMsg('Ses kaydı boş geldi. Mikrofonu kontrol edip tekrar deneyin.');
          return;
        }
        logEzber('RECORD_STOP','info',{surah:surahId,detail:{duration:durationSec}});

        const audioUrl = URL.createObjectURL(audioBlob);
        const newItem: VoiceRecordingItem = {
          id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          surahId,
          surahName,
          verseInfo: selectedVerseInfo,
          createdAt: Date.now(),
          durationSec,
          blob: audioBlob,
          url: audioUrl,
          pinned: false
        };

        setRecordings((prev) => {
          //Yeni kaydı en başa ekle; toplam 5 kayıttan fazlasını otomatik sil (sabitlenenleri koru)
          const combined = [newItem, ...prev];
          if (combined.length <= MAX_RECORDINGS) {
            syncRecordingsToDB(combined);
            return combined;
          }

          // Sabitlenmemiş en eski kaydı bul ve sil
          let removeIdx = -1;
          for (let i = combined.length - 1; i >= 0; i--) {
            if (!combined[i].pinned) {
              removeIdx = i;
              break;
            }
          }
          if (removeIdx === -1) {
            removeIdx = combined.length - 1;
          }

          const removed = combined[removeIdx];
          if (removed) {
            try {
              URL.revokeObjectURL(removed.url);
            } catch {}
          }

          const nextList = combined.filter((_, idx) => idx !== removeIdx).slice(0, MAX_RECORDINGS);
          syncRecordingsToDB(nextList);
          return nextList;
        });

        // Otomatik dinleme açıksa kaydı hemen oynat
        if (autoPlayAfterRecordRef.current) {
          setTimeout(() => {
            playRecording(newItem);
          }, 150);
        }
      };

      recorder.start(200);
      logEzber('RECORD_START','info',{surah:surahId});

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordStartTimeRef.current) / 1000);
        setRecordingSeconds(elapsed);
      }, 250);
    } catch (err) {
      logEzber('MIC_PERMISSION_ERROR','error',{surah:surahId,detail:{name:ezberErrorName(err)}});
      stopRecordingCleanup();
      setIsRecording(false);
      setErrorMsg('Mikrofon izni alınamadı. Lütfen tarayıcıdan mikrofon erişimine izin verin.');
    }
  };

  // Kaydı Durdur
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        stopRecordingCleanup();
        setIsRecording(false);
      }
    } else {
      stopRecordingCleanup();
      setIsRecording(false);
    }
  };

  // Kaydı Oynat / Durdur
  const playRecording = (item: VoiceRecordingItem) => {
    if (isRecording) {
      stopRecording();
    }
    if (onStopExternalAudio) {
      onStopExternalAudio();
    }

    if (playingId === item.id) {
      stopPlayback();
      return;
    }

    stopPlayback();

    const audio = new Audio(item.url);
    playerRef.current = audio;
    setPlayingId(item.id);
    setPlaybackProgress(0);

    audio.ontimeupdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setPlaybackProgress(Math.min(100, (audio.currentTime / audio.duration) * 100));
      }
    };

    audio.onended = () => {
      if (loopPlaybackRef.current) {
        audio.currentTime = 0;
        audio.play().catch((err) => {
          logEzber('RECORD_PLAY_ERROR','warning',{surah:surahId,detail:{name:ezberErrorName(err),stage:'repeat'}});
          stopPlayback();
        });
      } else {
        setPlayingId(null);
        setPlaybackProgress(0);
      }
    };

    audio.onerror = () => {
      logEzber('RECORD_PLAY_ERROR','error',{surah:surahId,detail:{mediaCode:audio.error?.code ?? 0,stage:'resource'}});
      stopPlayback();
    };

    audio.play().catch((err) => {
      logEzber('RECORD_PLAY_ERROR','error',{surah:surahId,detail:{name:ezberErrorName(err),stage:'play'}});
      stopPlayback();
    });
  };

  const stopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime = 0;
      playerRef.current.ontimeupdate = null;
      playerRef.current.onended = null;
      playerRef.current.onerror = null;
      playerRef.current.ontimeupdate = null;
      playerRef.current.removeAttribute('src');
      playerRef.current.load();
      playerRef.current = null;
    }
    setPlayingId(null);
    setPlaybackProgress(0);
  };

  // Tekil Kayıt Sil
  const deleteRecording = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === id) {
      stopPlayback();
    }
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.url);
        } catch {}
      }
      const next = prev.filter((r) => r.id !== id);
      syncRecordingsToDB(next);
      return next;
    });
  };

  // Kaydı Sabitle / Sabitlemeyi Kaldır (5 kayıt sınırında silinmesini önler)
  const togglePinRecording = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordings((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r));
      syncRecordingsToDB(next);
      return next;
    });
  };

  // Tüm Kayıtları Temizle
  const clearAllRecordings = () => {
    stopPlayback();
    setRecordings((prev) => {
      prev.forEach((r) => {
        try {
          URL.revokeObjectURL(r.url);
        } catch {}
      });
      syncRecordingsToDB([]);
      return [];
    });
  };

  return (
    <div
      className={`w-full rounded-xl border px-3 py-2.5 transition-all ${
        isRecording
          ? isDark
            ? 'bg-rose-950/30 border-rose-500/60 shadow-sm'
            : 'bg-rose-50/90 border-rose-300 shadow-sm'
          : isDark
          ? 'bg-[#181510]/90 border-[#3a3226]'
          : 'bg-slate-50/90 border-slate-200/90'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Sol Kısım: Kayıt Butonu + Canlı Süre + Son 5 Kayıt Çipleri */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Ana Kayıt Başlat / Durdur Butonu */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs active:scale-95 shrink-0 ${
                isDark
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500/80'
                  : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
              }`}
              title="Ezberinizi test etmek için ses kaydını başlatın (Durdurana kadar kaydeder, son 5 kayıt saklanır)"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Ses Kaydet</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border border-rose-400 shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
              title="Kaydı tamamlamak ve dinlemek için tıklayın"
            >
              <Square className="w-3.5 h-3.5 fill-current animate-ping" />
              <span>Kaydı Durdur ({formatDuration(recordingSeconds)})</span>
              {/* Canlı Mikrofon Ses Seviyesi Çubukları */}
              <span className="inline-flex items-end gap-0.5 h-3.5 ml-1">
                {[0.4, 0.75, 1, 0.65].map((mult, idx) => {
                  const barHeight = Math.max(25, Math.min(100, audioLevel * mult + 20));
                  return (
                    <span
                      key={idx}
                      className="w-1 bg-white rounded-full transition-all duration-75"
                      style={{ height: `${barHeight}%` }}
                    />
                  );
                })}
              </span>
            </button>
          )}

          {/* Kayıt Sayacı Rozeti */}
          <span
            className={`text-[11px] font-bold px-2 py-1 rounded-lg border shrink-0 ${
              isDark
                ? 'bg-[#211d16] text-[#b9b09a] border-[#3a3226]'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
            title="En fazla 5 ses kaydı tutulur. 5 kayıttan sonra en eski kayıt otomatik silinir."
          >
            {recordings.length}/{MAX_RECORDINGS} Kayıt
          </span>

          {/* Kayıt Butonunun Yanında Son 5 Kayıt Listesi */}
          {recordings.length === 0 ? (
            <span
              className={`text-xs italic truncate ${
                isDark ? 'text-[#8c826e]' : 'text-slate-400'
              }`}
            >
              {isRecording
                ? 'Mikrofona okuyun, bitince Kaydı Durdur butonuna basın...'
                : 'Ezberinizi sesli okuyup kaydedin; son 5 kaydınız burada sıralanır.'}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
              {recordings.map((rec, idx) => {
                const isThisPlaying = playingId === rec.id;
                const displayNum = recordings.length - idx; // Kayıt sırası

                return (
                  <div
                    key={rec.id}
                    onClick={() => playRecording(rec)}
                    className={`group relative overflow-hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                      isThisPlaying
                        ? isDark
                          ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : isDark
                        ? 'bg-[#211d16] text-[#f1ecdd] border-[#3a3226] hover:border-[#3fb996]/50'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                    }`}
                    title={`${rec.surahName} ${rec.verseInfo ? `(${rec.verseInfo})` : ''} • Süre: ${formatDuration(rec.durationSec)} — Dinlemek için tıklayın`}
                  >
                    {/* Oynatma İlerleme Arka Plan Çubuğu */}
                    {isThisPlaying && (
                      <div
                        className={`absolute left-0 bottom-0 h-0.5 transition-all duration-100 ${
                          isDark ? 'bg-[#3fb996]' : 'bg-white'
                        }`}
                        style={{ width: `${playbackProgress}%` }}
                      />
                    )}

                    {isThisPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    )}

                    <span className="font-bold">#{displayNum}</span>
                    <span className="max-w-[90px] truncate">{rec.surahName}</span>
                    <span
                      className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                        isThisPlaying
                          ? isDark
                            ? 'bg-[#181510]/60 text-[#3fb996]'
                            : 'bg-emerald-700 text-emerald-100'
                          : isDark
                          ? 'bg-[#181510] text-[#8c826e]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {formatDuration(rec.durationSec)}
                    </span>

                    {/* Sabitle (Otomatik silinmeyi engelle) Butonu */}
                    <button
                      type="button"
                      onClick={(e) => togglePinRecording(rec.id, e)}
                      className={`p-0.5 rounded transition-colors cursor-pointer ${
                        rec.pinned
                          ? isDark
                            ? 'text-amber-400'
                            : 'text-amber-500'
                          : 'opacity-40 group-hover:opacity-100 hover:text-amber-400'
                      }`}
                      title={
                        rec.pinned
                          ? 'Sabitlendi (5 kayıt dolduğunda otomatik silinmez)'
                          : 'Bu kaydı sabitle (Otomatik silinmesin)'
                      }
                    >
                      <Pin className="w-3 h-3" />
                    </button>

                    {/* Tekil Kayıt Silme Butonu */}
                    <button
                      type="button"
                      onClick={(e) => deleteRecording(rec.id, e)}
                      className={`p-0.5 rounded-full transition-colors opacity-60 group-hover:opacity-100 cursor-pointer ${
                        isThisPlaying
                          ? 'hover:bg-emerald-800 text-current'
                          : isDark
                          ? 'hover:bg-[#181510] text-[#8c826e] hover:text-rose-400'
                          : 'hover:bg-slate-200 text-slate-400 hover:text-rose-600'
                      }`}
                      title="Bu ses kaydını sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ Kısım: Yardımcı Ezber Araçları (Kayıtta Metni Gizle, Oto-Dinle, Tekrarla, Tümünü Sil) */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {/* Kayıtta Metni Gizle (Bakmadan Ezber Testi) */}
          <button
            type="button"
            onClick={toggleBlindMode}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              blindModeOnRecord
                ? isDark
                  ? 'bg-amber-950/50 text-amber-300 border-amber-600/60'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
                : isDark
                ? 'bg-[#211d16] text-[#8c826e] border-[#3a3226] hover:text-[#f1ecdd]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Aktif edildiğinde: Ses kaydı başladığında ayet metni bulanıklaşır (bakmadan okumanızı sağlar), kaydı durdurduğunuzda metin tekrar açılır."
          >
            {blindModeOnRecord ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>Kayıtta Gizle</span>
          </button>

          {/* Kayıt Bitince Otomatik Dinle */}
          <button
            type="button"
            onClick={toggleAutoPlay}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              autoPlayAfterRecord
                ? isDark
                  ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996]/50'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isDark
                ? 'bg-[#211d16] text-[#8c826e] border-[#3a3226] hover:text-[#f1ecdd]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Kaydı durdurduğunuz anda kendi sesinizi otomatik olarak çalar"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Oto-Dinle</span>
          </button>

          {/* Kaydı Döngüde Dinle */}
          {recordings.length > 0 && (
            <button
              type="button"
              onClick={() => setLoopPlayback(!loopPlayback)}
              className={`p-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                loopPlayback
                  ? isDark
                    ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996]/50'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isDark
                  ? 'bg-[#211d16] text-[#8c826e] border-[#3a3226] hover:text-[#f1ecdd]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Seçilen ses kaydını sürekli döngüde (tekrarlı) dinle"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Tüm Kayıtları Temizle */}
          {recordings.length > 0 && (
            <button
              type="button"
              onClick={clearAllRecordings}
              className={`p-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#211d16] text-rose-400 border-[#3a3226] hover:bg-rose-950/40'
                  : 'bg-white text-rose-600 border-slate-200 hover:bg-rose-50'
              }`}
              title="Tüm ses kayıtlarını sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hata Mesajı (Mikrofon izni reddedilirse vb.) */}
      {errorMsg && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-300 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
