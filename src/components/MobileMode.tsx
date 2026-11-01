import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause,
  RotateCcw,
  Square, 
  Settings2, 
  ChevronLeft, 
  ChevronRight, 
  Repeat, 
  Sparkles, 
  Sliders, 
  X,
  Check,
  Gauge,
  Layers
} from 'lucide-react';
import { Ayah, VerseWbw, WordData } from '../types';
import { SURAHS, RECITERS } from '../data/surahs';
import { fetchSurahData, fetchWbwData } from '../services/quranApi';
import { AnalysisModal } from './AnalysisModal';
import { SurahSearchSelect } from './SurahSearchSelect';
import { QuickSurahBookmarks } from './QuickSurahBookmarks';
import { EzberVoiceRecorder } from './EzberVoiceRecorder';
import { recordEzberEvent as logEzber, ezberErrorName } from '../utils/ezberDiagnostics';
import { getEzberWordIndex } from '../utils/ezberTracking';
import { readMobileEzberSession, saveMobileEzberSession, coordinateEzberWindows, claimEzberAudio, EZBER_STOP_AUDIO_EVENT, requestEzberLiveState, publishEzberLiveState, stopRemoteEzberAudio, type LiveEzberSession } from '../utils/ezberSession';

interface MobileModeProps {
  targetSurahId?: number | null;
  themeMode?: 'dark' | 'emerald';
  active?: boolean;
  onPlaybackChange?: (playing: boolean) => void;
}

