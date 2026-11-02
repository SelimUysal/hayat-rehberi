import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const provider = readFileSync(new URL('../src/account/AccountProvider.tsx', import.meta.url),'utf8');
const invite = readFileSync(new URL('../src/account/AccountInvitation.tsx', import.meta.url),'utf8');
const runtime = readFileSync(new URL('../src/account/accountRuntime.ts', import.meta.url),'utf8');
const gis = readFileSync(new URL('../src/account/googleOneTap.ts', import.meta.url),'utf8');
const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url),'utf8');

test('guest account invitation is optional, delayed and only presented once per browser',()=>{
  assert.match(provider,/authChecked/);
  assert.match(provider,/localStorage\.getItem\(ACCOUNT_INVITE_KEY\)/);
  assert.match(provider,/localStorage\.setItem\(ACCOUNT_INVITE_KEY,'shown'\)/);
  assert.match(provider,/localStorage\.setItem\(ACCOUNT_INVITE_KEY,'dismissed'\)/);
  assert.match(provider,/state\.needsImport/);
  assert.match(invite,/Misafir olarak devam et/);
  assert.match(invite,/Google ile devam et/);
  assert.match(provider,/onGuest=\{dismissInvitation\}/);
  assert.match(invite,/onClick=\{onGuest\}/);
});
test('native One Tap is opt-in, uses a Web OAuth client and never auto signs in',()=>{
  assert.match(gis,/VITE_GOOGLE_WEB_CLIENT_ID/);
  assert.match(gis,/auto_select: false/);
  assert.match(gis,/use_fedcm_for_prompt: true/);
  assert.match(gis,/https:\/\/accounts\.google\.com\/gsi\/client/);
  assert.match(provider,/const fallbackTimer/);
  assert.match(runtime,/signInWithCredential\(auth,GoogleAuthProvider\.credential\(idToken\)\)/);
});

test('GitHub Pages build receives the optional public Google OAuth Web Client ID',()=>{
  assert.match(workflow,/VITE_GOOGLE_WEB_CLIENT_ID:\s*\$\{\{\s*vars\.VITE_GOOGLE_WEB_CLIENT_ID\s*\}\}/);
});
