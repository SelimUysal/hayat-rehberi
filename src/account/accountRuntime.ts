// Loaded after the application has rendered. A failed/slow cloud connection
// cannot prevent reading local progress or using the rest of the application.
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut, linkWithPopup, signInWithCredential, type User } from 'firebase/auth';
import { firebaseClient } from './firebaseClient';
import { AccountSyncStore } from './syncStore';

export function createAccountRuntime() {
  const {auth,db} = firebaseClient();
  const store = new AccountSyncStore(db);
  const provider = () => {const p = new GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});return p;};
  return {
    store,
    watch: (next:(user:User|null)=>void,fail:()=>void) => onAuthStateChanged(auth,next,fail),
    google: () => signInWithPopup(auth,provider()),
    oneTap: (idToken:string) => signInWithCredential(auth,GoogleAuthProvider.credential(idToken)),
    login: (email:string,password:string) => signInWithEmailAndPassword(auth,email,password),
    register: (email:string,password:string) => createUserWithEmailAndPassword(auth,email,password),
    verify: (user:User) => sendEmailVerification(user),
    reset: (email:string) => sendPasswordResetEmail(auth,email),
    link: (user:User) => linkWithPopup(user,provider()),
    logout: () => signOut(auth),
  };
}
export type AccountRuntime = ReturnType<typeof createAccountRuntime>;