export const MobileMode: React.FC<MobileModeProps> = ({ targetSurahId, themeMode = 'dark', active = true, onPlaybackChange }) => {
  const isDark = themeMode === 'dark';
  // Durumlar
  const initialSessionRef = useRef(readMobileEzberSession());
  const initialSession = initialSessionRef.current;
  const [currentSurah, setCurrentSurah] = useState<number>(() => {
    return (targetSurahId && targetSurahId >= 1 && targetSurahId <= 114) ? targetSurahId : initialSession?.surahId ?? 67;
  });

  useEffect(() => {
    if (targetSurahId && targetSurahId >= 1 && targetSurahId <= 114) {
      setCurrentSurah(targetSurahId);
    }
  }, [targetSurahId]);
  const [selectedReciter, setSelectedReciter] = useState<string>(initialSession?.reciter ?? 'ar.mahermuaiqly');
  const [selectedFont, setSelectedFont] = useState<string>('font-amiri');
  const [fontSize, setFontSize] = useState<number>(1.85);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(initialSession?.playbackSpeed ?? 1.0);
  const [targetLoopCount, setTargetLoopCount] = useState<number | 'infinite'>(3);
  const [currentLoop, setCurrentLoop] = useState<number>(0);

  // Veriler
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Ayah[]>([]);
  const [wbwList, setWbwList] = useState<VerseWbw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Seçili Ayet
  const [selectedVerseNum, setSelectedVerseNum] = useState<number>(targetSurahId ? 1 : initialSession?.verseNum ?? 1);
  const [showMeal, setShowMeal] = useState<boolean>(false); // Varsayılan gizli

  // Çalma Durumu
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  useEffect(() => {
    onPlaybackChange?.(isPlaying);
  }, [isPlaying, onPlaybackChange]);
  useEffect(() => () => onPlaybackChange?.(false), [onPlaybackChange]);
  const [currentlyPlayingVerseNum, setCurrentlyPlayingVerseNum] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState<'verse' | 'full'>(initialSession?.mode ?? 'verse');
  const [pausedSession, setPausedSession] = useState(() => initialSession?.wasPlaying ? initialSession : null);
  const [completedSurah, setCompletedSurah] = useState<number | null>(null);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [remoteWordIdx, setRemoteWordIdx] = useState<number | null>(null);

  // Mobil Çekmece (Bottom Sheet) Durumu
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showSpeedPopover, setShowSpeedPopover] = useState<boolean>(false);

  // Analiz Modalı
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isBlindRecording, setIsBlindRecording] = useState<boolean>(false);

  // Audio Referansları
  // Construct audio once per mounted reader, not once per React render.
  const audioRef = useRef<HTMLAudioElement>(null!);
  if (audioRef.current === null) audioRef.current = new Audio();
  const playbackRequestRef = useRef(0);
  const ayahsRef = useRef(ayahs);
  ayahsRef.current = ayahs;
  const getWordsOfVerseRef = useRef<(ayah: Ayah) => string[]>(() => []);
  const lastSavedSecondRef = useRef(-1);
  const currentSurahRef = useRef(currentSurah);
  const selectedVerseNumRef = useRef(selectedVerseNum);
  const selectedReciterRef = useRef(selectedReciter);
  const sessionSpeedRef = useRef(playbackSpeed);
  const lastPositionRef = useRef(initialSession?.positionSeconds ?? 0);
  const resumeOffsetRef = useRef(0);
  const [resumeAvailable, setResumeAvailable] = useState(!targetSurahId && !!initialSession?.wasPlaying);
  const [remoteSession, setRemoteSession] = useState<LiveEzberSession|null>(null);
  const remoteRef = useRef<LiveEzberSession|null>(null);
  const ownsAudioRef = useRef(false);
  const modeRef = useRef<'verse'|'full'>('verse');
  const lastBroadcastRef = useRef(-1);
  currentSurahRef.current = currentSurah;
  selectedVerseNumRef.current = selectedVerseNum;
  selectedReciterRef.current = selectedReciter;
  sessionSpeedRef.current = playbackSpeed;
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncFollowRef = useRef<(() => void) | null>(null);
  const lastValidWordRef = useRef<number | null>(null);
  const resumeFollowTimerRef = useRef<(() => void) | null>(null);
  const activeScreenRef = useRef(active);
  activeScreenRef.current = active;
  const loopTimeoutRef = useRef<any>(null);
  const currentLoopRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const currentlyPlayingVerseNumRef = useRef<number | null>(null);
  const playModeRef = useRef<'verse' | 'full'>(initialSession?.mode ?? 'verse');
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  // Sure Verisini Yükle
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      stopAudio();
      logEzber('SURAH_LOAD_START','info',{surah:currentSurah,detail:{mode:'mobile'}});
      try {
        const [surahRes, wbwRes] = await Promise.all([
          fetchSurahData(currentSurah, selectedReciter),
          fetchWbwData(currentSurah)
        ]);
        if (!isCancelled) {
          setAyahs(surahRes.ayahs);
          setTranslations(surahRes.translations);
          setWbwList(wbwRes);
          if (initialSessionRef.current && !targetSurahId && initialSessionRef.current.surahId === currentSurah) {
            setSelectedVerseNum(initialSessionRef.current.verseNum);
          } else {
            setSelectedVerseNum(1);
          }
          initialSessionRef.current = null;
          logEzber('SURAH_LOAD_OK','info',{surah:currentSurah,detail:{mode:'mobile'}});
        }
      } catch (err) {
        if (!isCancelled) {
          setAyahs([]);
          setTranslations([]);
          setWbwList([]);
          logEzber('SURAH_LOAD_FAILED','error',{surah:currentSurah,detail:{mode:'mobile',name:ezberErrorName(err),online:navigator.onLine}});
        }
        console.error('Mobil veri hatası:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [currentSurah, selectedReciter]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.defaultPlaybackRate = playbackSpeed;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const stopFromOtherWindow = () => {
      stopAudio();
      window.dispatchEvent(new Event(EZBER_STOP_AUDIO_EVENT));
    };
    const release = coordinateEzberWindows(stopFromOtherWindow, state => {
      remoteRef.current = state; setRemoteSession(state);
      if (state) {
        const verse = ayahsRef.current.find(a => a.numberInSurah === state.verseNum);
        const count = verse ? getWordsOfVerseRef.current(verse).length : 0;
        setRemoteWordIdx(getEzberWordIndex(state.positionSeconds,state.durationSeconds ?? 0,count));
      } else setRemoteWordIdx(null);
      if(state){setCurrentSurah(state.surahId);setSelectedReciter(state.reciter);setPlaybackSpeed(state.playbackSpeed);setSelectedVerseNum(state.verseNum);setResumeAvailable(false);}
      else setResumeAvailable(true);
    },()=>{
      const player=audioRef.current;
      if(!ownsAudioRef.current||player.paused||!player.currentSrc)return null;
      return {surahId:currentSurahRef.current,verseNum:currentlyPlayingVerseNumRef.current??selectedVerseNumRef.current,reciter:selectedReciterRef.current,playbackSpeed:playbackSpeedRef.current,positionSeconds:player.currentTime||0,wasPlaying:true,mode:modeRef.current,updatedAt:Date.now(),durationSeconds:Number.isFinite(player.duration)?player.duration:undefined};
    },speed=>{playbackSpeedRef.current=speed;setPlaybackSpeed(speed);audioRef.current.playbackRate=speed;});
    return () => {
      release();
      stopAudio();
    };
  }, []);

  useEffect(()=>{
    if(!active||loading)return;
    if(ownsAudioRef.current){setIsPlaying(!audioRef.current.paused);setCurrentlyPlayingVerseNum(currentlyPlayingVerseNumRef.current);}
    else requestEzberLiveState();
    const verse=currentlyPlayingVerseNumRef.current??remoteRef.current?.verseNum??selectedVerseNumRef.current;
    const timer=setTimeout(()=>document.getElementById('mobile-verse-'+verse)?.scrollIntoView({behavior:'smooth',block:'center'}),250);
    return ()=>clearTimeout(timer);
  },[active,loading]);
  useEffect(()=>{
    if(!active || loading || !remoteSession) return;
    const timer=setTimeout(()=>{
      document.getElementById('mobile-verse-'+remoteSession.verseNum)?.scrollIntoView({behavior:'smooth',block:'center'});
    },160);
    return ()=>clearTimeout(timer);
  },[active,loading,remoteSession?.verseNum]);

  // Android may throttle timers when another app is in front, even while audio
  // keeps playing. Re-read the *existing* HTMLAudioElement on every foreground
  // transition. Never call playVerse() or create a second player here.
  useEffect(() => {
    let lastResyncAt = 0;
    const onForeground = () => {
      if (document.hidden || Date.now() - lastResyncAt < 250) return;
      lastResyncAt = Date.now();

      if (!ownsAudioRef.current) {
        requestEzberLiveState();
        return;
      }
      const player = audioRef.current;
      const verseNum = currentlyPlayingVerseNumRef.current;
      if (verseNum === null || !player.currentSrc) return;

      const playing = !player.paused && !player.ended;
      isPlayingRef.current = playing;
      setIsPlaying(playing);
      setCurrentlyPlayingVerseNum(verseNum);
      setSelectedVerseNum(verseNum);
      syncFollowRef.current?.();
      resumeFollowTimerRef.current?.();

      if (activeScreenRef.current) {
        window.requestAnimationFrame(() => {
          if (!document.hidden && activeScreenRef.current) {
            document.getElementById('mobile-verse-' + verseNum)?.scrollIntoView({
              behavior: 'smooth', block: 'center',
            });
          }
        });
      }
      logEzber('FOLLOW_RESYNC', 'info', {
        surah: currentSurahRef.current, verse: verseNum,
        detail: { mode: 'mobile', stage: playing ? 'playing' : 'paused' },
      });
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (tickIntervalRef.current !== null) {
          clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
        logEzber('APP_BACKGROUND', 'info', { surah: currentSurahRef.current });
      } else {
        logEzber('APP_FOREGROUND', 'info', { surah: currentSurahRef.current });
        onForeground();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('resume', onForeground);
    window.addEventListener('pageshow', onForeground);
    window.addEventListener('focus', onForeground);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('resume', onForeground);
      window.removeEventListener('pageshow', onForeground);
      window.removeEventListener('focus', onForeground);
    };
  }, []);

  useEffect(()=>{
    if(!remoteSession)return;
    const timer=setInterval(()=>{if(Date.now()-remoteSession.updatedAt>12000){remoteRef.current=null;setRemoteSession(null);setResumeAvailable(true);}},2000);
    return ()=>clearInterval(timer);
  },[remoteSession]);

  useEffect(() => {
    if (isPlayingRef.current || pausedSession || remoteRef.current || loading || !ayahs.length) return;
    saveMobileEzberSession({ surahId: currentSurah, verseNum: selectedVerseNum,
      reciter: selectedReciter, playbackSpeed, positionSeconds: lastPositionRef.current,
      wasPlaying: false });
  }, [currentSurah, selectedVerseNum, selectedReciter, playbackSpeed, loading, ayahs.length, pausedSession]);

  // Besmele Temizleme (Fatiha hariç, Fatiha'da 1. ayet Besmele'dir)
  const cleanVerseText = (text: string, verseNum: number): string => {
    if (currentSurah !== 1 && verseNum === 1) {
      return text.replace(/^بِسْمِ\s+ٱ?للَّهِ\s+ٱ?لرَّحْمَٰنِ\s+ٱ?لرَّحِيمِ\s*/, '').trim();
    }
    return text;
  };

  const getWordsOfVerse = (ayah: Ayah): string[] => {
    const cleaned = cleanVerseText(ayah.text, ayah.numberInSurah);
    return cleaned.split(' ').filter(Boolean);
  };
  getWordsOfVerseRef.current = getWordsOfVerse;

  const stopAudio = () => {
    const player = audioRef.current;
    const position = player && Number.isFinite(player.currentTime) ? player.currentTime : lastPositionRef.current;
    resumeOffsetRef.current = 0;
    if (isPlayingRef.current) {
      lastPositionRef.current = position;
      saveMobileEzberSession({surahId:currentSurahRef.current,verseNum:currentlyPlayingVerseNumRef.current ?? selectedVerseNumRef.current,reciter:selectedReciterRef.current,playbackSpeed:sessionSpeedRef.current,positionSeconds:position,wasPlaying:false,mode:playModeRef.current});
    }
    ownsAudioRef.current=false;
    lastValidWordRef.current = null;
    ++playbackRequestRef.current;
    if (isPlayingRef.current) logEzber('PLAY_STOP','info',{surah:currentSurah,verse:currentlyPlayingVerseNumRef.current??undefined,detail:{mode:'mobile'}});
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    syncFollowRef.current = null;
    resumeFollowTimerRef.current = null;
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onplaying = null;
      audioRef.current.onpause = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentlyPlayingVerseNum(null);
    currentlyPlayingVerseNumRef.current = null;
    setActiveWordIdx(null);
    setCurrentLoop(0);
    currentLoopRef.current = 0;
  };

  // Keep the actual player mounted while paused, so we can resume precisely.
  const pauseAudio = () => {
    const player = audioRef.current;
    if (!ownsAudioRef.current || player.paused || !isPlayingRef.current) return;
    const verseNum = currentlyPlayingVerseNumRef.current ?? selectedVerseNumRef.current;
    const saved = {
      surahId: currentSurahRef.current, verseNum,
      reciter: selectedReciterRef.current, playbackSpeed: playbackSpeedRef.current,
      positionSeconds: Number.isFinite(player.currentTime) ? player.currentTime : lastPositionRef.current,
      wasPlaying: true, mode: playModeRef.current,
    } as const;
    player.pause();
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setPausedSession(saved);
    setResumeAvailable(true);
    saveMobileEzberSession(saved);
  };

  const resumeAudio = () => {
    const paused = pausedSession ?? readMobileEzberSession();
    if (!paused || paused.surahId !== currentSurah) return;
    setResumeAvailable(false);
    setPausedSession(null);
    setSelectedVerseNum(paused.verseNum);
    const player = audioRef.current;
    if (ownsAudioRef.current && player.currentSrc &&
        currentlyPlayingVerseNumRef.current === paused.verseNum && !player.ended) {
      player.play().catch(err => {
        logEzber('VERSE_PLAY_REJECTED','error',{surah:currentSurah,verse:paused.verseNum,detail:{name:ezberErrorName(err)}});
        setPausedSession(paused);
        setResumeAvailable(true);
      });
      return;
    }
    stopAudio();
    resumeOffsetRef.current = paused.positionSeconds;
    currentLoopRef.current = 1;
    setCurrentLoop(1);
    setPlayMode(paused.mode ?? 'verse');
    playVerse(paused.verseNum, paused.mode ?? 'verse');
  };

  // Ayeti Çal ve Döngüye Al (Senkronizasyon garantili, karışma engelli)
  const playVerse = (verseNum: number, mode: 'verse' | 'full' = 'verse') => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    syncFollowRef.current = null;
    resumeFollowTimerRef.current = null;

    claimEzberAudio();
    setCompletedSurah(null);
    setPausedSession(null);
    ownsAudioRef.current=true;
    remoteRef.current=null;setRemoteSession(null);setRemoteWordIdx(null);
    modeRef.current=mode;
    const requestId = ++playbackRequestRef.current;
    const ayah = ayahs.find((a) => a.numberInSurah === verseNum);
    if (!ayah || !ayah.audio) {
      logEzber('VERSE_MISSING_AUDIO','error',{surah:currentSurah,verse:verseNum});
      stopAudio();
      return;
    }

    const words = getWordsOfVerse(ayah);
    logEzber('VERSE_PLAY_START','info',{surah:currentSurah,verse:verseNum,detail:{mode}});
    const player = audioRef.current;
    const targetSpeed = playbackSpeedRef.current;

    // Önceki ses dinleyicilerini temizle ve durdur
    player.onplay = null;
    player.onloadedmetadata = null;
    player.onerror = null;
    player.onended = null;
    player.ontimeupdate = null;
    player.onplaying = null;
    player.onpause = null;
    player.pause();

    setPlayMode(mode);
    playModeRef.current = mode;
    setSelectedVerseNum(verseNum);
    setCurrentlyPlayingVerseNum(verseNum);
    currentlyPlayingVerseNumRef.current = verseNum;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setActiveWordIdx(null);
    lastValidWordRef.current = null;
    // Scroll after React has marked the next ayah active; never scroll while hidden.
    if (!document.hidden && activeScreenRef.current) {
      window.setTimeout(() => {
        if (requestId === playbackRequestRef.current &&
            currentlyPlayingVerseNumRef.current === verseNum &&
            !document.hidden && activeScreenRef.current) {
          document.getElementById('mobile-verse-' + verseNum)?.scrollIntoView({
            behavior: 'smooth', block: 'center',
          });
        }
      }, 100);
    }

    lastPositionRef.current = 0;
    lastSavedSecondRef.current = -1;
    lastBroadcastRef.current=-1;
    saveMobileEzberSession({surahId:currentSurah,verseNum,reciter:selectedReciter,playbackSpeed:targetSpeed,positionSeconds:0,wasPlaying:true,mode});
    player.defaultPlaybackRate = targetSpeed;
    player.src = ayah.audio;
    player.playbackRate = targetSpeed;

    player.onplay = () => {
      player.playbackRate = playbackSpeedRef.current;
    };


    // Each ayah has one active tracking function and one end transition.
    // This remains safe when Android throttles setInterval in the background.
    let advanced = false;
    const ownsThisVerse = () =>
      requestId === playbackRequestRef.current &&
      currentlyPlayingVerseNumRef.current === verseNum;

    const syncFollow = () => {
      if (!ownsThisVerse()) return;
      if (player.playbackRate !== playbackSpeedRef.current) {
        player.playbackRate = playbackSpeedRef.current;
      }
      const cur = player.currentTime;
      if (!Number.isFinite(cur) || cur < 0) return;
      lastPositionRef.current = cur;

      const second = Math.floor(cur);
      if (second !== lastBroadcastRef.current) {
        lastBroadcastRef.current = second;
        publishEzberLiveState({
          surahId: currentSurah, verseNum, reciter: selectedReciterRef.current,
          playbackSpeed: playbackSpeedRef.current, positionSeconds: cur,
          wasPlaying: true, mode, mode, updatedAt: Date.now(),
          durationSeconds: Number.isFinite(player.duration) ? player.duration : undefined,
        });
      }
      if (second % 5 === 0 && second !== lastSavedSecondRef.current) {
        lastSavedSecondRef.current = second;
        saveMobileEzberSession({
          surahId: currentSurah, verseNum, reciter: selectedReciterRef.current,
          playbackSpeed: playbackSpeedRef.current, positionSeconds: cur,
          wasPlaying: true, mode,
        });
      }
      // The current audio position is the source of truth, not a timer counter.
      if (!document.hidden) {
        const idx = getEzberWordIndex(cur, player.duration, words.length);
        if (idx !== null) lastValidWordRef.current = idx;
        const next = idx ?? lastValidWordRef.current;
        setActiveWordIdx(previous => previous === next ? previous : next);
      }
      if (player.ended) finishVerse();
    };

    const restartFollowTimer = () => {
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      if (!ownsThisVerse() || document.hidden || player.paused || player.ended) return;
      // Only one timer, for smooth visible word highlighting.
      // ontimeupdate + onended continue handling audio while hidden.
      tickIntervalRef.current = window.setInterval(syncFollow, 125);
    };

    const finishVerse = () => {
      if (!ownsThisVerse() || advanced) return;
      advanced = true;
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      syncFollowRef.current = null;
      resumeFollowTimerRef.current = null;
      setActiveWordIdx(null);

      if (playModeRef.current === 'full') {
        if (verseNum < ayahs.length) {
          const nextNum = verseNum + 1;
          logEzber('VERSE_NEXT', 'info', { surah: currentSurah, verse: nextNum });
          loopTimeoutRef.current = window.setTimeout(() => {
            if (requestId !== playbackRequestRef.current) return;
            playVerse(nextNum, 'full');
          }, 180);
        } else {
          stopAudio();
          setCompletedSurah(currentSurah);
        }
      } else {
        currentLoopRef.current += 1;
        setCurrentLoop(currentLoopRef.current);
        if (targetLoopCount === 'infinite' || currentLoopRef.current <= targetLoopCount) {
          logEzber('VERSE_REPEAT', 'info', {
            surah: currentSurah, verse: verseNum,
            detail: { repeat: currentLoopRef.current },
          });
          loopTimeoutRef.current = window.setTimeout(() => {
            if (requestId !== playbackRequestRef.current) return;
            playVerse(verseNum, 'verse');
          }, 180);
        } else {
          stopAudio();
        }
      }
    };

    syncFollowRef.current = syncFollow;
    resumeFollowTimerRef.current = restartFollowTimer;
    player.ontimeupdate = syncFollow;
    player.onended = finishVerse;
    player.onplaying = () => {
      if (!ownsThisVerse()) return;
      isPlayingRef.current = true;
      setIsPlaying(true);
      syncFollow();
      restartFollowTimer();
    };
    player.onpause = () => {
      if (!ownsThisVerse() || player.ended) return;
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
    player.onloadedmetadata = () => {
      if (!ownsThisVerse()) return;
      player.defaultPlaybackRate = playbackSpeedRef.current;
      player.playbackRate = playbackSpeedRef.current;
      if (resumeOffsetRef.current > 0 && Number.isFinite(player.duration)) {
        try {
          player.currentTime = Math.min(resumeOffsetRef.current, Math.max(0, player.duration - 0.25));
        } catch {}
        resumeOffsetRef.current = 0;
      }
      player.play().then(() => {
        if (!ownsThisVerse()) return;
        player.playbackRate = playbackSpeedRef.current;
        syncFollow();
        restartFollowTimer();
      }).catch(err => {
        if (!ownsThisVerse()) return;
        logEzber('VERSE_PLAY_REJECTED', 'error', {
          surah: currentSurah, verse: verseNum,
          detail: { name: ezberErrorName(err) },
        });
        stopAudio();
      });
    };

    player.onerror = () => {
      if (!ownsThisVerse()) return;
      logEzber('VERSE_PLAY_ERROR','error',{surah:currentSurah,verse:verseNum,detail:{mediaCode:player.error?.code ?? 0,networkState:player.networkState,readyState:player.readyState}});
      stopAudio();
    };
  };

  const startPlayback = (vNum = selectedVerseNum) => {
    // Choosing a verse explicitly starts that verse from the beginning.
    // Only the dedicated Continue action restores the saved second.
    stopAudio();
    setPausedSession(null);
    resumeOffsetRef.current = 0;
    setResumeAvailable(false);
    currentLoopRef.current = 1;
    setCurrentLoop(1);
    setIsPlaying(true);
    playVerse(vNum, 'verse');

    const el = document.getElementById(`mobile-verse-${vNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const startFullSurahPlayback = () => {
    stopAudio();
    setPausedSession(null);
    setResumeAvailable(false);
    currentLoopRef.current = 1;
    setCurrentLoop(1);
    setIsPlaying(true);
    playVerse(1, 'full');

    const el = document.getElementById(`mobile-verse-1`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Önceki / Sonraki Ayet
  const goToPreviousVerse = () => {
    if (selectedVerseNum > 1) {
      const nextNum = selectedVerseNum - 1;
      setSelectedVerseNum(nextNum);
      if (isPlaying) {
        playVerse(nextNum, playModeRef.current);
      }
      const el = document.getElementById(`mobile-verse-${nextNum}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const goToNextVerse = () => {
    if (selectedVerseNum < ayahs.length) {
      const nextNum = selectedVerseNum + 1;
      setSelectedVerseNum(nextNum);
      if (isPlaying) {
        playVerse(nextNum, playModeRef.current);
      }
      const el = document.getElementById(`mobile-verse-${nextNum}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Modal İçin Veriler
  const getModalWordData = (): WordData[] => {
    const verseObj = wbwList.find((item) => item.verse_number === selectedVerseNum);
    if (!verseObj || !verseObj.words) return [];
    return verseObj.words.filter((w) => w.char_type_name !== 'end');
  };

  const currentSurahMeta = SURAHS.find((s) => s.id === currentSurah);
  // Only offer the Continue action when it belongs to this surah and there is
  // no live player already playing (locally or in another PWA window).
  const pausedPlayback = !isPlaying && !remoteSession
    ? (pausedSession ?? (resumeAvailable ? readMobileEzberSession() : null))
    : null;
  const canResume = !loading && !!pausedPlayback && pausedPlayback.surahId === currentSurah;
  const formatPlaybackSecond = (seconds: number) => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
  };
  const displayedVerse = remoteSession?.verseNum ?? currentlyPlayingVerseNum ?? selectedVerseNum;
  const selectedAyahObj = ayahs.find((a) => a.numberInSurah === selectedVerseNum);
  const selectedTranslationText = translations.find((t) => t.numberInSurah === selectedVerseNum)?.text || '';

  return (
    <div className={`max-w-3xl mx-auto w-full min-w-0 px-3 py-4 pb-64 sm:pb-44 font-sans ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
      
      {/* Mobil Üst Başlık & Sure Seçimi */}
      <div className={`rounded-2xl p-3 sm:p-4 shadow-sm border mb-4 sticky top-16 z-30 transition-colors ${
        isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 min-w-0">
          <div className="flex-1 min-w-0 w-full">
            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
              isDark ? 'text-[#3fb996]' : 'text-emerald-800'
            }`}>
              📱 Mobil Odaklı Okuma Modu
            </span>
            <SurahSearchSelect
                    linkTab="ezber"
              selectedSurahId={currentSurah}
              onSelectSurah={(id) => {
                stopAudio();
                setCurrentSurah(id);
                setSelectedVerseNum(1);
              }}
              buttonLabelPrefix="Sure:"
              className="w-full"
              theme={isDark ? 'dark' : 'light'}
            />
            <QuickSurahBookmarks
              currentSurahId={currentSurah}
              onSelectSurah={(id) => {
                stopAudio();
                setCurrentSurah(id);
                setSelectedVerseNum(1);
              }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1.5">
            {/* Meal Aç/Kapa Butonu */}
            <button
              onClick={() => setShowMeal(!showMeal)}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showMeal 
                  ? isDark
                    ? 'bg-[#2a241b] text-amber-200 border-amber-700/50'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : isDark
                  ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Mealleri Göster/Gizle"
            >
              {showMeal ? 'Meali Gizle' : 'Meal'}
            </button>

            {/* Ayarlar Çekmecesini Aç Butonu */}
            <button
              id="btn-open-mobile-drawer"
              onClick={() => setIsDrawerOpen(true)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#181510] hover:bg-[#2a241b] text-[#f1ecdd] border-[#3a3226]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Döngü ve Ses Ayarları"
            >
              <Settings2 className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            </button>
          </div>
        </div>

        {/* Mobil Ses Kayıt ve Son 5 Kaydı Dinleme Çubuğu */}
        <div className="mt-3 pt-2.5 border-t border-inherit">
          <EzberVoiceRecorder
            surahId={currentSurah}
            surahName={currentSurahMeta?.name || `Sure ${currentSurah}`}
            selectedVerseInfo={`${selectedVerseNum}. Ayet`}
            theme={isDark ? 'dark' : 'light'}
            onStopExternalAudio={stopAudio}
            onRecordingStateChange={(rec, blind) => setIsBlindRecording(rec && blind)}
          />
        </div>
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className={`w-9 h-9 border-4 ${isDark ? 'border-[#3fb996]' : 'border-emerald-600'} border-t-transparent rounded-full animate-spin`}></div>
          <p className={`text-sm font-medium ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>Ayetler yükleniyor...</p>
        </div>
      )}

      {/* Besmele */}
      {!loading && (
        <div className={`text-center py-3.5 mb-4 rounded-2xl border ${
          isDark
            ? 'bg-[#1c3630]/40 border-[#3fb996]/20'
            : 'bg-emerald-50/60 border-emerald-100'
        }`}>
          <p className={`text-2xl font-arabic ${selectedFont} ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayet Kartları Listesi */}
      {!loading && (
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const vNum = ayah.numberInSurah;
            const words = getWordsOfVerse(ayah);
            const isSelected = selectedVerseNum === vNum;
            const isPlayingThisVerse = (isPlaying && currentlyPlayingVerseNum === vNum) || (!!remoteSession && remoteSession.verseNum === vNum);

            return (
              <div
                key={vNum}
                id={`mobile-verse-${vNum}`}
                onClick={() => {
                  setSelectedVerseNum(vNum);
                  if (isPlaying && currentlyPlayingVerseNum !== vNum) {
                    stopAudio();
                  }
                }}
                className={`rounded-2xl p-4 md:p-5 transition-all cursor-pointer border ${
                  isSelected
                    ? isDark
                      ? 'bg-[#211d16] border-[#3fb996] shadow-md ring-2 ring-[#3fb996]/30'
                      : 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                    : isDark
                    ? 'bg-[#1a1712] border-[#3a3226] hover:border-[#4d4233]'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Ayet Üst Barı */}
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        isSelected
                          ? isDark
                            ? 'bg-[#3fb996] text-[#181510] shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-[#181510] text-[#b9b09a] border border-[#3a3226]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {vNum}
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>
                      {vNum}. Ayet
                    </span>
                  </div>

                  {/* Hızlı Aksiyon Butonları */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedVerseNum(vNum);
                        setModalOpen(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996]/40 hover:bg-[#23453d]'
                          : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                      }`}
                    >
                      <Sparkles className={`w-3 h-3 ${isDark ? 'text-[#3fb996]' : 'text-teal-600'}`} />
                      <span>Tahlil</span>
                    </button>
                    <button
                      onClick={() => {
                        if (isPlaying && currentlyPlayingVerseNum === vNum) {
                          stopAudio();
                        } else {
                          startPlayback(vNum);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isPlayingThisVerse
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isPlayingThisVerse ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Durdur</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Ezberle</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Arapça Metin */}
                <p 
                  className={`leading-[2.4] text-right dir-rtl select-none transition-all duration-300 ${selectedFont} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'} ${isBlindRecording ? 'blur-md hover:blur-xs' : ''}`}
                  style={{ fontSize: `${fontSize}rem` }}
                >
                  {words.map((word, wIdx) => {
                    const isWordActive = isPlayingThisVerse && (remoteSession ? remoteWordIdx : activeWordIdx) === wIdx;
                    return (
                      <span
                        key={wIdx}
                        className={`word-span ${isWordActive ? 'active-word' : ''}`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </p>

                {/* Türkçe Meali */}
                {showMeal && (
                  <div className={`mt-3 pt-2.5 border-t text-xs md:text-sm dir-ltr text-left leading-relaxed ${
                    isDark ? 'border-[#3a3226] text-[#b9b09a]' : 'border-slate-100 text-slate-600'
                  }`}>
                    <span className={`font-semibold mr-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>{vNum}. </span>
                    {translations.find((t) => t.numberInSurah === vNum)?.text || ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {remoteSession && <p role="status" className="mx-auto max-w-2xl rounded-xl bg-emerald-950/70 p-3 mb-3 text-emerald-100 text-xs">Dinleme başka bir sekmede devam ediyor: {remoteSession.verseNum}. ayet. Durdurabilir veya oynatmayı bu ekrana devralabilirsin.</p>}
      {/* SABİT ALT KONTROL ÇUBUĞU (Sticky Floating Bottom Dock) */}
      <div className={`fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] lg:bottom-0 left-0 right-0 z-40 w-full max-w-[100vw] min-w-0 backdrop-blur-md border-t shadow-2xl px-2 py-2 sm:px-4 sm:py-3 transition-colors ${
        isDark ? 'bg-[#211d16]/95 border-[#3a3226] text-[#f1ecdd]' : 'bg-white/95 border-slate-200 text-slate-800'
      }`}>
        <div className="max-w-2xl mx-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center sm:justify-between sm:gap-2 min-w-0">
          
          {/* Sol: Ayet Navigasyon & Bilgi */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={goToPreviousVerse}
              disabled={selectedVerseNum <= 1}
              className={`w-10 h-10 rounded-xl disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? 'bg-[#181510] hover:bg-[#2a241b] text-[#f1ecdd]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Önceki Ayet"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextVerse}
              disabled={selectedVerseNum >= ayahs.length}
              className={`w-10 h-10 rounded-xl disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? 'bg-[#181510] hover:bg-[#2a241b] text-[#f1ecdd]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Sonraki Ayet"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="hidden sm:block ml-1">
              <span className={`text-[11px] font-bold block leading-tight ${isDark ? 'text-[#3fb996]' : 'text-emerald-900'}`}>
                {selectedVerseNum}. Ayet
              </span>
              <span className={`text-[10px] block ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
                Döngü: {currentLoop} / {targetLoopCount === 'infinite' ? '∞' : targetLoopCount}
              </span>
            </div>
          </div>

          {/* Duruma göre tek ana kontrol: Başlat / Duraklat / Devam Et */}
          <div className="col-span-2 row-start-2 w-full min-w-0 sm:row-auto sm:col-auto sm:flex-1 sm:max-w-[340px]">
            {isPlaying || remoteSession ? (
              <div className={`rounded-xl border p-2.5 space-y-2 min-w-0 ${
                isDark ? 'border-[#3a3226] bg-[#181510]/80' : 'border-slate-200 bg-slate-50'
              }`} aria-label="Şu an dinleniyor">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="min-w-0 truncate font-bold">{currentSurahMeta?.name || 'Sure'}</span>
                  <span className={`shrink-0 tabular-nums ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>
                    {(remoteSession?.mode ?? playMode) === 'full' ? 'Tüm Sure' : 'Tek Ayet'} · {displayedVerse} / {ayahs.length} ayet
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Sure ayet ilerlemesi"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(1, ayahs.length)}
                  aria-valuenow={displayedVerse}
                  className={`h-1 overflow-hidden rounded-full ${isDark ? 'bg-[#3a3226]' : 'bg-slate-200'}`}
                >
                  <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                       style={{ width: `${ayahs.length ? Math.min(100, displayedVerse / ayahs.length * 100) : 0}%` }} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (remoteSession) {
                      stopRemoteEzberAudio();
                      remoteRef.current = null;
                      setRemoteSession(null);
                      setResumeAvailable(true);
                    } else pauseAudio();
                  }}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 cursor-pointer"
                >
                  <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{remoteSession ? 'Diğer Oturumu Durdur' : 'Duraklat'}</span>
                </button>
              </div>
            ) : canResume && pausedPlayback ? (
              <div className={`min-w-0 space-y-2 rounded-xl border p-2.5 ${
                isDark ? 'border-emerald-700/50 bg-[#181e19]' : 'border-emerald-200 bg-emerald-50/70'
              }`} aria-label="Duraklatılmış dinleme">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">
                      {currentSurahMeta?.name || 'Sure'} · {pausedPlayback.verseNum}. ayet
                    </p>
                    <p className={`mt-0.5 text-[11px] ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                      {formatPlaybackSecond(pausedPlayback.positionSeconds)} konumunda · {pausedPlayback.mode === 'full' ? 'Tüm sure dinlemesi' : 'Tek ayet tekrarı'}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
                    isDark ? 'bg-amber-900/30 text-amber-200' : 'bg-amber-100 text-amber-900'
                  }`}>Duraklatıldı</span>
                </div>
                <button
                  type="button"
                  onClick={resumeAudio}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 cursor-pointer"
                  title={pausedPlayback.mode === 'full'
                    ? 'Kaldığın saniyeden başlayıp surenin sonraki ayetlerini sırayla dinle'
                    : 'Kaldığın saniyeden aynı ayeti tekrar ederek dinle'}
                >
                  <Play className="h-4 w-4 shrink-0 fill-current" aria-hidden="true" />
                  <span>{pausedPlayback.mode === 'full' ? 'Sureye Devam Et' : 'Ayet Tekrarına Devam Et'}</span>
                </button>
                <p className={`text-center text-[10px] leading-relaxed ${
                  isDark ? 'text-[#b9b09a]' : 'text-slate-600'
                }`}>
                  {pausedPlayback.mode === 'full'
                    ? 'Aynı saniyeden devam eder, ardından diğer ayetlere geçer.'
                    : 'Aynı saniyeden devam eder, seçtiğin tekrar sayısını korur.'}
                </p>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Farklı dinleme başlat">
                  <button
                    type="button"
                    onClick={() => startPlayback(selectedVerseNum)}
                    className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[11px] font-semibold leading-tight transition-colors focus-visible:outline focus-visible:outline-2 cursor-pointer ${
                      isDark ? 'border-[#3a3226] bg-[#211d16] text-[#f1ecdd] hover:border-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400'
                    }`}
                    title="Seçili ayeti ilk saniyeden başlayarak tekrar et"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Seçili Ayeti Baştan Çal</span>
                  </button>
                  <button
                    type="button"
                    onClick={startFullSurahPlayback}
                    className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[11px] font-semibold leading-tight transition-colors focus-visible:outline focus-visible:outline-2 cursor-pointer ${
                      isDark ? 'border-[#3a3226] bg-[#211d16] text-[#f1ecdd] hover:border-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400'
                    }`}
                    title="Tüm sureyi birinci ayetten başlayarak sırayla dinle"
                  >
                    <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Tüm Sureyi Baştan Çal</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-w-0 space-y-2">
                {completedSurah === currentSurah && (
                  <p className={`text-center text-xs font-semibold ${
                    isDark ? 'text-[#3fb996]' : 'text-emerald-700'
                  }`} role="status">Sure tamamlandı · Yeniden dinlemek için bir mod seç</p>
                )}
                <div className="grid w-full min-w-0 grid-cols-2 gap-2" role="group" aria-label="Dinleme türünü seç">
                  <button
                    type="button"
                    onClick={() => startPlayback(selectedVerseNum)}
                    className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 cursor-pointer"
                    title={`${selectedVerseNum}. ayeti baştan başlayarak tekrar et`}
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" aria-hidden="true" />
                    <span>Seçili Ayeti Çal</span>
                  </button>
                  <button
                    type="button"
                    onClick={startFullSurahPlayback}
                    className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 cursor-pointer ${
                      isDark
                        ? 'border-[#3fb996]/40 bg-[#1c3630] text-[#3fb996] hover:bg-[#23453d]'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                    title="Tüm sureyi birinci ayetten başlayarak sırayla dinle"
                  >
                    <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Tüm Sureyi Çal</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sağ: İmleçli Hız Slider & Çekmece */}
          <div className="flex items-center gap-1.5 relative justify-self-end shrink-0">
            {/* Hız Slider Popover Kartı */}
            {showSpeedPopover && (
              <div className={`absolute right-0 bottom-full mb-3 w-64 max-w-[calc(100vw-1rem)] p-3.5 rounded-2xl shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                    <Gauge className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                    <span>Okuma Hızı</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {playbackSpeed.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  onPointerUp={() => setShowSpeedPopover(false)}
                  onTouchEnd={() => setShowSpeedPopover(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setShowSpeedPopover(false);
                  }}
                  onBlur={() => setShowSpeedPopover(false)}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${
                    isDark ? 'bg-[#2a241b]' : 'bg-slate-200'
                  }`}
                />
                <div className="grid grid-cols-4 gap-1 mt-2.5">
                  {[0.75, 1.0, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        setShowSpeedPopover(false);
                      }}
                      className={`py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        Math.abs(playbackSpeed - spd) < 0.05
                          ? isDark
                            ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996]'
                            : 'bg-emerald-600 text-white border-emerald-600'
                          : isDark
                          ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {spd.toFixed(2)}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSpeedPopover(!showSpeedPopover)}
              className={`px-2.5 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                showSpeedPopover
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isDark
                  ? 'bg-[#1c3630] hover:bg-[#23453d] text-[#3fb996] border-[#3fb996]/40'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="İmleçli Hız Ayarını Aç"
            >
              <Gauge className="w-3.5 h-3.5 shrink-0" />
              <span>{playbackSpeed.toFixed(1)}x</span>
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                isDark ? 'bg-[#1c3630] hover:bg-[#23453d] text-white border border-[#3fb996]/40' : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
              title="Döngü ve Ayarlar"
            >
              <Repeat className={`w-4 h-4 ${isDark ? 'text-[#3fb996]' : 'text-emerald-300'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* MOBİL AYARLAR ÇEKMECESİ (Bottom Drawer / Sheet) */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className={`rounded-t-3xl w-full max-w-lg p-5 pb-8 space-y-5 shadow-2xl border-t animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto ${
              isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Çekmece Başlığı */}
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Sliders className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                <h3 className={`font-bold text-base ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                  Mobil Döngü ve Ses Ayarları
                </h3>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className={`p-1.5 rounded-full cursor-pointer ${isDark ? 'hover:bg-[#181510] text-[#8c826e]' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Döngü Sayısı */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                Tekrar (Döngü) Sayısı:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 3, 5, 10, 'infinite'].map((val) => {
                  const isCur = targetLoopCount === val;
                  return (
                    <button
                      key={String(val)}
                      onClick={() => setTargetLoopCount(val as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isCur
                          ? isDark
                            ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : isDark
                          ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val === 'infinite' ? 'Sonsuz' : `${val}x`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hafız Seçimi */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                Hafız (Seslendirmen):
              </label>
              <select
                value={selectedReciter}
                onChange={(e) => setSelectedReciter(e.target.value)}
                className={`w-full border rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  isDark ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ayet Yazı Boyutu */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                  Ayet Yazı Boyutu:
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'text-emerald-800 bg-emerald-100'}`}>
                  {fontSize.toFixed(2)}rem
                </span>
              </div>
              <input
                type="range"
                min="1.2"
                max="3.5"
                step="0.05"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${isDark ? 'bg-[#2a241b]' : 'bg-slate-200'}`}
              />
            </div>

            {/* Okuma Hızı Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                  Okuma Hızı:
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'text-emerald-800 bg-emerald-100'}`}>
                  {playbackSpeed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${isDark ? 'bg-[#2a241b]' : 'bg-slate-200'}`}
              />
              <div className="grid grid-cols-4 gap-1 mt-2.5">
                {[0.75, 1.0, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                      Math.abs(playbackSpeed - spd) < 0.05
                        ? isDark
                          ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996]'
                          : 'bg-emerald-600 text-white border-emerald-600'
                        : isDark
                        ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {spd.toFixed(2)}x
                  </button>
                ))}
              </div>
            </div>

            {/* Hat Seçimi */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                Kur'an Yazı Hattı:
              </label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className={`w-full border rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  isDark ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="font-amiri">Amiri (Klasik Medine Hattı)</option>
                <option value="font-scheherazade">Scheherazade (Zarif Hat)</option>
                <option value="font-lateef">Lateef (Mushaf Hattı)</option>
              </select>
            </div>

            {/* Kapat ve Kaydet Butonu */}
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Ayarları Uygula</span>
            </button>

          </div>
        </div>
      )}

      {/* Yapay Zekâ Analiz Modalı */}
      <AnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedWords={getModalWordData()}
        selectedText={selectedAyahObj ? cleanVerseText(selectedAyahObj.text, selectedVerseNum) : ''}
        verseNumber={selectedVerseNum}
        verseTranslation={selectedTranslationText}
        surahName={currentSurahMeta?.name || ''}
      />

    </div>
  );
};
