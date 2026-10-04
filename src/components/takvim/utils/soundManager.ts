// Ezan Sesi ve Vakit Bildirimi Yönetimi
// Kullanıcı Seçenekleri: 
// 1. Ezan Sesi (Kullanıcının yüklediği "ezan_sesi.m4a" veya varsayılan ezan)
// 2. Sessiz (Kapalı)

import { loadCustomAudioFile, saveCustomAudioFile, deleteCustomAudioFile } from './audioStorage';

export type SoundMode = 'ezan' | 'off';

export interface SoundState {
  isPlaying: boolean;
  soundMode: SoundMode;
  activeSoundName: string;
  isCustom: boolean;
}

class SoundManager {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private soundMode: SoundMode = 'ezan';
  private activeSoundName = 'Ezan Sesi';
  private isCustom = false;
  private listeners: Set<(state: SoundState) => void> = new Set();
  private lastPlayedPrayerKey = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('namaz_sound_mode');
      this.soundMode = savedMode === 'off' ? 'off' : 'ezan';

      this.initAudio();
    }
  }

  private async initAudio() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Kullanıcının daha önce yüklediği özel ezan sesi var mı (IndexedDB)?
      const custom = await loadCustomAudioFile();
      if (custom && custom.url) {
        this.activeSoundName = custom.fileName;
        this.isCustom = true;
        this.setupAudioElement(custom.url);
        this.notifyListeners();
        return;
      }

      // 2. Varsayılan ses dosyası
      this.activeSoundName = 'Ezan Sesi';
      this.isCustom = false;
      this.setupAudioElement('/audio.mp3');
      this.notifyListeners();
    } catch (e) {
      console.warn('Audio init error:', e);
      this.setupAudioElement('/audio.mp3');
    }
  }

  private setupAudioElement(src: string) {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }

    this.audioElement = new Audio(src);
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyListeners();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyListeners();
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyListeners();
    });

    this.audioElement.addEventListener('error', (err) => {
      console.warn('Audio element error with src:', src, err);
      if (src !== '/audio.mp3') {
        this.setupAudioElement('/audio.mp3');
        this.activeSoundName = 'Varsayılan Ezan';
        this.isCustom = false;
        this.notifyListeners();
      }
    });
  }

  public subscribe(listener: (state: SoundState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SoundState {
    return {
      isPlaying: this.isPlaying,
      soundMode: this.soundMode,
      activeSoundName: this.activeSoundName,
      isCustom: this.isCustom
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getSoundMode(): SoundMode {
    return this.soundMode;
  }

  public setSoundMode(mode: SoundMode): void {
    this.soundMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('namaz_sound_mode', mode);
      if (mode === 'off') {
        this.stop();
      }
    }
    this.notifyListeners();
  }

  // Kullanıcının yüklediği özel ses dosyasını kaydet ve etkinleştir
  public async loadUserAudioFile(file: File): Promise<string> {
    try {
      const saved = await saveCustomAudioFile(file);
      this.activeSoundName = saved.fileName;
      this.isCustom = true;
      this.setupAudioElement(saved.url);
      this.notifyListeners();
      return saved.fileName;
    } catch (err) {
      console.error('Failed to save user audio file:', err);
      throw err;
    }
  }

  // Varsayılan ezan sesine geri dön
  public async resetToDefault(): Promise<void> {
    await deleteCustomAudioFile();
    this.activeSoundName = 'Varsayılan Ezan';
    this.isCustom = false;
    this.setupAudioElement('/audio/ezan.mp3');
    this.notifyListeners();
  }

  public async playEzan(): Promise<void> {
    if (this.soundMode === 'off') return;
    await this.playPreview();
  }

  // Kullanıcı "Dinle" butonuna bastığında sesi çalma
  public async playPreview(): Promise<void> {
    try {
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        await this.audioElement.play();
        this.isPlaying = true;
        this.notifyListeners();
        return;
      }
    } catch (err) {
      console.warn('HTML5 audio play error, falling back to speech synthesis:', err);
    }

    // Fallback: Web Speech API
    this.speakFallback();
  }

  // Vakit girdiğinde tetikleme (Aynı vakitte mükerrer çalmayı önler)
  public checkAndTriggerPrayerTime(prayerName: string, dateStr: string) {
    if (this.soundMode === 'off') return;

    const key = `${dateStr}_${prayerName}`;
    if (this.lastPlayedPrayerKey === key) return;

    this.lastPlayedPrayerKey = key;
    this.playEzan();

    // Tarayıcı Bildirimi
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Vakit Girdi: ${prayerName}`, {
          body: `${prayerName} namazı vakti girdi. Haydin namaza, haydin felaha.`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  }

  private speakFallback() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Allahu Ekber, Allahu Ekber');
      utterance.lang = 'ar-SA';
      utterance.pitch = 1.0;
      utterance.rate = 0.85;
      utterance.onstart = () => {
        this.isPlaying = true;
        this.notifyListeners();
      };
      utterance.onend = () => {
        this.isPlaying = false;
        this.notifyListeners();
      };
      utterance.onerror = () => {
        this.isPlaying = false;
        this.notifyListeners();
      };
      window.speechSynthesis.speak(utterance);
    }
  }

  public stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.notifyListeners();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.playEzan();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundManager = new SoundManager();
