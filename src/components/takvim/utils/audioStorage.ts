// IndexedDB tabanlı kullanıcıya özel Ezan Sesi depolama yardımcısı
// Kullanıcının seçtiği "ezan_sesi.m4a", .mp3 veya .wav sesini tarayıcıda kalıcı olarak saklar.

const DB_NAME = 'namaz_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';
const EZAN_KEY = 'custom_ezan_file';

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB desteklenmiyor'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredAudio {
  id: string;
  name: string;
  blob: Blob;
  type: string;
  updatedAt: number;
}

export async function saveCustomAudioFile(file: File): Promise<{ fileName: string; url: string }> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredAudio = {
      id: EZAN_KEY,
      name: file.name,
      blob: file,
      type: file.type || 'audio/mp4',
      updatedAt: Date.now()
    };

    const putRequest = store.put(record);

    putRequest.onsuccess = () => {
      const url = URL.createObjectURL(file);
      resolve({ fileName: file.name, url });
    };

    putRequest.onerror = () => reject(putRequest.error);
  });
}

export async function loadCustomAudioFile(): Promise<{ fileName: string; url: string; blob: Blob } | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(EZAN_KEY);

      getRequest.onsuccess = () => {
        const result: StoredAudio | undefined = getRequest.result;
        if (result && result.blob) {
          const url = URL.createObjectURL(result.blob);
          resolve({ fileName: result.name, url, blob: result.blob });
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Custom audio load error:', err);
    return null;
  }
}

export async function deleteCustomAudioFile(): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const delRequest = store.delete(EZAN_KEY);

      delRequest.onsuccess = () => resolve();
      delRequest.onerror = () => reject(delRequest.error);
    });
  } catch (err) {
    console.warn('Custom audio delete error:', err);
  }
}
