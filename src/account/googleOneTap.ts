// Optional native Google One Tap. Google Identity Services requires a Web OAuth
// client ID with the site origin authorized; the Firebase API key is not one.
type GoogleId = {
  initialize(config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select: boolean;
    use_fedcm_for_prompt: boolean;
    context: 'signin';
    color_scheme: 'default';
  }): void;
  prompt(): void;
  cancel(): void;
};
type GoogleGlobal = Window & { google?: { accounts?: { id?: GoogleId } } };
const SCRIPT_ID = 'hayat-rehberi-google-one-tap-script';
export const ACCOUNT_INVITE_KEY = 'hayat-rehberi-account-invitation-v1';
export const ACCOUNT_INVITE_DELAY_MS = 5000;

// Only a real OAuth Web client ID enables the native Google chooser. A manual
// Firebase Google sign-in invitation remains usable without this configuration.
export function configuredOneTapClientId(): string | null {
  const id = (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || '').trim();
  return /^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(id) ? id : null;
}
export function startGoogleOneTap(
  clientId: string,
  credential: (idToken: string) => void,
  unavailable: () => void,
): () => void {
  let active = true;
  const googleId = () => (window as GoogleGlobal).google?.accounts?.id;
  const launch = () => {
    if (!active) return;
    try {
      const id = googleId();
      if (!id) { unavailable(); return; }
      id.initialize({
        client_id: clientId,
        callback: response => {
          if (active && typeof response.credential === 'string' && response.credential) credential(response.credential);
        },
        auto_select: false, // Never sign in just because a Google account exists.
        use_fedcm_for_prompt: true,
        context: 'signin',
        color_scheme: 'default',
      });
      id.prompt();
    } catch { if (active) unavailable(); }
  };
  if (googleId()) { launch(); return () => { active = false; googleId()?.cancel(); }; }

  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
  }
  script.addEventListener('load', launch);
  script.addEventListener('error', unavailable);
  const currentScript = script;
  return () => {
    active = false;
    currentScript.removeEventListener('load', launch);
    currentScript.removeEventListener('error', unavailable);
    googleId()?.cancel();
  };
}
