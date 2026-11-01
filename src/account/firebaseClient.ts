import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

let connectedToEmulators = false;

// Firebase Web configuration is public client identification, not an admin
// credential. User data is protected by Authentication and firestore.rules.
export function firebaseClient() {
  const emulator = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true';
  if (emulator && !['localhost','127.0.0.1','[::1]'].includes(window.location.hostname)) throw new Error('Test bağlantısı yalnızca yerel bilgisayarda açılabilir.');
  const app = getApps().some(a => a.name === '[DEFAULT]') ? getApp() : initializeApp({
    projectId:emulator ? 'demo-hayat-rehberi' : 'hayat-rehberi-selimuysal',
    appId:'1:722668420054:web:84797e8cd1fe2ac17a8277',
    apiKey:'AIzaSyAc_I4Q12iDcu4_xYsyIFlUAguZefBDem0',
    authDomain:'hayat-rehberi-selimuysal.firebaseapp.com',
    messagingSenderId:'722668420054',
  });
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (emulator && !connectedToEmulators) {
    connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
    connectFirestoreEmulator(db,'127.0.0.1',8088);
    connectedToEmulators = true;
  }
  auth.languageCode = 'tr';
  return {auth,db};
}
